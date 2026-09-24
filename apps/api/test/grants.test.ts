import { grantsService } from '../src/modules/grants/grants.service';
import { accountingService } from '../src/modules/accounting/accounting.service';
import { prisma } from '../src/database/prisma';
import { JournalEntryType, AccountNature, AccountGroupType } from '@apna-school/shared-types';

describe('Phase 10: Complete Grant Management System Tests', () => {
  let tenantId: string;
  let userId: string;
  let financialYearId: string;
  let grantId: string;
  let grant2Id: string;  // second grant for isolation tests
  let cashAccountId: string;
  let incomeAccountId: string;

  // ── Setup ────────────────────────────────────────────────────────────────
  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Run seed before running tests (tenant SSVM not found)');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@ssvm.edu.in' } });
    if (!user) throw new Error('Admin user not found');
    userId = user.id;

    const fy = await prisma.financialYear.findFirst({ where: { tenantId, isCurrent: true } });
    if (!fy) throw new Error('No current financial year found');
    financialYearId = fy.id;

    // Find cash and income accounts for accounting integration tests
    const cashAcc = await prisma.chartOfAccount.findFirst({
      where: { tenantId, isCashAccount: true, isActive: true, financialYearId },
    });
    cashAccountId = cashAcc?.id || '';

    const incomeAcc = await prisma.chartOfAccount.findFirst({
      where: { tenantId, accountType: 'INCOME', isActive: true, financialYearId },
    });
    incomeAccountId = incomeAcc?.id || '';

    // Clean up previous test data
    await prisma.grantTransaction.deleteMany({
      where: { tenantId, grant: { nameEn: { contains: '[TEST-G10]' } } },
    });
    await prisma.grant.deleteMany({ where: { tenantId, nameEn: { contains: '[TEST-G10]' } } });
  });

  afterAll(async () => {
    await prisma.grantTransaction.deleteMany({
      where: { tenantId, grant: { nameEn: { contains: '[TEST-G10]' } } },
    });
    await prisma.grant.deleteMany({ where: { tenantId, nameEn: { contains: '[TEST-G10]' } } });
    await prisma.$disconnect();
  });

  // ── TC-1: Create grant ───────────────────────────────────────────────────
  test('TC-1: Create a new grant', async () => {
    const grant = await grantsService.createGrant(tenantId, userId, {
      nameEn: '[TEST-G10] SSA Infrastructure Grant',
      nameGu: '[TEST-G10] SSA ઇન્ફ્રા ગ્રાન્ટ',
      grantType: 'SSA',
      source: 'State Government',
      grantHead: 'School Building',
      sanctionedAmount: 500000,
      financialYearId,
      sanctionLetterNo: 'SSA/2025/001',
      remarks: 'For new classroom construction',
    });

    expect(grant.nameEn).toContain('[TEST-G10]');
    expect(grant.sanctionedAmount).toBe(500000);
    expect(grant.receivedAmount).toBe(0);
    expect(grant.utilizedAmount).toBe(0);
    expect((grant as any).remainingAmount).toBe(0);
    expect((grant as any).pendingAmount).toBe(500000);
    grantId = grant.id;
  });

  // ── TC-2: Validation — missing name ─────────────────────────────────────
  test('TC-2: Creating grant without nameEn throws', async () => {
    await expect(
      grantsService.createGrant(tenantId, userId, { nameEn: '', sanctionedAmount: 100000, financialYearId })
    ).rejects.toThrow('Grant name (English) is required.');
  });

  // ── TC-3: Validation — zero amount ──────────────────────────────────────
  test('TC-3: Creating grant with zero sanctioned amount throws', async () => {
    await expect(
      grantsService.createGrant(tenantId, userId, { nameEn: '[TEST-G10] Bad', sanctionedAmount: 0, financialYearId })
    ).rejects.toThrow('Sanctioned amount must be greater than zero.');
  });

  // ── TC-4: List grants ────────────────────────────────────────────────────
  test('TC-4: List grants returns paginated result', async () => {
    const result = await grantsService.getGrants(tenantId, { financialYearId });
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result).toHaveProperty('totalPages');
  });

  // ── TC-5: Get by ID ──────────────────────────────────────────────────────
  test('TC-5: Get grant by ID', async () => {
    const grant = await grantsService.getGrantById(tenantId, grantId);
    expect(grant.id).toBe(grantId);
    expect((grant as any).grantType).toBe('SSA');
    expect(Array.isArray((grant as any).transactions)).toBe(true);
  });

  // ── TC-6: Update grant ───────────────────────────────────────────────────
  test('TC-6: Update grant metadata', async () => {
    const updated = await grantsService.updateGrant(tenantId, userId, grantId, {
      grantType: 'State',
      remarks: 'Updated remarks for TC-6',
    });
    expect((updated as any).grantType).toBe('State');
    expect((updated as any).remarks).toBe('Updated remarks for TC-6');
  });

  // ── TC-7: Record receipt (no accounting linkage) ─────────────────────────
  test('TC-7: Record grant receipt within sanctioned amount', async () => {
    const txn = await grantsService.recordGrantReceipt(tenantId, userId, grantId, {
      amount: 200000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: 'First instalment',
      referenceNo: 'NEFT/2025/001',
    });
    expect(txn.transactionType).toBe('RECEIPT');
    expect(txn.amount).toBe(200000);
  });

  // ── TC-8: Verify balances after receipt ─────────────────────────────────
  test('TC-8: Grant receivedAmount and remainingAmount correct after receipt', async () => {
    const grant = await grantsService.getGrantById(tenantId, grantId);
    expect(grant.receivedAmount).toBe(200000);
    expect((grant as any).remainingAmount).toBe(200000);
    expect((grant as any).pendingAmount).toBe(300000);
  });

  // ── TC-9: Receipt exceeds sanctioned ────────────────────────────────────
  test('TC-9: Receipt exceeding sanctioned amount throws', async () => {
    await expect(
      grantsService.recordGrantReceipt(tenantId, userId, grantId, {
        amount: 400000,
        transactionDate: new Date().toISOString().split('T')[0],
      })
    ).rejects.toThrow('would exceed sanctioned amount');
  });

  // ── TC-10: Record utilization within available ───────────────────────────
  test('TC-10: Record utilization within available balance', async () => {
    const txn = await grantsService.recordGrantUtilization(tenantId, userId, grantId, {
      amount: 50000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: 'Purchased construction material',
    });
    expect(txn.transactionType).toBe('UTILIZATION');
    expect(txn.amount).toBe(50000);
  });

  // ── TC-11: Verify utilizedAmount ────────────────────────────────────────
  test('TC-11: Grant utilizedAmount and remainingAmount correct after utilization', async () => {
    const grant = await grantsService.getGrantById(tenantId, grantId);
    expect(grant.utilizedAmount).toBe(50000);
    expect((grant as any).remainingAmount).toBe(150000); // 200000 - 50000
  });

  // ── TC-12: Utilization exceeds — blocked ────────────────────────────────
  test('TC-12: Utilization exceeding available balance is rejected (no override)', async () => {
    await expect(
      grantsService.recordGrantUtilization(tenantId, userId, grantId, {
        amount: 200000,
        transactionDate: new Date().toISOString().split('T')[0],
      })
    ).rejects.toThrow('UTILIZATION_EXCEEDS_AVAILABLE');
  });

  // ── TC-13: Request override ──────────────────────────────────────────────
  test('TC-13: Request override for excess utilization', async () => {
    const result = await grantsService.requestOverride(tenantId, userId, grantId, {
      reason: 'Emergency repairs required',
      requestedAmount: 200000,
    });
    expect(result.success).toBe(true);
  });

  // ── TC-14: Approve override ──────────────────────────────────────────────
  test('TC-14: Approve override request', async () => {
    const result = await grantsService.approveOverride(tenantId, userId, grantId, {
      approved: true,
      remarks: 'Emergency situation confirmed',
    });
    expect(result.success).toBe(true);

    // Verify DB reflects approval
    const grant = await prisma.grant.findFirst({ where: { id: grantId } });
    expect(grant?.overrideApprovedBy).toBeTruthy();
  });

  // ── TC-15: Utilization succeeds with override ────────────────────────────
  test('TC-15: Utilization succeeds after approved override', async () => {
    const txn = await grantsService.recordGrantUtilization(tenantId, userId, grantId, {
      amount: 160000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: 'Emergency repairs',
    });
    expect(txn.transactionType).toBe('UTILIZATION');
    expect(txn.amount).toBe(160000);
  });

  // ── TC-16: Override auto-resets after use ───────────────────────────────
  test('TC-16: After override use, a new excess utilization is blocked again', async () => {
    // At this point: received=200000, utilized=50000+160000=210000 — already over
    // Any additional utilization should fail since override was consumed
    await expect(
      grantsService.recordGrantUtilization(tenantId, userId, grantId, {
        amount: 1000,
        transactionDate: new Date().toISOString().split('T')[0],
      })
    ).rejects.toThrow('UTILIZATION_EXCEEDS_AVAILABLE');

    // Verify override flags are cleared
    const grant = await prisma.grant.findFirst({ where: { id: grantId } });
    expect(grant?.overrideRequested).toBe(false);
    expect(grant?.overrideApprovedBy).toBeNull();
  });

  // ── TC-17: Get transactions ──────────────────────────────────────────────
  test('TC-17: Get grant transactions with pagination', async () => {
    const result = await grantsService.getGrantTransactions(tenantId, grantId);
    expect(Array.isArray(result.transactions)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(3);
    expect(result).toHaveProperty('totalPages');
  });

  // ── TC-18: Filter transactions by type ──────────────────────────────────
  test('TC-18: Filter transactions by RECEIPT type', async () => {
    const result = await grantsService.getGrantTransactions(tenantId, grantId, { transactionType: 'RECEIPT' });
    expect(result.transactions.every((t: any) => t.transactionType === 'RECEIPT')).toBe(true);
  });

  // ── TC-19: Grant statement ───────────────────────────────────────────────
  test('TC-19: Grant statement has running balance', async () => {
    const result = await grantsService.getGrantStatement(tenantId, grantId);
    expect(Array.isArray(result.ledger)).toBe(true);
    expect(result.ledger.length).toBeGreaterThan(0);
    expect(result.ledger[0]).toHaveProperty('runningBalance');
    // First entry is RECEIPT so running balance should be positive
    expect(result.ledger[0].runningBalance).toBeGreaterThan(0);
  });

  // ── TC-20: Utilization report ────────────────────────────────────────────
  test('TC-20: Utilization report returns summary and per-grant rows', async () => {
    const report = await grantsService.getGrantUtilizationReport(tenantId, { financialYearId });
    expect(report.summary).toHaveProperty('totalGrants');
    expect(report.summary).toHaveProperty('totalSanctioned');
    expect(report.summary).toHaveProperty('totalReceived');
    expect(report.summary).toHaveProperty('totalUtilized');
    expect(report.summary).toHaveProperty('totalRemaining');
    expect(Array.isArray(report.grants)).toBe(true);
    const testRow = report.grants.find((g: any) => g.id === grantId);
    expect(testRow).toBeDefined();
    expect(testRow).toHaveProperty('utilizationPct');
    expect(testRow).toHaveProperty('overallStatus');
  });

  // ── TC-21: Search grants ─────────────────────────────────────────────────
  test('TC-21: Search grants by keyword', async () => {
    const result = await grantsService.getGrants(tenantId, { search: '[TEST-G10]' });
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  // ── TC-22: Filter by grantType ───────────────────────────────────────────
  test('TC-22: Filter grants by grantType=State', async () => {
    const result = await grantsService.getGrants(tenantId, { grantType: 'State' });
    expect(result.data.every((g: any) => g.grantType === 'State')).toBe(true);
  });

  // ── TC-23: Multi-tenant isolation ───────────────────────────────────────
  test('TC-23: Multi-tenant isolation — different tenant cannot access grant', async () => {
    const tenant2 = await prisma.tenant.findFirst({ where: { code: 'SKV' } });
    if (!tenant2) return; // skip if SKV not seeded

    await expect(
      grantsService.getGrantById(tenant2.id, grantId)
    ).rejects.toThrow('GRANT_NOT_FOUND');
  });

  // ── TC-24: Cannot delete grant with transactions ─────────────────────────
  test('TC-24: Cannot delete grant that has transactions', async () => {
    await expect(
      grantsService.deleteGrant(tenantId, userId, grantId)
    ).rejects.toThrow('Cannot delete a grant that has receipt or utilization transactions');
  });

  // ── TC-25: Create and delete a clean grant ──────────────────────────────
  test('TC-25: Can delete grant with no transactions', async () => {
    const newGrant = await grantsService.createGrant(tenantId, userId, {
      nameEn: '[TEST-G10] Clean Grant for Delete',
      sanctionedAmount: 10000,
      financialYearId,
    });

    const result = await grantsService.deleteGrant(tenantId, userId, newGrant.id);
    expect(result.success).toBe(true);

    // Verify it's gone from active list
    const deleted = await prisma.grant.findFirst({ where: { id: newGrant.id } });
    expect(deleted?.status).toBe('DELETED');
    expect(deleted?.isActive).toBe(false);
  });

  // ── TC-26: Override rejection workflow ──────────────────────────────────
  test('TC-26: Override can be rejected', async () => {
    const g2 = await grantsService.createGrant(tenantId, userId, {
      nameEn: '[TEST-G10] Override Reject Grant',
      sanctionedAmount: 100000,
      financialYearId,
    });

    await grantsService.recordGrantReceipt(tenantId, userId, g2.id, {
      amount: 10000,
      transactionDate: new Date().toISOString().split('T')[0],
    });

    // Request override
    const reqResult = await grantsService.requestOverride(tenantId, userId, g2.id, {
      reason: 'Testing rejection flow',
      requestedAmount: 5000,
    });
    expect(reqResult.success).toBe(true);

    // Reject override
    const rejResult = await grantsService.approveOverride(tenantId, userId, g2.id, {
      approved: false,
      remarks: 'Not justified',
    });
    expect(rejResult.message).toContain('rejected');

    // Verify override is cleared
    const grant = await prisma.grant.findFirst({ where: { id: g2.id } });
    expect(grant?.overrideRequested).toBe(false);
    expect(grant?.overrideApprovedBy).toBeNull();

    grant2Id = g2.id;
  });

  // ── TC-27: Accounting integration — receipt creates journal entry ────────
  test('TC-27: Grant receipt with accounting creates journal entry', async () => {
    if (!cashAccountId || !incomeAccountId) {
      console.warn('Skipping TC-27: No cash or income accounts found');
      return;
    }

    const g = await grantsService.createGrant(tenantId, userId, {
      nameEn: '[TEST-G10] Accounting Integration Grant',
      sanctionedAmount: 100000,
      financialYearId,
      accountId: incomeAccountId,
    });

    const txn = await grantsService.recordGrantReceipt(tenantId, userId, g.id, {
      amount: 50000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: 'Accounting integration test',
      cashAccountId,
      financialYearId,
    });

    // Journal entry should be linked
    expect(txn.journalEntryId).toBeTruthy();

    const je = await prisma.journalEntry.findFirst({ where: { id: txn.journalEntryId as string } });
    expect(je).not.toBeNull();
    expect(je?.totalAmount).toBe(50000);
    expect(je?.entryType).toBe('RECEIPT');
  });

  // ── TC-28: Accounting integration — utilization creates journal entry ────
  test('TC-28: Grant utilization with accounting creates payment journal entry', async () => {
    if (!cashAccountId || !incomeAccountId) {
      console.warn('Skipping TC-28: No cash or income accounts found');
      return;
    }

    const g = await grantsService.createGrant(tenantId, userId, {
      nameEn: '[TEST-G10] Accounting Utilization Grant',
      sanctionedAmount: 100000,
      financialYearId,
      accountId: incomeAccountId,
    });

    // First receive funds
    await grantsService.recordGrantReceipt(tenantId, userId, g.id, {
      amount: 80000,
      transactionDate: new Date().toISOString().split('T')[0],
      cashAccountId,
      financialYearId,
    });

    // Then utilize
    const txn = await grantsService.recordGrantUtilization(tenantId, userId, g.id, {
      amount: 30000,
      transactionDate: new Date().toISOString().split('T')[0],
      description: 'Purchase for accounting test',
      cashAccountId,
      financialYearId,
    });

    expect(txn.journalEntryId).toBeTruthy();
    const je = await prisma.journalEntry.findFirst({ where: { id: txn.journalEntryId as string } });
    expect(je?.entryType).toBe('PAYMENT');
    expect(je?.totalAmount).toBe(30000);
  });

  // ── TC-29: Cannot approve override that doesn't exist ───────────────────
  test('TC-29: Approving non-existent override request throws error', async () => {
    const g = await grantsService.createGrant(tenantId, userId, {
      nameEn: '[TEST-G10] No Override Grant',
      sanctionedAmount: 50000,
      financialYearId,
    });

    await expect(
      grantsService.approveOverride(tenantId, userId, g.id, { approved: true })
    ).rejects.toThrow('No pending override request found');
  });

  // ── TC-30: computedFields accuracy ──────────────────────────────────────
  test('TC-30: Computed fields (remainingAmount, pendingAmount) are mathematically correct', async () => {
    const grant = await grantsService.getGrantById(tenantId, grantId);
    const expected = {
      remainingAmount: Math.round((grant.receivedAmount - grant.utilizedAmount) * 100) / 100,
      pendingAmount: Math.round((grant.sanctionedAmount - grant.receivedAmount) * 100) / 100,
    };
    expect((grant as any).remainingAmount).toBe(expected.remainingAmount);
    expect((grant as any).pendingAmount).toBe(expected.pendingAmount);
  });
});
