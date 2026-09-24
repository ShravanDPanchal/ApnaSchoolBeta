import { studentService } from '../src/modules/student/student.service';
import { prisma } from '../src/database/prisma';
import ExcelJS from 'exceljs';

describe('Advanced Student Management Lifecycle Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let nextAcademicYearId: string;
  let class1Id: string;
  let class2Id: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Run seed before running tests');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@ssvm.edu.in' } });
    userId = user!.id;

    const currentYear = await prisma.academicYear.findFirst({ where: { tenantId, name: '2026-27' } });
    academicYearId = currentYear!.id;

    // Create next academic year for promotion testing
    const nextYear = await prisma.academicYear.upsert({
      where: { tenantId_name: { tenantId, name: '2027-28' } },
      update: {},
      create: {
        tenantId,
        name: '2027-28',
        startDate: new Date('2027-06-01'),
        endDate: new Date('2028-04-30'),
      },
    });
    nextAcademicYearId = nextYear.id;

    const c1 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 1 } });
    const c2 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 2 } });
    class1Id = c1!.id;
    class2Id = c2!.id;

    // Clean up any existing test records for clean repeatable runs
    const testGrNumbers = ['8801', '8890'];
    const existingStudents = await prisma.student.findMany({
      where: { tenantId, grNumber: { in: testGrNumbers } },
      select: { id: true },
    });
    const sIds = existingStudents.map((s) => s.id);
    if (sIds.length > 0) {
      await prisma.studentAttendance.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.document.deleteMany({ where: { entityType: 'STUDENT', entityId: { in: sIds } } });
      await prisma.studentFee.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.enrollment.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.studentParent.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.student.deleteMany({ where: { id: { in: sIds } } });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Creates new student admission with parent details and auto-enrollment', async () => {
    const student = await studentService.createStudent(tenantId, userId, {
      grNumber: '8801',
      firstNameEn: 'Harsh',
      middleNameEn: 'Girishbhai',
      lastNameEn: 'Trivedi',
      firstNameGu: 'હર્ષ',
      middleNameGu: 'ગિરીશભાઈ',
      lastNameGu: 'ત્રિવેદી',
      gender: 'MALE',
      dateOfBirth: '2019-03-21',
      dobInWords: 'એકવીસ માર્ચ બે હજાર ઓગણીસ',
      classId: class1Id,
      academicYearId,
      parentFirstNameGu: 'ગિરીશભાઈ',
      parentPhone: '9825123456',
    });

    expect(student).toBeDefined();
    expect(student.grNumber).toBe('8801');
    expect(student.status).toBe('ACTIVE');

    const profile: any = await studentService.getStudentById(tenantId, student.id);
    expect(profile.enrollments.length).toBeGreaterThan(0);
    expect(profile.studentParents.length).toBeGreaterThan(0);
  });

  test('2. Promotes student from Std 1 to Std 2 in next academic year', async () => {
    const student = await prisma.student.findFirst({ where: { tenantId, grNumber: '8801' } });
    expect(student).toBeDefined();

    const result = await studentService.promoteStudents(tenantId, userId, {
      sourceClassId: class1Id,
      targetClassId: class2Id,
      targetAcademicYearId: nextAcademicYearId,
      studentIds: [student!.id],
    });

    expect(result.success).toBe(true);
    expect(result.promotedCount).toBe(1);

    const updatedProfile: any = await studentService.getStudentById(tenantId, student!.id);
    const latestEnrollment = updatedProfile.enrollments.find((e: any) => e.academicYearId === nextAcademicYearId);
    expect(latestEnrollment).toBeDefined();
    expect(latestEnrollment!.classId).toBe(class2Id);
    expect(latestEnrollment!.status).toBe('ACTIVE');
  });

  test('3. Transfers/withdraws student and generates Leaving Certificate data', async () => {
    const student = await prisma.student.findFirst({ where: { tenantId, grNumber: '8801' } });
    expect(student).toBeDefined();

    const transferResult = await studentService.transferOrWithdrawStudent(tenantId, userId, {
      studentId: student!.id,
      transferDate: '2026-09-10',
      reason: 'Parents shifted to Ahmedabad (વાલીની બદલી)',
      leavingStandard: 'Std 2',
      conduct: 'Good (સારી)',
      progress: 'Satisfactory (સંતોષકારક)',
      destinationSchool: 'Sant Kabir School, Ahmedabad',
    });

    expect(transferResult.success).toBe(true);
    expect(transferResult.leavingCertificate).toBeDefined();
    expect(transferResult.leavingCertificate.grNumber).toBe('8801');
    expect(transferResult.leavingCertificate.reasonForLeaving).toContain('Ahmedabad');

    const checkStudent = await prisma.student.findUnique({ where: { id: student!.id } });
    expect(checkStudent!.status).toBe('TRANSFERRED');
  });

  test('4. Attaches document record to student profile', async () => {
    const student = await prisma.student.findFirst({ where: { tenantId, grNumber: '1001' } });
    expect(student).toBeDefined();

    const doc = await studentService.addStudentDocument(tenantId, userId, student!.id, {
      fileName: 'Birth_Certificate_Aarav.pdf',
      fileType: 'application/pdf',
      fileSize: 102400,
      storagePath: '/uploads/students/birth_cert_1001.pdf',
    });

    expect(doc).toBeDefined();
    expect(doc.fileName).toBe('Birth_Certificate_Aarav.pdf');

    const docs = await studentService.getStudentDocuments(tenantId, student!.id);
    expect(docs.some((d) => d.id === doc.id)).toBe(true);
  });

  test('5. Excel Import validates records and detects duplicates and missing fields', async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Import');

    sheet.addRow(['GR No', 'FirstNameEn', 'MiddleNameEn', 'LastNameEn', 'FirstNameGu', 'MiddleNameGu', 'LastNameGu', 'Standard', 'Division', 'Gender', 'DOB', 'Mobile']);
    // Valid row
    sheet.addRow(['8890', 'Ketan', 'Bhavinbhai', 'Vora', 'કેતન', 'ભાવિનભાઈ', 'વોરા', 1, 'A', 'MALE', '2019-05-10', '9825000001']);
    // Duplicate GR (already in DB from test 1)
    sheet.addRow(['8801', 'Duplicate', 'Test', 'User', 'ડુપ્લીકેટ', '', 'યુઝર', 1, 'A', 'MALE', '2019-01-01', '9825000002']);

    const buffer = await workbook.xlsx.writeBuffer();
    const importRes = await studentService.importStudentsFromBuffer(tenantId, userId, academicYearId, Buffer.from(buffer));

    expect(importRes.importedCount).toBe(1);
    expect(importRes.errors.length).toBeGreaterThan(0);
    expect(importRes.errors.some((e) => e.grNumber === '8801')).toBe(true);
  });
});
