import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';

export interface BatchStudentAttendanceItem {
  studentId: string;
  enrollmentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY';
  remark?: string;
}

export interface BatchStaffAttendanceItem {
  staffId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY';
  leaveType?: 'CASUAL' | 'MEDICAL' | 'EARNED' | 'DUTY' | 'OTHER';
  remark?: string;
}

export class AttendanceService {
  // --- STUDENT ATTENDANCE ---
  async getStudentAttendanceByClassAndDate(tenantId: string, classId: string, dateStr: string, divisionId?: string) {
    const attendanceDate = new Date(dateStr);
    attendanceDate.setHours(0, 0, 0, 0);

    const students = await prisma.student.findMany({
      where: {
        tenantId,
        isActive: true,
        status: 'ACTIVE',
        enrollments: {
          some: {
            classId,
            ...(divisionId ? { divisionId } : {}),
            isActive: true,
          },
        },
      },
      include: {
        enrollments: {
          where: { classId, isActive: true },
          take: 1,
        },
        studentAttendances: {
          where: {
            attendanceDate,
          },
          take: 1,
        },
      },
      orderBy: { grNumber: 'asc' },
    });

    return students.map((s) => {
      const enr = s.enrollments[0];
      const att = s.studentAttendances[0];
      return {
        studentId: s.id,
        enrollmentId: enr?.id,
        grNumber: s.grNumber,
        firstNameEn: s.firstNameEn,
        lastNameEn: s.lastNameEn,
        firstNameGu: s.firstNameGu,
        lastNameGu: s.lastNameGu,
        rollNumber: enr?.rollNumber,
        status: att ? att.status : 'PRESENT', // default to PRESENT for fast 1-click flow
        remark: att?.remark || '',
      };
    });
  }

  async markBatchStudentAttendance(
    tenantId: string,
    academicYearId: string,
    userId: string,
    dateStr: string,
    items: BatchStudentAttendanceItem[]
  ) {
    const attendanceDate = new Date(dateStr);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const item of items) {
      const record = await prisma.studentAttendance.upsert({
        where: {
          tenantId_studentId_attendanceDate: {
            tenantId,
            studentId: item.studentId,
            attendanceDate,
          },
        },
        update: {
          status: item.status,
          remark: item.remark || null,
          markedBy: userId,
          enrollmentId: item.enrollmentId,
          academicYearId,
        },
        create: {
          tenantId,
          studentId: item.studentId,
          enrollmentId: item.enrollmentId,
          academicYearId,
          attendanceDate,
          status: item.status,
          remark: item.remark || null,
          markedBy: userId,
        },
      });
      results.push(record);
    }

    await logAudit({
      tenantId,
      userId,
      action: 'BATCH_MARK_STUDENT_ATTENDANCE',
      entityType: 'STUDENT_ATTENDANCE',
      newValues: { date: dateStr, count: items.length },
    });

    return { success: true, count: results.length };
  }

  async getMonthlyAttendanceSummary(tenantId: string, classId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const attendances = await prisma.studentAttendance.findMany({
      where: {
        tenantId,
        attendanceDate: {
          gte: startDate,
          lte: endDate,
        },
        enrollment: {
          classId,
        },
      },
      include: {
        student: true,
      },
    });

    const summaryMap = new Map<string, { present: number; absent: number; late: number; leave: number }>();
    for (const att of attendances) {
      if (!summaryMap.has(att.studentId)) {
        summaryMap.set(att.studentId, { present: 0, absent: 0, late: 0, leave: 0 });
      }
      const counts = summaryMap.get(att.studentId)!;
      if (att.status === 'PRESENT') counts.present++;
      else if (att.status === 'ABSENT') counts.absent++;
      else if (att.status === 'LATE') counts.late++;
      else if (att.status === 'LEAVE') counts.leave++;
    }

    return Array.from(summaryMap.entries()).map(([studentId, counts]) => ({
      studentId,
      ...counts,
      totalWorkingDays: counts.present + counts.absent + counts.late + counts.leave,
      percentage: counts.present + counts.absent > 0
        ? Math.round((counts.present / (counts.present + counts.absent + counts.late + counts.leave)) * 100)
        : 100,
    }));
  }

  // --- STAFF ATTENDANCE & LEAVE MANAGEMENT ---
  async getStaffAttendanceByDate(tenantId: string, dateStr: string) {
    const attendanceDate = new Date(dateStr);
    attendanceDate.setHours(0, 0, 0, 0);

    const staffList = await prisma.staff.findMany({
      where: { tenantId, isActive: true, status: 'ACTIVE' },
      include: {
        staffAttendances: {
          where: { attendanceDate },
          take: 1,
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    return staffList.map((s) => {
      const att = s.staffAttendances[0];
      return {
        staffId: s.id,
        employeeId: s.employeeId,
        firstNameEn: s.firstNameEn,
        lastNameEn: s.lastNameEn,
        firstNameGu: s.firstNameGu,
        lastNameGu: s.lastNameGu,
        designation: s.designation,
        department: s.department,
        status: att ? att.status : 'PRESENT',
        leaveType: att?.leaveType || undefined,
        remark: att?.remark || '',
      };
    });
  }

  async markBatchStaffAttendance(tenantId: string, userId: string, dateStr: string, items: BatchStaffAttendanceItem[]) {
    const attendanceDate = new Date(dateStr);
    attendanceDate.setHours(0, 0, 0, 0);

    const results = [];
    for (const item of items) {
      const record = await prisma.staffAttendance.upsert({
        where: {
          tenantId_staffId_attendanceDate: {
            tenantId,
            staffId: item.staffId,
            attendanceDate,
          },
        },
        update: {
          status: item.status,
          leaveType: item.status === 'LEAVE' ? item.leaveType || 'CASUAL' : null,
          remark: item.remark || null,
          markedBy: userId,
        },
        create: {
          tenantId,
          staffId: item.staffId,
          attendanceDate,
          status: item.status,
          leaveType: item.status === 'LEAVE' ? item.leaveType || 'CASUAL' : null,
          remark: item.remark || null,
          markedBy: userId,
        },
      });
      results.push(record);
    }

    await logAudit({
      tenantId,
      userId,
      action: 'BATCH_MARK_STAFF_ATTENDANCE',
      entityType: 'STAFF_ATTENDANCE',
      newValues: { date: dateStr, count: items.length },
    });

    return { success: true, count: results.length };
  }

  async getStaffMonthlyAttendanceSummary(tenantId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const staffList = await prisma.staff.findMany({
      where: { tenantId, isActive: true },
      include: {
        staffAttendances: {
          where: { attendanceDate: { gte: startDate, lte: endDate } },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    return staffList.map((s) => {
      let present = 0;
      let absent = 0;
      let leave = 0;
      let late = 0;

      for (const att of s.staffAttendances) {
        if (att.status === 'PRESENT') present++;
        else if (att.status === 'ABSENT') absent++;
        else if (att.status === 'LEAVE') leave++;
        else if (att.status === 'LATE') late++;
      }

      const total = present + absent + leave + late;
      return {
        staffId: s.id,
        employeeId: s.employeeId,
        nameGu: `${s.firstNameGu} ${s.lastNameGu}`,
        nameEn: `${s.firstNameEn} ${s.lastNameEn}`,
        designation: s.designation,
        present,
        absent,
        leave,
        late,
        totalDays: total,
        percentage: total > 0 ? Math.round((present / total) * 100) : 100,
      };
    });
  }
}

export const attendanceService = new AttendanceService();
