import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';
import {
  CreateJournalEntryDto,
  CreateAccountGroupDto,
  CreateAccountDto,
  UpdateAccountDto,
  CreateReceiptVoucherDto,
  CreatePaymentVoucherDto,
  CreateContraVoucherDto,
  CreateAdjustmentVoucherDto,
  JournalEntryType,
  JournalEntryStatus,
  AccountGroupType,
  AccountNature,
  PaymentMode,
  CashBookStatementDto,
  BankBookStatementDto,
  IncomeExpenseStatementDto,
  HeadWiseReportDto,
  MonthlyFinancialSummaryDto,
  YearlyFinancialSummaryDto,
  CloseFinancialYearDto,
} from '@apna-school/shared-types';

export class AccountingService {
  // -------------------------------------------------------------
  // 1. ACCOUNT GROUPS & CHART OF ACCOUNTS
  // -------------------------------------------------------------

  async getAccountGroups(tenantId: string) {
    return prisma.accountGroup.findMany({
      where: { tenantId, isActive: true },
      include: {
        children: true,
        accounts: { where: { isActive: true } },
      },
      orderBy: { sequenceOrder: 'asc' },
    });
  }

  async createAccountGroup(tenantId: string, userId: string, dto: CreateAccountGroupDto) {
    const existing = await prisma.accountGroup.findFirst({
      where: { tenantId, nameEn: dto.nameEn },
    });
    if (existing) {
      throw new Error(`Account group "${dto.nameEn}" already exists.`);
    }

    const group = await prisma.accountGroup.create({
      data: {
        tenantId,
        nameEn: dto.nameEn,
        nameGu: dto.nameGu,
        parentId: dto.parentId || null,
        groupType: dto.groupType,
        sequenceOrder: dto.sequenceOrder || 10,
        isSystem: false,
        isActive: true,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_ACCOUNT_GROUP',
      entityType: 'ACCOUNT_GROUP',
      entityId: group.id,
      newValues: { nameEn: dto.nameEn, groupType: dto.groupType },
    });

    return group;
  }

  async getChartOfAccounts(tenantId: string, financialYearId?: string, accountType?: AccountGroupType) {
    return prisma.chartOfAccount.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(financialYearId ? { financialYearId } : {}),
        ...(accountType ? { accountType } : {}),
      },
      include: {
        accountGroup: true,
        bankAccounts: true,
      },
      orderBy: [{ accountType: 'asc' }, { code: 'asc' }],
    });
  }

  async createAccount(tenantId: string, userId: string, dto: CreateAccountDto) {
    // Check unique code within tenant and financial year
    const existing = await prisma.chartOfAccount.findFirst({
      where: {
        tenantId,
        code: dto.code,
        financialYearId: dto.financialYearId,
      },
    });
    if (existing) {
      throw new Error(`Account with code "${dto.code}" already exists for this financial year.`);
    }

    const openingBal = Number(dto.openingBalance) || 0;

    const account = await prisma.$transaction(async (tx) => {
      const acc = await tx.chartOfAccount.create({
        data: {
          tenantId,
          accountGroupId: dto.accountGroupId,
          code: dto.code,
          nameEn: dto.nameEn,
          nameGu: dto.nameGu,
          accountType: dto.accountType,
          accountNature: dto.accountNature,
          openingBalance: openingBal,
          currentBalance: openingBal,
          financialYearId: dto.financialYearId,
          isBankAccount: Boolean(dto.isBankAccount),
          isCashAccount: Boolean(dto.isCashAccount),
          isSystem: false,
          isActive: true,
        },
        include: {
          accountGroup: true,
        },
      });

      if (dto.isBankAccount && dto.bankDetails) {
        await tx.bankAccount.create({
          data: {
            tenantId,
            accountId: acc.id,
            bankName: dto.bankDetails.bankName,
            branchName: dto.bankDetails.branchName || null,
            accountNumber: dto.bankDetails.accountNumber,
            ifscCode: dto.bankDetails.ifscCode || null,
            accountType: dto.bankDetails.accountType || 'SAVINGS',
            isActive: true,
          },
        });
      }

      return acc;
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_ACCOUNT',
      entityType: 'CHART_OF_ACCOUNT',
      entityId: account.id,
      newValues: { code: dto.code, nameEn: dto.nameEn, openingBalance: openingBal },
    });

    return account;
  }

  async updateAccount(tenantId: string, userId: string, accountId: string, dto: UpdateAccountDto) {
    const existing = await prisma.chartOfAccount.findFirst({
      where: { id: accountId, tenantId },
    });
    if (!existing) throw new Error('ACCOUNT_NOT_FOUND');

    // If changing opening balance, recalculate currentBalance
    let newOpening = existing.openingBalance;
    let newCurrent = existing.currentBalance;

    if (dto.openingBalance !== undefined) {
      const diff = Number(dto.openingBalance) - existing.openingBalance;
      newOpening = Number(dto.openingBalance);
      newCurrent = Math.round((existing.currentBalance + diff) * 100) / 100;
    }

    const updated = await prisma.chartOfAccount.update({
      where: { id: accountId },
      data: {
        ...(dto.nameEn ? { nameEn: dto.nameEn } : {}),
        ...(dto.nameGu ? { nameGu: dto.nameGu } : {}),
        ...(dto.accountGroupId ? { accountGroupId: dto.accountGroupId } : {}),
        ...(dto.openingBalance !== undefined ? { openingBalance: newOpening, currentBalance: newCurrent } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { accountGroup: true },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE_ACCOUNT',
      entityType: 'CHART_OF_ACCOUNT',
      entityId: accountId,
      oldValues: { nameEn: existing.nameEn, openingBalance: existing.openingBalance },
      newValues: { nameEn: updated.nameEn, openingBalance: updated.openingBalance },
    });

    return updated;
  }

  // -------------------------------------------------------------
  // 2. SPECIALIZED VOUCHERS (Receipt, Payment, Contra, Adjustment)
  // -------------------------------------------------------------

  async createReceiptVoucher(tenantId: string, userId: string, dto: CreateReceiptVoucherDto) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new Error('Receipt amount must be greater than zero.');

    const paymentAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.paymentAccountId, tenantId },
    });
    if (!paymentAcc) throw new Error('Deposit Cash/Bank Account not found.');

    const incomeAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.incomeAccountId, tenantId },
    });
    if (!incomeAcc) throw new Error('Income/Credit Account not found.');

    const entry = await this.createJournalEntry(tenantId, userId, {
      financialYearId: dto.financialYearId,
      entryDate: dto.date,
      entryType: JournalEntryType.RECEIPT,
      narration: dto.narration || `Receipt received via ${dto.paymentMode}`,
      voucherNumber: dto.voucherNumber,
      referenceType: 'receipt_voucher',
      referenceId: dto.referenceNo,
      lines: [
        {
          accountId: paymentAcc.id,
          debitAmount: amount,
          creditAmount: 0,
          narration: `Received in ${paymentAcc.nameEn} (${dto.paymentMode})`,
        },
        {
          accountId: incomeAcc.id,
          debitAmount: 0,
          creditAmount: amount,
          narration: `Credit to ${incomeAcc.nameEn}`,
        },
      ],
    });

    return entry;
  }

  async createPaymentVoucher(tenantId: string, userId: string, dto: CreatePaymentVoucherDto) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new Error('Payment amount must be greater than zero.');

    const expenseAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.expenseAccountId, tenantId },
    });
    if (!expenseAcc) throw new Error('Expense/Debit Account not found.');

    const paymentAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.paymentAccountId, tenantId },
    });
    if (!paymentAcc) throw new Error('Payment Cash/Bank Account not found.');

    const entry = await this.createJournalEntry(tenantId, userId, {
      financialYearId: dto.financialYearId,
      entryDate: dto.date,
      entryType: JournalEntryType.PAYMENT,
      narration: dto.narration || `Payment made via ${dto.paymentMode} to ${dto.payeeName || 'Party'}`,
      voucherNumber: dto.voucherNumber,
      referenceType: 'payment_voucher',
      referenceId: dto.referenceNo,
      lines: [
        {
          accountId: expenseAcc.id,
          debitAmount: amount,
          creditAmount: 0,
          narration: `Debit to ${expenseAcc.nameEn} (Payee: ${dto.payeeName || 'N/A'})`,
        },
        {
          accountId: paymentAcc.id,
          debitAmount: 0,
          creditAmount: amount,
          narration: `Paid from ${paymentAcc.nameEn} (${dto.paymentMode})`,
        },
      ],
    });

    return entry;
  }

  async createContraVoucher(tenantId: string, userId: string, dto: CreateContraVoucherDto) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new Error('Contra amount must be greater than zero.');

    const fromAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.fromAccountId, tenantId },
    });
    if (!fromAcc) throw new Error('Source (From) Account not found.');

    const toAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.toAccountId, tenantId },
    });
    if (!toAcc) throw new Error('Destination (To) Account not found.');

    if (fromAcc.id === toAcc.id) {
      throw new Error('From and To accounts cannot be identical in a Contra transfer.');
    }

    const entry = await this.createJournalEntry(tenantId, userId, {
      financialYearId: dto.financialYearId,
      entryDate: dto.date,
      entryType: JournalEntryType.CONTRA,
      narration: dto.narration || `Contra Transfer: ${dto.transferType} from ${fromAcc.nameEn} to ${toAcc.nameEn}`,
      voucherNumber: dto.voucherNumber,
      referenceType: 'contra_voucher',
      referenceId: dto.referenceNo,
      lines: [
        {
          accountId: toAcc.id,
          debitAmount: amount,
          creditAmount: 0,
          narration: `Transfer In: Received into ${toAcc.nameEn}`,
        },
        {
          accountId: fromAcc.id,
          debitAmount: 0,
          creditAmount: amount,
          narration: `Transfer Out: Disbursed from ${fromAcc.nameEn}`,
        },
      ],
    });

    return entry;
  }

  async createAdjustmentVoucher(tenantId: string, userId: string, dto: CreateAdjustmentVoucherDto) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new Error('Adjustment amount must be greater than zero.');

    const debitAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.debitAccountId, tenantId },
    });
    if (!debitAcc) throw new Error('Debit Account not found.');

    const creditAcc = await prisma.chartOfAccount.findFirst({
      where: { id: dto.creditAccountId, tenantId },
    });
    if (!creditAcc) throw new Error('Credit Account not found.');

    const entry = await this.createJournalEntry(tenantId, userId, {
      financialYearId: dto.financialYearId,
      entryDate: dto.date,
      entryType: JournalEntryType.ADJUSTMENT,
      narration: dto.narration || `Adjustment: ${debitAcc.nameEn} / ${creditAcc.nameEn}`,
      voucherNumber: dto.voucherNumber,
      referenceType: 'adjustment_voucher',
      referenceId: dto.referenceNo,
      lines: [
        {
          accountId: debitAcc.id,
          debitAmount: amount,
          creditAmount: 0,
          narration: `Debit adjustment: ${debitAcc.nameEn}`,
        },
        {
          accountId: creditAcc.id,
          debitAmount: 0,
          creditAmount: amount,
          narration: `Credit adjustment: ${creditAcc.nameEn}`,
        },
      ],
    });

    return entry;
  }

  // -------------------------------------------------------------
  // 3. GENERAL JOURNAL ENTRIES & DOUBLE-ENTRY ENGINE
  // -------------------------------------------------------------

  async createJournalEntry(tenantId: string, userId: string, dto: CreateJournalEntryDto) {
    if (!dto.lines || dto.lines.length < 2) {
      throw new Error('A journal entry must have at least two lines (one debit and one credit).');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of dto.lines) {
      const debit = Number(line.debitAmount) || 0;
      const credit = Number(line.creditAmount) || 0;

      if (debit < 0 || credit < 0) {
        throw new Error('Debit and Credit amounts cannot be negative.');
      }
      if (debit > 0 && credit > 0) {
        throw new Error('A single line cannot have both Debit and Credit amounts.');
      }
      if (debit === 0 && credit === 0) {
        throw new Error('A line must have either a Debit or a Credit amount greater than 0.');
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    if (totalDebit !== totalCredit) {
      throw new Error(
        `Journal entry is out of balance! Total Debits (₹${totalDebit}) does not equal Total Credits (₹${totalCredit}).`
      );
    }

    if (totalDebit <= 0) {
      throw new Error('Total transaction amount must be greater than zero.');
    }

    // Generate collision-proof sequential entry number
    const count = await prisma.journalEntry.count({
      where: { tenantId, financialYearId: dto.financialYearId },
    });
    let seq = count + 1;
    const year = new Date(dto.entryDate).getFullYear();
    const prefix =
      dto.entryType === JournalEntryType.RECEIPT
        ? 'REC'
        : dto.entryType === JournalEntryType.PAYMENT
        ? 'PAY'
        : dto.entryType === JournalEntryType.CONTRA
        ? 'CTR'
        : dto.entryType === JournalEntryType.ADJUSTMENT
        ? 'ADJ'
        : 'JV';

    let entryNumber = `${prefix}-${year}-${String(seq).padStart(5, '0')}`;
    while (
      await prisma.journalEntry.findFirst({
        where: { tenantId, financialYearId: dto.financialYearId, entryNumber },
      })
    ) {
      seq++;
      entryNumber = `${prefix}-${year}-${String(seq).padStart(5, '0')}`;
    }

    const entryDate = new Date(dto.entryDate);

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          tenantId,
          entryNumber,
          financialYearId: dto.financialYearId,
          entryDate,
          entryType: dto.entryType,
          narration: dto.narration || null,
          totalAmount: totalDebit,
          referenceType: dto.referenceType || 'manual',
          referenceId: dto.referenceId || null,
          voucherNumber: dto.voucherNumber || null,
          status: 'ACTIVE',
          createdById: userId,
          lines: {
            create: dto.lines.map((l) => ({
              accountId: l.accountId,
              debitAmount: Number(l.debitAmount) || 0,
              creditAmount: Number(l.creditAmount) || 0,
              narration: l.narration || null,
            })),
          },
        },
        include: {
          lines: {
            include: { account: true },
          },
        },
      });

      // Update current balances atomically
      for (const line of dto.lines) {
        const debit = Number(line.debitAmount) || 0;
        const credit = Number(line.creditAmount) || 0;

        const acc = await tx.chartOfAccount.findFirst({ where: { id: line.accountId, tenantId } });
        if (!acc) throw new Error(`Account ID ${line.accountId} not found in this tenant.`);

        let newBalance = acc.currentBalance;
        if (acc.accountNature === 'DEBIT') {
          newBalance = newBalance + debit - credit;
        } else {
          newBalance = newBalance + credit - debit;
        }

        await tx.chartOfAccount.update({
          where: { id: acc.id },
          data: { currentBalance: Math.round(newBalance * 100) / 100 },
        });
      }

      return entry;
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_JOURNAL_ENTRY',
      entityType: 'JOURNAL_ENTRY',
      entityId: result.id,
      newValues: { entryNumber, totalAmount: totalDebit, type: dto.entryType },
    });

    return result;
  }

  async getJournalEntries(
    tenantId: string,
    query: {
      financialYearId?: string;
      entryType?: string;
      status?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ...(query.financialYearId ? { financialYearId: query.financialYearId } : {}),
      ...(query.entryType ? { entryType: query.entryType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.fromDate || query.toDate
        ? {
            entryDate: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(`${query.toDate}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
      ...(query.search
        ? {
            OR: [
              { entryNumber: { contains: query.search } },
              { voucherNumber: { contains: query.search } },
              { narration: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.journalEntry.count({ where }),
      prisma.journalEntry.findMany({
        where,
        include: {
          lines: { include: { account: true } },
          createdBy: { select: { id: true, email: true, phone: true } },
        },
        orderBy: { entryDate: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getJournalEntryById(tenantId: string, id: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: {
        lines: { include: { account: { include: { accountGroup: true } } } },
        createdBy: { select: { id: true, email: true, phone: true } },
        approvedBy: { select: { id: true, email: true, phone: true } },
      },
    });
    if (!entry) throw new Error('JOURNAL_ENTRY_NOT_FOUND');

    const documents = await prisma.document.findMany({
      where: { tenantId, entityType: 'JOURNAL_ENTRY', entityId: id, isActive: true },
    });

    return { ...entry, documents };
  }

  async reverseJournalEntry(tenantId: string, userId: string, entryId: string, reason: string) {
    const original = await prisma.journalEntry.findFirst({
      where: { id: entryId, tenantId },
      include: { lines: true },
    });

    if (!original) throw new Error('JOURNAL_ENTRY_NOT_FOUND');
    if (original.status !== 'ACTIVE') throw new Error('Can only reverse active journal entries.');

    const reversalLines = original.lines.map((line) => ({
      accountId: line.accountId,
      debitAmount: line.creditAmount,
      creditAmount: line.debitAmount,
      narration: `Reversal of ${original.entryNumber}: ${line.narration || ''}`.trim(),
    }));

    const reversalEntry = await this.createJournalEntry(tenantId, userId, {
      financialYearId: original.financialYearId,
      entryDate: new Date().toISOString().split('T')[0],
      entryType: JournalEntryType.REVERSAL,
      narration: `Reversal of ${original.entryNumber}. Reason: ${reason}`,
      referenceType: 'reversal',
      referenceId: original.id,
      lines: reversalLines,
    });

    await prisma.journalEntry.update({
      where: { id: original.id },
      data: {
        status: 'REVERSED',
        reversedById: reversalEntry.id,
        cancellationReason: reason,
      },
    });

    await prisma.journalEntry.update({
      where: { id: reversalEntry.id },
      data: {
        reversalOf: original.id,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'REVERSE_JOURNAL_ENTRY',
      entityType: 'JOURNAL_ENTRY',
      entityId: original.id,
      newValues: { reversalEntryId: reversalEntry.id, reason },
    });

    return reversalEntry;
  }

  async cancelJournalEntry(tenantId: string, userId: string, entryId: string, reason: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, tenantId },
      include: { lines: true },
    });

    if (!entry) throw new Error('JOURNAL_ENTRY_NOT_FOUND');
    if (entry.status !== 'ACTIVE') throw new Error('Only active journal entries can be cancelled.');

    // If active, reversing balances is mandatory to prevent corrupted ledgers
    await this.reverseJournalEntry(tenantId, userId, entryId, `Cancellation: ${reason}`);

    await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CANCEL_JOURNAL_ENTRY',
      entityType: 'JOURNAL_ENTRY',
      entityId: entryId,
      newValues: { status: 'CANCELLED', reason },
    });

    return { success: true, message: 'Journal entry cancelled and reversed.' };
  }

  async attachDocument(tenantId: string, userId: string, entryId: string, data: { fileName: string; fileType?: string; fileSize?: number; storagePath: string }) {
    const entry = await prisma.journalEntry.findFirst({ where: { id: entryId, tenantId } });
    if (!entry) throw new Error('JOURNAL_ENTRY_NOT_FOUND');

    const doc = await prisma.document.create({
      data: {
        tenantId,
        entityType: 'JOURNAL_ENTRY',
        entityId: entryId,
        fileName: data.fileName,
        fileType: data.fileType || null,
        fileSize: data.fileSize || null,
        storagePath: data.storagePath,
        uploadedBy: userId,
        isActive: true,
      },
    });

    return doc;
  }

  // -------------------------------------------------------------
  // 4. BOOKS OF ACCOUNTS (Ledger, Cash Book, Bank Book)
  // -------------------------------------------------------------

  async getLedger(tenantId: string, accountId: string, fromDateStr: string, toDateStr: string) {
    const account = await prisma.chartOfAccount.findFirst({
      where: { id: accountId, tenantId },
      include: { accountGroup: true },
    });
    if (!account) throw new Error('ACCOUNT_NOT_FOUND');

    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    toDate.setHours(23, 59, 59, 999);

    const priorLines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: {
          tenantId,
          status: 'ACTIVE',
          entryDate: { lt: fromDate },
        },
      },
    });

    let priorDebit = 0;
    let priorCredit = 0;
    for (const pl of priorLines) {
      priorDebit += pl.debitAmount;
      priorCredit += pl.creditAmount;
    }

    let calculatedOpeningBalance = account.openingBalance;
    if (account.accountNature === 'DEBIT') {
      calculatedOpeningBalance += priorDebit - priorCredit;
    } else {
      calculatedOpeningBalance += priorCredit - priorDebit;
    }

    const lines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: {
          tenantId,
          status: 'ACTIVE',
          entryDate: { gte: fromDate, lte: toDate },
        },
      },
      include: {
        journalEntry: {
          include: {
            lines: {
              include: { account: true },
            },
          },
        },
      },
      orderBy: { journalEntry: { entryDate: 'asc' } },
    });

    let runningBalance = calculatedOpeningBalance;
    let periodDebit = 0;
    let periodCredit = 0;

    const entries = lines.map((l) => {
      periodDebit += l.debitAmount;
      periodCredit += l.creditAmount;

      if (account.accountNature === 'DEBIT') {
        runningBalance = runningBalance + l.debitAmount - l.creditAmount;
      } else {
        runningBalance = runningBalance + l.creditAmount - l.debitAmount;
      }

      const oppositeLine = l.journalEntry.lines.find((ol) => ol.id !== l.id);

      return {
        date: l.journalEntry.entryDate.toISOString().split('T')[0],
        entryNumber: l.journalEntry.entryNumber,
        voucherNumber: l.journalEntry.voucherNumber || undefined,
        oppositeAccountEn: oppositeLine?.account.nameEn || 'Various Accounts',
        oppositeAccountGu: oppositeLine?.account.nameGu || 'વિવિધ ખાતાં',
        narration: l.narration || l.journalEntry.narration || '',
        debitAmount: l.debitAmount,
        creditAmount: l.creditAmount,
        runningBalance: Math.round(runningBalance * 100) / 100,
        runningBalanceNature:
          runningBalance >= 0 ? account.accountNature : account.accountNature === 'DEBIT' ? 'CREDIT' : 'DEBIT',
      };
    });

    return {
      accountId: account.id,
      accountCode: account.code,
      accountNameEn: account.nameEn,
      accountNameGu: account.nameGu,
      accountType: account.accountType,
      openingBalance: Math.round(calculatedOpeningBalance * 100) / 100,
      openingBalanceNature: account.accountNature,
      fromDate: fromDateStr,
      toDate: toDateStr,
      entries,
      totalDebit: Math.round(periodDebit * 100) / 100,
      totalCredit: Math.round(periodCredit * 100) / 100,
      closingBalance: Math.round(runningBalance * 100) / 100,
      closingBalanceNature:
        runningBalance >= 0 ? account.accountNature : account.accountNature === 'DEBIT' ? 'CREDIT' : 'DEBIT',
    };
  }

  async getCashBook(tenantId: string, financialYearId: string, fromDateStr: string, toDateStr: string): Promise<CashBookStatementDto> {
    const cashAccounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, financialYearId, isCashAccount: true, isActive: true },
    });
    const cashAccountIds = cashAccounts.map((a) => a.id);

    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    toDate.setHours(23, 59, 59, 999);

    let baseOpening = 0;
    for (const ca of cashAccounts) {
      baseOpening += ca.openingBalance;
    }

    const priorLines = await prisma.journalLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: {
          tenantId,
          status: 'ACTIVE',
          entryDate: { lt: fromDate },
        },
      },
    });

    let priorInflow = 0;
    let priorOutflow = 0;
    for (const pl of priorLines) {
      priorInflow += pl.debitAmount;
      priorOutflow += pl.creditAmount;
    }

    const calculatedOpeningBalance = Math.round((baseOpening + priorInflow - priorOutflow) * 100) / 100;

    const periodLines = await prisma.journalLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        journalEntry: {
          tenantId,
          status: 'ACTIVE',
          entryDate: { gte: fromDate, lte: toDate },
        },
      },
      include: {
        journalEntry: {
          include: {
            lines: { include: { account: true } },
          },
        },
      },
      orderBy: { journalEntry: { entryDate: 'asc' } },
    });

    let runningBal = calculatedOpeningBalance;
    let totalReceipts = 0;
    let totalPayments = 0;

    const items = periodLines.map((line) => {
      const receipt = line.debitAmount;
      const payment = line.creditAmount;
      totalReceipts += receipt;
      totalPayments += payment;
      runningBal = runningBal + receipt - payment;

      const oppositeLine = line.journalEntry.lines.find((ol) => ol.id !== line.id);

      return {
        date: line.journalEntry.entryDate.toISOString().split('T')[0],
        entryNumber: line.journalEntry.entryNumber,
        voucherNumber: line.journalEntry.voucherNumber || undefined,
        accountNameEn: oppositeLine?.account.nameEn || 'Various Accounts',
        accountNameGu: oppositeLine?.account.nameGu || 'વિવિધ ખાતાં',
        narration: line.narration || line.journalEntry.narration || '',
        receiptAmount: receipt,
        paymentAmount: payment,
        runningBalance: Math.round(runningBal * 100) / 100,
      };
    });

    return {
      financialYearId,
      fromDate: fromDateStr,
      toDate: toDateStr,
      openingBalance: calculatedOpeningBalance,
      items,
      totalReceipts: Math.round(totalReceipts * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      closingBalance: Math.round(runningBal * 100) / 100,
    };
  }

  async getBankBook(tenantId: string, financialYearId: string, fromDateStr: string, toDateStr: string, bankAccountId?: string): Promise<BankBookStatementDto> {
    const bankAccounts = await prisma.chartOfAccount.findMany({
      where: {
        tenantId,
        financialYearId,
        isBankAccount: true,
        isActive: true,
        ...(bankAccountId ? { id: bankAccountId } : {}),
      },
      include: { bankAccounts: true },
    });

    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);
    toDate.setHours(23, 59, 59, 999);

    let totalOpening = 0;
    let grandTotalDeposits = 0;
    let grandTotalWithdrawals = 0;

    const accountsData = await Promise.all(
      bankAccounts.map(async (acc) => {
        const priorLines = await prisma.journalLine.findMany({
          where: {
            accountId: acc.id,
            journalEntry: {
              tenantId,
              status: 'ACTIVE',
              entryDate: { lt: fromDate },
            },
          },
        });

        let priorInflow = 0;
        let priorOutflow = 0;
        for (const pl of priorLines) {
          priorInflow += pl.debitAmount;
          priorOutflow += pl.creditAmount;
        }

        const openingBal = Math.round((acc.openingBalance + priorInflow - priorOutflow) * 100) / 100;
        totalOpening += openingBal;

        const periodLines = await prisma.journalLine.findMany({
          where: {
            accountId: acc.id,
            journalEntry: {
              tenantId,
              status: 'ACTIVE',
              entryDate: { gte: fromDate, lte: toDate },
            },
          },
          include: {
            journalEntry: {
              include: {
                lines: { include: { account: true } },
              },
            },
          },
          orderBy: { journalEntry: { entryDate: 'asc' } },
        });

        let running = openingBal;
        let deposits = 0;
        let withdrawals = 0;

        const items = periodLines.map((line) => {
          const dep = line.debitAmount;
          const wtd = line.creditAmount;
          deposits += dep;
          withdrawals += wtd;
          running = running + dep - wtd;

          const oppositeLine = line.journalEntry.lines.find((ol) => ol.id !== line.id);

          return {
            date: line.journalEntry.entryDate.toISOString().split('T')[0],
            entryNumber: line.journalEntry.entryNumber,
            voucherNumber: line.journalEntry.voucherNumber || undefined,
            accountNameEn: oppositeLine?.account.nameEn || 'Various Accounts',
            accountNameGu: oppositeLine?.account.nameGu || 'વિવિધ ખાતાં',
            narration: line.narration || line.journalEntry.narration || '',
            depositAmount: dep,
            withdrawalAmount: wtd,
            runningBalance: Math.round(running * 100) / 100,
          };
        });

        grandTotalDeposits += deposits;
        grandTotalWithdrawals += withdrawals;

        return {
          accountId: acc.id,
          accountCode: acc.code,
          bankName: acc.bankAccounts[0]?.bankName || acc.nameEn,
          accountNumber: acc.bankAccounts[0]?.accountNumber || 'N/A',
          openingBalance: openingBal,
          items,
          totalDeposits: Math.round(deposits * 100) / 100,
          totalWithdrawals: Math.round(withdrawals * 100) / 100,
          closingBalance: Math.round(running * 100) / 100,
        };
      })
    );

    return {
      financialYearId,
      fromDate: fromDateStr,
      toDate: toDateStr,
      totalOpeningBalance: Math.round(totalOpening * 100) / 100,
      accounts: accountsData,
      grandTotalDeposits: Math.round(grandTotalDeposits * 100) / 100,
      grandTotalWithdrawals: Math.round(grandTotalWithdrawals * 100) / 100,
      totalClosingBalance: Math.round((totalOpening + grandTotalDeposits - grandTotalWithdrawals) * 100) / 100,
    };
  }

  // -------------------------------------------------------------
  // 5. FINANCIAL REPORTS (Trial Balance, Income/Expense, Head-Wise, Monthly, Yearly)
  // -------------------------------------------------------------

  async getTrialBalance(tenantId: string, financialYearId: string) {
    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, financialYearId, isActive: true },
      include: { accountGroup: true },
      orderBy: [{ accountType: 'asc' }, { code: 'asc' }],
    });

    let totalDebit = 0;
    let totalCredit = 0;

    const rows = accounts.map((acc) => {
      const isDebit = acc.accountNature === 'DEBIT';
      const bal = acc.currentBalance;
      const debitBal = isDebit ? (bal >= 0 ? bal : 0) : bal < 0 ? Math.abs(bal) : 0;
      const creditBal = !isDebit ? (bal >= 0 ? bal : 0) : bal < 0 ? Math.abs(bal) : 0;

      totalDebit += debitBal;
      totalCredit += creditBal;

      return {
        id: acc.id,
        code: acc.code,
        nameEn: acc.nameEn,
        nameGu: acc.nameGu,
        groupNameEn: acc.accountGroup.nameEn,
        groupNameGu: acc.accountGroup.nameGu,
        accountType: acc.accountType,
        debitAmount: Math.round(debitBal * 100) / 100,
        creditAmount: Math.round(creditBal * 100) / 100,
      };
    });

    return {
      financialYearId,
      rows,
      totalDebit: Math.round(totalDebit * 100) / 100,
      totalCredit: Math.round(totalCredit * 100) / 100,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }

  async getIncomeExpenseReport(tenantId: string, financialYearId: string, fromDateStr?: string, toDateStr?: string): Promise<IncomeExpenseStatementDto> {
    const fy = await prisma.financialYear.findFirst({ where: { id: financialYearId, tenantId } });
    if (!fy) throw new Error('FINANCIAL_YEAR_NOT_FOUND');

    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        tenantId,
        financialYearId,
        accountType: { in: ['INCOME', 'EXPENSE'] },
        isActive: true,
      },
      include: { accountGroup: true },
      orderBy: { code: 'asc' },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    const incomes: any[] = [];
    const expenses: any[] = [];

    for (const acc of accounts) {
      const amt = Math.abs(acc.currentBalance);
      const item = {
        accountId: acc.id,
        code: acc.code,
        nameEn: acc.nameEn,
        nameGu: acc.nameGu,
        groupNameEn: acc.accountGroup.nameEn,
        groupNameGu: acc.accountGroup.nameGu,
        amount: amt,
      };

      if (acc.accountType === 'INCOME') {
        totalIncome += amt;
        incomes.push(item);
      } else {
        totalExpense += amt;
        expenses.push(item);
      }
    }

    const netSurplusOrDeficit = Math.round((totalIncome - totalExpense) * 100) / 100;

    return {
      financialYearId,
      financialYearName: fy.name,
      fromDate: fromDateStr || fy.startDate.toISOString().split('T')[0],
      toDate: toDateStr || fy.endDate.toISOString().split('T')[0],
      incomes,
      totalIncome: Math.round(totalIncome * 100) / 100,
      expenses,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netSurplusOrDeficit,
      isSurplus: netSurplusOrDeficit >= 0,
    };
  }

  async getHeadWiseReport(tenantId: string, financialYearId: string, accountType: AccountGroupType): Promise<HeadWiseReportDto> {
    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, financialYearId, accountType, isActive: true },
      include: {
        accountGroup: true,
        journalLines: {
          where: { journalEntry: { status: 'ACTIVE', financialYearId } },
          include: { journalEntry: true },
        },
      },
      orderBy: { code: 'asc' },
    });

    const heads = accounts.map((acc) => {
      const monthMap = new Map<string, number>();

      for (const line of acc.journalLines) {
        const monthKey = line.journalEntry.entryDate.toISOString().slice(0, 7); // YYYY-MM
        const amt =
          acc.accountNature === 'DEBIT'
            ? line.debitAmount - line.creditAmount
            : line.creditAmount - line.debitAmount;
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + amt);
      }

      const totalAmount = Math.abs(acc.currentBalance);

      const monthBreakdown = Array.from(monthMap.entries()).map(([month, amount]) => ({
        month,
        amount: Math.round(Math.abs(amount) * 100) / 100,
      }));

      return {
        accountId: acc.id,
        code: acc.code,
        nameEn: acc.nameEn,
        nameGu: acc.nameGu,
        groupNameEn: acc.accountGroup.nameEn,
        groupNameGu: acc.accountGroup.nameGu,
        totalAmount: Math.round(totalAmount * 100) / 100,
        monthBreakdown,
      };
    });

    const grandTotal = Math.round(heads.reduce((sum, h) => sum + h.totalAmount, 0) * 100) / 100;

    return {
      financialYearId,
      accountType,
      heads,
      grandTotal,
    };
  }

  async getMonthlySummaryReport(tenantId: string, financialYearId: string): Promise<MonthlyFinancialSummaryDto> {
    const entries = await prisma.journalEntry.findMany({
      where: { tenantId, financialYearId, status: 'ACTIVE' },
      include: { lines: { include: { account: true } } },
      orderBy: { entryDate: 'asc' },
    });

    const monthBuckets = new Map<string, { totalIncome: number; totalExpense: number; cashInflow: number; cashOutflow: number }>();

    for (const entry of entries) {
      const monthKey = entry.entryDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthBuckets.has(monthKey)) {
        monthBuckets.set(monthKey, { totalIncome: 0, totalExpense: 0, cashInflow: 0, cashOutflow: 0 });
      }
      const b = monthBuckets.get(monthKey)!;

      for (const line of entry.lines) {
        if (line.account.accountType === 'INCOME') {
          b.totalIncome += line.creditAmount - line.debitAmount;
        } else if (line.account.accountType === 'EXPENSE') {
          b.totalExpense += line.debitAmount - line.creditAmount;
        }

        if (line.account.isCashAccount || line.account.isBankAccount) {
          b.cashInflow += line.debitAmount;
          b.cashOutflow += line.creditAmount;
        }
      }
    }

    let totalAnnualIncome = 0;
    let totalAnnualExpense = 0;

    const months = Array.from(monthBuckets.entries()).map(([monthKey, data]) => {
      const inc = Math.round(data.totalIncome * 100) / 100;
      const exp = Math.round(data.totalExpense * 100) / 100;
      totalAnnualIncome += inc;
      totalAnnualExpense += exp;

      return {
        monthName: monthKey,
        totalIncome: inc,
        totalExpense: exp,
        netSurplus: Math.round((inc - exp) * 100) / 100,
        cashInflow: Math.round(data.cashInflow * 100) / 100,
        cashOutflow: Math.round(data.cashOutflow * 100) / 100,
      };
    });

    return {
      financialYearId,
      months,
      totalAnnualIncome: Math.round(totalAnnualIncome * 100) / 100,
      totalAnnualExpense: Math.round(totalAnnualExpense * 100) / 100,
      annualSurplus: Math.round((totalAnnualIncome - totalAnnualExpense) * 100) / 100,
    };
  }

  async getYearlySummaryReport(tenantId: string): Promise<YearlyFinancialSummaryDto[]> {
    const financialYears = await prisma.financialYear.findMany({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'asc' },
    });

    const summaries = await Promise.all(
      financialYears.map(async (fy) => {
        const incExp = await this.getIncomeExpenseReport(tenantId, fy.id);
        const tb = await this.getTrialBalance(tenantId, fy.id);

        return {
          financialYearId: fy.id,
          financialYearName: fy.name,
          startDate: fy.startDate.toISOString().split('T')[0],
          endDate: fy.endDate.toISOString().split('T')[0],
          isClosed: fy.isClosed,
          totalIncome: incExp.totalIncome,
          totalExpense: incExp.totalExpense,
          netSurplus: incExp.netSurplusOrDeficit,
          totalAssetsAndLiabilities: tb.totalDebit,
        };
      })
    );

    return summaries;
  }

  // -------------------------------------------------------------
  // 6. FINANCIAL YEAR LIFECYCLE & YEAR-END ROLLOVER
  // -------------------------------------------------------------

  async getFinancialYears(tenantId: string) {
    return prisma.financialYear.findMany({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async createFinancialYear(
    tenantId: string,
    userId: string,
    data: { name: string; startDate: string; endDate: string; isCurrent?: boolean }
  ) {
    const existing = await prisma.financialYear.findFirst({
      where: { tenantId, name: data.name },
    });
    if (existing) throw new Error(`Financial Year "${data.name}" already exists.`);

    if (data.isCurrent) {
      await prisma.financialYear.updateMany({
        where: { tenantId, isCurrent: true },
        data: { isCurrent: false },
      });
    }

    const fy = await prisma.financialYear.create({
      data: {
        tenantId,
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isCurrent: Boolean(data.isCurrent),
        isClosed: false,
        isActive: true,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_FINANCIAL_YEAR',
      entityType: 'FINANCIAL_YEAR',
      entityId: fy.id,
      newValues: { name: data.name, isCurrent: data.isCurrent },
    });

    return fy;
  }

  async closeFinancialYear(tenantId: string, userId: string, dto: CloseFinancialYearDto) {
    const closingFy = await prisma.financialYear.findFirst({
      where: { id: dto.closingFinancialYearId, tenantId },
    });
    if (!closingFy) throw new Error('CLOSING_FINANCIAL_YEAR_NOT_FOUND');
    if (closingFy.isClosed) throw new Error('Financial year is already closed.');

    const nextFy = await prisma.financialYear.findFirst({
      where: { id: dto.nextFinancialYearId, tenantId },
    });
    if (!nextFy) throw new Error('NEXT_FINANCIAL_YEAR_NOT_FOUND');

    // 1. Verify Trial Balance parity before closing
    const tb = await this.getTrialBalance(tenantId, closingFy.id);
    if (!tb.isBalanced) {
      throw new Error(
        `Cannot close financial year! Trial Balance is out of balance (Debits: ₹${tb.totalDebit}, Credits: ₹${tb.totalCredit}).`
      );
    }

    // 2. Compute Net Surplus / Deficit
    const incExp = await this.getIncomeExpenseReport(tenantId, closingFy.id);
    const netSurplus = incExp.netSurplusOrDeficit;

    // 3. Roll over Balance Sheet Accounts (Asset, Liability, Equity) to Next Financial Year
    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, financialYearId: closingFy.id, isActive: true },
      include: { bankAccounts: true },
    });

    await prisma.$transaction(async (tx) => {
      for (const acc of accounts) {
        if (acc.accountType === 'ASSET' || acc.accountType === 'LIABILITY' || acc.accountType === 'EQUITY') {
          const closingBalance = acc.currentBalance;

          const nextAcc = await tx.chartOfAccount.findFirst({
            where: { tenantId, financialYearId: nextFy.id, code: acc.code },
          });

          if (nextAcc) {
            await tx.chartOfAccount.update({
              where: { id: nextAcc.id },
              data: {
                openingBalance: closingBalance,
                currentBalance: closingBalance,
              },
            });
          } else {
            const createdAcc = await tx.chartOfAccount.create({
              data: {
                tenantId,
                accountGroupId: acc.accountGroupId,
                code: acc.code,
                nameEn: acc.nameEn,
                nameGu: acc.nameGu,
                accountType: acc.accountType,
                accountNature: acc.accountNature,
                openingBalance: closingBalance,
                currentBalance: closingBalance,
                financialYearId: nextFy.id,
                isBankAccount: acc.isBankAccount,
                isCashAccount: acc.isCashAccount,
                isSystem: acc.isSystem,
                isActive: true,
              },
            });

            if (acc.isBankAccount && acc.bankAccounts.length > 0) {
              const ba = acc.bankAccounts[0];
              await tx.bankAccount.create({
                data: {
                  tenantId,
                  accountId: createdAcc.id,
                  bankName: ba.bankName,
                  branchName: ba.branchName,
                  accountNumber: ba.accountNumber,
                  ifscCode: ba.ifscCode,
                  accountType: ba.accountType,
                  isActive: true,
                },
              });
            }
          }
        } else {
          // Nominal accounts (Income, Expense) start at 0 in next FY
          const nextAcc = await tx.chartOfAccount.findFirst({
            where: { tenantId, financialYearId: nextFy.id, code: acc.code },
          });

          if (!nextAcc) {
            await tx.chartOfAccount.create({
              data: {
                tenantId,
                accountGroupId: acc.accountGroupId,
                code: acc.code,
                nameEn: acc.nameEn,
                nameGu: acc.nameGu,
                accountType: acc.accountType,
                accountNature: acc.accountNature,
                openingBalance: 0,
                currentBalance: 0,
                financialYearId: nextFy.id,
                isBankAccount: false,
                isCashAccount: false,
                isSystem: acc.isSystem,
                isActive: true,
              },
            });
          }
        }
      }

      // 4. If retained earnings account provided, add net surplus to it in next FY
      if (dto.retainedEarningsAccountId) {
        const retAcc = await tx.chartOfAccount.findFirst({
          where: { id: dto.retainedEarningsAccountId, tenantId },
        });
        if (retAcc) {
          const nextRetAcc = await tx.chartOfAccount.findFirst({
            where: { tenantId, financialYearId: nextFy.id, code: retAcc.code },
          });
          if (nextRetAcc) {
            const updatedOpening = Math.round((nextRetAcc.openingBalance + netSurplus) * 100) / 100;
            await tx.chartOfAccount.update({
              where: { id: nextRetAcc.id },
              data: { openingBalance: updatedOpening, currentBalance: updatedOpening },
            });
          }
        }
      }

      // 5. Mark closing FY as closed and next FY as current
      await tx.financialYear.update({
        where: { id: closingFy.id },
        data: { isClosed: true, isCurrent: false },
      });

      await tx.financialYear.update({
        where: { id: nextFy.id },
        data: { isCurrent: true },
      });
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CLOSE_FINANCIAL_YEAR',
      entityType: 'FINANCIAL_YEAR',
      entityId: closingFy.id,
      newValues: {
        closingFyName: closingFy.name,
        nextFyName: nextFy.name,
        netSurplus,
        reason: dto.reason || 'Year-end account closure and balance rollover',
      },
    });

    return {
      success: true,
      message: `Financial year ${closingFy.name} closed successfully. Balances rolled over to ${nextFy.name}.`,
      netSurplus,
    };
  }
}

export const accountingService = new AccountingService();

