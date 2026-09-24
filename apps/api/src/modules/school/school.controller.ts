import { Router, Request, Response } from 'express';
import { schoolService } from './school.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const schoolRouter = Router();

schoolRouter.use(authMiddleware);

schoolRouter.get('/', requirePermission(PermissionCode.SCHOOL_SETTINGS_VIEW, PermissionCode.DASHBOARD_VIEW), async (req: Request, res: Response) => {
  try {
    const school = await schoolService.getSchoolProfile(req.tenantId!);
    return sendSuccess(res, school);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.patch('/', requirePermission(PermissionCode.SCHOOL_SETTINGS_UPDATE), async (req: Request, res: Response) => {
  try {
    const updated = await schoolService.updateSchoolProfile(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, updated, 'School profile updated successfully');
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.get('/academic-years', requirePermission(PermissionCode.SCHOOL_SETTINGS_VIEW, PermissionCode.STUDENTS_VIEW, PermissionCode.TIMETABLE_VIEW, PermissionCode.ATTENDANCE_STUDENT_VIEW), async (req: Request, res: Response) => {
  try {
    const years = await schoolService.getAcademicYears(req.tenantId!);
    return sendSuccess(res, years);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.get('/financial-years', requirePermission(PermissionCode.ACCOUNTING_ENTRIES_VIEW, PermissionCode.FEES_VIEW, PermissionCode.GRANTS_VIEW), async (req: Request, res: Response) => {
  try {
    const years = await schoolService.getFinancialYears(req.tenantId!);
    return sendSuccess(res, years);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.get('/classes', requirePermission(PermissionCode.STUDENTS_VIEW, PermissionCode.ATTENDANCE_STUDENT_VIEW, PermissionCode.TIMETABLE_VIEW), async (req: Request, res: Response) => {
  try {
    const classes = await schoolService.getClasses(req.tenantId!);
    return sendSuccess(res, classes);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.get('/subjects', requirePermission(PermissionCode.TIMETABLE_VIEW, PermissionCode.EXAM_VIEW), async (req: Request, res: Response) => {
  try {
    const subjects = await schoolService.getSubjects(req.tenantId!);
    return sendSuccess(res, subjects);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.get('/notices', requirePermission(PermissionCode.DASHBOARD_VIEW, PermissionCode.STUDENTS_VIEW, PermissionCode.STAFF_VIEW), async (req: Request, res: Response) => {
  try {
    const notices = await schoolService.getNotices(req.tenantId!);
    return sendSuccess(res, notices);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

schoolRouter.post('/notices', requirePermission(PermissionCode.NOTIFICATIONS_SEND), async (req: Request, res: Response) => {
  try {
    const notice = await schoolService.createNotice(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, notice, 'Notice published successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
