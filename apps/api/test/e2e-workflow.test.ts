import request from 'supertest';
import { app } from '../src/main';
import { prisma } from '../src/database/prisma';

describe('Comprehensive End-to-End (E2E) QA Verification (25-Step Lifecycle)', () => {
  let adminToken: string;
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let financialYearId: string;
  let teacherId: string;
  let classId: string;
  let divisionId: string;
  let studentId: string;
  let examTypeId: string;
  let examScheduleId: string;
  let feeStructureId: string;
  let studentFeeId: string;
  let paymentId: string;
  let cashAccountId: string;
  let expenseAccountId: string;

  beforeAll(async () => {
    // 0. Clean test student if exists
    const existingStudent = await prisma.student.findFirst({ where: { grNumber: 'E2E-9901' } });
    if (existingStudent) {
      await prisma.studentAttendance.deleteMany({ where: { studentId: existingStudent.id } });
      await prisma.marks.deleteMany({ where: { studentId: existingStudent.id } });
      await prisma.feePaymentItem.deleteMany({ where: { studentFee: { studentId: existingStudent.id } } });
      await prisma.studentFee.deleteMany({ where: { studentId: existingStudent.id } });
      await prisma.enrollment.deleteMany({ where: { studentId: existingStudent.id } });
      await prisma.student.delete({ where: { id: existingStudent.id } });
    }

    // 1. Authenticate system admin
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@ssvm.edu.in', password: 'Password@123', tenantCode: 'SSVM' });
    expect(loginRes.status).toBe(200);
    adminToken = loginRes.body.data.token;
    tenantId = loginRes.body.data.user.tenantId;
    userId = loginRes.body.data.user.userId;

    const ay = await prisma.academicYear.findFirst({ where: { tenantId, isCurrent: true } });
    academicYearId = ay!.id;

    const fy = await prisma.financialYear.findFirst({ where: { tenantId, isCurrent: true } });
    financialYearId = fy!.id;

    const cashAcc = await prisma.chartOfAccount.findFirst({ where: { tenantId, isCashAccount: true, financialYearId, isActive: true } });
    cashAccountId = cashAcc!.id;

    const expAcc = await prisma.chartOfAccount.findFirst({ where: { tenantId, accountType: 'EXPENSE', financialYearId, isActive: true } });
    expenseAccountId = expAcc!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // STEP 1: Verify / Fetch School Profile
  test('Step 1: Get School profile master', async () => {
    const res = await request(app)
      .get('/api/v1/school')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('nameEn');
    expect(res.body.data).toHaveProperty('nameGu');
  });

  // STEP 2: Verify Admin Session
  test('Step 2: Verify authenticated admin profile context', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe(userId);
  });

  // STEP 3: Create Teacher / Staff
  test('Step 3: Create a new teacher in staff master', async () => {
    const res = await request(app)
      .post('/api/v1/staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        firstNameEn: 'Vijay',
        lastNameEn: 'Trivedi',
        firstNameGu: 'વિજય',
        lastNameGu: 'ત્રિવેદી',
        gender: 'MALE',
        dateOfBirth: '1985-06-15',
        phone: '9825199887',
        staffType: 'TEACHING',
        designation: 'Senior Teacher',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.firstNameEn).toBe('Vijay');
    teacherId = res.body.data.id;
  });

  // STEP 4: Retrieve / Create Class and Division
  test('Step 4: Fetch classes and divisions', async () => {
    const res = await request(app)
      .get('/api/v1/school/classes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    classId = res.body.data[0].id;
    divisionId = res.body.data[0].divisions[0].id;
  });

  // STEP 5: Add Student
  test('Step 5: Add a new student to the class', async () => {
    const res = await request(app)
      .post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        grNumber: 'E2E-9901',
        firstNameEn: 'Rohan',
        lastNameEn: 'Joshi',
        firstNameGu: 'રોહન',
        lastNameGu: 'જોશી',
        gender: 'MALE',
        dateOfBirth: '2016-04-10',
        phone: '9825012399',
        classId,
        divisionId,
        academicYearId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.grNumber).toBe('E2E-9901');
    studentId = res.body.data.id;
  });

  // STEP 6: Mark Attendance
  test('Step 6: Mark student daily attendance', async () => {
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: { enrollments: true },
    });
    const enrollmentId = student!.enrollments[0].id;

    const res = await request(app)
      .post('/api/v1/attendance/students/batch')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        academicYearId,
        date: new Date().toISOString().split('T')[0],
        items: [{ studentId, enrollmentId, status: 'PRESENT' }],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(1);
  });

  // STEP 7: Create Timetable Entry
  test('Step 7: Create timetable period entry', async () => {
    const periodsRes = await request(app)
      .get('/api/v1/timetable/periods')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ academicYearId });
    expect(periodsRes.status).toBe(200);
    const period = periodsRes.body.data[0];

    const subject = await prisma.subject.findFirst({ where: { tenantId } });
    const res = await request(app)
      .post('/api/v1/timetable/entry')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        academicYearId,
        classId,
        divisionId,
        dayOfWeek: 1,
        periodId: period.id,
        subjectId: subject!.id,
        staffId: teacherId,
        roomName: 'Room 101',
      });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id');
  });

  // STEP 8: Create Examination Type
  test('Step 8: Create examination type & schedule', async () => {
    const typeRes = await request(app)
      .post('/api/v1/exam/types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nameEn: 'Quarterly Exam 2026',
        nameGu: 'ત્રિમાસિક પરીક્ષા ૨૦૨૬',
        academicYearId,
        weightage: 50,
      });
    expect(typeRes.status).toBe(200);
    examTypeId = typeRes.body.data.id;

    const subject = await prisma.subject.findFirst({ where: { tenantId } });
    const schedRes = await request(app)
      .post('/api/v1/exam/schedules')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        academicYearId,
        classId,
        examTypeId,
        subjectId: subject!.id,
        examDate: new Date().toISOString().split('T')[0],
        maxMarks: 50,
        passingMarks: 18,
      });
    expect(schedRes.status).toBe(200);
    examScheduleId = schedRes.body.data.id;
  });

  // STEP 9: Enter Marks
  test('Step 9: Record examination marks batch', async () => {
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: { enrollments: true },
    });
    const enrollmentId = student!.enrollments[0].id;

    const res = await request(app)
      .post('/api/v1/exam/marks/batch')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        examId: examScheduleId,
        items: [{ studentId, enrollmentId, theoryMarks: 42, isAbsent: false }],
      });
    expect(res.status).toBe(200);
    expect(res.body.data.count).toBe(1);
  });

  // STEP 10: Generate Result & Report Card
  test('Step 10: Retrieve class exam results and student report card', async () => {
    const classRes = await request(app)
      .get('/api/v1/exam/results/class')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ academicYearId, classId, examTypeId });
    expect(classRes.status).toBe(200);
    expect(Array.isArray(classRes.body.data.students)).toBe(true);

    const cardRes = await request(app)
      .get(`/api/v1/exam/report-card/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ academicYearId, examTypeId });
    expect(cardRes.status).toBe(200);
    expect(cardRes.body.data.student.id).toBe(studentId);
  });

  // STEP 11: Create Fee Structure
  test('Step 11: Create a fee structure for the class', async () => {
    const feeHead = await prisma.feeHead.findFirst({ where: { tenantId } });
    const res = await request(app)
      .post('/api/v1/fees/structures')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        academicYearId,
        classId,
        feeHeadId: feeHead!.id,
        amount: 2500,
        frequency: 'ONE_TIME',
        dueDate: '2026-12-31',
      });
    expect(res.status).toBe(201);
    feeStructureId = res.body.data.id;
  });

  // STEP 12: Generate Student Fee Demand
  test('Step 12: Create student fee record linked to student', async () => {
    const student = await prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: { enrollments: true },
    });
    const enrollmentId = student!.enrollments[0].id;

    const sf = await prisma.studentFee.create({
      data: {
        tenantId,
        studentId,
        enrollmentId,
        feeStructureId,
        amount: 2500,
        netAmount: 2500,
        paidAmount: 0,
        status: 'PENDING',
      },
    });
    expect(sf).toBeDefined();
    studentFeeId = sf.id;
  });

  // STEP 13: Receive Payment
  test('Step 13: Collect student fee payment', async () => {
    const res = await request(app)
      .post('/api/v1/fees/collect')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId,
        academicYearId,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: 'CASH',
        items: [{ studentFeeId, amount: 2500 }],
        narration: 'E2E Full Fee Collection',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe(2500);
    paymentId = res.body.data.id;
  });

  // STEP 14: Generate 3-Ply Statutory Receipt
  test('Step 14: Generate and verify receipt details', async () => {
    const res = await request(app)
      .get(`/api/v1/fees/receipt/${paymentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.receipt).toHaveProperty('receiptNumber');
    expect(res.body.data.plyTypes.length).toBe(3); // Student, Office, Bank
  });

  // STEP 15: Verify Accounting Transaction Entry
  test('Step 15: Verify automatic double-entry journal creation from fee receipt', async () => {
    const res = await request(app)
      .get('/api/v1/accounting/journal-entries')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ entryType: 'RECEIPT' });
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  // STEP 16: Create Expense Voucher
  test('Step 16: Post an expense payment voucher', async () => {
    const res = await request(app)
      .post('/api/v1/accounting/vouchers/payment')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        financialYearId,
        date: new Date().toISOString().split('T')[0],
        expenseAccountId,
        paymentAccountId: cashAccountId,
        amount: 800,
        paymentMode: 'CASH',
        payeeName: 'Stationery Supplier',
        narration: 'E2E Office Stationery Purchase',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe(800);
  });

  // STEP 17: Verify Rojmel Day-View
  test('Step 17: Verify Rojmel Jama / Udhar balance', async () => {
    const res = await request(app)
      .get('/api/v1/rojmel/day-view')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ date: new Date().toISOString().split('T')[0], financialYearId });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalOpeningBalance');
    expect(res.body.data).toHaveProperty('totalClosingBalance');
    expect(res.body.data).toHaveProperty('jamaEntries');
    expect(res.body.data).toHaveProperty('udharEntries');
    expect(res.body.data.isBalanced).toBe(true);
  });

  // STEP 18: Verify Cash Balance
  test('Step 18: Verify cash account current balance in Chart of Accounts', async () => {
    const res = await request(app)
      .get('/api/v1/accounting/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ financialYearId });
    expect(res.status).toBe(200);
    const cashAcc = res.body.data.find((a: any) => a.id === cashAccountId);
    expect(cashAcc).toBeDefined();
    expect(typeof cashAcc.currentBalance).toBe('number');
  });

  // STEP 19: Verify Ledger Statement
  test('Step 19: Verify Account Ledger statement generation', async () => {
    const res = await request(app)
      .get(`/api/v1/accounting/ledger/${expenseAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ from: '2026-04-01', to: '2027-03-31' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('entries');
  });

  // STEP 20: Generate School Reports
  test('Step 20: Generate student master report via reporting engine', async () => {
    const res = await request(app)
      .get('/api/v1/reports/school/students')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data).toHaveProperty('rows');
    expect(res.body.data.rows.length).toBeGreaterThan(0);
  });

  // STEP 21: Export Excel Report
  test('Step 21: Generate formatted .xlsx Excel report', async () => {
    const res = await request(app)
      .get('/api/v1/reports/school/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ format: 'excel' })
      .responseType('blob');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('openxmlformats-officedocument.spreadsheetml.sheet');
    expect(res.body).toBeDefined();
  });

  // STEP 22: Export Printable HTML / PDF View
  test('Step 22: Generate printable HTML report with Gujarati typography', async () => {
    const res = await request(app)
      .get('/api/v1/reports/school/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ format: 'print' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  // STEP 23: Change User Preferred Locale (Gujarati / English)
  test('Step 23: Update user preferred locale preference', async () => {
    const resGu = await request(app)
      .patch('/api/v1/auth/locale')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ locale: 'gu' });
    expect(resGu.status).toBe(200);
    expect(resGu.body.data.locale).toBe('gu');

    const resEn = await request(app)
      .patch('/api/v1/auth/locale')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ locale: 'en' });
    expect(resEn.status).toBe(200);
    expect(resEn.body.data.locale).toBe('en');
  });

  // STEP 24: Test Strict Multi-Tenant Isolation
  test('Step 24: Verify complete cross-tenant boundary isolation', async () => {
    const skvLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@skv.edu.in', password: 'Password@123', tenantCode: 'SKV' });
    expect(skvLogin.status).toBe(200);
    const skvToken = skvLogin.body.data.token;

    // SKV attempts to access SSVM student
    const res = await request(app)
      .get(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${skvToken}`);
    expect([400, 403, 404]).toContain(res.status);
  });

  // STEP 25: Verify Dashboard Admin Analytics (Mobile/Web Feed)
  test('Step 25: Verify dashboard KPI metrics feed for mobile UI', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalStudents');
    expect(res.body.data).toHaveProperty('attendanceSummary');
    expect(res.body.data).toHaveProperty('cashBalance');
    expect(res.body.data).toHaveProperty('totalFeeCollected');
  });
});
