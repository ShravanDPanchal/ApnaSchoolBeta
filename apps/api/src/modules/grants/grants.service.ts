import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';
import { accountingService } from '../accounting/accounting.service';
import { JournalEntryType } from '@apna-school/shared-types';

export interface CreateGrantDto {
  nameEn: string;
  nameGu?: string;
  grantType?: string;
  source?: string;
  grantHead?: string;
  sanctionedAmount: number;
  financialYearId: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sanctionLetterNo?: string;
  sanctionDate?: string;
  remarks?: string;
}

export interface UpdateGrantDto extends Partial<CreateGrantDto> {
  status?: string;
}

export interface RecordGrantReceiptDto {
  amount: number;
  transactionDate: string;
  description?: string;
  referenceNo?: string;
  cashAccountId?: string;
  financialYearId?: string;
}

export interface RecordGrantUtilizationDto {
  amount: number;
  transactionDate: string;
  description?: string;
  referenceNo?: string;
  cashAccountId?: string;
  financialYearId?: string;
}

export interface RequestOverrideDto {
  reason: string;
  requestedAmount: number;
}

export interface ApproveOverrideDto {
  approved: boolean;
  remarks?: string;
}

export interface GrantFiltersDto {
  financialYearId?: string;
  grantType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class GrantsService {
  private _withComputed<T extends { receivedAmount: number; utilizedAmount: number; sanctionedAmount: number }>(g: T) {
    return {
      ...g,
      remainingAmount: Math.round((g.receivedAmount - g.utilizedAmount) * 100) / 100,
      pendingAmount: Math.round((g.sanctionedAmount - g.receivedAmount) * 100) / 100,
    };
  }

  async createGrant(tenantId: string, userId: string, dto: CreateGrantDto) {
    if (!dto.nameEn?.trim()) throw new Error('Grant name (English) is required.');
    if (!dto.sanctionedAmount || Number(dto.sanctionedAmount) <= 0) throw new Error('Sanctioned amount must be greater than zero.');
    if (!dto.financialYearId) throw new Error('Financial year is required.');

    const fy = await prisma.financialYear.findFirst({ where: { id: dto.financialYearId, tenantId } });
    if (!fy) throw new Error('FINANCIAL_YEAR_NOT_FOUND');

    if (dto.accountId) {
      const acc = await prisma.chartOfAccount.findFirst({ where: { id: dto.accountId, tenantId } });
      if (!acc) throw new Error('LINKED_ACCOUNT_NOT_FOUND');
    }

    const grant = await prisma.grant.create({
      data: {
        tenantId,
        nameEn: dto.nameEn.trim(),
        nameGu: dto.nameGu?.trim() || dto.nameEn.trim(),
        grantType: dto.grantType || null,
        source: dto.source || null,
        grantHead: dto.grantHead || null,
        sanctionedAmount: Number(dto.sanctionedAmount),
        receivedAmount: 0,
        utilizedAmount: 0,
        financialYearId: dto.financialYearId,
        accountId: dto.accountId || null,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        sanctionLetterNo: dto.sanctionLetterNo || null,
        sanctionDate: dto.sanctionDate ? new Date(dto.sanctionDate) : null,
        remarks: dto.remarks || null,
        status: 'ACTIVE',
        isActive: true,
        createdById: userId,
      },
      include: { financialYear: true, account: true },
    });

    await logAudit({ tenantId, userId, action: 'CREATE_GRANT', entityType: 'GRANT', entityId: grant.id, newValues: { nameEn: grant.nameEn, sanctionedAmount: grant.sanctionedAmount } });
    return this._withComputed(grant);
  }

  async updateGrant(tenantId: string, userId: string, grantId: string, dto: UpdateGrantDto) {
    const existing = await prisma.grant.findFirst({ where: { id: grantId, tenantId } });
    if (!existing) throw new Error('GRANT_NOT_FOUND');

    if (dto.sanctionedAmount !== undefined && Number(dto.sanctionedAmount) < existing.utilizedAmount) {
      throw new Error(`Cannot reduce sanctioned amount below already utilized amount (Rs.${existing.utilizedAmount}).`);
    }

    const updated = await prisma.grant.update({
      where: { id: grantId },
      data: {
        nameEn: dto.nameEn?.trim() ?? existing.nameEn,
        nameGu: dto.nameGu?.trim() ?? existing.nameGu,
        grantType: dto.grantType !== undefined ? dto.grantType : existing.grantType,
        source: dto.source !== undefined ? dto.source : existing.source,
        grantHead: dto.grantHead !== undefined ? dto.grantHead : existing.grantHead,
        sanctionedAmount: dto.sanctionedAmount !== undefined ? Number(dto.sanctionedAmount) : existing.sanctionedAmount,
        financialYearId: dto.financialYearId ?? existing.financialYearId,
        accountId: dto.accountId !== undefined ? dto.accountId : existing.accountId,
        startDate: dto.startDate ? new Date(dto.startDate) : existing.startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : existing.endDate,
        sanctionLetterNo: dto.sanctionLetterNo !== undefined ? dto.sanctionLetterNo : existing.sanctionLetterNo,
        sanctionDate: dto.sanctionDate ? new Date(dto.sanctionDate) : existing.sanctionDate,
        remarks: dto.remarks !== undefined ? dto.remarks : existing.remarks,
        status: dto.status ?? existing.status,
      },
      include: { financialYear: true, account: true },
    });

    await logAudit({ tenantId, userId, action: 'UPDATE_GRANT', entityType: 'GRANT', entityId: grantId, newValues: dto as Record<string, unknown> });
    return this._withComputed(updated);
  }

  async getGrants(tenantId: string, filters: GrantFiltersDto = {}) {
    const { financialYearId, grantType, status, fromDate, toDate, search, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: true,
      ...(financialYearId ? { financialYearId } : {}),
      ...(grantType ? { grantType } : {}),
      ...(status ? { status } : {}),
      ...(fromDate || toDate ? { createdAt: { ...(fromDate ? { gte: new Date(fromDate) } : {}), ...(toDate ? { lte: new Date(`${toDate}T23:59:59`) } : {}) } } : {}),
      ...(search ? { OR: [{ nameEn: { contains: search } }, { nameGu: { contains: search } }, { source: { contains: search } }, { grantHead: { contains: search } }] } : {}),
    };

    const [grants, total] = await Promise.all([
      prisma.grant.findMany({ where, include: { financialYear: true, account: true }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.grant.count({ where }),
    ]);

    return { data: grants.map((g) => this._withComputed(g)), total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getGrantById(tenantId: string, grantId: string) {
    const grant = await prisma.grant.findFirst({
      where: { id: grantId, tenantId },
      include: {
        financialYear: true,
        account: true,
        transactions: {
          orderBy: { transactionDate: 'desc' },
          include: { journalEntry: { select: { id: true, entryNumber: true, entryDate: true } } },
        },
      },
    });
    if (!grant) throw new Error('GRANT_NOT_FOUND');
    return this._withComputed(grant);
  }

  async deleteGrant(tenantId: string, userId: string, grantId: string) {
    const grant = await prisma.grant.findFirst({ where: { id: grantId, tenantId } });
    if (!grant) throw new Error('GRANT_NOT_FOUND');
    if (grant.receivedAmount > 0 || grant.utilizedAmount > 0) {
      throw new Error('Cannot delete a grant that has receipt or utilization transactions. Archive it instead.');
    }
    await prisma.grant.update({ where: { id: grantId }, data: { isActive: false, status: 'DELETED' } });
    await logAudit({ tenantId, userId, action: 'DELETE_GRANT', entityType: 'GRANT', entityId: grantId, newValues: { nameEn: grant.nameEn } });
    return { success: true };
  }

  async recordGrantReceipt(tenantId: string, userId: string, grantId: string, dto: RecordGrantReceiptDto) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new Error('Receipt amount must be greater than zero.');

    const grant = await prisma.grant.findFirst({ where: { id: grantId, tenantId, isActive: true } });
    if (!grant) throw new Error('GRANT_NOT_FOUND');
    if (grant.status !== 'ACTIVE') throw new Error('Grant is not ACTIVE.');

    const newReceived = Math.round((grant.receivedAmount + amount) * 100) / 100;
    if (newReceived > grant.sanctionedAmount) {
      throw new Error(`Receipt of Rs.${amount} would exceed sanctioned amount (Rs.${grant.sanctionedAmount}). Already received: Rs.${grant.receivedAmount}.`);
    }

    let journalEntryId: string | null = null;
    if (grant.accountId && dto.cashAccountId && dto.financialYearId) {
      const je = await accountingService.createJournalEntry(tenantId, userId, {
        financialYearId: dto.financialYearId,
        entryDate: dto.transactionDate,
        entryType: JournalEntryType.RECEIPT,
        narration: dto.description || `Grant receipt: ${grant.nameEn}`,
        referenceType: 'grant_receipt',
        referenceId: grantId,
        lines: [
          { accountId: dto.cashAccountId, debitAmount: amount, creditAmount: 0, narration: 'Grant funds received' },
          { accountId: grant.accountId, debitAmount: 0, creditAmount: amount, narration: `Grant income: ${grant.nameEn}` },
        ],
      });
      journalEntryId = je.id;
    }

    const txn = await prisma.$transaction(async (tx) => {
      const t = await tx.grantTransaction.create({
        data: { tenantId, grantId, transactionType: 'RECEIPT', amount, transactionDate: new Date(dto.transactionDate), description: dto.description || null, referenceNo: dto.referenceNo || null, cashAccountId: dto.cashAccountId || null, journalEntryId, createdById: userId },
      });
      await tx.grant.update({ where: { id: grantId }, data: { receivedAmount: newReceived } });
      return t;
    });

    await logAudit({ tenantId, userId, action: 'GRANT_RECEIPT', entityType: 'GRANT', entityId: grantId, newValues: { amount, newReceivedTotal: newReceived } });
    return txn;
  }

  async recordGrantUtilization(tenantId: string, userId: string, grantId: string, dto: RecordGrantUtilizationDto) {
    const amount = Number(dto.amount);
    if (!amount || amount <= 0) throw new Error('Utilization amount must be greater than zero.');

    const grant = await prisma.grant.findFirst({ where: { id: grantId, tenantId, isActive: true } });
    if (!grant) throw new Error('GRANT_NOT_FOUND');
    if (grant.status !== 'ACTIVE') throw new Error('Grant is not ACTIVE.');

    const available = Math.round((grant.receivedAmount - grant.utilizedAmount) * 100) / 100;
    const newUtilized = Math.round((grant.utilizedAmount + amount) * 100) / 100;

    if (amount > available) {
      if (!grant.overrideRequested || !grant.overrideApprovedBy) {
        throw new Error(`UTILIZATION_EXCEEDS_AVAILABLE: Cannot utilize Rs.${amount}. Available: Rs.${available}. Request an override if required.`);
      }
      await logAudit({ tenantId, userId, action: 'GRANT_UTILIZATION_OVERRIDE_USED', entityType: 'GRANT', entityId: grantId, newValues: { amount, available, overrideApprovedBy: grant.overrideApprovedBy } });
    }

    let journalEntryId: string | null = null;
    if (grant.accountId && dto.cashAccountId && dto.financialYearId) {
      const je = await accountingService.createJournalEntry(tenantId, userId, {
        financialYearId: dto.financialYearId,
        entryDate: dto.transactionDate,
        entryType: JournalEntryType.PAYMENT,
        narration: dto.description || `Grant utilization: ${grant.nameEn}`,
        referenceType: 'grant_utilization',
        referenceId: grantId,
        lines: [
          { accountId: grant.accountId, debitAmount: amount, creditAmount: 0, narration: `Grant expense: ${grant.nameEn}` },
          { accountId: dto.cashAccountId, debitAmount: 0, creditAmount: amount, narration: 'Grant funds disbursed' },
        ],
      });
      journalEntryId = je.id;
    }

    const txn = await prisma.$transaction(async (tx) => {
      const t = await tx.grantTransaction.create({
        data: { tenantId, grantId, transactionType: 'UTILIZATION', amount, transactionDate: new Date(dto.transactionDate), description: dto.description || null, referenceNo: dto.referenceNo || null, cashAccountId: dto.cashAccountId || null, journalEntryId, createdById: userId },
      });
      await tx.grant.update({
        where: { id: grantId },
        data: { utilizedAmount: newUtilized, overrideRequested: false, overrideApprovedBy: null, overrideReason: null, overrideApprovedAt: null, overrideRequestedBy: null },
      });
      return t;
    });

    await logAudit({ tenantId, userId, action: 'GRANT_UTILIZATION', entityType: 'GRANT', entityId: grantId, newValues: { amount, newUtilizedTotal: newUtilized } });
    return txn;
  }

  async requestOverride(tenantId: string, userId: string, grantId: string, dto: RequestOverrideDto) {
    const grant = await prisma.grant.findFirst({ where: { id: grantId, tenantId, isActive: true } });
    if (!grant) throw new Error('GRANT_NOT_FOUND');
    if (!dto.reason?.trim()) throw new Error('Override reason is required.');
    if (!dto.requestedAmount || dto.requestedAmount <= 0) throw new Error('Requested amount must be positive.');

    await prisma.grant.update({ where: { id: grantId }, data: { overrideRequested: true, overrideRequestedBy: userId, overrideReason: dto.reason.trim(), overrideApprovedBy: null, overrideApprovedAt: null } });
    await logAudit({ tenantId, userId, action: 'GRANT_OVERRIDE_REQUESTED', entityType: 'GRANT', entityId: grantId, newValues: { reason: dto.reason, requestedAmount: dto.requestedAmount } });
    return { success: true, message: 'Override request submitted. Awaiting approval.' };
  }

  async approveOverride(tenantId: string, userId: string, grantId: string, dto: ApproveOverrideDto) {
    const grant = await prisma.grant.findFirst({ where: { id: grantId, tenantId, isActive: true } });
    if (!grant) throw new Error('GRANT_NOT_FOUND');
    if (!grant.overrideRequested) throw new Error('No pending override request found for this grant.');

    if (dto.approved) {
      await prisma.grant.update({ where: { id: grantId }, data: { overrideApprovedBy: userId, overrideApprovedAt: new Date() } });
      await logAudit({ tenantId, userId, action: 'GRANT_OVERRIDE_APPROVED', entityType: 'GRANT', entityId: grantId, newValues: { approvedBy: userId } });
      return { success: true, message: 'Override approved.' };
    } else {
      await prisma.grant.update({ where: { id: grantId }, data: { overrideRequested: false, overrideRequestedBy: null, overrideReason: null } });
      await logAudit({ tenantId, userId, action: 'GRANT_OVERRIDE_REJECTED', entityType: 'GRANT', entityId: grantId, newValues: { rejectedBy: userId } });
      return { success: true, message: 'Override request rejected.' };
    }
  }

  async getGrantTransactions(tenantId: string, grantId: string, filters: { fromDate?: string; toDate?: string; transactionType?: string; page?: number; limit?: number } = {}) {
    const grant = await prisma.grant.findFirst({ where: { id: grantId, tenantId } });
    if (!grant) throw new Error('GRANT_NOT_FOUND');

    const { fromDate, toDate, transactionType, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      grantId,
      tenantId,
      ...(transactionType ? { transactionType } : {}),
      ...(fromDate || toDate ? { transactionDate: { ...(fromDate ? { gte: new Date(fromDate) } : {}), ...(toDate ? { lte: new Date(`${toDate}T23:59:59`) } : {}) } } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.grantTransaction.findMany({ where, include: { journalEntry: { select: { id: true, entryNumber: true, entryDate: true } } }, orderBy: { transactionDate: 'desc' }, skip, take: limit }),
      prisma.grantTransaction.count({ where }),
    ]);

    return { grant: this._withComputed(grant), transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getGrantUtilizationReport(tenantId: string, filters: { financialYearId?: string; grantType?: string; fromDate?: string; toDate?: string } = {}) {
    const { financialYearId, grantType, fromDate, toDate } = filters;

    const grants = await prisma.grant.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(financialYearId ? { financialYearId } : {}),
        ...(grantType ? { grantType } : {}),
        ...(fromDate || toDate ? { createdAt: { ...(fromDate ? { gte: new Date(fromDate) } : {}), ...(toDate ? { lte: new Date(`${toDate}T23:59:59`) } : {}) } } : {}),
      },
      include: { financialYear: true, account: true },
      orderBy: [{ grantType: 'asc' }, { nameEn: 'asc' }],
    });

    const rows = grants.map((g) => {
      const remaining = Math.round((g.receivedAmount - g.utilizedAmount) * 100) / 100;
      const utilizationPct = g.receivedAmount > 0 ? Math.round((g.utilizedAmount / g.receivedAmount) * 10000) / 100 : 0;
      return {
        ...this._withComputed(g),
        utilizationPct,
        overallStatus: g.utilizedAmount > g.receivedAmount ? 'OVER_UTILIZED' : remaining === 0 ? 'FULLY_UTILIZED' : utilizationPct >= 75 ? 'MOSTLY_UTILIZED' : 'PARTIALLY_UTILIZED',
      };
    });

    const summary = {
      totalGrants: grants.length,
      totalSanctioned: Math.round(grants.reduce((s, g) => s + g.sanctionedAmount, 0) * 100) / 100,
      totalReceived: Math.round(grants.reduce((s, g) => s + g.receivedAmount, 0) * 100) / 100,
      totalUtilized: Math.round(grants.reduce((s, g) => s + g.utilizedAmount, 0) * 100) / 100,
      totalRemaining: Math.round(grants.reduce((s, g) => s + (g.receivedAmount - g.utilizedAmount), 0) * 100) / 100,
    };

    return { summary, grants: rows };
  }

  async getGrantStatement(tenantId: string, grantId: string) {
    const grant = await prisma.grant.findFirst({
      where: { id: grantId, tenantId },
      include: { financialYear: true, account: true, transactions: { orderBy: { transactionDate: 'asc' }, include: { journalEntry: { select: { entryNumber: true, entryDate: true } } } } },
    });
    if (!grant) throw new Error('GRANT_NOT_FOUND');

    let runningBalance = 0;
    const ledger = grant.transactions.map((txn) => {
      runningBalance = txn.transactionType === 'RECEIPT'
        ? Math.round((runningBalance + txn.amount) * 100) / 100
        : Math.round((runningBalance - txn.amount) * 100) / 100;
      return { ...txn, runningBalance };
    });

    return { grant: this._withComputed(grant), ledger };
  }
}

export const grantsService = new GrantsService();
