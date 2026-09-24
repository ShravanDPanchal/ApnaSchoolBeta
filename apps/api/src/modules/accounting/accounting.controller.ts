import { Router, Request, Response } from 'express';
import { accountingService } from './accounting.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode, AccountGroupType } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const accountingRouter = Router();

accountingRouter.use(authMiddleware);

// -------------------------------------------------------------
// 1. ACCOUNT GROUPS & CHART OF ACCOUNTS
// -------------------------------------------------------------

accountingRouter.get('/groups', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE, PermissionCode.ACCOUNTING_ENTRIES_VIEW), async (req: Request, res: Response) => {
  try {
    const groups = await accountingService.getAccountGroups(req.tenantId!);
    return sendSuccess(res, groups);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.post('/groups', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE), async (req: Request, res: Response) => {
  try {
    const group = await accountingService.createAccountGroup(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, group, 'Account group created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'CREATION_FAILED', err.message, null, 400);
  }
});

accountingRouter.get('/accounts', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE, PermissionCode.ACCOUNTING_ENTRIES_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId, accountType } = req.query;
    const accounts = await accountingService.getChartOfAccounts(req.tenantId!, financialYearId as string, accountType as AccountGroupType);
    return sendSuccess(res, accounts);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.post('/accounts', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE), async (req: Request, res: Response) => {
  try {
    const account = await accountingService.createAccount(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, account, 'Account created successfully in Chart of Accounts', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'CREATION_FAILED', err.message, null, 400);
  }
});

accountingRouter.put('/accounts/:id', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE), async (req: Request, res: Response) => {
  try {
    const account = await accountingService.updateAccount(req.tenantId!, req.user!.userId, req.params.id, req.body);
    return sendSuccess(res, account, 'Account updated successfully');
  } catch (err: any) {
    return sendError(res, 'UPDATE_FAILED', err.message, null, 400);
  }
});

// -------------------------------------------------------------
// 2. SPECIALIZED VOUCHERS (Receipt, Payment, Contra, Adjustment)
// -------------------------------------------------------------

accountingRouter.post('/vouchers/receipt', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_CREATE), async (req: Request, res: Response) => {
  try {
    const entry = await accountingService.createReceiptVoucher(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Receipt voucher created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'VOUCHER_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/vouchers/payment', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_CREATE), async (req: Request, res: Response) => {
  try {
    const entry = await accountingService.createPaymentVoucher(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Payment voucher created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'VOUCHER_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/vouchers/contra', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_CREATE), async (req: Request, res: Response) => {
  try {
    const entry = await accountingService.createContraVoucher(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Contra voucher created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'VOUCHER_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/vouchers/adjustment', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_CREATE), async (req: Request, res: Response) => {
  try {
    const entry = await accountingService.createAdjustmentVoucher(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Adjustment voucher created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'VOUCHER_FAILED', err.message, null, 400);
  }
});

// -------------------------------------------------------------
// 3. GENERAL JOURNAL ENTRIES & ACTIONS
// -------------------------------------------------------------

accountingRouter.get('/journal-entries', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_VIEW), async (req: Request, res: Response) => {
  try {
    const result = await accountingService.getJournalEntries(req.tenantId!, req.query as any);
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/journal-entries/:id', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_VIEW), async (req: Request, res: Response) => {
  try {
    const entry = await accountingService.getJournalEntryById(req.tenantId!, req.params.id);
    return sendSuccess(res, entry);
  } catch (err: any) {
    return sendError(res, 'NOT_FOUND', err.message, null, 404);
  }
});

accountingRouter.post('/journal-entries', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_CREATE), async (req: Request, res: Response) => {
  try {
    const entry = await accountingService.createJournalEntry(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Journal entry posted successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'ENTRY_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/journal-entries/:id/reverse', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_REVERSE), async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return sendError(res, 'VALIDATION_ERROR', 'Reversal reason is required', null, 400);
    }
    const entry = await accountingService.reverseJournalEntry(req.tenantId!, req.user!.userId, req.params.id, reason);
    return sendSuccess(res, entry, 'Journal entry reversed successfully');
  } catch (err: any) {
    return sendError(res, 'REVERSAL_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/journal-entries/:id/cancel', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_REVERSE), async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return sendError(res, 'VALIDATION_ERROR', 'Cancellation reason is required', null, 400);
    }
    const result = await accountingService.cancelJournalEntry(req.tenantId!, req.user!.userId, req.params.id, reason);
    return sendSuccess(res, result, 'Journal entry cancelled and reversed');
  } catch (err: any) {
    return sendError(res, 'CANCELLATION_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/journal-entries/:id/attachments', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_CREATE), async (req: Request, res: Response) => {
  try {
    const doc = await accountingService.attachDocument(req.tenantId!, req.user!.userId, req.params.id, req.body);
    return sendSuccess(res, doc, 'Document attached successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'ATTACHMENT_FAILED', err.message, null, 400);
  }
});

// -------------------------------------------------------------
// 4. BOOKS OF ACCOUNTS (Ledger, Cash Book, Bank Book, Trial Balance)
// -------------------------------------------------------------

accountingRouter.get('/ledger/:accountId', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return sendError(res, 'VALIDATION_ERROR', 'from and to dates are required (YYYY-MM-DD)', null, 400);
    }
    const statement = await accountingService.getLedger(req.tenantId!, req.params.accountId, from as string, to as string);
    return sendSuccess(res, statement);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/cash-book', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId, from, to } = req.query;
    if (!financialYearId || !from || !to) {
      return sendError(res, 'VALIDATION_ERROR', 'financialYearId, from, and to dates are required', null, 400);
    }
    const cb = await accountingService.getCashBook(req.tenantId!, financialYearId as string, from as string, to as string);
    return sendSuccess(res, cb);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/bank-book', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId, from, to, bankAccountId } = req.query;
    if (!financialYearId || !from || !to) {
      return sendError(res, 'VALIDATION_ERROR', 'financialYearId, from, and to dates are required', null, 400);
    }
    const bb = await accountingService.getBankBook(req.tenantId!, financialYearId as string, from as string, to as string, bankAccountId as string);
    return sendSuccess(res, bb);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/trial-balance', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId } = req.query;
    if (!financialYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'financialYearId is required', null, 400);
    }
    const tb = await accountingService.getTrialBalance(req.tenantId!, financialYearId as string);
    return sendSuccess(res, tb);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// -------------------------------------------------------------
// 5. STATUTORY & ANALYTICAL REPORTS
// -------------------------------------------------------------

accountingRouter.get('/reports/income-expense', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId, from, to } = req.query;
    if (!financialYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'financialYearId is required', null, 400);
    }
    const report = await accountingService.getIncomeExpenseReport(req.tenantId!, financialYearId as string, from as string, to as string);
    return sendSuccess(res, report);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/reports/head-wise', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId, accountType } = req.query;
    if (!financialYearId || !accountType) {
      return sendError(res, 'VALIDATION_ERROR', 'financialYearId and accountType are required', null, 400);
    }
    const report = await accountingService.getHeadWiseReport(req.tenantId!, financialYearId as string, accountType as AccountGroupType);
    return sendSuccess(res, report);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/reports/monthly', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId } = req.query;
    if (!financialYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'financialYearId is required', null, 400);
    }
    const report = await accountingService.getMonthlySummaryReport(req.tenantId!, financialYearId as string);
    return sendSuccess(res, report);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.get('/reports/yearly', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const report = await accountingService.getYearlySummaryReport(req.tenantId!);
    return sendSuccess(res, report);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// -------------------------------------------------------------
// 6. FINANCIAL YEARS & YEAR-END ROLLOVER
// -------------------------------------------------------------

accountingRouter.get('/financial-years', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE, PermissionCode.ACCOUNTING_ENTRIES_VIEW), async (req: Request, res: Response) => {
  try {
    const fys = await accountingService.getFinancialYears(req.tenantId!);
    return sendSuccess(res, fys);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

accountingRouter.post('/financial-years', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE), async (req: Request, res: Response) => {
  try {
    const fy = await accountingService.createFinancialYear(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, fy, 'Financial Year created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'CREATION_FAILED', err.message, null, 400);
  }
});

accountingRouter.post('/financial-years/close', requirePermission(PermissionCode.ACCOUNTING_COA_MANAGE), async (req: Request, res: Response) => {
  try {
    const result = await accountingService.closeFinancialYear(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, result, result.message);
  } catch (err: any) {
    return sendError(res, 'CLOSING_FAILED', err.message, null, 400);
  }
});

