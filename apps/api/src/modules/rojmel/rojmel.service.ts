import { prisma } from '../../database/prisma';
import { accountingService } from '../accounting/accounting.service';
import {
  RojmelEntryCreateDto,
  RojmelEntryType,
  PaymentMode,
  JournalEntryType,
  RojmelDayViewDto,
  RojmelMonthlyViewDto,
  RojmelYearlyViewDto,
  RojmelHeadSummaryDto,
  RojmelItemDto,
  RojmelDaySummaryRowDto,
  RojmelMonthSummaryRowDto,
  RojmelQuickBatchDto,
} from '@apna-school/shared-types';

export class RojmelService {
  /**
   * Helper: Resolve Financial Year for a specific date or by ID
   */
  private async resolveFinancialYear(tenantId: string, date: Date, financialYearId?: string) {
    if (financialYearId) {
      const fy = await prisma.financialYear.findFirst({ where: { id: financialYearId, tenantId } });
      if (fy) return fy;
    }
    let fy = await prisma.financialYear.findFirst({
      where: {
        tenantId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
    if (!fy) {
      fy = await prisma.financialYear.findFirst({ where: { tenantId, isCurrent: true } });
    }
    if (!fy) {
      fy = await prisma.financialYear.findFirst({ where: { tenantId } });
    }
    if (!fy) throw new Error('FINANCIAL_YEAR_NOT_FOUND');
    return fy;
  }

  /**
   * Helper: Compute balance of Cash / Bank account prior to a specific timestamp
   */
  private async getAccountBalanceAsOf(tenantId: string, accountId: string, asOfDate: Date) {
    const account = await prisma.chartOfAccount.findUnique({ where: { id: accountId } });
    if (!account) return 0;

    const lines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: {
          tenantId,
          status: 'ACTIVE',
          entryDate: { lt: asOfDate },
        },
      },
    });

    let balance = account.openingBalance;
    for (const l of lines) {
      balance += l.debitAmount - l.creditAmount;
    }
    return Math.round(balance * 100) / 100;
  }

  /**
   * 1. Daily Deshi Nama Rojmel View (દૈનિક રોજમેળ આખરો)
   */
  async getRojmelDayView(tenantId: string, dateStr: string, financialYearId?: string): Promise<RojmelDayViewDto> {
    const entryDate = new Date(dateStr);
    entryDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(entryDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const fy = await this.resolveFinancialYear(tenantId, entryDate, financialYearId);

    // Fetch Cash and Bank Accounts for this FY
    const cashAccount = await prisma.chartOfAccount.findFirst({
      where: { tenantId, isCashAccount: true, financialYearId: fy.id, isActive: true },
    });
    const bankAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, isBankAccount: true, financialYearId: fy.id, isActive: true },
    });

    if (!cashAccount) {
      throw new Error('Cash account not configured in Chart of Accounts.');
    }

    // Opening Balances as of beginning of the day
    const openingCash = await this.getAccountBalanceAsOf(tenantId, cashAccount.id, entryDate);
    let openingBank = 0;
    for (const b of bankAccounts) {
      openingBank += await this.getAccountBalanceAsOf(tenantId, b.id, entryDate);
    }
    openingBank = Math.round(openingBank * 100) / 100;

    // Fetch day's posted journal entries
    const dayEntries = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        entryDate: { gte: entryDate, lt: nextDay },
      },
      include: {
        lines: {
          include: {
            account: {
              include: { accountGroup: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const jamaItems: RojmelItemDto[] = [];
    const udharItems: RojmelItemDto[] = [];
    const headTotals: Record<string, { account: any; jama: number; udhar: number }> = {};

    let totalCashReceipts = 0;
    let totalBankReceipts = 0;
    let totalCashPayments = 0;
    let totalBankPayments = 0;

    for (const entry of dayEntries) {
      const cashLines = entry.lines.filter((l) => l.account.isCashAccount);
      const bankLines = entry.lines.filter((l) => l.account.isBankAccount);
      const otherLines = entry.lines.filter((l) => !l.account.isCashAccount && !l.account.isBankAccount);

      // --- CASE A: CONTRA TRANSFER (Cash to Bank or Bank to Cash) ---
      if (entry.entryType === JournalEntryType.CONTRA || (cashLines.length > 0 && bankLines.length > 0)) {
        for (const cl of cashLines) {
          if (cl.debitAmount > 0) {
            // Cash Deposit Inflow to Cash from Bank withdrawal
            totalCashReceipts += cl.debitAmount;
            const bankAcc = bankLines[0]?.account;
            jamaItems.push({
              id: `${entry.id}-cash-dr`,
              journalEntryId: entry.id,
              date: dateStr,
              khataPanoNo: bankAcc?.code || '1002',
              accountId: bankAcc?.id || '',
              accountCode: bankAcc?.code || '1002',
              accountNameEn: bankAcc?.nameEn || 'Bank Account',
              accountNameGu: bankAcc?.nameGu || 'બેંક ખાતું (રોકડ ઉપાડ)',
              groupNameGu: 'બેંક ખાતું',
              cashAmount: cl.debitAmount,
              bankAmount: 0,
              totalAmount: cl.debitAmount,
              paymentMode: PaymentMode.CASH,
              narration: entry.narration || 'બેંકમાંથી રોકડ ઉપાડી',
              voucherNumber: entry.voucherNumber || entry.entryNumber,
              referenceNumber: entry.referenceId || undefined,
              isCash: true,
            });
          }
          if (cl.creditAmount > 0) {
            // Cash Deposited into Bank
            totalCashPayments += cl.creditAmount;
            const bankAcc = bankLines[0]?.account;
            udharItems.push({
              id: `${entry.id}-cash-cr`,
              journalEntryId: entry.id,
              date: dateStr,
              khataPanoNo: bankAcc?.code || '1002',
              accountId: bankAcc?.id || '',
              accountCode: bankAcc?.code || '1002',
              accountNameEn: bankAcc?.nameEn || 'Bank Account',
              accountNameGu: bankAcc?.nameGu || 'બેંક ખાતું (રોકડ જમા)',
              groupNameGu: 'બેંક ખાતું',
              cashAmount: cl.creditAmount,
              bankAmount: 0,
              totalAmount: cl.creditAmount,
              paymentMode: PaymentMode.CASH,
              narration: entry.narration || 'બેંકમાં રોકડ જમા કરાવી',
              voucherNumber: entry.voucherNumber || entry.entryNumber,
              referenceNumber: entry.referenceId || undefined,
              isCash: true,
            });
          }
        }

        for (const bl of bankLines) {
          if (bl.debitAmount > 0) {
            totalBankReceipts += bl.debitAmount;
            const cashAcc = cashLines[0]?.account;
            jamaItems.push({
              id: `${entry.id}-bank-dr`,
              journalEntryId: entry.id,
              date: dateStr,
              khataPanoNo: cashAcc?.code || '1001',
              accountId: cashAcc?.id || '',
              accountCode: cashAcc?.code || '1001',
              accountNameEn: cashAcc?.nameEn || 'Cash in Hand',
              accountNameGu: cashAcc?.nameGu || 'શ્રી રોકડ સિલક ખાતું',
              groupNameGu: 'રોકડ ખાતું',
              cashAmount: 0,
              bankAmount: bl.debitAmount,
              totalAmount: bl.debitAmount,
              paymentMode: PaymentMode.BANK_TRANSFER,
              narration: entry.narration || 'રોકડ બેંકમાં જમા',
              voucherNumber: entry.voucherNumber || entry.entryNumber,
              referenceNumber: entry.referenceId || undefined,
              isCash: false,
              bankName: bl.account.nameGu,
            });
          }
          if (bl.creditAmount > 0) {
            totalBankPayments += bl.creditAmount;
            const cashAcc = cashLines[0]?.account;
            udharItems.push({
              id: `${entry.id}-bank-cr`,
              journalEntryId: entry.id,
              date: dateStr,
              khataPanoNo: cashAcc?.code || '1001',
              accountId: cashAcc?.id || '',
              accountCode: cashAcc?.code || '1001',
              accountNameEn: cashAcc?.nameEn || 'Cash in Hand',
              accountNameGu: cashAcc?.nameGu || 'શ્રી રોકડ સિલક ખાતું',
              groupNameGu: 'રોકડ ખાતું',
              cashAmount: 0,
              bankAmount: bl.creditAmount,
              totalAmount: bl.creditAmount,
              paymentMode: PaymentMode.BANK_TRANSFER,
              narration: entry.narration || 'ચેકથી રોકડ ઉપાડ',
              voucherNumber: entry.voucherNumber || entry.entryNumber,
              referenceNumber: entry.referenceId || undefined,
              isCash: false,
              bankName: bl.account.nameGu,
            });
          }
        }
        continue;
      }

      // --- CASE B: REGULAR INFLOWS & OUTFLOWS ---
      // 1. Cash Inflows (JAMA)
      for (const cl of cashLines) {
        if (cl.debitAmount > 0) {
          totalCashReceipts += cl.debitAmount;
          const opp = otherLines[0]?.account || entry.lines.find((l) => l.id !== cl.id)?.account;
          if (opp) {
            if (!headTotals[opp.id]) headTotals[opp.id] = { account: opp, jama: 0, udhar: 0 };
            headTotals[opp.id].jama += cl.debitAmount;
          }
          jamaItems.push({
            id: `${entry.id}-cash-dr`,
            journalEntryId: entry.id,
            date: dateStr,
            khataPanoNo: opp?.code || '1001',
            accountId: opp?.id || '',
            accountCode: opp?.code || '1001',
            accountNameEn: opp?.nameEn || 'Cash Receipt',
            accountNameGu: opp?.nameGu || 'રોકડ આવક',
            groupNameGu: opp?.accountGroup?.nameGu,
            cashAmount: cl.debitAmount,
            bankAmount: 0,
            totalAmount: cl.debitAmount,
            paymentMode: PaymentMode.CASH,
            narration: entry.narration || '',
            voucherNumber: entry.voucherNumber || entry.entryNumber,
            referenceNumber: entry.referenceId || undefined,
            isCash: true,
          });
        }
        // 2. Cash Outflows (UDHAR)
        if (cl.creditAmount > 0) {
          totalCashPayments += cl.creditAmount;
          const opp = otherLines[0]?.account || entry.lines.find((l) => l.id !== cl.id)?.account;
          if (opp) {
            if (!headTotals[opp.id]) headTotals[opp.id] = { account: opp, jama: 0, udhar: 0 };
            headTotals[opp.id].udhar += cl.creditAmount;
          }
          udharItems.push({
            id: `${entry.id}-cash-cr`,
            journalEntryId: entry.id,
            date: dateStr,
            khataPanoNo: opp?.code || '1001',
            accountId: opp?.id || '',
            accountCode: opp?.code || '1001',
            accountNameEn: opp?.nameEn || 'Cash Payment',
            accountNameGu: opp?.nameGu || 'રોકડ ચુકવણી',
            groupNameGu: opp?.accountGroup?.nameGu,
            cashAmount: cl.creditAmount,
            bankAmount: 0,
            totalAmount: cl.creditAmount,
            paymentMode: PaymentMode.CASH,
            narration: entry.narration || '',
            voucherNumber: entry.voucherNumber || entry.entryNumber,
            referenceNumber: entry.referenceId || undefined,
            isCash: true,
          });
        }
      }

      // 3. Bank Inflows (JAMA)
      for (const bl of bankLines) {
        if (bl.debitAmount > 0) {
          totalBankReceipts += bl.debitAmount;
          const opp = otherLines[0]?.account || entry.lines.find((l) => l.id !== bl.id)?.account;
          if (opp) {
            if (!headTotals[opp.id]) headTotals[opp.id] = { account: opp, jama: 0, udhar: 0 };
            headTotals[opp.id].jama += bl.debitAmount;
          }
          jamaItems.push({
            id: `${entry.id}-bank-dr`,
            journalEntryId: entry.id,
            date: dateStr,
            khataPanoNo: opp?.code || '1002',
            accountId: opp?.id || '',
            accountCode: opp?.code || '1002',
            accountNameEn: opp?.nameEn || 'Bank Receipt',
            accountNameGu: opp?.nameGu || 'બેંક આવક',
            groupNameGu: opp?.accountGroup?.nameGu,
            cashAmount: 0,
            bankAmount: bl.debitAmount,
            totalAmount: bl.debitAmount,
            paymentMode: PaymentMode.BANK_TRANSFER,
            narration: entry.narration || '',
            voucherNumber: entry.voucherNumber || entry.entryNumber,
            referenceNumber: entry.referenceId || undefined,
            isCash: false,
            bankName: bl.account.nameGu,
          });
        }
        // 4. Bank Outflows (UDHAR)
        if (bl.creditAmount > 0) {
          totalBankPayments += bl.creditAmount;
          const opp = otherLines[0]?.account || entry.lines.find((l) => l.id !== bl.id)?.account;
          if (opp) {
            if (!headTotals[opp.id]) headTotals[opp.id] = { account: opp, jama: 0, udhar: 0 };
            headTotals[opp.id].udhar += bl.creditAmount;
          }
          udharItems.push({
            id: `${entry.id}-bank-cr`,
            journalEntryId: entry.id,
            date: dateStr,
            khataPanoNo: opp?.code || '1002',
            accountId: opp?.id || '',
            accountCode: opp?.code || '1002',
            accountNameEn: opp?.nameEn || 'Bank Payment',
            accountNameGu: opp?.nameGu || 'બેંક ચુકવણી',
            groupNameGu: opp?.accountGroup?.nameGu,
            cashAmount: 0,
            bankAmount: bl.creditAmount,
            totalAmount: bl.creditAmount,
            paymentMode: PaymentMode.BANK_TRANSFER,
            narration: entry.narration || '',
            voucherNumber: entry.voucherNumber || entry.entryNumber,
            referenceNumber: entry.referenceId || undefined,
            isCash: false,
            bankName: bl.account.nameGu,
          });
        }
      }
    }

    // Totals and Closings
    const totalReceipts = Math.round((totalCashReceipts + totalBankReceipts) * 100) / 100;
    const totalPayments = Math.round((totalCashPayments + totalBankPayments) * 100) / 100;

    const closingCash = Math.round((openingCash + totalCashReceipts - totalCashPayments) * 100) / 100;
    const closingBank = Math.round((openingBank + totalBankReceipts - totalBankPayments) * 100) / 100;
    const totalClosing = Math.round((closingCash + closingBank) * 100) / 100;
    const totalOpening = Math.round((openingCash + openingBank) * 100) / 100;

    // Deshi Nama Aakharo Formula:
    // Total Jama Side = Total Opening (Cash + Bank) + Total Receipts (Cash + Bank)
    const totalJama = Math.round((totalOpening + totalReceipts) * 100) / 100;

    // Total Udhar Side = Total Payments (Cash + Bank) + Total Closing (Cash + Bank)
    const totalUdhar = Math.round((totalPayments + totalClosing) * 100) / 100;

    const diff = Math.round((totalJama - totalUdhar) * 100) / 100;
    const isBalanced = Math.abs(diff) < 0.01;

    // Head Summaries
    const headSummaries: RojmelHeadSummaryDto[] = Object.values(headTotals).map((h) => ({
      accountId: h.account.id,
      code: h.account.code,
      nameEn: h.account.nameEn,
      nameGu: h.account.nameGu,
      groupNameGu: h.account.accountGroup?.nameGu,
      jamaAmount: Math.round(h.jama * 100) / 100,
      udharAmount: Math.round(h.udhar * 100) / 100,
      netAmount: Math.round((h.jama - h.udhar) * 100) / 100,
    }));

    return {
      date: dateStr,
      financialYearId: fy.id,
      financialYearName: fy.name,
      openingCashBalance: openingCash,
      openingBankBalance: openingBank,
      totalOpeningBalance: totalOpening,
      jamaEntries: jamaItems,
      totalCashReceipts: Math.round(totalCashReceipts * 100) / 100,
      totalBankReceipts: Math.round(totalBankReceipts * 100) / 100,
      totalReceipts,
      totalJamaAmount: totalJama,
      udharEntries: udharItems,
      totalCashPayments: Math.round(totalCashPayments * 100) / 100,
      totalBankPayments: Math.round(totalBankPayments * 100) / 100,
      totalPayments,
      closingCashBalance: closingCash,
      closingBankBalance: closingBank,
      totalClosingBalance: totalClosing,
      totalUdharAmount: totalUdhar,
      headSummaries,
      isBalanced,
      difference: diff,
    };
  }

  /**
   * 2. Monthly View (માસિક રોજમેળ - Day-by-Day Grid)
   */
  async getRojmelMonthlyView(
    tenantId: string,
    year: number,
    month: number,
    financialYearId?: string
  ): Promise<RojmelMonthlyViewDto> {
    const monthIndex = month - 1; // 0-indexed for Date
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of month

    const fy = await this.resolveFinancialYear(tenantId, startDate, financialYearId);

    const gujaratiMonths = [
      'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
      'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર',
    ];
    const englishMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const days: RojmelDaySummaryRowDto[] = [];
    let monthOpeningCash = 0;
    let monthOpeningBank = 0;
    let monthTotalCashReceipts = 0;
    let monthTotalBankReceipts = 0;
    let monthTotalCashPayments = 0;
    let monthTotalBankPayments = 0;

    const totalDays = endDate.getDate();
    const cashAccount = await prisma.chartOfAccount.findFirst({
      where: { tenantId, isCashAccount: true, financialYearId: fy.id, isActive: true },
    });
    const bankAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, isBankAccount: true, financialYearId: fy.id, isActive: true },
    });

    if (!cashAccount) {
      throw new Error('Cash account not configured in Chart of Accounts.');
    }

    monthOpeningCash = await this.getAccountBalanceAsOf(tenantId, cashAccount.id, startDate);
    for (const b of bankAccounts) {
      monthOpeningBank += await this.getAccountBalanceAsOf(tenantId, b.id, startDate);
    }
    monthOpeningCash = Math.round(monthOpeningCash * 100) / 100;
    monthOpeningBank = Math.round(monthOpeningBank * 100) / 100;

    const monthEntries = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        entryDate: { gte: startDate, lte: endDate },
      },
      include: {
        lines: {
          include: {
            account: {
              include: { accountGroup: true },
            },
          },
        },
      },
      orderBy: [{ entryDate: 'asc' }, { createdAt: 'asc' }],
    });

    const entriesByDate: Record<string, typeof monthEntries> = {};
    for (const entry of monthEntries) {
      const d = new Date(entry.entryDate);
      const dKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!entriesByDate[dKey]) entriesByDate[dKey] = [];
      entriesByDate[dKey].push(entry);
    }

    let runningCash = monthOpeningCash;
    let runningBank = monthOpeningBank;

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEntries = entriesByDate[dateStr] || [];

      let dayCashJama = 0;
      let dayBankJama = 0;
      let dayCashUdhar = 0;
      let dayBankUdhar = 0;
      let dayEntriesCount = 0;

      for (const entry of dayEntries) {
        const cashLines = entry.lines.filter((l) => l.account.isCashAccount);
        const bankLines = entry.lines.filter((l) => l.account.isBankAccount);
        dayEntriesCount += cashLines.length + bankLines.length;

        for (const cl of cashLines) {
          if (cl.debitAmount > 0) dayCashJama += cl.debitAmount;
          if (cl.creditAmount > 0) dayCashUdhar += cl.creditAmount;
        }
        for (const bl of bankLines) {
          if (bl.debitAmount > 0) dayBankJama += bl.debitAmount;
          if (bl.creditAmount > 0) dayBankUdhar += bl.creditAmount;
        }
      }

      dayCashJama = Math.round(dayCashJama * 100) / 100;
      dayBankJama = Math.round(dayBankJama * 100) / 100;
      dayCashUdhar = Math.round(dayCashUdhar * 100) / 100;
      dayBankUdhar = Math.round(dayBankUdhar * 100) / 100;

      const dayTotalJama = Math.round((dayCashJama + dayBankJama) * 100) / 100;
      const dayTotalUdhar = Math.round((dayCashUdhar + dayBankUdhar) * 100) / 100;

      const dayOpeningCash = runningCash;
      const dayOpeningBank = runningBank;
      const dayClosingCash = Math.round((dayOpeningCash + dayCashJama - dayCashUdhar) * 100) / 100;
      const dayClosingBank = Math.round((dayOpeningBank + dayBankJama - dayBankUdhar) * 100) / 100;
      const dayClosingTotal = Math.round((dayClosingCash + dayClosingBank) * 100) / 100;

      const totalJamaFormula = Math.round((dayOpeningCash + dayOpeningBank + dayTotalJama) * 100) / 100;
      const totalUdharFormula = Math.round((dayTotalUdhar + dayClosingTotal) * 100) / 100;
      const isBalanced = Math.abs(totalJamaFormula - totalUdharFormula) < 0.01;

      monthTotalCashReceipts += dayCashJama;
      monthTotalBankReceipts += dayBankJama;
      monthTotalCashPayments += dayCashUdhar;
      monthTotalBankPayments += dayBankUdhar;

      days.push({
        date: dateStr,
        openingCash: dayOpeningCash,
        openingBank: dayOpeningBank,
        cashJama: dayCashJama,
        bankJama: dayBankJama,
        totalJama: dayTotalJama,
        cashUdhar: dayCashUdhar,
        bankUdhar: dayBankUdhar,
        totalUdhar: dayTotalUdhar,
        closingCash: dayClosingCash,
        closingBank: dayClosingBank,
        closingTotal: dayClosingTotal,
        entriesCount: dayEntriesCount,
        isBalanced,
      });

      runningCash = dayClosingCash;
      runningBank = dayClosingBank;
    }

    const lastDay = days[days.length - 1];
    const headSummary = await this.getRojmelHeadWiseSummary(
      tenantId,
      `${year}-${String(month).padStart(2, '0')}-01`,
      `${year}-${String(month).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`,
      fy.id
    );

    return {
      financialYearId: fy.id,
      financialYearName: fy.name,
      year,
      month,
      monthNameEn: englishMonths[monthIndex],
      monthNameGu: gujaratiMonths[monthIndex],
      openingCash: Math.round(monthOpeningCash * 100) / 100,
      openingBank: Math.round(monthOpeningBank * 100) / 100,
      totalCashReceipts: Math.round(monthTotalCashReceipts * 100) / 100,
      totalBankReceipts: Math.round(monthTotalBankReceipts * 100) / 100,
      totalReceipts: Math.round((monthTotalCashReceipts + monthTotalBankReceipts) * 100) / 100,
      totalCashPayments: Math.round(monthTotalCashPayments * 100) / 100,
      totalBankPayments: Math.round(monthTotalBankPayments * 100) / 100,
      totalPayments: Math.round((monthTotalCashPayments + monthTotalBankPayments) * 100) / 100,
      closingCash: lastDay ? lastDay.closingCash : monthOpeningCash,
      closingBank: lastDay ? lastDay.closingBank : monthOpeningBank,
      days,
      headSummaries: headSummary,
    };
  }

  /**
   * 3. Yearly Rojmel View (વાર્ષિક મેળ - 12 Months Summary)
   */
  async getRojmelYearlyView(tenantId: string, financialYearId?: string): Promise<RojmelYearlyViewDto> {
    const fy = await this.resolveFinancialYear(tenantId, new Date(), financialYearId);

    const start = new Date(fy.startDate);
    const end = new Date(fy.endDate);

    const gujaratiMonths = [
      'જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
      'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર',
    ];
    const englishMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const months: RojmelMonthSummaryRowDto[] = [];
    let runningOpeningCash = 0;
    let runningOpeningBank = 0;
    let yearTotalReceipts = 0;
    let yearTotalPayments = 0;

    let currYear = start.getFullYear();
    let currMonth = start.getMonth(); // 0-based (April is 3)

    for (let i = 0; i < 12; i++) {
      const mNum = currMonth + 1;
      const monthKey = `${currYear}-${String(mNum).padStart(2, '0')}`;
      const mData = await this.getRojmelMonthlyView(tenantId, currYear, mNum, fy.id);

      if (i === 0) {
        runningOpeningCash = mData.openingCash;
        runningOpeningBank = mData.openingBank;
      }

      yearTotalReceipts += mData.totalReceipts;
      yearTotalPayments += mData.totalPayments;
      const net = Math.round((mData.totalReceipts - mData.totalPayments) * 100) / 100;

      months.push({
        monthIndex: i + 1,
        monthKey,
        monthNameEn: englishMonths[currMonth],
        monthNameGu: gujaratiMonths[currMonth],
        openingCash: mData.openingCash,
        openingBank: mData.openingBank,
        totalReceipts: mData.totalReceipts,
        totalPayments: mData.totalPayments,
        netSurplusDeficit: net,
        closingCash: mData.closingCash,
        closingBank: mData.closingBank,
        closingTotal: Math.round((mData.closingCash + mData.closingBank) * 100) / 100,
      });

      // Advance month
      currMonth++;
      if (currMonth > 11) {
        currMonth = 0;
        currYear++;
      }
    }

    const lastMonth = months[months.length - 1];
    const headSummaries = await this.getRojmelHeadWiseSummary(
      tenantId,
      start.toISOString().slice(0, 10),
      end.toISOString().slice(0, 10),
      fy.id
    );

    return {
      financialYearId: fy.id,
      financialYearName: fy.name,
      startDate: fy.startDate.toISOString().slice(0, 10),
      endDate: fy.endDate.toISOString().slice(0, 10),
      openingCash: runningOpeningCash,
      openingBank: runningOpeningBank,
      totalReceipts: Math.round(yearTotalReceipts * 100) / 100,
      totalPayments: Math.round(yearTotalPayments * 100) / 100,
      netSurplusDeficit: Math.round((yearTotalReceipts - yearTotalPayments) * 100) / 100,
      closingCash: lastMonth ? lastMonth.closingCash : runningOpeningCash,
      closingBank: lastMonth ? lastMonth.closingBank : runningOpeningBank,
      months,
      headSummaries,
    };
  }

  /**
   * 4. Head-Wise Summary for Any Period (હેડવાર આવક-ખર્ચ સરવાળો)
   */
  async getRojmelHeadWiseSummary(
    tenantId: string,
    fromStr: string,
    toStr: string,
    financialYearId?: string
  ): Promise<RojmelHeadSummaryDto[]> {
    const fromDate = new Date(fromStr);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(toStr);
    toDate.setHours(23, 59, 59, 999);

    const entries = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        entryDate: { gte: fromDate, lte: toDate },
      },
      include: {
        lines: {
          include: {
            account: {
              include: { accountGroup: true },
            },
          },
        },
      },
    });

    const headMap: Record<string, { account: any; jama: number; udhar: number }> = {};

    for (const entry of entries) {
      const nonCashLines = entry.lines.filter((l) => !l.account.isCashAccount && !l.account.isBankAccount);
      for (const line of nonCashLines) {
        const acc = line.account;
        if (!headMap[acc.id]) {
          headMap[acc.id] = { account: acc, jama: 0, udhar: 0 };
        }
        // If the nominal account was credited, it represents an inflow/revenue (Jama)
        headMap[acc.id].jama += line.creditAmount;
        // If the nominal account was debited, it represents an outflow/expense (Udhar)
        headMap[acc.id].udhar += line.debitAmount;
      }
    }

    return Object.values(headMap).map((h) => ({
      accountId: h.account.id,
      code: h.account.code,
      nameEn: h.account.nameEn,
      nameGu: h.account.nameGu,
      groupNameGu: h.account.accountGroup?.nameGu,
      jamaAmount: Math.round(h.jama * 100) / 100,
      udharAmount: Math.round(h.udhar * 100) / 100,
      netAmount: Math.round((h.jama - h.udhar) * 100) / 100,
    }));
  }

  /**
   * 5. Create Single Rojmel Entry (Direct Double-Entry Creation)
   */
  async createRojmelEntry(tenantId: string, userId: string, dto: RojmelEntryCreateDto) {
    if (!dto.amount || dto.amount <= 0) {
      throw new Error('Transaction amount must be greater than zero.');
    }

    const entryDate = new Date(dto.date);
    const fy = await this.resolveFinancialYear(tenantId, entryDate);

    // Ensure payment account is valid cash/bank
    const paymentAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.paymentAccountId, tenantId },
    });
    if (!paymentAcc || (!paymentAcc.isCashAccount && !paymentAcc.isBankAccount)) {
      throw new Error('Payment account must be a valid Cash or Bank account.');
    }

    // Ensure target account exists
    const targetAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.accountId, tenantId },
    });
    if (!targetAcc) {
      throw new Error('Selected account head not found.');
    }

    let journalType: JournalEntryType;
    let lines: Array<{ accountId: string; debitAmount: number; creditAmount: number; narration?: string }>;

    if (dto.entryType === 'CONTRA' || (targetAcc.isCashAccount || targetAcc.isBankAccount)) {
      // Contra transfer: e.g., Cash to Bank or Bank to Cash
      journalType = JournalEntryType.CONTRA;
      lines = [
        { accountId: dto.accountId, debitAmount: dto.amount, creditAmount: 0, narration: dto.narration },
        { accountId: dto.paymentAccountId, debitAmount: 0, creditAmount: dto.amount, narration: dto.narration },
      ];
    } else if (dto.entryType === RojmelEntryType.JAMA) {
      // JAMA (Inflow / Receipt): Debit Cash/Bank, Credit Income Head
      journalType = JournalEntryType.RECEIPT;
      lines = [
        { accountId: dto.paymentAccountId, debitAmount: dto.amount, creditAmount: 0, narration: dto.narration },
        { accountId: dto.accountId, debitAmount: 0, creditAmount: dto.amount, narration: dto.narration },
      ];
    } else {
      // UDHAR (Outflow / Payment): Debit Expense Head, Credit Cash/Bank
      journalType = JournalEntryType.PAYMENT;
      lines = [
        { accountId: dto.accountId, debitAmount: dto.amount, creditAmount: 0, narration: dto.narration },
        { accountId: dto.paymentAccountId, debitAmount: 0, creditAmount: dto.amount, narration: dto.narration },
      ];
    }

    const entry = await accountingService.createJournalEntry(tenantId, userId, {
      financialYearId: fy.id,
      entryDate: dto.date,
      entryType: journalType,
      narration: dto.narration,
      voucherNumber: dto.voucherNumber,
      referenceId: dto.referenceNumber || dto.voucherNumber,
      referenceType: 'ROJMEL',
      lines,
    });

    return entry;
  }

  /**
   * 6. Quick Batch Entry (Rapid multiple entries in 1 shot)
   */
  async createQuickBatchRojmel(tenantId: string, userId: string, dto: RojmelQuickBatchDto) {
    if (!dto.entries || dto.entries.length === 0) {
      throw new Error('At least one transaction is required.');
    }

    const results = [];
    for (const item of dto.entries) {
      const created = await this.createRojmelEntry(tenantId, userId, {
        date: dto.date,
        ...item,
      });
      results.push(created);
    }
    return results;
  }
}

export const rojmelService = new RojmelService();
