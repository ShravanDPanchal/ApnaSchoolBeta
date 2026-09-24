import { Router, Request, Response } from 'express';
import { attendanceService } from './attendance.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const attendanceRouter = Router();

attendanceRouter.use(authMiddleware);

// --- STUDENT ATTENDANCE ENDPOINTS ---
attendanceRouter.get('/students', requirePermission(PermissionCode.ATTENDANCE_STUDENT_VIEW), async (req: Request, res: Response) => {
  try {
    const { classId, date, divisionId } = req.query;
    if (!classId || !date) {
      return sendError(res, 'VALIDATION_ERROR', 'classId and date (YYYY-MM-DD) are required', null, 400);
    }
    const result = await attendanceService.getStudentAttendanceByClassAndDate(
      req.tenantId!,
      classId as string,
      date as string,
      divisionId as string
    );
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

attendanceRouter.post('/students/batch', requirePermission(PermissionCode.ATTENDANCE_STUDENT_CREATE), async (req: Request, res: Response) => {
  try {
    const { academicYearId, date, items } = req.body;
    if (!academicYearId || !date || !Array.isArray(items)) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId, date, and items array are required', null, 400);
    }
    const result = await attendanceService.markBatchStudentAttendance(
      req.tenantId!,
      academicYearId,
      req.user!.userId,
      date,
      items
    );
    return sendSuccess(res, result, 'Attendance recorded successfully');
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

attendanceRouter.get('/students/monthly-summary', requirePermission(PermissionCode.ATTENDANCE_STUDENT_VIEW), async (req: Request, res: Response) => {
  try {
    const { classId, month, year } = req.query;
    if (!classId || !month || !year) {
      return sendError(res, 'VALIDATION_ERROR', 'classId, month, and year are required', null, 400);
    }
    const result = await attendanceService.getMonthlyAttendanceSummary(
      req.tenantId!,
      classId as string,
      parseInt(month as string, 10),
      parseInt(year as string, 10)
    );
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// --- STAFF ATTENDANCE ENDPOINTS ---
attendanceRouter.get('/staff', requirePermission(PermissionCode.ATTENDANCE_STAFF_VIEW), async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return sendError(res, 'VALIDATION_ERROR', 'date (YYYY-MM-DD) is required', null, 400);
    }
    const result = await attendanceService.getStaffAttendanceByDate(req.tenantId!, date as string);
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

attendanceRouter.post('/staff/batch', requirePermission(PermissionCode.ATTENDANCE_STAFF_CREATE), async (req: Request, res: Response) => {
  try {
    const { date, items } = req.body;
    if (!date || !Array.isArray(items)) {
      return sendError(res, 'VALIDATION_ERROR', 'date and items array are required', null, 400);
    }
    const result = await attendanceService.markBatchStaffAttendance(req.tenantId!, req.user!.userId, date, items);
    return sendSuccess(res, result, 'Staff attendance recorded successfully');
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

attendanceRouter.get('/staff/monthly-summary', requirePermission(PermissionCode.ATTENDANCE_STAFF_VIEW), async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return sendError(res, 'VALIDATION_ERROR', 'month and year are required', null, 400);
    }
    const result = await attendanceService.getStaffMonthlyAttendanceSummary(
      req.tenantId!,
      parseInt(month as string, 10),
      parseInt(year as string, 10)
    );
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
