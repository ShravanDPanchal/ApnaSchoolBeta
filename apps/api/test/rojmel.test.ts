import { rojmelService } from '../src/modules/rojmel/rojmel.service';
import { prisma } from '../src/database/prisma';
import {
  RojmelEntryType,
  AccountGroupType,
  AccountNature,
} from '@apna-school/shared-types';

describe('Phase 8: Gujarati-First Daily Rojmel Subsystem Tests (શ્રી રોજમેળ)', () => {
  let tenant1Id: string;
  let tenant2Id: string;
  let user1Id: string;
  let fy1Id: string;
  let fy2Id: string;
  let cashAcc1: any;
  let bankAcc1: any;
  let feeInc1: any;
  let grantInc1: any;
  let stationeryExp1: any;
  let electricityExp1: any;

  beforeAll(async () => {
    // 1. Setup Tenant 1 (SSVM)
    const t1 = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!t1) throw new Error('Tenant SSVM not found in seed database');
    tenant1Id = t1.id;

    const u1 = await prisma.user.findFirst({ where: { email: 'accountant@ssvm.edu.in' } });
    user1Id = u1!.id;

    const fy1 = await prisma.financialYear.findFirst({ where: { tenantId: tenant1Id, name: '2026-27' } });
    fy1Id = fy1!.id;

    await prisma.financialYear.update({
      where: { id: fy1Id },
      data: { isClosed: false, isCurrent: true },
    });

    // Accounts for Tenant 1
    cashAcc1 = await prisma.chartOfAccount.findFirst({
      where: { tenantId: tenant1Id, isCashAccount: true, financialYearId: fy1Id },
    });
    bankAcc1 = await prisma.chartOfAccount.findFirst({
      where: { tenantId: tenant1Id, isBankAccount: true, financialYearId: fy1Id },
    });
    feeInc1 = await prisma.chartOfAccount.findFirst({
      where: { tenantId: tenant1Id, code: '3001', financialYearId: fy1Id },
    });
    stationeryExp1 = await prisma.chartOfAccount.findFirst({
      where: { tenantId: tenant1Id, code: '4001', financialYearId: fy1Id },
    });
    electricityExp1 = await prisma.chartOfAccount.findFirst({
      where: { tenantId: tenant1Id, code: '4002', financialYearId: fy1Id },
    });

    // Create Grant Income account if not exists
    let incGroup1 = await prisma.accountGroup.findFirst({
      where: { tenantId: tenant1Id, groupType: 'INCOME' },
    });
    grantInc1 = await prisma.chartOfAccount.findFirst({
      where: { tenantId: tenant1Id, code: '3002', financialYearId: fy1Id },
    });
    if (!grantInc1) {
      grantInc1 = await prisma.chartOfAccount.create({
        data: {
          tenantId: tenant1Id,
          financialYearId: fy1Id,
          accountGroupId: incGroup1!.id,
          code: '3002',
          nameEn: 'Govt Grant Income',
          nameGu: 'સરકારી ગ્રાન્ટ આવક',
          accountType: AccountGroupType.INCOME,
          accountNature: AccountNature.CREDIT,
          openingBalance: 0,
          currentBalance: 0,
          isSystem: false,
          isActive: true,
        },
      });
    }

    // 2. Setup Tenant 2 (Isolation Check)
    let t2 = await prisma.tenant.findFirst({ where: { code: 'T2-ROJMEL-ISOL' } });
    if (!t2) {
      t2 = await prisma.tenant.create({
        data: {
          name: 'Tenant Two School',
          slug: 'tenant-two-rojmel-school',
          code: 'T2-ROJMEL-ISOL',
          isActive: true,
        },
      });
    }
    tenant2Id = t2.id;

    let fy2 = await prisma.financialYear.findFirst({ where: { tenantId: tenant2Id, name: '2026-27' } });
    if (!fy2) {
      fy2 = await prisma.financialYear.create({
        data: {
          tenantId: tenant2Id,
          name: '2026-27',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isCurrent: true,
          isClosed: false,
          isActive: true,
        },
      });
    }
    fy2Id = fy2.id;

    let assetGroup2 = await prisma.accountGroup.findFirst({ where: { tenantId: tenant2Id } });
    if (!assetGroup2) {
      assetGroup2 = await prisma.accountGroup.create({
        data: {
          tenantId: tenant2Id,
          nameEn: 'Current Assets',
          nameGu: 'ચાલુ મિલકતો',
          groupType: AccountGroupType.ASSET,
          isSystem: true,
        },
      });
    }

    let t2Cash = await prisma.chartOfAccount.findFirst({ where: { tenantId: tenant2Id, isCashAccount: true } });
    if (!t2Cash) {
      await prisma.chartOfAccount.create({
        data: {
          tenantId: tenant2Id,
          financialYearId: fy2Id,
          accountGroupId: assetGroup2.id,
          code: '1001',
          nameEn: 'Cash on Hand',
          nameGu: 'શ્રી હાથ પર રોકડ સિલક',
          accountType: AccountGroupType.ASSET,
          accountNature: AccountNature.DEBIT,
          openingBalance: 5000,
          currentBalance: 5000,
          isCashAccount: true,
          isSystem: true,
          isActive: true,
        },
      });
    }

    // Clean up any test journal entries from prior test runs
    await prisma.journalLine.deleteMany({
      where: {
        journalEntry: {
          tenantId: tenant1Id,
          referenceType: 'ROJMEL',
        },
      },
    });
    await prisma.journalEntry.deleteMany({
      where: {
        tenantId: tenant1Id,
        referenceType: 'ROJMEL',
      },
    });
    await prisma.journalLine.deleteMany({
      where: { journalEntry: { tenantId: tenant2Id } },
    });
    await prisma.journalEntry.deleteMany({
      where: { tenantId: tenant2Id },
    });
    await prisma.chartOfAccount.deleteMany({
      where: { tenantId: tenant2Id, code: '9999' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('1. Daily Rojmel Aakharo and Double-Entry Generation', () => {
    const testDate = '2026-07-15';

    it('should compute initial opening balances and report balanced Aakharo for an empty day', async () => {
      const dayView = await rojmelService.getRojmelDayView(tenant1Id, testDate, fy1Id);

      expect(dayView).toBeDefined();
      expect(dayView.date).toBe(testDate);
      expect(dayView.isBalanced).toBe(true);
      expect(dayView.difference).toBe(0);
      expect(dayView.totalJamaAmount).toBe(dayView.totalUdharAmount);
      expect(dayView.jamaEntries.length).toBe(0);
      expect(dayView.udharEntries.length).toBe(0);
    });

    it('should record a JAMA (Receipt) entry and reflect in Cash column', async () => {
      const entry = await rojmelService.createRojmelEntry(tenant1Id, user1Id, {
        date: testDate,
        entryType: RojmelEntryType.JAMA,
        accountId: feeInc1.id,
        paymentAccountId: cashAcc1.id,
        amount: 2500,
        narration: 'વિદ્યાર્થી ફી જમા (Admission Fee)',
        voucherNumber: 'J-101',
        referenceNumber: 'REC-001',
      });

      expect(entry).toBeDefined();
      expect(entry.entryType).toBe('RECEIPT');
      expect(entry.totalAmount).toBe(2500);

      const dayView = await rojmelService.getRojmelDayView(tenant1Id, testDate, fy1Id);
      expect(dayView.totalCashReceipts).toBe(2500);
      expect(dayView.jamaEntries.length).toBe(1);
      expect(dayView.jamaEntries[0].accountNameGu).toBe(feeInc1.nameGu);
      expect(dayView.jamaEntries[0].cashAmount).toBe(2500);
      expect(dayView.jamaEntries[0].bankAmount).toBe(0);
      expect(dayView.isBalanced).toBe(true);
    });

    it('should record an UDHAR (Payment) entry and reflect in Bank column', async () => {
      const entry = await rojmelService.createRojmelEntry(tenant1Id, user1Id, {
        date: testDate,
        entryType: RojmelEntryType.UDHAR,
        accountId: stationeryExp1.id,
        paymentAccountId: bankAcc1.id,
        amount: 800,
        narration: 'સ્ટેશનરી ખરીદી ચુકવણી (Stationery purchase)',
        voucherNumber: 'U-201',
        referenceNumber: 'CHQ-88912',
      });

      expect(entry).toBeDefined();
      expect(entry.entryType).toBe('PAYMENT');
      expect(entry.totalAmount).toBe(800);

      const dayView = await rojmelService.getRojmelDayView(tenant1Id, testDate, fy1Id);
      expect(dayView.totalBankPayments).toBe(800);
      expect(dayView.udharEntries.length).toBe(1);
      expect(dayView.udharEntries[0].accountNameGu).toBe(stationeryExp1.nameGu);
      expect(dayView.udharEntries[0].bankAmount).toBe(800);
      expect(dayView.isBalanced).toBe(true);
      expect(dayView.difference).toBe(0);
    });

    it('should maintain Deshi Nama Aakharo parity: Total Jama Side == Total Udhar Side', async () => {
      const dayView = await rojmelService.getRojmelDayView(tenant1Id, testDate, fy1Id);

      // Total Jama Side = Opening Cash + Opening Bank + Total Cash Receipts + Total Bank Receipts
      const expectedJamaSide =
        dayView.openingCashBalance +
        dayView.openingBankBalance +
        dayView.totalCashReceipts +
        dayView.totalBankReceipts;

      // Total Udhar Side = Total Cash Payments + Total Bank Payments + Closing Cash + Closing Bank
      const expectedUdharSide =
        dayView.totalCashPayments +
        dayView.totalBankPayments +
        dayView.closingCashBalance +
        dayView.closingBankBalance;

      expect(dayView.totalJamaAmount).toBe(Math.round(expectedJamaSide * 100) / 100);
      expect(dayView.totalUdharAmount).toBe(Math.round(expectedUdharSide * 100) / 100);
      expect(dayView.totalJamaAmount).toBe(dayView.totalUdharAmount);
      expect(dayView.isBalanced).toBe(true);
    });
  });

  describe('2. Opening Balance Carry-Forward Across Days', () => {
    const day1 = '2026-08-01';
    const day2 = '2026-08-02';

    it('should carry forward closing balances of Day 1 as opening balances of Day 2', async () => {
      // Record transaction on Day 1
      await rojmelService.createRojmelEntry(tenant1Id, user1Id, {
        date: day1,
        entryType: RojmelEntryType.JAMA,
        accountId: grantInc1.id,
        paymentAccountId: cashAcc1.id,
        amount: 15000,
        narration: 'સર્વ શિક્ષા અભિયાન ગ્રાન્ટ',
      });

      await rojmelService.createRojmelEntry(tenant1Id, user1Id, {
        date: day1,
        entryType: RojmelEntryType.UDHAR,
        accountId: electricityExp1.id,
        paymentAccountId: cashAcc1.id,
        amount: 3200,
        narration: 'લાઈટ બિલ ચુકવણી',
      });

      const day1View = await rojmelService.getRojmelDayView(tenant1Id, day1, fy1Id);
      const day2View = await rojmelService.getRojmelDayView(tenant1Id, day2, fy1Id);

      // Day 2 opening cash must equal Day 1 closing cash
      expect(day2View.openingCashBalance).toBe(day1View.closingCashBalance);
      expect(day2View.openingBankBalance).toBe(day1View.closingBankBalance);
      expect(day2View.isBalanced).toBe(true);
    });
  });

  describe('3. Contra Entries (Bank Deposit / Cash Withdrawal)', () => {
    const contraDate = '2026-08-10';

    it('should handle cash deposited into bank (Contra Transfer)', async () => {
      // Prior view
      const beforeView = await rojmelService.getRojmelDayView(tenant1Id, contraDate, fy1Id);
      const initialTotal = beforeView.openingCashBalance + beforeView.openingBankBalance;

      // Deposit 5,000 cash into bank
      // Target: Bank (Dr), Source: Cash (Cr)
      const contraEntry = await rojmelService.createRojmelEntry(tenant1Id, user1Id, {
        date: contraDate,
        entryType: 'CONTRA' as any,
        accountId: bankAcc1.id,
        paymentAccountId: cashAcc1.id,
        amount: 5000,
        narration: 'રોકડ બેંકમાં જમા કરાવી (Cash deposited to SBI)',
      });

      expect(contraEntry.entryType).toBe('CONTRA');

      const afterView = await rojmelService.getRojmelDayView(tenant1Id, contraDate, fy1Id);

      // In Rojmel:
      // - Udhar side shows Cash payment of 5000
      // - Jama side shows Bank receipt of 5000
      expect(afterView.totalCashPayments).toBe(5000);
      expect(afterView.totalBankReceipts).toBe(5000);

      // Closing Cash reduced by 5000, Closing Bank increased by 5000
      expect(afterView.closingCashBalance).toBe(beforeView.openingCashBalance - 5000);
      expect(afterView.closingBankBalance).toBe(beforeView.openingBankBalance + 5000);

      // Grand total closing balance is invariant
      const finalTotal = afterView.closingCashBalance + afterView.closingBankBalance;
      expect(finalTotal).toBe(initialTotal);
      expect(afterView.isBalanced).toBe(true);
    });
  });

  describe('4. Rapid Batch Rojmel Entry', () => {
    const batchDate = '2026-09-01';

    it('should create multiple entries in a single batch call', async () => {
      const batchResult = await rojmelService.createQuickBatchRojmel(tenant1Id, user1Id, {
        date: batchDate,
        entries: [
          {
            entryType: RojmelEntryType.JAMA,
            accountId: feeInc1.id,
            paymentAccountId: cashAcc1.id,
            amount: 1200,
            narration: 'ટ્યુશન ફી જમા',
          },
          {
            entryType: RojmelEntryType.JAMA,
            accountId: feeInc1.id,
            paymentAccountId: bankAcc1.id,
            amount: 3500,
            narration: 'ઓનલાઈન ફી જમા',
          },
          {
            entryType: RojmelEntryType.UDHAR,
            accountId: stationeryExp1.id,
            paymentAccountId: cashAcc1.id,
            amount: 450,
            narration: 'ચોક અને ડસ્ટર ખરીદી',
          },
        ],
      });

      expect(batchResult.length).toBe(3);

      const dayView = await rojmelService.getRojmelDayView(tenant1Id, batchDate, fy1Id);
      expect(dayView.jamaEntries.length).toBe(2);
      expect(dayView.udharEntries.length).toBe(1);
      expect(dayView.totalCashReceipts).toBe(1200);
      expect(dayView.totalBankReceipts).toBe(3500);
      expect(dayView.totalCashPayments).toBe(450);
      expect(dayView.isBalanced).toBe(true);
    });
  });

  describe('5. Monthly Rojmel Matrix and Head-Wise Summaries', () => {
    it('should generate a 31-day month grid for August 2026', async () => {
      const monthlyView = await rojmelService.getRojmelMonthlyView(tenant1Id, 2026, 8, fy1Id);

      expect(monthlyView).toBeDefined();
      expect(monthlyView.month).toBe(8);
      expect(monthlyView.year).toBe(2026);
      expect(monthlyView.days.length).toBe(31);

      // Find August 10th (where we did contra transfer)
      const day10 = monthlyView.days.find((d) => d.date === '2026-08-10');
      expect(day10).toBeDefined();
      expect(day10!.cashUdhar).toBe(5000);
      expect(day10!.bankJama).toBe(5000);
    });

    it('should aggregate head-wise income and expense totals for the financial year', async () => {
      const heads = await rojmelService.getRojmelHeadWiseSummary(tenant1Id, '2026-04-01', '2027-03-31', fy1Id);

      expect(heads.length).toBeGreaterThan(0);
      const feeHead = heads.find((h) => h.accountId === feeInc1.id);
      expect(feeHead).toBeDefined();
      expect(feeHead!.jamaAmount).toBeGreaterThanOrEqual(2500);

      const statHead = heads.find((h) => h.accountId === stationeryExp1.id);
      expect(statHead).toBeDefined();
      expect(statHead!.udharAmount).toBeGreaterThanOrEqual(800);
    });
  });

  describe('6. Yearly 12-Month Rojmel Summary', () => {
    it('should generate a 12-month summary for the financial year', async () => {
      const yearlyView = await rojmelService.getRojmelYearlyView(tenant1Id, fy1Id);

      expect(yearlyView).toBeDefined();
      expect(yearlyView.months.length).toBe(12);
      expect(yearlyView.financialYearId).toBe(fy1Id);
      expect(yearlyView.totalReceipts).toBeGreaterThan(0);
      expect(yearlyView.totalPayments).toBeGreaterThan(0);
      expect(yearlyView.netSurplusDeficit).toBe(
        Math.round((yearlyView.totalReceipts - yearlyView.totalPayments) * 100) / 100
      );
    });
  });

  describe('7. Multi-Tenant Isolation', () => {
    it('should isolate Tenant 2 Rojmel completely from Tenant 1', async () => {
      const t2DayView = await rojmelService.getRojmelDayView(tenant2Id, '2026-07-15', fy2Id);

      // Tenant 2 has opening 5000, 0 receipts, 0 payments
      expect(t2DayView.openingCashBalance).toBe(5000);
      expect(t2DayView.openingBankBalance).toBe(0);
      expect(t2DayView.jamaEntries.length).toBe(0);
      expect(t2DayView.udharEntries.length).toBe(0);
      expect(t2DayView.closingCashBalance).toBe(5000);
      expect(t2DayView.isBalanced).toBe(true);

      // Tenant 2 creating entry does not mutate Tenant 1
      const t1Before = await rojmelService.getRojmelDayView(tenant1Id, '2026-07-15', fy1Id);

      // Find t2 cash account
      const t2Cash = await prisma.chartOfAccount.findFirst({
        where: { tenantId: tenant2Id, isCashAccount: true },
      });

      // Tenant 2 dummy head
      const t2Exp = await prisma.chartOfAccount.create({
        data: {
          tenantId: tenant2Id,
          financialYearId: fy2Id,
          accountGroupId: (await prisma.accountGroup.findFirst({ where: { tenantId: tenant2Id } }))!.id,
          code: '9999',
          nameEn: 'T2 Expense',
          nameGu: 'ટી૨ ખર્ચ',
          accountType: AccountGroupType.EXPENSE,
          accountNature: AccountNature.DEBIT,
          openingBalance: 0,
          currentBalance: 0,
          isSystem: false,
          isActive: true,
        },
      });

      await rojmelService.createRojmelEntry(tenant2Id, user1Id, {
        date: '2026-07-15',
        entryType: RojmelEntryType.UDHAR,
        accountId: t2Exp.id,
        paymentAccountId: t2Cash!.id,
        amount: 300,
        narration: 'ટી૨ ચા-નાસ્તો ખર્ચ',
      });

      const t1After = await rojmelService.getRojmelDayView(tenant1Id, '2026-07-15', fy1Id);
      expect(t1After.totalJamaAmount).toBe(t1Before.totalJamaAmount);
      expect(t1After.totalUdharAmount).toBe(t1Before.totalUdharAmount);
      expect(t1After.udharEntries.length).toBe(t1Before.udharEntries.length);
    });
  });
});
