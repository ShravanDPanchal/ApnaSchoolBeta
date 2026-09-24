import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';
import ExcelJS from 'exceljs';

export interface StudentFilterParams {
  classId?: string;
  divisionId?: string;
  academicYearId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PromoteStudentsDto {
  targetAcademicYearId: string;
  sourceClassId: string;
  targetClassId: string;
  targetDivisionId?: string;
  studentIds: string[];
}

export interface TransferStudentDto {
  studentId: string;
  transferDate: string;
  reason: string;
  leavingStandard: string;
  conduct: string;
  progress: string;
  destinationSchool?: string;
}

export interface ImportRowError {
  rowNumber: number;
  grNumber?: string;
  error: string;
}

export class StudentService {
  async getStudents(tenantId: string, params: StudentFilterParams) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: true,
    };

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.search) {
      const q = params.search.trim();
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

    if (params.classId || params.divisionId || params.academicYearId) {
      where.enrollments = {
        some: {
          isActive: true,
          ...(params.academicYearId ? { academicYearId: params.academicYearId } : {}),
          ...(params.classId ? { classId: params.classId } : {}),
          ...(params.divisionId ? { divisionId: params.divisionId } : {}),
        },
      };
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { grNumber: 'asc' },
        include: {
          enrollments: {
            where: { isActive: true },
            include: {
              class: true,
              division: true,
              academicYear: true,
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          studentParents: {
            include: {
              parent: true,
            },
          },
        },
      }),
    ]);

    const formatted = students.map((s) => {
      const enrollment = s.enrollments[0];
      const primaryParent = s.studentParents.find((sp) => sp.isPrimary)?.parent || s.studentParents[0]?.parent;
      return {
        id: s.id,
        grNumber: s.grNumber,
        admissionNo: s.admissionNo,
        firstNameEn: s.firstNameEn,
        middleNameEn: s.middleNameEn,
        lastNameEn: s.lastNameEn,
        firstNameGu: s.firstNameGu,
        middleNameGu: s.middleNameGu,
        lastNameGu: s.lastNameGu,
        fullNameEn: `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.replace(/\s+/g, ' ').trim(),
        fullNameGu: `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.replace(/\s+/g, ' ').trim(),
        gender: s.gender,
        dateOfBirth: s.dateOfBirth.toISOString().split('T')[0],
        dobInWords: s.dobInWords,
        bloodGroup: s.bloodGroup,
        aadhaarNumber: s.aadhaarNumber,
        apaarId: s.apaarId,
        ctsUniqueId: s.ctsUniqueId,
        phone: s.phone,
        email: s.email,
        category: s.category,
        status: s.status,
        photoUrl: s.photoUrl,
        classId: enrollment?.classId,
        classNameEn: enrollment?.class?.nameEn,
        classNameGu: enrollment?.class?.nameGu,
        divisionId: enrollment?.divisionId,
        divisionNameEn: enrollment?.division?.nameEn,
        rollNumber: enrollment?.rollNumber,
        parentName: primaryParent ? `${primaryParent.firstNameEn} ${primaryParent.lastNameEn || ''}`.trim() : undefined,
        parentNameGu: primaryParent ? `${primaryParent.firstNameGu || primaryParent.firstNameEn} ${primaryParent.lastNameGu || primaryParent.lastNameEn || ''}`.trim() : undefined,
        parentPhone: primaryParent?.phone,
        parentRelation: primaryParent?.relationType,
      };
    });

    return {
      students: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(tenantId: string, studentId: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        enrollments: {
          include: {
            class: true,
            division: true,
            academicYear: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        studentParents: {
          include: { parent: true },
        },
        studentFees: {
          include: {
            feeStructure: {
              include: { feeHead: true },
            },
          },
        },
        feePayments: {
          orderBy: { paymentDate: 'desc' },
        },
        studentAttendances: {
          take: 30,
          orderBy: { attendanceDate: 'desc' },
        },
      },
    });

    if (!student) throw new Error('STUDENT_NOT_FOUND');

    const documents = await prisma.document.findMany({
      where: { tenantId, entityType: 'STUDENT', entityId: studentId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      ...student,
      documents,
    };
  }

  async createStudent(tenantId: string, userId: string, data: any) {
    let grNumber = data.grNumber;
    if (!grNumber) {
      const count = await prisma.student.count({ where: { tenantId } });
      grNumber = String(count + 1).padStart(4, '0');
    }

    const existing = await prisma.student.findFirst({
      where: { tenantId, grNumber },
    });
    if (existing) {
      throw new Error(`GR Number ${grNumber} already exists in this school.`);
    }

    const student = await prisma.student.create({
      data: {
        tenantId,
        grNumber,
        admissionNo: data.admissionNo || `ADM-${grNumber}`,
        firstNameEn: data.firstNameEn,
        middleNameEn: data.middleNameEn,
        lastNameEn: data.lastNameEn,
        firstNameGu: data.firstNameGu || data.firstNameEn,
        middleNameGu: data.middleNameGu || data.middleNameEn,
        lastNameGu: data.lastNameGu || data.lastNameEn,
        gender: data.gender || 'MALE',
        dateOfBirth: new Date(data.dateOfBirth),
        dobInWords: data.dobInWords,
        bloodGroup: data.bloodGroup,
        aadhaarNumber: data.aadhaarNumber,
        apaarId: data.apaarId,
        ctsUniqueId: data.ctsUniqueId,
        addressLine1: data.addressLine1,
        city: data.city || 'Rajkot',
        district: data.district || 'Rajkot',
        pinCode: data.pinCode,
        phone: data.phone,
        email: data.email,
        category: data.category || 'General',
        religion: data.religion || 'Hindu',
        admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
        previousSchool: data.previousSchool,
        status: 'ACTIVE',
      },
    });

    // Create Enrollment
    if (data.classId && data.academicYearId) {
      const enroll = await prisma.enrollment.create({
        data: {
          tenantId,
          studentId: student.id,
          academicYearId: data.academicYearId,
          classId: data.classId,
          divisionId: data.divisionId || null,
          rollNumber: data.rollNumber ? parseInt(data.rollNumber, 10) : null,
        },
      });

      // Auto-assign fee structures
      const feeStructures = await prisma.feeStructure.findMany({
        where: {
          tenantId,
          academicYearId: data.academicYearId,
          classId: data.classId,
          isActive: true,
        },
      });

      for (const fs of feeStructures) {
        await prisma.studentFee.create({
          data: {
            tenantId,
            studentId: student.id,
            enrollmentId: enroll.id,
            feeStructureId: fs.id,
            amount: fs.amount,
            netAmount: fs.amount,
            dueDate: fs.dueDate,
            status: 'PENDING',
          },
        });
      }
    }

    // Create Parent/Guardian
    if (data.parentFirstNameEn || data.parentFirstNameGu) {
      const parent = await prisma.parent.create({
        data: {
          tenantId,
          relationType: data.parentRelation || 'FATHER',
          firstNameEn: data.parentFirstNameEn || data.firstNameEn,
          lastNameEn: data.parentLastNameEn || data.lastNameEn,
          firstNameGu: data.parentFirstNameGu || data.firstNameGu,
          lastNameGu: data.parentLastNameGu || data.lastNameGu,
          phone: data.parentPhone || data.phone,
          occupation: data.parentOccupation,
          annualIncome: data.parentAnnualIncome ? parseFloat(data.parentAnnualIncome) : null,
        },
      });

      await prisma.studentParent.create({
        data: {
          studentId: student.id,
          parentId: parent.id,
          isPrimary: true,
        },
      });
    }

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'STUDENT',
      entityId: student.id,
      newValues: { grNumber: student.grNumber, name: `${student.firstNameEn} ${student.lastNameEn}` },
    });

    return student;
  }

  async updateStudent(tenantId: string, userId: string, studentId: string, data: any) {
    const existing = await prisma.student.findFirst({ where: { id: studentId, tenantId } });
    if (!existing) throw new Error('STUDENT_NOT_FOUND');

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        firstNameEn: data.firstNameEn ?? existing.firstNameEn,
        middleNameEn: data.middleNameEn ?? existing.middleNameEn,
        lastNameEn: data.lastNameEn ?? existing.lastNameEn,
        firstNameGu: data.firstNameGu ?? existing.firstNameGu,
        middleNameGu: data.middleNameGu ?? existing.middleNameGu,
        lastNameGu: data.lastNameGu ?? existing.lastNameGu,
        gender: data.gender ?? existing.gender,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : existing.dateOfBirth,
        dobInWords: data.dobInWords ?? existing.dobInWords,
        bloodGroup: data.bloodGroup ?? existing.bloodGroup,
        aadhaarNumber: data.aadhaarNumber ?? existing.aadhaarNumber,
        apaarId: data.apaarId ?? existing.apaarId,
        ctsUniqueId: data.ctsUniqueId ?? existing.ctsUniqueId,
        phone: data.phone ?? existing.phone,
        email: data.email ?? existing.email,
        addressLine1: data.addressLine1 ?? existing.addressLine1,
        city: data.city ?? existing.city,
        district: data.district ?? existing.district,
        pinCode: data.pinCode ?? existing.pinCode,
        category: data.category ?? existing.category,
        status: data.status ?? existing.status,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'STUDENT',
      entityId: studentId,
      oldValues: existing,
      newValues: updated,
    });

    return updated;
  }

  // --- STUDENT PROMOTION ---
  async promoteStudents(tenantId: string, userId: string, dto: PromoteStudentsDto) {
    if (!dto.studentIds || dto.studentIds.length === 0) {
      throw new Error('At least one student must be selected for promotion.');
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        tenantId,
        academicYearId: dto.targetAcademicYearId,
        classId: dto.targetClassId,
        isActive: true,
      },
    });

    const promotedCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const studentId of dto.studentIds) {
        // 1. Verify student exists in this tenant
        const student = await tx.student.findFirst({ where: { id: studentId, tenantId } });
        if (!student) continue;

        // 2. Mark previous enrollment as PROMOTED
        await tx.enrollment.updateMany({
          where: { tenantId, studentId, classId: dto.sourceClassId },
          data: { status: 'PROMOTED' },
        });

        // 3. Create new enrollment for target academic year
        const newEnroll = await tx.enrollment.upsert({
          where: {
            tenantId_studentId_academicYearId: {
              tenantId,
              studentId,
              academicYearId: dto.targetAcademicYearId,
            },
          },
          update: {
            classId: dto.targetClassId,
            divisionId: dto.targetDivisionId || null,
            status: 'ACTIVE',
            isActive: true,
          },
          create: {
            tenantId,
            studentId,
            academicYearId: dto.targetAcademicYearId,
            classId: dto.targetClassId,
            divisionId: dto.targetDivisionId || null,
            status: 'ACTIVE',
          },
        });

        // 4. Assign fee structures for the promoted class
        for (const fs of feeStructures) {
          await tx.studentFee.create({
            data: {
              tenantId,
              studentId,
              enrollmentId: newEnroll.id,
              feeStructureId: fs.id,
              amount: fs.amount,
              netAmount: fs.amount,
              dueDate: fs.dueDate,
              status: 'PENDING',
            },
          });
        }

        count++;
      }
      return count;
    });

    await logAudit({
      tenantId,
      userId,
      action: 'BULK_PROMOTE',
      entityType: 'ENROLLMENT',
      newValues: {
        count: promotedCount,
        sourceClass: dto.sourceClassId,
        targetClass: dto.targetClassId,
        targetYear: dto.targetAcademicYearId,
      },
    });

    return { success: true, promotedCount };
  }

  // --- STUDENT TRANSFER / WITHDRAWAL (LC GENERATION) ---
  async transferOrWithdrawStudent(tenantId: string, userId: string, dto: TransferStudentDto) {
    const student = await prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
      include: {
        enrollments: {
          include: { class: true, division: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) throw new Error('STUDENT_NOT_FOUND');

    const transferDate = new Date(dto.transferDate);

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mark student status as TRANSFERRED
      const s = await tx.student.update({
        where: { id: student.id },
        data: {
          status: 'TRANSFERRED',
          statusDate: transferDate,
          statusReason: `${dto.reason} | Destination: ${dto.destinationSchool || 'N/A'} | Conduct: ${dto.conduct}`,
        },
      });

      // 2. Mark active enrollment as TRANSFERRED
      await tx.enrollment.updateMany({
        where: { tenantId, studentId: student.id, isActive: true },
        data: { status: 'TRANSFERRED' },
      });

      return s;
    });

    await logAudit({
      tenantId,
      userId,
      action: 'TRANSFER_STUDENT',
      entityType: 'STUDENT',
      entityId: student.id,
      newValues: { grNumber: student.grNumber, reason: dto.reason, date: dto.transferDate },
    });

    // Return Certificate data
    const school = await prisma.school.findFirst({ where: { tenantId } });
    return {
      success: true,
      leavingCertificate: {
        schoolNameEn: school?.nameEn,
        schoolNameGu: school?.nameGu,
        diseCode: school?.diseCode,
        grNumber: student.grNumber,
        studentFullNameEn: `${student.firstNameEn} ${student.middleNameEn || ''} ${student.lastNameEn}`.trim(),
        studentFullNameGu: `${student.firstNameGu} ${student.middleNameGu || ''} ${student.lastNameGu}`.trim(),
        gender: student.gender,
        dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
        dobInWords: student.dobInWords || 'વિગતવાર શબ્દોમાં',
        category: student.category,
        religion: student.religion,
        apaarId: student.apaarId,
        ctsUniqueId: student.ctsUniqueId,
        admissionDate: student.admissionDate?.toISOString().split('T')[0],
        leavingDate: dto.transferDate,
        leavingStandard: dto.leavingStandard || student.enrollments[0]?.class?.nameEn,
        reasonForLeaving: dto.reason,
        conduct: dto.conduct,
        progress: dto.progress,
      },
    };
  }

  // --- STUDENT DOCUMENTS ---
  async addStudentDocument(tenantId: string, userId: string, studentId: string, docData: { fileName: string; fileType: string; fileSize?: number; storagePath: string }) {
    const student = await prisma.student.findFirst({ where: { id: studentId, tenantId } });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    const doc = await prisma.document.create({
      data: {
        tenantId,
        entityType: 'STUDENT',
        entityId: studentId,
        fileName: docData.fileName,
        fileType: docData.fileType,
        fileSize: docData.fileSize || 0,
        storagePath: docData.storagePath,
        uploadedBy: userId,
      },
    });

    return doc;
  }

  async getStudentDocuments(tenantId: string, studentId: string) {
    return prisma.document.findMany({
      where: { tenantId, entityType: 'STUDENT', entityId: studentId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- EXCEL IMPORT / EXPORT ---
  async getImportTemplate() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Student_Import_Template');

    sheet.columns = [
      { header: 'GR Number * (જી.આર. નં)', key: 'grNumber', width: 16 },
      { header: 'First Name English *', key: 'firstNameEn', width: 20 },
      { header: 'Middle Name English', key: 'middleNameEn', width: 20 },
      { header: 'Last Name English *', key: 'lastNameEn', width: 20 },
      { header: 'પ્રથમ નામ ગુજરાતી *', key: 'firstNameGu', width: 20 },
      { header: 'પિતાનું નામ ગુજરાતી', key: 'middleNameGu', width: 20 },
      { header: 'અટક ગુજરાતી *', key: 'lastNameGu', width: 20 },
      { header: 'Standard Number * (1-8)', key: 'classOrder', width: 18 },
      { header: 'Division (A/B)', key: 'division', width: 14 },
      { header: 'Gender * (MALE/FEMALE)', key: 'gender', width: 18 },
      { header: 'Birth Date * (YYYY-MM-DD)', key: 'dateOfBirth', width: 22 },
      { header: 'Mobile (મોબાઈલ)', key: 'phone', width: 16 },
      { header: 'Aadhaar (આધાર નં)', key: 'aadhaar', width: 18 },
      { header: 'APAAR ID (12-digit)', key: 'apaar', width: 18 },
      { header: 'CTS Unique ID (18-digit)', key: 'cts', width: 22 },
      { header: 'Category (General/OBC/SC/ST)', key: 'category', width: 18 },
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    };

    sheet.addRow({
      grNumber: '1099',
      firstNameEn: 'Mehul',
      middleNameEn: 'Bharatbhai',
      lastNameEn: 'Dave',
      firstNameGu: 'મેહુલ',
      middleNameGu: 'ભરતભાઈ',
      lastNameGu: 'દવે',
      classOrder: 1,
      division: 'A',
      gender: 'MALE',
      dateOfBirth: '2019-08-10',
      phone: '9825099887',
      aadhaar: '240123456789',
      apaar: '123456789099',
      cts: '240901012340001099',
      category: 'General',
    });

    return workbook;
  }

  async importStudentsFromBuffer(tenantId: string, userId: string, academicYearId: string, buffer: any) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    if (!sheet) throw new Error('Uploaded Excel file contains no worksheets.');

    const rows: any[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const values: any = row.values;
      rows.push({
        rowNumber,
        grNumber: String(values[1] || '').trim(),
        firstNameEn: String(values[2] || '').trim(),
        middleNameEn: String(values[3] || '').trim(),
        lastNameEn: String(values[4] || '').trim(),
        firstNameGu: String(values[5] || '').trim(),
        middleNameGu: String(values[6] || '').trim(),
        lastNameGu: String(values[7] || '').trim(),
        classOrder: parseInt(String(values[8] || '1'), 10),
        division: String(values[9] || 'A').trim().toUpperCase(),
        gender: String(values[10] || 'MALE').trim().toUpperCase(),
        dateOfBirth: String(values[11] || '2019-01-01').trim(),
        phone: String(values[12] || '').trim(),
        aadhaar: String(values[13] || '').trim(),
        apaar: String(values[14] || '').trim(),
        cts: String(values[15] || '').trim(),
        category: String(values[16] || 'General').trim(),
      });
    });

    const classes = await prisma.class.findMany({
      where: { tenantId, isActive: true },
      include: { divisions: true },
    });

    const errors: ImportRowError[] = [];
    const validStudentsToCreate: any[] = [];

    const existingStudents = await prisma.student.findMany({
      where: { tenantId },
      select: { grNumber: true },
    });
    const existingGRSet = new Set(existingStudents.map((s) => s.grNumber));
    const sheetGRSet = new Set<string>();

    for (const r of rows) {
      if (!r.grNumber) {
        errors.push({ rowNumber: r.rowNumber, error: 'GR Number is required' });
        continue;
      }
      if (existingGRSet.has(r.grNumber)) {
        errors.push({ rowNumber: r.rowNumber, grNumber: r.grNumber, error: `GR Number ${r.grNumber} already exists in database` });
        continue;
      }
      if (sheetGRSet.has(r.grNumber)) {
        errors.push({ rowNumber: r.rowNumber, grNumber: r.grNumber, error: `Duplicate GR Number ${r.grNumber} within spreadsheet` });
        continue;
      }
      sheetGRSet.add(r.grNumber);

      if (!r.firstNameEn || !r.lastNameEn) {
        errors.push({ rowNumber: r.rowNumber, grNumber: r.grNumber, error: 'First name and Last name (English) are required' });
        continue;
      }

      const matchedClass = classes.find((c) => c.numericOrder === r.classOrder);
      if (!matchedClass) {
        errors.push({ rowNumber: r.rowNumber, grNumber: r.grNumber, error: `Standard ${r.classOrder} not found in school configuration` });
        continue;
      }

      const matchedDiv = matchedClass.divisions.find((d) => d.nameEn === r.division) || matchedClass.divisions[0];

      validStudentsToCreate.push({
        ...r,
        classId: matchedClass.id,
        divisionId: matchedDiv?.id,
      });
    }

    if (errors.length > 0 && validStudentsToCreate.length === 0) {
      return { success: false, importedCount: 0, errors };
    }

    let importedCount = 0;
    for (const v of validStudentsToCreate) {
      await this.createStudent(tenantId, userId, {
        grNumber: v.grNumber,
        firstNameEn: v.firstNameEn,
        middleNameEn: v.middleNameEn,
        lastNameEn: v.lastNameEn,
        firstNameGu: v.firstNameGu || v.firstNameEn,
        middleNameGu: v.middleNameGu || v.middleNameEn,
        lastNameGu: v.lastNameGu || v.lastNameEn,
        gender: v.gender === 'FEMALE' ? 'FEMALE' : 'MALE',
        dateOfBirth: v.dateOfBirth,
        dobInWords: 'જન્મ તારીખ વિગત',
        phone: v.phone,
        aadhaarNumber: v.aadhaar,
        apaarId: v.apaar,
        ctsUniqueId: v.cts,
        category: v.category,
        classId: v.classId,
        divisionId: v.divisionId,
        academicYearId,
      });
      importedCount++;
    }

    await logAudit({
      tenantId,
      userId,
      action: 'EXCEL_IMPORT',
      entityType: 'STUDENT',
      newValues: { count: importedCount, errorCount: errors.length },
    });

    return { success: true, importedCount, errors };
  }

  async exportStudentsExcel(tenantId: string, classId?: string) {
    const students = await prisma.student.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(classId ? { enrollments: { some: { classId } } } : {}),
      },
      include: {
        enrollments: {
          include: { class: true, division: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { grNumber: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    worksheet.columns = [
      { header: 'GR No (જી.આર. નં)', key: 'grNumber', width: 15 },
      { header: 'Full Name (English)', key: 'nameEn', width: 30 },
      { header: 'પૂરું નામ (ગુજરાતી)', key: 'nameGu', width: 30 },
      { header: 'Class (ધોરણ)', key: 'class', width: 12 },
      { header: 'Division (વિભાગ)', key: 'division', width: 12 },
      { header: 'Gender (જાતિ)', key: 'gender', width: 12 },
      { header: 'Birth Date (જન્મ તારીખ)', key: 'dob', width: 15 },
      { header: 'Mobile (મોબાઈલ)', key: 'phone', width: 15 },
      { header: 'Aadhaar (આધાર નં)', key: 'aadhaar', width: 18 },
      { header: 'APAAR ID', key: 'apaar', width: 18 },
      { header: 'CTS Unique ID', key: 'cts', width: 22 },
      { header: 'Category (કેટેગરી)', key: 'category', width: 12 },
      { header: 'Status (સ્થિતિ)', key: 'status', width: 12 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E40AF' },
    };

    for (const s of students) {
      const enr = s.enrollments[0];
      worksheet.addRow({
        grNumber: s.grNumber,
        nameEn: `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.replace(/\s+/g, ' ').trim(),
        nameGu: `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.replace(/\s+/g, ' ').trim(),
        class: enr?.class?.nameEn || '',
        division: enr?.division?.nameEn || '',
        gender: s.gender,
        dob: s.dateOfBirth.toISOString().split('T')[0],
        phone: s.phone || '',
        aadhaar: s.aadhaarNumber || '',
        apaar: s.apaarId || '',
        cts: s.ctsUniqueId || '',
        category: s.category || '',
        status: s.status,
      });
    }

    return workbook;
  }
}

export const studentService = new StudentService();
