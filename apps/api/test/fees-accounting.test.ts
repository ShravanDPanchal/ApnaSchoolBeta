import { feesService } from '../src/modules/fees/fees.service';
import { accountingService } from '../src/modules/accounting/accounting.service';
import { prisma } from '../src/database/prisma';
import { PaymentMode } from '@apna-school/shared-types';

describe('Fees Management & Double-Entry Accounting Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let financialYearId: string;
  let class1Id: string;
  let cashAccountId: string;
  let bankAccountId: string;
  let tuitionFeeHead: any;
  let feeStructure: any;
  let testStudent: any;
  let studentFee: any;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Run seed before running tests');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@ssvm.edu.in' } });
    userId = user!.id;

    const currentAy = await prisma.academicYear.findFirst({ where: { tenantId, isCurrent: true } }) ||
      await prisma.academicYear.findFirst({ where: { tenantId } });
    academicYearId = currentAy!.id;

    const currentFy = await prisma.financialYear.findFirst({ where: { tenantId, isCurrent: true } }) ||
      await prisma.financialYear.findFirst({ where: { tenantId } });
    financialYearId = currentFy!.id;

    const c1 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 1 } });
    class1Id = c1!.id;

    const cashAcc = await prisma.chartOfAccount.findFirst({ where: { tenantId, code: '1001', financialYearId } });
    const bankAcc = await prisma.chartOfAccount.findFirst({ where: { tenantId, code: '1002', financialYearId } });
    cashAccountId = cashAcc!.id;
    bankAccountId = bankAcc!.id;

    // Create Fee Head
    tuitionFeeHead = await prisma.feeHead.upsert({
      where: { tenantId_code: { tenantId, code: 'TEST-TFEE' } },
      update: {},
      create: {
        tenantId,
        nameEn: 'Tuition Fee Test',
        nameGu: 'શિક્ષણ ફી ટેસ્ટ',
        code: 'TEST-TFEE',
      },
    });

    // Create Fee Structure: ₹12,000 for Std 1
    feeStructure = await prisma.feeStructure.create({
      data: {
        tenantId,
        academicYearId,
        classId: class1Id,
        feeHeadId: tuitionFeeHead.id,
        amount: 12000,
        installmentNo: 1,
        dueDate: new Date('2026-07-15'),
      },
    });

    // Create Test Student
    testStudent = await prisma.student.create({
      data: {
        tenantId,
        grNumber: 'FEE-TEST-01',
        firstNameEn: 'Nirav',
        lastNameEn: 'Desai',
        firstNameGu: 'નીરવ',
        lastNameGu: 'દેસાઈ',
        gender: 'MALE',
        dateOfBirth: new Date('2019-05-10'),
      },
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        tenantId,
        studentId: testStudent.id,
        academicYearId,
        classId: class1Id,
        rollNumber: 50,
      },
    });

    // Create StudentFee record for ₹12,000
    studentFee = await prisma.studentFee.create({
      data: {
        tenantId,
        studentId: testStudent.id,
        enrollmentId: enrollment.id,
        feeStructureId: feeStructure.id,
        amount: 12000,
        netAmount: 12000,
        paidAmount: 0,
        status: 'PENDING',
        dueDate: new Date('2026-07-15'),
      },
    });
  });

  afterAll(async () => {
    if (testStudent) {
      const payments = await prisma.feePayment.findMany({ where: { studentId: testStudent.id } });
      const pIds = payments.map((p) => p.id);
      if (pIds.length > 0) {
        await prisma.feePaymentItem.deleteMany({ where: { feePaymentId: { in: pIds } } });
        await prisma.feePayment.deleteMany({ where: { id: { in: pIds } } });
      }
      await prisma.studentFee.deleteMany({ where: { studentId: testStudent.id } });
      await prisma.enrollment.deleteMany({ where: { studentId: testStudent.id } });
      await prisma.student.deleteMany({ where: { id: testStudent.id } });
    }

    if (feeStructure) {
      await prisma.feeStructure.delete({ where: { id: feeStructure.id } });
    }
    if (tuitionFeeHead) {
      await prisma.feeHead.delete({ where: { id: tuitionFeeHead.id } });
    }

    await prisma.$disconnect();
  });

  test('1. Discount and Concession reduces netAmount and adjusts status', async () => {
    // Apply ₹2,000 Sibling Concession
    const updated = await feesService.applyDiscountOrConcession(tenantId, userId, {
      studentFeeId: studentFee.id,
      discountAmount: 2000,
      discountReason: 'Sibling Discount (ભાઈ-બહેન છૂટછાટ)',
      concessionType: 'SIBLING',
    });

    expect(updated).toBeDefined();
    expect(updated.discountAmount).toBe(2000);
    expect(updated.netAmount).toBe(10000); // 12000 - 2000
    expect(updated.status).toBe('PENDING');
  });

  test('2. Late fine addition increases netAmount accordingly', async () => {
    // Apply ₹200 Late fine
    const updated = await feesService.applyLateFine(tenantId, userId, {
      studentFeeId: studentFee.id,
      fineAmount: 200,
      fineReason: 'Late payment penalty after July 15',
    });

    expect(updated).toBeDefined();
    expect(updated.fineAmount).toBe(200);
    expect(updated.netAmount).toBe(10200); // 12000 - 2000 + 200
  });

  test('3. Partial Payment records payment, updates paidAmount, and sets status to PARTIAL', async () => {
    // Pay ₹5,000 partial payment via CASH
    const payment = await feesService.collectFee(tenantId, userId, {
      studentId: testStudent.id,
      academicYearId,
      paymentDate: '2026-09-10',
      paymentMode: PaymentMode.CASH,
      depositAccountId: cashAccountId,
      narration: 'Installment 1 partial payment (રોકડ ફી ચૂકવણી)',
      items: [
        {
          studentFeeId: studentFee.id,
          amount: 5000,
        },
      ],
    });

    expect(payment).toBeDefined();
    expect(payment.totalAmount).toBe(5000);
    expect(payment.receiptNumber).toMatch(/^REC-/);

    const checkSf = await prisma.studentFee.findUnique({ where: { id: studentFee.id } });
    expect(checkSf!.paidAmount).toBe(5000);
    expect(checkSf!.status).toBe('PARTIAL');

    // Double-entry accounting check: Journal Entry should exist
    expect(payment.journalEntryId).toBeDefined();
    const journal = await prisma.journalEntry.findUnique({
      where: { id: payment.journalEntryId! },
      include: { lines: true },
    });
    expect(journal).toBeDefined();
    expect(journal!.status).toBe('ACTIVE');

    const debitLine = journal!.lines.find((l) => l.accountId === cashAccountId);
    expect(debitLine).toBeDefined();
    expect(debitLine!.debitAmount).toBe(5000);
  });

  test('4. Overpayment Protection rejects payment exceeding remaining dues', async () => {
    // Net amount is ₹10,200, already paid ₹5,000 -> remaining is ₹5,200.
    // Attempting to pay ₹6,000 must be rejected!
    await expect(
      feesService.collectFee(tenantId, userId, {
        studentId: testStudent.id,
        academicYearId,
        paymentDate: '2026-09-10',
        paymentMode: PaymentMode.UPI,
        depositAccountId: bankAccountId,
        items: [
          {
            studentFeeId: studentFee.id,
            amount: 6000,
          },
        ],
      })
    ).rejects.toThrow(/exceeds outstanding dues/i);
  });

  test('5. Second payment settles remaining balance and sets status to PAID', async () => {
    // Pay exact remaining balance ₹5,200 via Bank / UPI
    const payment2 = await feesService.collectFee(tenantId, userId, {
      studentId: testStudent.id,
      academicYearId,
      paymentDate: '2026-09-10',
      paymentMode: PaymentMode.UPI,
      referenceNo: 'UPI-REF-99887766',
      depositAccountId: bankAccountId,
      items: [
        {
          studentFeeId: studentFee.id,
          amount: 5200,
        },
      ],
    });

    expect(payment2).toBeDefined();
    expect(payment2.totalAmount).toBe(5200);

    const checkSf = await prisma.studentFee.findUnique({ where: { id: studentFee.id } });
    expect(checkSf!.paidAmount).toBe(10200);
    expect(checkSf!.status).toBe('PAID');
  });

  test('6. 3-Ply Statutory Receipt details generation', async () => {
    const payment = await prisma.feePayment.findFirst({
      where: { studentId: testStudent.id, totalAmount: 5200 },
    });
    expect(payment).toBeDefined();

    const receiptDetails = await feesService.getReceiptDetails(tenantId, payment!.id);
    expect(receiptDetails).toBeDefined();
    expect(receiptDetails.school.nameGu).toBeDefined();
    expect(receiptDetails.student.studentNameEn).toContain('Nirav');
    expect(receiptDetails.receipt.receiptNumber).toBe(payment!.receiptNumber);
    expect(receiptDetails.receipt.amountInWordsEn).toContain('Rupees Only');
    expect(receiptDetails.receipt.amountInWordsGu).toContain('અંકે રૂપિયા');
    expect(receiptDetails.plyTypes.length).toBe(3);
  });

  test('7. Refund / Cancellation reverses StudentFee paid amount and reverses accounting entry', async () => {
    const payment2 = await prisma.feePayment.findFirst({
      where: { studentId: testStudent.id, totalAmount: 5200 },
    });
    expect(payment2).toBeDefined();

    const refundResult = await feesService.refundOrCancelPayment(tenantId, userId, {
      feePaymentId: payment2!.id,
      reason: 'Wrong fee collection entered by mistake (વાલી વિનંતી)',
    });

    expect(refundResult.success).toBe(true);
    expect(refundResult.payment.status).toBe('REFUNDED');

    // StudentFee paidAmount should drop back to ₹5,000 and status to 'PARTIAL'
    const checkSf = await prisma.studentFee.findUnique({ where: { id: studentFee.id } });
    expect(checkSf!.paidAmount).toBe(5000);
    expect(checkSf!.status).toBe('PARTIAL');

    // Double-entry accounting reversal check
    const originalJournal = await prisma.journalEntry.findUnique({
      where: { id: payment2!.journalEntryId! },
    });
    expect(originalJournal!.status).toBe('REVERSED');
  });

  test('8. Daily and Monthly Collection Reports aggregate transactions correctly', async () => {
    const dailyReport = await feesService.getDailyCollectionReport(tenantId, '2026-09-10');
    expect(dailyReport).toBeDefined();
    expect(dailyReport.totalCount).toBeGreaterThan(0);
    expect(dailyReport.totalAmount).toBeGreaterThan(0);
    expect(dailyReport.modeBreakdown.CASH).toBeDefined();

    const monthlyReport = await feesService.getMonthlyCollectionReport(tenantId, 9, 2026);
    expect(monthlyReport).toBeDefined();
    expect(monthlyReport.totalTransactions).toBeGreaterThan(0);
    expect(monthlyReport.totalCollected).toBeGreaterThan(0);
  });
});
