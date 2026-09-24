import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';
import ExcelJS from 'exceljs';

export interface AssignTeacherDto {
  staffId: string;
  classId: string;
  divisionId?: string;
  subjectId?: string;
  academicYearId: string;
  isClassTeacher?: boolean;
}

export class StaffService {
  async getStaffList(tenantId: string, staffType?: string) {
    return prisma.staff.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(staffType ? { staffType } : {}),
      },
      include: {
        teacherAssignments: {
          where: { isActive: true },
          include: {
            class: true,
            division: true,
            subject: true,
            academicYear: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    });
  }

  async getStaffById(tenantId: string, staffId: string) {
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, tenantId },
      include: {
        teacherAssignments: {
          include: {
            class: true,
            division: true,
            subject: true,
            academicYear: true,
          },
        },
        staffAttendances: {
          take: 30,
          orderBy: { attendanceDate: 'desc' },
        },
      },
    });

    if (!staff) throw new Error('STAFF_NOT_FOUND');
    return staff;
  }

  async createStaff(tenantId: string, userId: string, data: any) {
    let employeeId = data.employeeId;
    if (!employeeId) {
      const count = await prisma.staff.count({ where: { tenantId } });
      employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
    }

    const existing = await prisma.staff.findFirst({
      where: { tenantId, employeeId },
    });
    if (existing) {
      throw new Error(`Employee ID ${employeeId} already exists in this school.`);
    }

    const staff = await prisma.staff.create({
      data: {
        tenantId,
        employeeId,
        firstNameEn: data.firstNameEn,
        middleNameEn: data.middleNameEn,
        lastNameEn: data.lastNameEn,
        firstNameGu: data.firstNameGu || data.firstNameEn,
        middleNameGu: data.middleNameGu || data.middleNameEn,
        lastNameGu: data.lastNameGu || data.lastNameEn,
        gender: data.gender || 'MALE',
        phone: data.phone,
        email: data.email,
        designation: data.designation || 'Teacher',
        department: data.department || 'Primary Section',
        qualification: data.qualification,
        specialization: data.specialization,
        experienceYears: data.experienceYears ? parseInt(data.experienceYears, 10) : undefined,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        staffType: data.staffType || 'TEACHING',
        employmentType: data.employmentType || 'PERMANENT',
        salaryAmount: data.salaryAmount ? parseFloat(data.salaryAmount) : null,
        bankName: data.bankName,
        bankAccountNo: data.bankAccountNo,
        bankIfsc: data.bankIfsc,
        address: data.address,
        status: 'ACTIVE',
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'STAFF',
      entityId: staff.id,
      newValues: { employeeId, name: `${staff.firstNameEn} ${staff.lastNameEn}` },
    });

    return staff;
  }

  async updateStaff(tenantId: string, userId: string, staffId: string, data: any) {
    const existing = await prisma.staff.findFirst({ where: { id: staffId, tenantId } });
    if (!existing) throw new Error('STAFF_NOT_FOUND');

    const updated = await prisma.staff.update({
      where: { id: staffId },
      data: {
        firstNameEn: data.firstNameEn ?? existing.firstNameEn,
        middleNameEn: data.middleNameEn ?? existing.middleNameEn,
        lastNameEn: data.lastNameEn ?? existing.lastNameEn,
        firstNameGu: data.firstNameGu ?? existing.firstNameGu,
        middleNameGu: data.middleNameGu ?? existing.middleNameGu,
        lastNameGu: data.lastNameGu ?? existing.lastNameGu,
        gender: data.gender ?? existing.gender,
        phone: data.phone ?? existing.phone,
        email: data.email ?? existing.email,
        designation: data.designation ?? existing.designation,
        department: data.department ?? existing.department,
        qualification: data.qualification ?? existing.qualification,
        specialization: data.specialization ?? existing.specialization,
        salaryAmount: data.salaryAmount !== undefined ? (data.salaryAmount ? parseFloat(data.salaryAmount) : null) : existing.salaryAmount,
        bankName: data.bankName ?? existing.bankName,
        bankAccountNo: data.bankAccountNo ?? existing.bankAccountNo,
        bankIfsc: data.bankIfsc ?? existing.bankIfsc,
        status: data.status ?? existing.status,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'STAFF',
      entityId: staffId,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  async assignTeacher(tenantId: string, userId: string, dto: AssignTeacherDto) {
    const staff = await prisma.staff.findFirst({ where: { id: dto.staffId, tenantId } });
    if (!staff) throw new Error('STAFF_NOT_FOUND');

    const assignment = await prisma.teacherAssignment.create({
      data: {
        tenantId,
        staffId: dto.staffId,
        classId: dto.classId,
        divisionId: dto.divisionId || null,
        subjectId: dto.subjectId || null,
        academicYearId: dto.academicYearId,
        isClassTeacher: dto.isClassTeacher || false,
      },
      include: {
        class: true,
        division: true,
        subject: true,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'ASSIGN_TEACHER',
      entityType: 'TEACHER_ASSIGNMENT',
      entityId: assignment.id,
      newValues: { staffId: dto.staffId, classId: dto.classId, isClassTeacher: dto.isClassTeacher },
    });

    return assignment;
  }

  async exportStaffExcel(tenantId: string) {
    const staff = await prisma.staff.findMany({
      where: { tenantId, isActive: true },
      include: {
        teacherAssignments: {
          include: { class: true, division: true, subject: true },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Staff');

    worksheet.columns = [
      { header: 'Emp ID (કર્મચારી નં)', key: 'employeeId', width: 16 },
      { header: 'Name English', key: 'nameEn', width: 28 },
      { header: 'નામ ગુજરાતી', key: 'nameGu', width: 28 },
      { header: 'Designation (હોદ્દો)', key: 'designation', width: 22 },
      { header: 'Department (વિભાગ)', key: 'department', width: 20 },
      { header: 'Qualification (લાયકાત)', key: 'qualification', width: 20 },
      { header: 'Mobile (મોબાઈલ)', key: 'phone', width: 16 },
      { header: 'Type', key: 'staffType', width: 15 },
      { header: 'Salary (₹)', key: 'salary', width: 14 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    };

    for (const s of staff) {
      worksheet.addRow({
        employeeId: s.employeeId,
        nameEn: `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.trim(),
        nameGu: `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.trim(),
        designation: s.designation,
        department: s.department || '',
        qualification: s.qualification || '',
        phone: s.phone || '',
        staffType: s.staffType,
        salary: s.salaryAmount || '',
        status: s.status,
      });
    }

    return workbook;
  }
}

export const staffService = new StaffService();
