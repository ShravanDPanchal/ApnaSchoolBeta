import { Router, Request, Response } from 'express';
import { timetableService } from './timetable.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const timetableRouter = Router();

timetableRouter.use(authMiddleware);

timetableRouter.get('/periods', requirePermission(PermissionCode.TIMETABLE_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const periods = await timetableService.getPeriods(req.tenantId!, academicYearId as string);
    return sendSuccess(res, periods);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

timetableRouter.post('/entry', requirePermission(PermissionCode.TIMETABLE_MANAGE), async (req: Request, res: Response) => {
  try {
    const entry = await timetableService.saveTimetableEntry(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, entry, 'Timetable entry saved successfully');
  } catch (err: any) {
    return sendError(res, 'TIMETABLE_CONFLICT', err.message, null, 400);
  }
});

timetableRouter.get('/class/:classId', requirePermission(PermissionCode.TIMETABLE_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId, divisionId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const timetable = await timetableService.getClassTimetable(
      req.tenantId!,
      academicYearId as string,
      req.params.classId,
      divisionId as string
    );
    return sendSuccess(res, timetable);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

timetableRouter.get('/teacher/:staffId', requirePermission(PermissionCode.TIMETABLE_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const timetable = await timetableService.getTeacherTimetable(
      req.tenantId!,
      academicYearId as string,
      req.params.staffId
    );
    return sendSuccess(res, timetable);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
