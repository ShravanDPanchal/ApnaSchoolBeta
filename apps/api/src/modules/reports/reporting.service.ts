import { prisma } from '../../database/prisma';
import ExcelJS from 'exceljs';

export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  date?: string;
  academicYearId?: string;
  financialYearId?: string;
  classId?: string;
  divisionId?: string;
  studentId?: string;
  staffId?: string;
  examTypeId?: string;
  subjectId?: string;
  accountId?: string;
  accountGroupId?: string;
  paymentMode?: string;
  status?: string;
  search?: string;
  gender?: string;
  category?: string;
}

export class ReportingService {
  // =========================================================================
  // 1. SCHOOL REPORTS
  // =========================================================================

  async getStudentReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = { tenantId, isActive: true };

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters.gender && filters.gender !== 'ALL') {
      where.gender = filters.gender;
    }
    if (filters.category && filters.category !== 'ALL') {
      where.category = filters.category;
    }
    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { grNumber: { contains: q } },
        { firstNameEn: { contains: q } },
        { lastNameEn: { contains: q } },
        { firstNameGu: { contains: q } },
        { lastNameGu: { contains: q } },
        { phone: { contains: q } },
        { aadhaarNumber: { contains: q } },
        { ctsUniqueId: { contains: q } },
        { apaarId: { contains: q } },
      ];
    }

    if (filters.classId || filters.divisionId || filters.academicYearId) {
      where.enrollments = {
        some: {
          isActive: true,
          ...(filters.academicYearId ? { academicYearId: filters.academicYearId } : {}),
          ...(filters.classId ? { classId: filters.classId } : {}),
          ...(filters.divisionId ? { divisionId: filters.divisionId } : {}),
        },
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { isActive: true },
          include: { class: true, division: true, academicYear: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        studentParents: {
          include: { parent: true },
        },
      },
      orderBy: { grNumber: 'asc' },
    });

    const rows = students.map((s) => {
      const enrollment = s.enrollments[0];
      const parent = s.studentParents.find((p) => p.isPrimary)?.parent || s.studentParents[0]?.parent;
      return {
        id: s.id,
        grNumber: s.grNumber,
        admissionNo: s.admissionNo || '-',
        nameEn: `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.replace(/\s+/g, ' ').trim(),
        nameGu: `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.replace(/\s+/g, ' ').trim(),
        className: enrollment ? `${enrollment.class.nameEn} - ${enrollment.division?.nameEn || 'A'}` : '-',
        classNameGu: enrollment ? `${enrollment.class.nameGu} - ${enrollment.division?.nameGu || 'અ'}` : '-',
        rollNumber: enrollment?.rollNumber || '-',
        gender: s.gender,
        dob: s.dateOfBirth.toISOString().split('T')[0],
        category: s.category || 'General',
        aadhaarNumber: s.aadhaarNumber || '-',
        apaarId: s.apaarId || '-',
        ctsUniqueId: s.ctsUniqueId || '-',
        phone: s.phone || parent?.phone || '-',
        parentName: parent ? `${parent.firstNameEn} ${parent.lastNameEn || ''}`.trim() : '-',
        parentNameGu: parent ? `${parent.firstNameGu || parent.firstNameEn} ${parent.lastNameGu || parent.lastNameEn || ''}`.trim() : '-',
        status: s.status,
      };
    });

    const summary = {
      total: rows.length,
      boys: rows.filter((r) => r.gender === 'MALE').length,
      girls: rows.filter((r) => r.gender === 'FEMALE').length,
      aadhaarLinked: rows.filter((r) => r.aadhaarNumber !== '-').length,
      apaarGenerated: rows.filter((r) => r.apaarId !== '-').length,
      categoryCounts: rows.reduce((acc: any, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {}),
    };

    return { title: 'General Register (eGR) Student Report / વિદ્યાર્થી પત્રક', summary, rows };
  }

  async getAttendanceReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = { tenantId };

    if (filters.academicYearId) {
      where.academicYearId = filters.academicYearId;
    }
    if (filters.startDate || filters.endDate) {
      where.attendanceDate = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(`${filters.endDate}T23:59:59.999Z`) } : {}),
      };
    } else if (filters.date) {
      const d = new Date(filters.date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      where.attendanceDate = { gte: d, lt: nextDay };
    }

    if (filters.classId || filters.divisionId) {
      where.enrollment = {
        ...(filters.classId ? { classId: filters.classId } : {}),
        ...(filters.divisionId ? { divisionId: filters.divisionId } : {}),
      };
    }

    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    const attendances = await prisma.studentAttendance.findMany({
      where,
      include: {
        student: true,
        enrollment: { include: { class: true, division: true } },
      },
      orderBy: [{ attendanceDate: 'desc' }, { student: { grNumber: 'asc' } }],
    });

    // Student aggregate stats
    const studentMap = new Map<string, any>();
    for (const a of attendances) {
      if (!studentMap.has(a.studentId)) {
        studentMap.set(a.studentId, {
          studentId: a.studentId,
          grNumber: a.student.grNumber,
          nameEn: `${a.student.firstNameEn} ${a.student.lastNameEn}`,
          nameGu: `${a.student.firstNameGu} ${a.student.lastNameGu}`,
          className: `${a.enrollment.class.nameEn} - ${a.enrollment.division?.nameEn || 'A'}`,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          leaveDays: 0,
        });
      }
      const s = studentMap.get(a.studentId);
      s.totalDays++;
      if (a.status === 'PRESENT') s.presentDays++;
      else if (a.status === 'ABSENT') s.absentDays++;
      else if (a.status === 'LEAVE') s.leaveDays++;
    }

    const studentSummaries = Array.from(studentMap.values()).map((s) => ({
      ...s,
      percentage: s.totalDays > 0 ? Math.round((s.presentDays / s.totalDays) * 1000) / 10 : 0,
      isDefaulter: s.totalDays > 0 && (s.presentDays / s.totalDays) < 0.75,
    }));

    const rows = attendances.map((a) => ({
      date: a.attendanceDate.toISOString().split('T')[0],
      grNumber: a.student.grNumber,
      nameEn: `${a.student.firstNameEn} ${a.student.lastNameEn}`,
      nameGu: `${a.student.firstNameGu} ${a.student.lastNameGu}`,
      className: `${a.enrollment.class.nameEn} - ${a.enrollment.division?.nameEn || 'A'}`,
      status: a.status,
      remark: a.remark || '-',
    }));

    const summary = {
      totalRecords: attendances.length,
      presentCount: attendances.filter((a) => a.status === 'PRESENT').length,
      absentCount: attendances.filter((a) => a.status === 'ABSENT').length,
      leaveCount: attendances.filter((a) => a.status === 'LEAVE').length,
      averagePercentage:
        studentSummaries.length > 0
          ? Math.round((studentSummaries.reduce((sum, s) => sum + s.percentage, 0) / studentSummaries.length) * 10) / 10
          : 0,
      defaulterCount: studentSummaries.filter((s) => s.isDefaulter).length,
    };

    return {
      title: 'Student Attendance Report / હાજરી પત્રક',
      summary,
      rows,
      studentSummaries,
    };
  }

  async getStaffReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = { tenantId, isActive: true };

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status;
    }
    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { employeeId: { contains: q } },
        { firstNameEn: { contains: q } },
        { lastNameEn: { contains: q } },
        { firstNameGu: { contains: q } },
        { lastNameGu: { contains: q } },
        { phone: { contains: q } },
        { designation: { contains: q } },
      ];
    }

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        teacherAssignments: {
          where: { isActive: true },
          include: { class: true, division: true, subject: true },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    const rows = staffList.map((s) => {
      const classTeacherAssignment = s.teacherAssignments.find((ta) => ta.isClassTeacher);
      return {
        id: s.id,
        employeeId: s.employeeId,
        nameEn: `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.replace(/\s+/g, ' ').trim(),
        nameGu: `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.replace(/\s+/g, ' ').trim(),
        designation: s.designation,
        department: s.department || 'General',
        qualification: s.qualification || '-',
        experienceYears: s.experienceYears || 0,
        staffType: s.staffType,
        employmentType: s.employmentType,
        phone: s.phone || '-',
        email: s.email || '-',
        joiningDate: s.joiningDate ? s.joiningDate.toISOString().split('T')[0] : '-',
        classTeacherOf: classTeacherAssignment
          ? `${classTeacherAssignment.class.nameEn} - ${classTeacherAssignment.division?.nameEn || 'A'}`
          : '-',
        classTeacherOfGu: classTeacherAssignment
          ? `${classTeacherAssignment.class.nameGu} - ${classTeacherAssignment.division?.nameGu || 'અ'}`
          : '-',
        status: s.status,
      };
    });

    const summary = {
      totalStaff: rows.length,
      teaching: rows.filter((r) => r.staffType === 'TEACHING').length,
      nonTeaching: rows.filter((r) => r.staffType !== 'TEACHING').length,
      permanent: rows.filter((r) => r.employmentType === 'PERMANENT').length,
      contract: rows.filter((r) => r.employmentType !== 'PERMANENT').length,
      classTeachers: rows.filter((r) => r.classTeacherOf !== '-').length,
    };

    return { title: 'Staff Directory & Faculty Report / સ્ટાફ પત્રક', summary, rows };
  }

  async getTimetableReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = { tenantId, isActive: true };

    if (filters.academicYearId) where.academicYearId = filters.academicYearId;
    if (filters.classId) where.classId = filters.classId;
    if (filters.divisionId) where.divisionId = filters.divisionId;
    if (filters.staffId) where.staffId = filters.staffId;

    const entries = await prisma.timetableEntry.findMany({
      where,
      include: {
        class: true,
        division: true,
        subject: true,
        staff: true,
        period: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { period: { periodNumber: 'asc' } }],
    });

    const dayNames = ['સોમવાર (Mon)', 'મંગળવાર (Tue)', 'બુધવાર (Wed)', 'ગુરુવાર (Thu)', 'શુક્રવાર (Fri)', 'શનિવાર (Sat)'];

    const rows = entries.map((e) => ({
      id: e.id,
      day: dayNames[e.dayOfWeek - 1] || `Day ${e.dayOfWeek}`,
      dayOfWeek: e.dayOfWeek,
      periodNumber: e.period.periodNumber,
      time: `${e.period.startTime} - ${e.period.endTime}`,
      className: `${e.class.nameEn} - ${e.division?.nameEn || 'A'}`,
      subjectNameEn: e.subject?.nameEn || '-',
      subjectNameGu: e.subject?.nameGu || '-',
      teacherNameEn: e.staff ? `${e.staff.firstNameEn} ${e.staff.lastNameEn}` : '-',
      teacherNameGu: e.staff ? `${e.staff.firstNameGu} ${e.staff.lastNameGu}` : '-',
      roomName: e.roomName || '-',
    }));

    const summary = {
      totalPeriodsScheduled: rows.length,
      classesCovered: new Set(rows.map((r) => r.className)).size,
      teachersAssigned: new Set(rows.filter((r) => r.teacherNameEn !== '-').map((r) => r.teacherNameEn)).size,
    };

    return { title: 'Timetable Master Schedule / સમયપત્રક અહેવાલ', summary, rows };
  }

  async getExaminationReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = { tenantId };

    if (filters.examTypeId) {
      where.exam = { examTypeId: filters.examTypeId };
    }
    if (filters.classId) {
      where.exam = { ...where.exam, classId: filters.classId };
    }
    if (filters.subjectId) {
      where.exam = { ...where.exam, subjectId: filters.subjectId };
    }
    if (filters.studentId) {
      where.studentId = filters.studentId;
    }

    const marksRecords = await prisma.marks.findMany({
      where,
      include: {
        student: true,
        enrollment: { include: { class: true, division: true } },
        exam: { include: { examType: true, subject: true, class: true } },
      },
      orderBy: [{ exam: { class: { numericOrder: 'asc' } } }, { student: { grNumber: 'asc' } }],
    });

    const rows = marksRecords.map((m) => {
      const percentage = m.exam.maxMarks > 0 ? Math.round(((m.totalMarks || 0) / m.exam.maxMarks) * 1000) / 10 : 0;
      const isPass = !m.isAbsent && (m.totalMarks || 0) >= m.exam.passingMarks;
      return {
        id: m.id,
        examName: m.exam.examType.nameEn,
        examNameGu: m.exam.examType.nameGu,
        grNumber: m.student.grNumber,
        studentNameEn: `${m.student.firstNameEn} ${m.student.lastNameEn}`,
        studentNameGu: `${m.student.firstNameGu} ${m.student.lastNameGu}`,
        className: `${m.exam.class.nameEn} - ${m.enrollment.division?.nameEn || 'A'}`,
        subjectNameEn: m.exam.subject.nameEn,
        subjectNameGu: m.exam.subject.nameGu,
        theoryMarks: m.theoryMarks ?? '-',
        practicalMarks: m.practicalMarks ?? '-',
        internalMarks: m.internalMarks ?? '-',
        graceMarks: m.graceMarks || 0,
        totalMarks: m.isAbsent ? 'AB' : m.totalMarks ?? 0,
        maxMarks: m.exam.maxMarks,
        passingMarks: m.exam.passingMarks,
        percentage: m.isAbsent ? 0 : percentage,
        grade: m.isAbsent ? 'AB' : m.grade || '-',
        status: m.isAbsent ? 'ABSENT' : isPass ? 'PASS' : 'FAIL',
      };
    });

    const validScores = rows.filter((r) => r.status !== 'ABSENT');
    const summary = {
      totalCandidates: rows.length,
      appeared: validScores.length,
      absent: rows.filter((r) => r.status === 'ABSENT').length,
      passed: rows.filter((r) => r.status === 'PASS').length,
      failed: rows.filter((r) => r.status === 'FAIL').length,
      passPercentage: validScores.length > 0
        ? Math.round((rows.filter((r) => r.status === 'PASS').length / validScores.length) * 1000) / 10
        : 0,
      classAverage: validScores.length > 0
        ? Math.round((validScores.reduce((acc, curr) => acc + Number(curr.percentage), 0) / validScores.length) * 10) / 10
        : 0,
    };

    return { title: 'Examination & Marks Register / પરીક્ષા પરિણામ પત્રક', summary, rows };
  }

  async getReportCards(tenantId: string, filters: ReportFilterDto) {
    const studentWhere: any = { tenantId, isActive: true };
    if (filters.studentId) studentWhere.id = filters.studentId;
    if (filters.classId || filters.divisionId || filters.academicYearId) {
      studentWhere.enrollments = {
        some: {
          isActive: true,
          ...(filters.academicYearId ? { academicYearId: filters.academicYearId } : {}),
          ...(filters.classId ? { classId: filters.classId } : {}),
          ...(filters.divisionId ? { divisionId: filters.divisionId } : {}),
        },
      };
    }

    const school = await prisma.school.findFirst({ where: { tenantId } });

    const students = await prisma.student.findMany({
      where: studentWhere,
      include: {
        enrollments: {
          where: { isActive: true },
          include: { class: true, division: true, academicYear: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        marks: {
          include: { exam: { include: { subject: true, examType: true } } },
        },
        studentAttendances: true,
      },
      orderBy: { grNumber: 'asc' },
    });

    const reportCards = students.map((s) => {
      const enrollment = s.enrollments[0];
      const subjectsMap = new Map<string, any>();

      for (const m of s.marks) {
        const subId = m.exam.subjectId;
        if (!subjectsMap.has(subId)) {
          subjectsMap.set(subId, {
            subjectNameEn: m.exam.subject.nameEn,
            subjectNameGu: m.exam.subject.nameGu,
            theoryMarks: m.theoryMarks || 0,
            practicalMarks: m.practicalMarks || 0,
            internalMarks: m.internalMarks || 0,
            graceMarks: m.graceMarks || 0,
            totalMarks: m.totalMarks || 0,
            maxMarks: m.exam.maxMarks,
            grade: m.grade || '-',
            isPass: !m.isAbsent && (m.totalMarks || 0) >= m.exam.passingMarks,
          });
        }
      }

      const subjects = Array.from(subjectsMap.values());
      const totalObtained = subjects.reduce((sum, sub) => sum + sub.totalMarks, 0);
      const totalMax = subjects.reduce((sum, sub) => sum + sub.maxMarks, 0);
      const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 1000) / 10 : 0;

      let overallGrade = 'E';
      if (overallPercentage >= 91) overallGrade = 'A1';
      else if (overallPercentage >= 81) overallGrade = 'A2';
      else if (overallPercentage >= 71) overallGrade = 'B1';
      else if (overallPercentage >= 61) overallGrade = 'B2';
      else if (overallPercentage >= 51) overallGrade = 'C1';
      else if (overallPercentage >= 41) overallGrade = 'C2';
      else if (overallPercentage >= 33) overallGrade = 'D';

      const totalAtt = s.studentAttendances.length;
      const presentAtt = s.studentAttendances.filter((a) => a.status === 'PRESENT').length;
      const attendancePercent = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 1000) / 10 : 100;

      return {
        schoolNameEn: school?.nameEn || 'Apna School',
        schoolNameGu: school?.nameGu || 'અપના સ્કૂલ',
        diseCode: school?.diseCode || '24090100101',
        grNumber: s.grNumber,
        studentNameEn: `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.replace(/\s+/g, ' ').trim(),
        studentNameGu: `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.replace(/\s+/g, ' ').trim(),
        className: enrollment ? `${enrollment.class.nameEn} - ${enrollment.division?.nameEn || 'A'}` : '-',
        classNameGu: enrollment ? `${enrollment.class.nameGu} - ${enrollment.division?.nameGu || 'અ'}` : '-',
        rollNumber: enrollment?.rollNumber || 1,
        academicYear: enrollment?.academicYear.name || '2026-2027',
        attendancePercentage: attendancePercent,
        subjects,
        totalObtained,
        totalMax,
        overallPercentage,
        overallGrade,
        resultStatus: subjects.every((sub) => sub.isPass) ? 'PASS / ઉત્તીર્ણ' : 'NEED IMPROVEMENT / સુધારણા જરૂરી',
      };
    });

    return {
      title: 'Progress Report Cards / પ્રગતિ પત્રક',
      count: reportCards.length,
      reportCards,
    };
  }

  // =========================================================================
  // 2. FEES REPORTS
  // =========================================================================

  async getFeeCollectionReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = { tenantId, status: 'ACTIVE' };

    if (filters.academicYearId) where.academicYearId = filters.academicYearId;
    if (filters.paymentMode && filters.paymentMode !== 'ALL') where.paymentMode = filters.paymentMode;

    if (filters.startDate || filters.endDate) {
      where.paymentDate = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(`${filters.endDate}T23:59:59.999Z`) } : {}),
      };
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { receiptNumber: { contains: q } },
        { referenceNo: { contains: q } },
        { student: { grNumber: { contains: q } } },
        { student: { firstNameEn: { contains: q } } },
        { student: { lastNameEn: { contains: q } } },
      ];
    }

    const payments = await prisma.feePayment.findMany({
      where,
      include: {
        student: {
          include: {
            enrollments: {
              where: { isActive: true },
              include: { class: true, division: true },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        items: {
          include: {
            studentFee: { include: { feeStructure: { include: { feeHead: true } } } },
          },
        },
        receivedBy: { select: { id: true, email: true } },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const rows = payments.map((p) => {
      const enrollment = p.student.enrollments[0];
      const headBreakdown = p.items
        .map((it) => `${it.studentFee.feeStructure.feeHead.nameEn}: ₹${it.amount}`)
        .join(', ');

      return {
        id: p.id,
        receiptNumber: p.receiptNumber,
        date: p.paymentDate.toISOString().split('T')[0],
        grNumber: p.student.grNumber,
        studentNameEn: `${p.student.firstNameEn} ${p.student.lastNameEn}`,
        studentNameGu: `${p.student.firstNameGu} ${p.student.lastNameGu}`,
        className: enrollment ? `${enrollment.class.nameEn} - ${enrollment.division?.nameEn || 'A'}` : '-',
        totalAmount: p.totalAmount,
        paymentMode: p.paymentMode,
        referenceNo: p.referenceNo || '-',
        bankName: p.bankName || '-',
        heads: headBreakdown || 'General Fee',
        receivedBy: p.receivedBy.email || 'Admin',
      };
    });

    const summary = {
      totalTransactions: rows.length,
      totalCollected: Math.round(rows.reduce((sum, r) => sum + r.totalAmount, 0) * 100) / 100,
      cashAmount: Math.round(rows.filter((r) => r.paymentMode === 'CASH').reduce((s, r) => s + r.totalAmount, 0) * 100) / 100,
      bankTransferAmount: Math.round(rows.filter((r) => r.paymentMode === 'BANK_TRANSFER').reduce((s, r) => s + r.totalAmount, 0) * 100) / 100,
      upiAmount: Math.round(rows.filter((r) => r.paymentMode === 'UPI').reduce((s, r) => s + r.totalAmount, 0) * 100) / 100,
      chequeAmount: Math.round(rows.filter((r) => r.paymentMode === 'CHEQUE').reduce((s, r) => s + r.totalAmount, 0) * 100) / 100,
    };

    return { title: 'Fee Collection Register / ફી વસૂલાત રજીસ્ટર', summary, rows };
  }

  async getOutstandingFeesReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = {
      tenantId,
      isActive: true,
      status: { in: ['PENDING', 'PARTIAL'] },
    };

    if (filters.academicYearId) {
      where.feeStructure = { academicYearId: filters.academicYearId };
    }
    if (filters.classId) {
      where.feeStructure = { ...where.feeStructure, classId: filters.classId };
    }

    const studentFees = await prisma.studentFee.findMany({
      where,
      include: {
        student: {
          include: {
            enrollments: {
              where: { isActive: true },
              include: { class: true, division: true },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        feeStructure: { include: { feeHead: true, class: true } },
      },
      orderBy: [{ feeStructure: { class: { numericOrder: 'asc' } } }, { student: { grNumber: 'asc' } }],
    });

    // Group dues by student
    const studentDuesMap = new Map<string, any>();
    for (const sf of studentFees) {
      const remaining = sf.netAmount - sf.paidAmount;
      if (remaining <= 0) continue;

      if (!studentDuesMap.has(sf.studentId)) {
        const enrollment = sf.student.enrollments[0];
        studentDuesMap.set(sf.studentId, {
          studentId: sf.studentId,
          grNumber: sf.student.grNumber,
          studentNameEn: `${sf.student.firstNameEn} ${sf.student.lastNameEn}`,
          studentNameGu: `${sf.student.firstNameGu} ${sf.student.lastNameGu}`,
          className: enrollment ? `${enrollment.class.nameEn} - ${enrollment.division?.nameEn || 'A'}` : sf.feeStructure.class.nameEn,
          phone: sf.student.phone || '-',
          totalBilled: 0,
          totalDiscount: 0,
          totalNet: 0,
          totalPaid: 0,
          outstandingBalance: 0,
          headsPending: [] as string[],
        });
      }

      const s = studentDuesMap.get(sf.studentId);
      s.totalBilled += sf.amount;
      s.totalDiscount += sf.discountAmount;
      s.totalNet += sf.netAmount;
      s.totalPaid += sf.paidAmount;
      s.outstandingBalance += remaining;
      s.headsPending.push(`${sf.feeStructure.feeHead.nameEn} (₹${remaining})`);
    }

    const rows = Array.from(studentDuesMap.values()).map((s) => ({
      ...s,
      totalBilled: Math.round(s.totalBilled * 100) / 100,
      totalDiscount: Math.round(s.totalDiscount * 100) / 100,
      totalNet: Math.round(s.totalNet * 100) / 100,
      totalPaid: Math.round(s.totalPaid * 100) / 100,
      outstandingBalance: Math.round(s.outstandingBalance * 100) / 100,
      pendingDetails: s.headsPending.join(', '),
    }));

    const summary = {
      defaulterCount: rows.length,
      totalBilledAmount: Math.round(rows.reduce((sum, r) => sum + r.totalBilled, 0) * 100) / 100,
      totalCollectedAmount: Math.round(rows.reduce((sum, r) => sum + r.totalPaid, 0) * 100) / 100,
      totalOutstandingAmount: Math.round(rows.reduce((sum, r) => sum + r.outstandingBalance, 0) * 100) / 100,
    };

    return { title: 'Fee Outstanding & Dues Report / બાકી ફી પત્રક', summary, rows };
  }

  async getDailyCollectionReport(tenantId: string, filters: ReportFilterDto) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const payments = await prisma.feePayment.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        paymentDate: { gte: targetDate, lt: nextDay },
      },
      include: {
        student: true,
        items: { include: { studentFee: { include: { feeStructure: { include: { feeHead: true } } } } } },
      },
      orderBy: { paymentDate: 'asc' },
    });

    const rows = payments.map((p) => ({
      receiptNumber: p.receiptNumber,
      grNumber: p.student.grNumber,
      studentName: `${p.student.firstNameEn} ${p.student.lastNameEn}`,
      amount: p.totalAmount,
      mode: p.paymentMode,
      refNo: p.referenceNo || '-',
      narration: p.narration || '-',
    }));

    const summary = {
      date: targetDate.toISOString().split('T')[0],
      totalReceipts: rows.length,
      totalAmount: Math.round(rows.reduce((sum, r) => sum + r.amount, 0) * 100) / 100,
      cashAmount: Math.round(payments.filter((p) => p.paymentMode === 'CASH').reduce((s, p) => s + p.totalAmount, 0) * 100) / 100,
      bankAmount: Math.round(payments.filter((p) => p.paymentMode !== 'CASH').reduce((s, p) => s + p.totalAmount, 0) * 100) / 100,
    };

    return { title: 'Daily Fee Collection Report (Rojmel Synced) / દૈનિક ફી વસૂલાત', summary, rows };
  }

  async getMonthlyCollectionReport(tenantId: string, filters: ReportFilterDto) {
    const academicYearId = filters.academicYearId;
    const payments = await prisma.feePayment.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: {
        items: { include: { studentFee: { include: { feeStructure: { include: { feeHead: true } } } } } },
      },
      orderBy: { paymentDate: 'asc' },
    });

    const monthlyMap = new Map<string, any>();
    for (const p of payments) {
      const monthKey = p.paymentDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          receiptCount: 0,
          totalAmount: 0,
          cashAmount: 0,
          bankAmount: 0,
        });
      }
      const m = monthlyMap.get(monthKey);
      m.receiptCount++;
      m.totalAmount += p.totalAmount;
      if (p.paymentMode === 'CASH') m.cashAmount += p.totalAmount;
      else m.bankAmount += p.totalAmount;
    }

    const rows = Array.from(monthlyMap.values()).map((m) => ({
      ...m,
      totalAmount: Math.round(m.totalAmount * 100) / 100,
      cashAmount: Math.round(m.cashAmount * 100) / 100,
      bankAmount: Math.round(m.bankAmount * 100) / 100,
    }));

    const summary = {
      totalMonths: rows.length,
      grandTotal: Math.round(rows.reduce((sum, r) => sum + r.totalAmount, 0) * 100) / 100,
      totalCash: Math.round(rows.reduce((sum, r) => sum + r.cashAmount, 0) * 100) / 100,
      totalBank: Math.round(rows.reduce((sum, r) => sum + r.bankAmount, 0) * 100) / 100,
    };

    return { title: 'Monthly Fee Collection Summary / માસિક ફી વસૂલાત અહેવાલ', summary, rows };
  }

  async getStudentFeeStatement(tenantId: string, studentId: string, academicYearId?: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        enrollments: {
          where: { isActive: true },
          include: { class: true, division: true, academicYear: true },
          take: 1,
        },
      },
    });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    const studentFees = await prisma.studentFee.findMany({
      where: {
        studentId,
        tenantId,
        isActive: true,
        ...(academicYearId ? { feeStructure: { academicYearId } } : {}),
      },
      include: {
        feeStructure: { include: { feeHead: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const feePayments = await prisma.feePayment.findMany({
      where: {
        studentId,
        tenantId,
        status: 'ACTIVE',
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: {
        items: { include: { studentFee: { include: { feeStructure: { include: { feeHead: true } } } } } },
      },
      orderBy: { paymentDate: 'asc' },
    });

    const feeCharges = studentFees.map((sf) => ({
      type: 'FEE_CHARGE',
      head: sf.feeStructure.feeHead.nameEn,
      headGu: sf.feeStructure.feeHead.nameGu,
      grossAmount: sf.amount,
      discount: sf.discountAmount,
      fine: sf.fineAmount,
      netAmount: sf.netAmount,
      paidAmount: sf.paidAmount,
      balance: sf.netAmount - sf.paidAmount,
      status: sf.status,
    }));

    const paymentLedger = feePayments.map((fp) => ({
      type: 'PAYMENT_RECEIPT',
      receiptNumber: fp.receiptNumber,
      date: fp.paymentDate.toISOString().split('T')[0],
      amount: fp.totalAmount,
      paymentMode: fp.paymentMode,
      referenceNo: fp.referenceNo || '-',
    }));

    const totalBilled = feeCharges.reduce((s, c) => s + c.netAmount, 0);
    const totalPaid = paymentLedger.reduce((s, p) => s + p.amount, 0);
    const outstandingBalance = Math.round((totalBilled - totalPaid) * 100) / 100;

    return {
      title: 'Individual Student Fee Statement / વિદ્યાર્થી ફી ખાતાવહી',
      student: {
        grNumber: student.grNumber,
        nameEn: `${student.firstNameEn} ${student.lastNameEn}`,
        nameGu: `${student.firstNameGu} ${student.lastNameGu}`,
        className: student.enrollments[0]
          ? `${student.enrollments[0].class.nameEn} - ${student.enrollments[0].division?.nameEn || 'A'}`
          : '-',
      },
      summary: {
        totalBilled: Math.round(totalBilled * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        outstandingBalance,
        isFullyPaid: outstandingBalance <= 0,
      },
      feeCharges,
      paymentLedger,
    };
  }

  // =========================================================================
  // 3. ACCOUNTING & ROJMEL REPORTS
  // =========================================================================

  async getRojmelReport(tenantId: string, filters: ReportFilterDto) {
    const targetDate = filters.date ? new Date(filters.date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        entryDate: { gte: targetDate, lt: nextDay },
      },
      include: {
        lines: { include: { account: true } },
      },
      orderBy: { entryDate: 'asc' },
    });

    const jamaRows: any[] = [];
    const udharRows: any[] = [];

    for (const je of journalEntries) {
      for (const line of je.lines) {
        if (line.creditAmount > 0) {
          jamaRows.push({
            entryNumber: je.entryNumber,
            voucherNumber: je.voucherNumber || '-',
            accountCode: line.account.code,
            accountNameEn: line.account.nameEn,
            accountNameGu: line.account.nameGu,
            amount: line.creditAmount,
            narration: line.narration || je.narration || '-',
          });
        }
        if (line.debitAmount > 0) {
          udharRows.push({
            entryNumber: je.entryNumber,
            voucherNumber: je.voucherNumber || '-',
            accountCode: line.account.code,
            accountNameEn: line.account.nameEn,
            accountNameGu: line.account.nameGu,
            amount: line.debitAmount,
            narration: line.narration || je.narration || '-',
          });
        }
      }
    }

    const totalJama = Math.round(jamaRows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
    const totalUdhar = Math.round(udharRows.reduce((s, r) => s + r.amount, 0) * 100) / 100;

    return {
      title: 'Deshi Nama Rojmel (શ્રી રોજમેળ) / દૈનિક આવક-ખર્ચ મેળ',
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalJama,
        totalUdhar,
        isAakharoBalanced: Math.abs(totalJama - totalUdhar) < 0.01,
      },
      jamaRows,
      udharRows,
    };
  }

  async getCashBookReport(tenantId: string, filters: ReportFilterDto) {
    const cashAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, isCashAccount: true, isActive: true },
    });
    const cashAccountIds = cashAccounts.map((a) => a.id);

    const fromDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 3, 1);
    const toDate = filters.endDate ? new Date(filters.endDate) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const priorLines = await prisma.journalLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: { tenantId, status: 'ACTIVE', entryDate: { lt: fromDate } },
      },
    });

    let baseOpening = cashAccounts.reduce((sum, a) => sum + a.openingBalance, 0);
    for (const pl of priorLines) {
      baseOpening += pl.debitAmount - pl.creditAmount;
    }

    const periodLines = await prisma.journalLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: { tenantId, status: 'ACTIVE', entryDate: { gte: fromDate, lte: toDate } },
      },
      include: {
        journalEntry: { include: { lines: { include: { account: true } } } },
      },
      orderBy: { journalEntry: { entryDate: 'asc' } },
    });

    let runningBalance = baseOpening;
    const rows = periodLines.map((l) => {
      const isInflow = l.debitAmount > 0;
      runningBalance += l.debitAmount - l.creditAmount;
      const opp = l.journalEntry.lines.find((ol) => ol.id !== l.id);

      return {
        date: l.journalEntry.entryDate.toISOString().split('T')[0],
        entryNumber: l.journalEntry.entryNumber,
        voucherNumber: l.journalEntry.voucherNumber || '-',
        type: l.journalEntry.entryType,
        oppositeAccount: opp?.account.nameEn || 'Various Accounts',
        oppositeAccountGu: opp?.account.nameGu || 'વિવિધ ખાતાં',
        narration: l.narration || l.journalEntry.narration || '-',
        receiptAmount: l.debitAmount,
        paymentAmount: l.creditAmount,
        runningCashBalance: Math.round(runningBalance * 100) / 100,
      };
    });

    const totalReceipts = Math.round(rows.reduce((s, r) => s + r.receiptAmount, 0) * 100) / 100;
    const totalPayments = Math.round(rows.reduce((s, r) => s + r.paymentAmount, 0) * 100) / 100;

    return {
      title: 'Cash Book Report / રોકડ મેળ',
      openingBalance: Math.round(baseOpening * 100) / 100,
      closingBalance: Math.round(runningBalance * 100) / 100,
      summary: { totalReceipts, totalPayments, netChange: Math.round((totalReceipts - totalPayments) * 100) / 100 },
      rows,
    };
  }

  async getBankBookReport(tenantId: string, filters: ReportFilterDto) {
    const bankAccounts = await prisma.chartOfAccount.findMany({
      where: {
        tenantId,
        isBankAccount: true,
        isActive: true,
        ...(filters.accountId ? { id: filters.accountId } : {}),
      },
      include: { bankAccounts: true },
    });
    const bankAccountIds = bankAccounts.map((a) => a.id);

    const fromDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 3, 1);
    const toDate = filters.endDate ? new Date(filters.endDate) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const priorLines = await prisma.journalLine.findMany({
      where: {
        accountId: { in: bankAccountIds },
        journalEntry: { tenantId, status: 'ACTIVE', entryDate: { lt: fromDate } },
      },
    });

    let baseOpening = bankAccounts.reduce((sum, a) => sum + a.openingBalance, 0);
    for (const pl of priorLines) {
      baseOpening += pl.debitAmount - pl.creditAmount;
    }

    const periodLines = await prisma.journalLine.findMany({
      where: {
        accountId: { in: bankAccountIds },
        journalEntry: { tenantId, status: 'ACTIVE', entryDate: { gte: fromDate, lte: toDate } },
      },
      include: {
        account: true,
        journalEntry: { include: { lines: { include: { account: true } } } },
      },
      orderBy: { journalEntry: { entryDate: 'asc' } },
    });

    let runningBalance = baseOpening;
    const rows = periodLines.map((l) => {
      runningBalance += l.debitAmount - l.creditAmount;
      const opp = l.journalEntry.lines.find((ol) => ol.id !== l.id);

      return {
        date: l.journalEntry.entryDate.toISOString().split('T')[0],
        bankAccountName: l.account.nameEn,
        entryNumber: l.journalEntry.entryNumber,
        voucherNumber: l.journalEntry.voucherNumber || '-',
        type: l.journalEntry.entryType,
        oppositeAccount: opp?.account.nameEn || 'Various Accounts',
        narration: l.narration || l.journalEntry.narration || '-',
        depositAmount: l.debitAmount,
        withdrawalAmount: l.creditAmount,
        runningBankBalance: Math.round(runningBalance * 100) / 100,
      };
    });

    const totalDeposits = Math.round(rows.reduce((s, r) => s + r.depositAmount, 0) * 100) / 100;
    const totalWithdrawals = Math.round(rows.reduce((s, r) => s + r.withdrawalAmount, 0) * 100) / 100;

    return {
      title: 'Bank Book Report / બેંક મેળ',
      openingBalance: Math.round(baseOpening * 100) / 100,
      closingBalance: Math.round(runningBalance * 100) / 100,
      summary: { totalDeposits, totalWithdrawals, netChange: Math.round((totalDeposits - totalWithdrawals) * 100) / 100 },
      rows,
    };
  }

  async getLedgerReport(tenantId: string, accountId: string, filters: ReportFilterDto) {
    const account = await prisma.chartOfAccount.findFirst({
      where: { id: accountId, tenantId },
      include: { accountGroup: true },
    });
    if (!account) throw new Error('ACCOUNT_NOT_FOUND');

    const fromDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 3, 1);
    const toDate = filters.endDate ? new Date(filters.endDate) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const priorLines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: { tenantId, status: 'ACTIVE', entryDate: { lt: fromDate } },
      },
    });

    let priorDebit = 0;
    let priorCredit = 0;
    for (const pl of priorLines) {
      priorDebit += pl.debitAmount;
      priorCredit += pl.creditAmount;
    }

    let calculatedOpening = account.openingBalance;
    if (account.accountNature === 'DEBIT') {
      calculatedOpening += priorDebit - priorCredit;
    } else {
      calculatedOpening += priorCredit - priorDebit;
    }

    const periodLines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: { tenantId, status: 'ACTIVE', entryDate: { gte: fromDate, lte: toDate } },
      },
      include: {
        journalEntry: { include: { lines: { include: { account: true } } } },
      },
      orderBy: { journalEntry: { entryDate: 'asc' } },
    });

    let runningBalance = calculatedOpening;
    let totalDebit = 0;
    let totalCredit = 0;

    const rows = periodLines.map((l) => {
      totalDebit += l.debitAmount;
      totalCredit += l.creditAmount;

      if (account.accountNature === 'DEBIT') {
        runningBalance += l.debitAmount - l.creditAmount;
      } else {
        runningBalance += l.creditAmount - l.debitAmount;
      }

      const opp = l.journalEntry.lines.find((ol) => ol.id !== l.id);

      return {
        date: l.journalEntry.entryDate.toISOString().split('T')[0],
        entryNumber: l.journalEntry.entryNumber,
        voucherNumber: l.journalEntry.voucherNumber || '-',
        oppositeAccount: opp?.account.nameEn || 'Various Accounts',
        oppositeAccountGu: opp?.account.nameGu || 'વિવિધ ખાતાં',
        narration: l.narration || l.journalEntry.narration || '-',
        debitAmount: l.debitAmount,
        creditAmount: l.creditAmount,
        runningBalance: Math.round(runningBalance * 100) / 100,
        runningNature: runningBalance >= 0 ? account.accountNature : account.accountNature === 'DEBIT' ? 'CREDIT' : 'DEBIT',
      };
    });

    return {
      title: `General Ledger: ${account.nameEn} (${account.code}) / ખાતાવહી`,
      accountCode: account.code,
      accountNameEn: account.nameEn,
      accountNameGu: account.nameGu,
      accountGroup: account.accountGroup.nameEn,
      openingBalance: Math.round(calculatedOpening * 100) / 100,
      openingNature: account.accountNature,
      closingBalance: Math.round(runningBalance * 100) / 100,
      closingNature: runningBalance >= 0 ? account.accountNature : account.accountNature === 'DEBIT' ? 'CREDIT' : 'DEBIT',
      summary: {
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
      },
      rows,
    };
  }

  async getTrialBalanceReport(tenantId: string, filters: ReportFilterDto) {
    const financialYearId = filters.financialYearId;
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(financialYearId ? { financialYearId } : {}),
      },
      include: {
        accountGroup: true,
        journalLines: {
          where: { journalEntry: { status: 'ACTIVE' } },
        },
      },
      orderBy: [{ accountType: 'asc' }, { code: 'asc' }],
    });

    let grandDebit = 0;
    let grandCredit = 0;

    const rows = accounts.map((a) => {
      let totalDebit = 0;
      let totalCredit = 0;

      for (const line of a.journalLines) {
        totalDebit += line.debitAmount;
        totalCredit += line.creditAmount;
      }

      let netDebit = 0;
      let netCredit = 0;

      if (a.accountNature === 'DEBIT') {
        const net = a.openingBalance + totalDebit - totalCredit;
        if (net >= 0) netDebit = net;
        else netCredit = Math.abs(net);
      } else {
        const net = a.openingBalance + totalCredit - totalDebit;
        if (net >= 0) netCredit = net;
        else netDebit = Math.abs(net);
      }

      grandDebit += netDebit;
      grandCredit += netCredit;

      return {
        id: a.id,
        code: a.code,
        nameEn: a.nameEn,
        nameGu: a.nameGu,
        groupName: a.accountGroup.nameEn,
        groupType: a.accountGroup.groupType,
        debitAmount: Math.round(netDebit * 100) / 100,
        creditAmount: Math.round(netCredit * 100) / 100,
      };
    });

    const isBalanced = Math.abs(grandDebit - grandCredit) < 0.01;

    return {
      title: 'Trial Balance Report / કાચું સરવૈયું',
      summary: {
        grandDebit: Math.round(grandDebit * 100) / 100,
        grandCredit: Math.round(grandCredit * 100) / 100,
        difference: Math.round(Math.abs(grandDebit - grandCredit) * 100) / 100,
        isBalanced,
      },
      rows,
    };
  }

  async getIncomeExpenseReport(tenantId: string, filters: ReportFilterDto) {
    const fromDate = filters.startDate ? new Date(filters.startDate) : new Date(new Date().getFullYear(), 3, 1);
    const toDate = filters.endDate ? new Date(filters.endDate) : new Date();
    toDate.setHours(23, 59, 59, 999);

    const incomeAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, accountType: 'INCOME', isActive: true },
      include: {
        accountGroup: true,
        journalLines: {
          where: { journalEntry: { status: 'ACTIVE', entryDate: { gte: fromDate, lte: toDate } } },
        },
      },
    });

    const expenseAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, accountType: 'EXPENSE', isActive: true },
      include: {
        accountGroup: true,
        journalLines: {
          where: { journalEntry: { status: 'ACTIVE', entryDate: { gte: fromDate, lte: toDate } } },
        },
      },
    });

    const incomeRows = incomeAccounts.map((a) => {
      const total = a.journalLines.reduce((s, l) => s + l.creditAmount - l.debitAmount, 0);
      return {
        code: a.code,
        nameEn: a.nameEn,
        nameGu: a.nameGu,
        groupName: a.accountGroup.nameEn,
        amount: Math.round(Math.max(0, total) * 100) / 100,
      };
    });

    const expenseRows = expenseAccounts.map((a) => {
      const total = a.journalLines.reduce((s, l) => s + l.debitAmount - l.creditAmount, 0);
      return {
        code: a.code,
        nameEn: a.nameEn,
        nameGu: a.nameGu,
        groupName: a.accountGroup.nameEn,
        amount: Math.round(Math.max(0, total) * 100) / 100,
      };
    });

    const totalIncome = Math.round(incomeRows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
    const totalExpense = Math.round(expenseRows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
    const netSurplus = Math.round((totalIncome - totalExpense) * 100) / 100;

    return {
      title: 'Income & Expense Statement / આવક-ખર્ચ પત્રક',
      summary: {
        totalIncome,
        totalExpense,
        netSurplus,
        status: netSurplus >= 0 ? 'SURPLUS / બચત' : 'DEFICIT / ખાધ',
      },
      incomeRows,
      expenseRows,
    };
  }

  async getVoucherRegister(tenantId: string, filters: ReportFilterDto, entryType?: string) {
    const where: any = { tenantId, status: 'ACTIVE' };

    if (entryType) {
      where.entryType = entryType;
    } else if (filters.status) {
      where.entryType = filters.status;
    }

    if (filters.financialYearId) where.financialYearId = filters.financialYearId;
    if (filters.startDate || filters.endDate) {
      where.entryDate = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(`${filters.endDate}T23:59:59.999Z`) } : {}),
      };
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { entryNumber: { contains: q } },
        { voucherNumber: { contains: q } },
        { narration: { contains: q } },
      ];
    }

    const vouchers = await prisma.journalEntry.findMany({
      where,
      include: {
        lines: { include: { account: true } },
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { entryDate: 'desc' },
    });

    const rows = vouchers.map((v) => {
      const debitAccounts = v.lines
        .filter((l) => l.debitAmount > 0)
        .map((l) => `${l.account.nameEn} (₹${l.debitAmount})`)
        .join(', ');
      const creditAccounts = v.lines
        .filter((l) => l.creditAmount > 0)
        .map((l) => `${l.account.nameEn} (₹${l.creditAmount})`)
        .join(', ');

      return {
        id: v.id,
        entryNumber: v.entryNumber,
        voucherNumber: v.voucherNumber || '-',
        date: v.entryDate.toISOString().split('T')[0],
        entryType: v.entryType,
        totalAmount: v.totalAmount,
        debitAccounts: debitAccounts || '-',
        creditAccounts: creditAccounts || '-',
        narration: v.narration || '-',
        createdBy: v.createdBy.email || 'Admin',
      };
    });

    const totalAmount = Math.round(rows.reduce((s, r) => s + r.totalAmount, 0) * 100) / 100;

    return {
      title: entryType ? `${entryType} Register / વાઉચર રજીસ્ટર` : 'Comprehensive Voucher Register / સર્વ વાઉચર રજીસ્ટર',
      summary: { totalCount: rows.length, totalAmount },
      rows,
    };
  }

  async getGrantReport(tenantId: string, filters: ReportFilterDto) {
    const where: any = {
      tenantId,
      isActive: true,
      ...(filters.financialYearId ? { financialYearId: filters.financialYearId } : {}),
    };

    const grants = await prisma.grant.findMany({
      where,
      include: {
        account: true,
        financialYear: true,
        transactions: { orderBy: { transactionDate: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = grants.map((g) => {
      const unspent = g.receivedAmount - g.utilizedAmount;
      return {
        id: g.id,
        nameEn: g.nameEn,
        nameGu: g.nameGu,
        source: g.source || 'Govt of Gujarat',
        grantHead: g.grantHead || 'General School Grant',
        sanctionedAmount: g.sanctionedAmount,
        receivedAmount: g.receivedAmount,
        utilizedAmount: g.utilizedAmount,
        unspentBalance: Math.round(unspent * 100) / 100,
        status: g.status,
      };
    });

    const summary = {
      totalGrants: rows.length,
      totalSanctioned: Math.round(rows.reduce((s, r) => s + r.sanctionedAmount, 0) * 100) / 100,
      totalReceived: Math.round(rows.reduce((s, r) => s + r.receivedAmount, 0) * 100) / 100,
      totalUtilized: Math.round(rows.reduce((s, r) => s + r.utilizedAmount, 0) * 100) / 100,
      totalUnspent: Math.round(rows.reduce((s, r) => s + r.unspentBalance, 0) * 100) / 100,
    };

    return { title: 'Government Grants & Utilization Report / સરકારી અનુદાન પત્રક', summary, rows };
  }

  // =========================================================================
  // 4. EXCEL (.xlsx) EXPORT GENERATOR
  // =========================================================================

  async generateExcelReport(
    reportTitle: string,
    data: { summary?: any; rows: any[] },
    schoolInfo?: { nameEn?: string; nameGu?: string; diseCode?: string | null; address?: string | null }
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Apna School ERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Report', {
      views: [{ showGridLines: true }],
    });

    // 1. School Header Block
    const schoolName = schoolInfo?.nameGu ? `${schoolInfo.nameGu} (${schoolInfo.nameEn || ''})` : 'અપના સ્કૂલ (Apna School ERP)';
    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = schoolName;
    sheet.getCell('A1').font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1E3A8A' } };
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 25;

    sheet.mergeCells('A2:H2');
    sheet.getCell('A2').value = reportTitle;
    sheet.getCell('A2').font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    sheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 20;

    sheet.mergeCells('A3:H3');
    sheet.getCell('A3').value = `Generated on: ${new Date().toLocaleString('en-IN')} | DISE: ${schoolInfo?.diseCode || '24090100101'}`;
    sheet.getCell('A3').font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF64748B' } };
    sheet.getCell('A3').alignment = { horizontal: 'center', vertical: 'middle' };

    // Empty row
    sheet.addRow([]);

    if (data.rows.length === 0) {
      sheet.addRow(['No records found for the selected criteria.']);
      const buf = await workbook.xlsx.writeBuffer();
      return Buffer.from(buf);
    }

    // Headers
    const headers = Object.keys(data.rows[0]).filter((k) => k !== 'id');
    const headerRow = sheet.addRow(headers.map((h) => this.formatColumnHeader(h)));
    headerRow.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.height = 24;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' },
      };
    });

    // Data rows
    for (const r of data.rows) {
      const rowValues = headers.map((h) => r[h]);
      const dataRow = sheet.addRow(rowValues);
      dataRow.font = { name: 'Arial', size: 9.5 };
      dataRow.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
        if (typeof cell.value === 'number') {
          cell.alignment = { horizontal: 'right' };
        }
      });
    }

    // Auto fit columns
    sheet.columns.forEach((column: any) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: false }, (cell: any) => {
        const len = cell.value ? String(cell.value).length : 0;
        if (len > maxLen) maxLen = Math.min(len + 3, 50);
      });
      column.width = maxLen;
    });

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  private formatColumnHeader(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  // =========================================================================
  // 5. PRINT / PDF READY HTML GENERATOR
  // =========================================================================

  generatePrintHtml(
    reportTitle: string,
    data: { summary?: any; rows: any[] },
    schoolInfo?: { nameEn?: string; nameGu?: string; diseCode?: string | null; address?: string | null }
  ): string {
    const schoolNameGu = schoolInfo?.nameGu || 'અપના વિદ્યામંદિર (ગુજરાત)';
    const schoolNameEn = schoolInfo?.nameEn || 'Apna Vidyamandir (Gujarat)';
    const diseCode = schoolInfo?.diseCode || '24090100101';
    const dateStr = new Date().toLocaleDateString('gu-IN');

    const headers = data.rows.length > 0 ? Object.keys(data.rows[0]).filter((k) => k !== 'id') : [];

    const summaryCardsHtml = data.summary
      ? Object.entries(data.summary)
          .map(
            ([k, v]) => `
          <div class="summary-card">
            <span class="label">${this.formatColumnHeader(k)}</span>
            <span class="val">${typeof v === 'number' && k.toLowerCase().includes('amount') ? '₹' + v.toLocaleString('en-IN') : String(v)}</span>
          </div>`
          )
          .join('')
      : '';

    const tableRowsHtml = data.rows
      .map(
        (r, idx) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          ${headers.map((h) => `<td style="${typeof r[h] === 'number' ? 'text-align:right;' : ''}">${r[h] !== null && r[h] !== undefined ? r[h] : '-'}</td>`).join('')}
        </tr>`
      )
      .join('');

    return `<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="utf-8">
  <title>${reportTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Anek+Gujarati:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    body {
      font-family: 'Anek Gujarati', 'Inter', sans-serif;
      margin: 20px;
      color: #0f172a;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 12px;
      margin-bottom: 15px;
    }
    .school-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0;
    }
    .school-sub {
      font-size: 14px;
      color: #475569;
      margin: 4px 0;
    }
    .report-name {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 6px;
      background: #f1f5f9;
      display: inline-block;
      padding: 4px 16px;
      border-radius: 4px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 12px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 15px;
    }
    .summary-card {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      border-radius: 6px;
      background: #f8fafc;
    }
    .summary-card .label {
      display: block;
      font-size: 11px;
      color: #64748b;
    }
    .summary-card .val {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
    }
    th {
      background-color: #1e293b;
      color: #ffffff;
      font-weight: 600;
      text-align: left;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .signatures {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      padding: 0 30px;
    }
    .sig-box {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      border-top: 1px dashed #475569;
      width: 160px;
      padding-top: 6px;
    }
    @media print {
      body { margin: 10mm; }
      .no-print { display: none; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="school-title">${schoolNameGu}</h1>
    <div class="school-sub">${schoolNameEn} • DISE: ${diseCode}</div>
    <div class="report-name">${reportTitle}</div>
  </div>

  <div class="meta">
    <span>તારીખ: ${dateStr}</span>
    <span>Apna School ERP (ગુજરાત બોર્ડ અધિકૃત પત્રક)</span>
  </div>

  ${summaryCardsHtml ? `<div class="summary-grid">${summaryCardsHtml}</div>` : ''}

  <table>
    <thead>
      <tr>
        <th style="width: 35px; text-align:center;">#</th>
        ${headers.map((h) => `<th>${this.formatColumnHeader(h)}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="signatures">
    <div class="sig-box">તૈયાર કરનાર ક્લાર્ક</div>
    <div class="sig-box">હિસાબી અધિકારી / એકાઉન્ટન્ટ</div>
    <div class="sig-box">આચાર્યશ્રીના સહી-સિક્કો</div>
  </div>

  <script>
    window.onload = function() {
      // Auto trigger print dialog if requested
      if (window.location.search.includes('autoprint=true')) {
        window.print();
      }
    };
  </script>
</body>
</html>`;
  }
}

export const reportingService = new ReportingService();
