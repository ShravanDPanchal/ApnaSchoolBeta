import { Router, Request, Response } from 'express';
import { grantsService } from './grants.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const grantsRouter = Router();

grantsRouter.use(authMiddleware);

// ── LIST & CREATE ─────────────────────────────────────────────────────────────
grantsRouter.get(
  '/',
  requirePermission(PermissionCode.GRANTS_VIEW, PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const { financialYearId, grantType, status, fromDate, toDate, search, page, limit } = req.query as Record<string, string | undefined>;
      const result = await grantsService.getGrants(req.tenantId!, {
        financialYearId,
        grantType,
        status,
        fromDate,
        toDate,
        search,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, 'SERVER_ERROR', err.message, null, 500);
    }
  }
);

grantsRouter.post(
  '/',
  requirePermission(PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const grant = await grantsService.createGrant(req.tenantId!, req.user!.userId, req.body);
      return sendSuccess(res, grant, 'Grant created successfully', undefined, 201);
    } catch (err: any) {
      return sendError(res, 'CREATION_FAILED', err.message, null, 400);
    }
  }
);

// ── UTILIZATION REPORT ────────────────────────────────────────────────────────
grantsRouter.get(
  '/utilization-report',
  requirePermission(PermissionCode.GRANTS_VIEW, PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const { financialYearId, grantType, fromDate, toDate } = req.query as Record<string, string | undefined>;
      const result = await grantsService.getGrantUtilizationReport(req.tenantId!, { financialYearId, grantType, fromDate, toDate });
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, 'SERVER_ERROR', err.message, null, 500);
    }
  }
);

// ── SINGLE GRANT ──────────────────────────────────────────────────────────────
grantsRouter.get(
  '/:id',
  requirePermission(PermissionCode.GRANTS_VIEW, PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const grant = await grantsService.getGrantById(req.tenantId!, req.params.id);
      return sendSuccess(res, grant);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'SERVER_ERROR', err.message, null, 500);
    }
  }
);

grantsRouter.put(
  '/:id',
  requirePermission(PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const grant = await grantsService.updateGrant(req.tenantId!, req.user!.userId, req.params.id, req.body);
      return sendSuccess(res, grant, 'Grant updated successfully');
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'UPDATE_FAILED', err.message, null, 400);
    }
  }
);

grantsRouter.delete(
  '/:id',
  requirePermission(PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const result = await grantsService.deleteGrant(req.tenantId!, req.user!.userId, req.params.id);
      return sendSuccess(res, result, 'Grant deleted successfully');
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'DELETE_FAILED', err.message, null, 400);
    }
  }
);

// ── RECEIPT ───────────────────────────────────────────────────────────────────
grantsRouter.post(
  '/:id/receive',
  requirePermission(PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const txn = await grantsService.recordGrantReceipt(req.tenantId!, req.user!.userId, req.params.id, req.body);
      return sendSuccess(res, txn, 'Grant receipt recorded successfully', undefined, 201);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'RECEIPT_FAILED', err.message, null, 400);
    }
  }
);

// ── UTILIZATION ───────────────────────────────────────────────────────────────
grantsRouter.post(
  '/:id/utilize',
  requirePermission(PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const txn = await grantsService.recordGrantUtilization(req.tenantId!, req.user!.userId, req.params.id, req.body);
      return sendSuccess(res, txn, 'Grant utilization recorded successfully', undefined, 201);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      if (err.message.startsWith('UTILIZATION_EXCEEDS_AVAILABLE')) return sendError(res, 'UTILIZATION_EXCEEDS_AVAILABLE', err.message, null, 422);
      return sendError(res, 'UTILIZATION_FAILED', err.message, null, 400);
    }
  }
);

// ── OVERRIDE WORKFLOW ─────────────────────────────────────────────────────────
grantsRouter.post(
  '/:id/request-override',
  requirePermission(PermissionCode.GRANTS_OVERRIDE_REQUEST, PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const result = await grantsService.requestOverride(req.tenantId!, req.user!.userId, req.params.id, req.body);
      return sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'OVERRIDE_REQUEST_FAILED', err.message, null, 400);
    }
  }
);

grantsRouter.post(
  '/:id/approve-override',
  requirePermission(PermissionCode.GRANTS_OVERRIDE_APPROVE),
  async (req: Request, res: Response) => {
    try {
      const result = await grantsService.approveOverride(req.tenantId!, req.user!.userId, req.params.id, req.body);
      return sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'OVERRIDE_APPROVE_FAILED', err.message, null, 400);
    }
  }
);

// ── TRANSACTIONS ──────────────────────────────────────────────────────────────
grantsRouter.get(
  '/:id/transactions',
  requirePermission(PermissionCode.GRANTS_VIEW, PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const { fromDate, toDate, transactionType, page, limit } = req.query as Record<string, string | undefined>;
      const result = await grantsService.getGrantTransactions(req.tenantId!, req.params.id, {
        fromDate,
        toDate,
        transactionType,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });
      return sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'SERVER_ERROR', err.message, null, 500);
    }
  }
);

// ── GRANT STATEMENT (per-grant ledger view) ───────────────────────────────────
grantsRouter.get(
  '/:id/statement',
  requirePermission(PermissionCode.GRANTS_VIEW, PermissionCode.GRANTS_MANAGE),
  async (req: Request, res: Response) => {
    try {
      const result = await grantsService.getGrantStatement(req.tenantId!, req.params.id);
      return sendSuccess(res, result);
    } catch (err: any) {
      if (err.message === 'GRANT_NOT_FOUND') return sendError(res, 'NOT_FOUND', 'Grant not found', null, 404);
      return sendError(res, 'SERVER_ERROR', err.message, null, 500);
    }
  }
);
