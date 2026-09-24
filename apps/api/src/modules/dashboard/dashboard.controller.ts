import { Router, Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const dashboardRouter = Router();

dashboardRouter.use(authMiddleware);

dashboardRouter.get('/admin', requirePermission(PermissionCode.DASHBOARD_VIEW), async (req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getAdminDashboard(req.tenantId!);
    return sendSuccess(res, stats);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
