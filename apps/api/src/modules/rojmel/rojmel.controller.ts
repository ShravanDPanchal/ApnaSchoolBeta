import { Router, Request, Response } from 'express';
import { rojmelService } from './rojmel.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const rojmelRouter = Router();

rojmelRouter.use(authMiddleware);

rojmelRouter.get('/day-view', requirePermission(PermissionCode.ROJMEL_VIEW), async (req: Request, res: Response) => {
  try {
    const { date, financialYearId } = req.query;
    if (!date) {
      return sendError(res, 'VALIDATION_ERROR', 'date parameter is required (YYYY-MM-DD)', null, 400);
    }
    const result = await rojmelService.getRojmelDayView(req.tenantId!, date as string, financialYearId as string);
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

rojmelRouter.get('/monthly-view', requirePermission(PermissionCode.ROJMEL_VIEW), async (req: Request, res: Response) => {
  try {
    const { year, month, financialYearId } = req.query;
    if (!year || !month) {
      return sendError(res, 'VALIDATION_ERROR', 'year and month parameters are required', null, 400);
    }
    const result = await rojmelService.getRojmelMonthlyView(
      req.tenantId!,
      parseInt(year as string, 10),
      parseInt(month as string, 10),
      financialYearId as string
    );
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

rojmelRouter.get('/yearly-view', requirePermission(PermissionCode.ROJMEL_VIEW), async (req: Request, res: Response) => {
  try {
    const { financialYearId } = req.query;
    const result = await rojmelService.getRojmelYearlyView(req.tenantId!, financialYearId as string);
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

rojmelRouter.get('/head-wise-summary', requirePermission(PermissionCode.ROJMEL_VIEW), async (req: Request, res: Response) => {
  try {
    const { from, to, financialYearId } = req.query;
    if (!from || !to) {
      return sendError(res, 'VALIDATION_ERROR', 'from and to date parameters are required (YYYY-MM-DD)', null, 400);
    }
    const result = await rojmelService.getRojmelHeadWiseSummary(
      req.tenantId!,
      from as string,
      to as string,
      financialYearId as string
    );
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

rojmelRouter.post('/entry', requirePermission(PermissionCode.ROJMEL_ENTRY), async (req: Request, res: Response) => {
  try {
    const entry = await rojmelService.createRojmelEntry(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Rojmel entry recorded successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'ENTRY_FAILED', err.message, null, 400);
  }
});

rojmelRouter.post('/quick-batch', requirePermission(PermissionCode.ROJMEL_ENTRY), async (req: Request, res: Response) => {
  try {
    const entries = await rojmelService.createQuickBatchRojmel(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entries, 'Batch Rojmel entries recorded successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'BATCH_FAILED', err.message, null, 400);
  }
});
