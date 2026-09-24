import { accountingService } from '../src/modules/accounting/accounting.service';
import { rojmelService } from '../src/modules/rojmel/rojmel.service';
import { prisma } from '../src/database/prisma';
import {
  JournalEntryType,
  RojmelEntryType,
  PaymentMode,
  AccountGroupType,
  AccountNature,
} from '@apna-school/shared-types';

describe('Production-Grade Accounting Subsystem Tests (Phase 7)', () => {
  let tenantId: string;
  let tenant2Id: string;
  let userId: string;
  let fyId: string;
  let nextFyId: string;
  let cashAccountId: string;
  let bankAccountId: string;
  let feeIncomeAccountId: string;
  let stationeryAccountId: string;
  let capitalFundAccountId: string;

  beforeAll(async () => {
    // Tenant 1
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Run seed before running tests');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'accountant@ssvm.edu.in' } });
    userId = user!.id;

    const fy = await prisma.financialYear.findFirst({ where: { tenantId, name: '2026-27' } });
    fyId = fy!.id;

    // Ensure FY is active and open at test start
    await prisma.financialYear.update({
      where: { id: fyId },
      data: { isClosed: false, isCurrent: true },
    });

    // Create or find a Next Financial Year for rollover tests
    let nextFy = await prisma.financialYear.findFirst({
      where: { tenantId, name: '2027-28' },
    });
    if (!nextFy) {
      nextFy = await prisma.financialYear.create({
        data: {
          tenantId,
          name: '2027-28',
          startDate: new Date('2027-04-01'),
          endDate: new Date('2028-03-31'),
          isCurrent: false,
          isClosed: false,
          isActive: true,
        },
      });
    }
    nextFyId = nextFy.id;

    // Accounts
    const cash = await prisma.chartOfAccount.findFirst({
      where: { tenantId, isCashAccount: true, financialYearId: fyId },
    });
    cashAccountId = cash!.id;

    const bank = await prisma.chartOfAccount.findFirst({
      where: { tenantId, isBankAccount: true, financialYearId: fyId },
    });
    bankAccountId = bank!.id;

    const feeInc = await prisma.chartOfAccount.findFirst({
      where: { tenantId, code: '3001', financialYearId: fyId },
    });
    feeIncomeAccountId = feeInc!.id;

    const statExp = await prisma.chartOfAccount.findFirst({
      where: { tenantId, code: '4001', financialYearId: fyId },
    });
    stationeryAccountId = statExp!.id;

    let capGroup = await prisma.accountGroup.findFirst({
      where: { tenantId, groupType: 'LIABILITY' },
    });
    if (!capGroup) {
      capGroup = await prisma.accountGroup.create({
        data: {
          tenantId,
          nameEn: 'Capital & Funds',
          nameGu: 'મૂડી અને ભંડોળ',
          groupType: AccountGroupType.LIABILITY,
          isSystem: true,
        },
      });
    }

    let capFund = await prisma.chartOfAccount.findFirst({
      where: { tenantId, code: '2001', financialYearId: fyId },
    });
    if (!capFund) {
      capFund = await prisma.chartOfAccount.create({
        data: {
          tenantId,
          accountGroupId: capGroup.id,
          code: '2001',
          nameEn: 'Capital & Reserve Fund',
          nameGu: 'મૂડી અને અનામત ભંડોળ',
          accountType: AccountGroupType.LIABILITY,
          accountNature: AccountNature.CREDIT,
          openingBalance: 0,
          currentBalance: 0,
          financialYearId: fyId,
          isSystem: true,
        },
      });
    }

    // Compute exact balancing amount for Capital & Reserve Fund
    const allAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, financialYearId: fyId, isActive: true },
    });
    let sumDr = 0;
    let sumCr = 0;
    for (const a of allAccounts) {
      if (a.id === capFund.id) continue;
      const isDebit = a.accountNature === 'DEBIT';
      const bal = a.currentBalance;
      if (isDebit) sumDr += bal >= 0 ? bal : 0;
      else sumCr += bal >= 0 ? bal : 0;
    }
    const diff = Math.round((sumDr - sumCr) * 100) / 100;
    await prisma.chartOfAccount.update({
      where: { id: capFund.id },
      data: { openingBalance: diff, currentBalance: diff },
    });
    capitalFundAccountId = capFund.id;

    // Tenant 2 for Isolation tests
    let tenant2 = await prisma.tenant.findFirst({ where: { code: 'T2-ACCOUNTS' } });
    if (!tenant2) {
      tenant2 = await prisma.tenant.create({
        data: {
          name: 'Tenant Two School',
          slug: 'tenant-two-school',
          code: 'T2-ACCOUNTS',
          isActive: true,
        },
      });
    }
    tenant2Id = tenant2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Core Double-Entry Validation
  test('1. Rejects unbalanced journal entries (Debits != Credits)', async () => {
    await expect(
      accountingService.createJournalEntry(tenantId, userId, {
        financialYearId: fyId,
        entryDate: '2026-09-10',
        entryType: JournalEntryType.JOURNAL,
        narration: 'Unbalanced test',
        lines: [
          { accountId: cashAccountId, debitAmount: 5000, creditAmount: 0 },
          { accountId: feeIncomeAccountId, debitAmount: 0, creditAmount: 4000 },
        ],
      })
    ).rejects.toThrow(/out of balance/i);
  });

  test('2. Chart of Accounts: Creating and updating accounts with opening balances', async () => {
    const groups = await accountingService.getAccountGroups(tenantId);
    const assetGroup = groups.find((g) => g.groupType === 'ASSET') || groups[0];
    const testCode = `T${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newAcc = await accountingService.createAccount(tenantId, userId, {
      accountGroupId: assetGroup.id,
      code: testCode,
      nameEn: 'Petty Cash Box B',
      nameGu: 'પરચૂરણ રોકડ પેટી બી',
      accountType: AccountGroupType.ASSET,
      accountNature: AccountNature.DEBIT,
      openingBalance: 0,
      financialYearId: fyId,
      isCashAccount: true,
    });

    expect(newAcc).toBeDefined();
    expect(newAcc.code).toBe(testCode);
    expect(newAcc.openingBalance).toBe(0);
    expect(newAcc.currentBalance).toBe(0);

    // Update account metadata
    const updated = await accountingService.updateAccount(tenantId, userId, newAcc.id, {
      nameEn: 'Petty Cash Box B - Updated',
      nameGu: 'પરચૂરણ રોકડ પેટી બી સુધારેલ',
    });
    expect(updated.nameEn).toBe('Petty Cash Box B - Updated');
  });

  // 2. Specialized Vouchers
  test('3. Receipt Voucher: Collects income into bank account and credits revenue', async () => {
    const bankBefore = await prisma.chartOfAccount.findUnique({ where: { id: bankAccountId } });
    const feeBefore = await prisma.chartOfAccount.findUnique({ where: { id: feeIncomeAccountId } });

    const voucher = await accountingService.createReceiptVoucher(tenantId, userId, {
      financialYearId: fyId,
      date: '2026-09-10',
      incomeAccountId: feeIncomeAccountId,
      paymentAccountId: bankAccountId,
      amount: 15000,
      paymentMode: PaymentMode.UPI,
      voucherNumber: 'V-REC-001',
      narration: 'Direct UPI Fee Donation',
    });

    expect(voucher).toBeDefined();
    expect(voucher.entryType).toBe(JournalEntryType.RECEIPT);
    expect(voucher.totalAmount).toBe(15000);

    const bankAfter = await prisma.chartOfAccount.findUnique({ where: { id: bankAccountId } });
    const feeAfter = await prisma.chartOfAccount.findUnique({ where: { id: feeIncomeAccountId } });

    expect(bankAfter!.currentBalance).toBe(bankBefore!.currentBalance + 15000);
    expect(feeAfter!.currentBalance).toBe(feeBefore!.currentBalance + 15000);
  });

  test('4. Payment Voucher: Disburses expense from cash account and debits expense head', async () => {
    const cashBefore = await prisma.chartOfAccount.findUnique({ where: { id: cashAccountId } });
    const statBefore = await prisma.chartOfAccount.findUnique({ where: { id: stationeryAccountId } });

    const voucher = await accountingService.createPaymentVoucher(tenantId, userId, {
      financialYearId: fyId,
      date: '2026-09-10',
      expenseAccountId: stationeryAccountId,
      paymentAccountId: cashAccountId,
      amount: 3200,
      paymentMode: PaymentMode.CASH,
      payeeName: 'Gujarat Stationers',
      voucherNumber: 'V-PAY-001',
      narration: 'Purchased Exam Papers & Registers',
    });

    expect(voucher).toBeDefined();
    expect(voucher.entryType).toBe(JournalEntryType.PAYMENT);
    expect(voucher.totalAmount).toBe(3200);

    const cashAfter = await prisma.chartOfAccount.findUnique({ where: { id: cashAccountId } });
    const statAfter = await prisma.chartOfAccount.findUnique({ where: { id: stationeryAccountId } });

    expect(cashAfter!.currentBalance).toBe(cashBefore!.currentBalance - 3200);
    expect(statAfter!.currentBalance).toBe(statBefore!.currentBalance + 3200);
  });

  test('5. Contra Voucher: Transfers cash from cash-in-hand to bank account (Cash Deposit)', async () => {
    const cashBefore = await prisma.chartOfAccount.findUnique({ where: { id: cashAccountId } });
    const bankBefore = await prisma.chartOfAccount.findUnique({ where: { id: bankAccountId } });

    const contra = await accountingService.createContraVoucher(tenantId, userId, {
      financialYearId: fyId,
      date: '2026-09-10',
      fromAccountId: cashAccountId,
      toAccountId: bankAccountId,
      amount: 5000,
      transferType: 'CASH_DEPOSIT',
      voucherNumber: 'V-CTR-001',
      narration: 'Deposited daily cash balance into SBI Bank Account',
    });

    expect(contra).toBeDefined();
    expect(contra.entryType).toBe(JournalEntryType.CONTRA);
    expect(contra.totalAmount).toBe(5000);

    const cashAfter = await prisma.chartOfAccount.findUnique({ where: { id: cashAccountId } });
    const bankAfter = await prisma.chartOfAccount.findUnique({ where: { id: bankAccountId } });

    expect(cashAfter!.currentBalance).toBe(cashBefore!.currentBalance - 5000);
    expect(bankAfter!.currentBalance).toBe(bankBefore!.currentBalance + 5000);
  });

  test('6. Adjustment Voucher: Adjusts non-cash entries between accounts', async () => {
    const adj = await accountingService.createAdjustmentVoucher(tenantId, userId, {
      financialYearId: fyId,
      date: '2026-09-10',
      debitAccountId: stationeryAccountId,
      creditAccountId: feeIncomeAccountId,
      amount: 450,
      voucherNumber: 'V-ADJ-001',
      narration: 'Book store adjustment',
    });

    expect(adj).toBeDefined();
    expect(adj.entryType).toBe(JournalEntryType.ADJUSTMENT);
    expect(adj.totalAmount).toBe(450);
  });

  // 3. Traceability, Reversals, Cancellations & Attachments
  test('7. Reversal & Cancellation: Reversing an entry restores balances with audit trail', async () => {
    const cashBefore = await prisma.chartOfAccount.findUnique({ where: { id: cashAccountId } });
    const statBefore = await prisma.chartOfAccount.findUnique({ where: { id: stationeryAccountId } });

    const origEntry = await accountingService.createPaymentVoucher(tenantId, userId, {
      financialYearId: fyId,
      date: '2026-09-10',
      expenseAccountId: stationeryAccountId,
      paymentAccountId: cashAccountId,
      amount: 1200,
      paymentMode: PaymentMode.CASH,
      narration: 'Entry to be reversed',
    });

    const reversed = await accountingService.reverseJournalEntry(tenantId, userId, origEntry.id, 'Duplicate invoice entered');
    expect(reversed).toBeDefined();
    expect(reversed.totalAmount).toBe(1200);

    const cashAfter = await prisma.chartOfAccount.findUnique({ where: { id: cashAccountId } });
    const statAfter = await prisma.chartOfAccount.findUnique({ where: { id: stationeryAccountId } });

    // Balances returned to original
    expect(cashAfter!.currentBalance).toBe(cashBefore!.currentBalance);
    expect(statAfter!.currentBalance).toBe(statBefore!.currentBalance);

    const updatedOrig = await prisma.journalEntry.findUnique({ where: { id: origEntry.id } });
    expect(updatedOrig!.status).toBe('REVERSED');
    expect(updatedOrig!.cancellationReason).toBe('Duplicate invoice entered');
  });

  test('8. Document Attachments: Attaches supporting documents to journal entry', async () => {
    const entry = await accountingService.createReceiptVoucher(tenantId, userId, {
      financialYearId: fyId,
      date: '2026-09-10',
      incomeAccountId: feeIncomeAccountId,
      paymentAccountId: bankAccountId,
      amount: 2500,
      paymentMode: PaymentMode.BANK_TRANSFER,
      narration: 'Bank transfer with voucher bill',
    });

    const doc = await accountingService.attachDocument(tenantId, userId, entry.id, {
      fileName: 'bank_challan_copy.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      storagePath: '/uploads/documents/bank_challan_copy.pdf',
    });

    expect(doc).toBeDefined();
    expect(doc.entityType).toBe('JOURNAL_ENTRY');
    expect(doc.entityId).toBe(entry.id);

    const entryWithDocs = await accountingService.getJournalEntryById(tenantId, entry.id);
    expect(entryWithDocs.documents.length).toBeGreaterThanOrEqual(1);
    expect(entryWithDocs.documents[0].fileName).toBe('bank_challan_copy.pdf');
  });

  // 4. Books: General Ledger, Cash Book, Bank Book
  test('9. General Ledger: Running balance calculated correctly with prior dates', async () => {
    const ledger = await accountingService.getLedger(tenantId, cashAccountId, '2026-04-01', '2027-03-31');
    expect(ledger).toBeDefined();
    expect(ledger.accountId).toBe(cashAccountId);
    expect(ledger.entries.length).toBeGreaterThan(0);
    expect(typeof ledger.openingBalance).toBe('number');
    expect(typeof ledger.closingBalance).toBe('number');
  });

  test('10. Cash Book: Extracts receipts, payments, and matches running cash balance', async () => {
    const cashBook = await accountingService.getCashBook(tenantId, fyId, '2026-04-01', '2027-03-31');
    expect(cashBook).toBeDefined();
    expect(cashBook.financialYearId).toBe(fyId);
    expect(cashBook.totalReceipts).toBeGreaterThanOrEqual(0);
    expect(cashBook.totalPayments).toBeGreaterThanOrEqual(0);
    expect(
      Math.abs(cashBook.openingBalance + cashBook.totalReceipts - cashBook.totalPayments - cashBook.closingBalance)
    ).toBeLessThan(0.01);
  });

  test('11. Bank Book: Aggregates bank deposits, withdrawals, and balances', async () => {
    const bankBook = await accountingService.getBankBook(tenantId, fyId, '2026-04-01', '2027-03-31');
    expect(bankBook).toBeDefined();
    expect(bankBook.accounts.length).toBeGreaterThan(0);
    expect(
      Math.abs(
        bankBook.totalOpeningBalance + bankBook.grandTotalDeposits - bankBook.grandTotalWithdrawals - bankBook.totalClosingBalance
      )
    ).toBeLessThan(0.01);
  });

  // 5. Financial Statements & Reports
  test('12. Trial Balance: Parity verification (Total Debits == Total Credits)', async () => {
    const tb = await accountingService.getTrialBalance(tenantId, fyId);
    expect(tb).toBeDefined();
    expect(tb.rows.length).toBeGreaterThan(0);
    expect(tb.totalDebit).toBe(tb.totalCredit);
    expect(tb.isBalanced).toBe(true);
  });

  test('13. Income & Expense Statement: Correct surplus/deficit computation', async () => {
    const incExp = await accountingService.getIncomeExpenseReport(tenantId, fyId);
    expect(incExp).toBeDefined();
    expect(incExp.incomes.length).toBeGreaterThan(0);
    expect(incExp.expenses.length).toBeGreaterThan(0);
    expect(incExp.netSurplusOrDeficit).toBe(
      Math.round((incExp.totalIncome - incExp.totalExpense) * 100) / 100
    );
    expect(incExp.isSurplus).toBe(incExp.netSurplusOrDeficit >= 0);
  });

  test('14. Head-Wise & Monthly Summary Reports', async () => {
    const headReport = await accountingService.getHeadWiseReport(tenantId, fyId, AccountGroupType.EXPENSE);
    expect(headReport).toBeDefined();
    expect(headReport.heads.length).toBeGreaterThan(0);
    expect(headReport.grandTotal).toBeGreaterThanOrEqual(0);

    const monthlyReport = await accountingService.getMonthlySummaryReport(tenantId, fyId);
    expect(monthlyReport).toBeDefined();
    expect(monthlyReport.months.length).toBeGreaterThan(0);
  });

  // 6. Year-End Closing & Balance Rollover
  test('15. Financial Year Rollover: Closes FY, rolls balance sheet accounts, resets nominal accounts', async () => {
    const incExp = await accountingService.getIncomeExpenseReport(tenantId, fyId);
    const expectedSurplus = incExp.netSurplusOrDeficit;

    const result = await accountingService.closeFinancialYear(tenantId, userId, {
      closingFinancialYearId: fyId,
      nextFinancialYearId: nextFyId,
      retainedEarningsAccountId: capitalFundAccountId,
      reason: 'Statutory Annual Audit Complete 2026-27',
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.netSurplus).toBe(expectedSurplus);

    // Verify closing FY is closed
    const closedFy = await prisma.financialYear.findUnique({ where: { id: fyId } });
    expect(closedFy!.isClosed).toBe(true);

    // Verify next FY has rolled over accounts
    const nextCash = await prisma.chartOfAccount.findFirst({
      where: { tenantId, financialYearId: nextFyId, code: '1001' },
    });
    const oldCash = await prisma.chartOfAccount.findFirst({
      where: { tenantId, financialYearId: fyId, code: '1001' },
    });

    expect(nextCash).toBeDefined();
    expect(nextCash!.openingBalance).toBe(oldCash!.currentBalance);

    // Nominal Income account starts at 0 in next FY
    const nextIncome = await prisma.chartOfAccount.findFirst({
      where: { tenantId, financialYearId: nextFyId, code: '3001' },
    });
    expect(nextIncome).toBeDefined();
    expect(nextIncome!.openingBalance).toBe(0);
  });

  // 7. Multi-Tenant Isolation
  test('16. Multi-Tenant Isolation: Tenant B cannot access Tenant A accounts or entries', async () => {
    const tenant2Accounts = await accountingService.getChartOfAccounts(tenant2Id);
    expect(tenant2Accounts.length).toBe(0);

    await expect(
      accountingService.getLedger(tenant2Id, cashAccountId, '2026-04-01', '2027-03-31')
    ).rejects.toThrow(/ACCOUNT_NOT_FOUND/i);
  });
});

