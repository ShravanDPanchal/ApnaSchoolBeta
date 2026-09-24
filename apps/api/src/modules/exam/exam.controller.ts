import { Router, Request, Response } from 'express';
import { examService } from './exam.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const examRouter = Router();

examRouter.use(authMiddleware);

// --- EXAM TYPES ---
examRouter.get('/types', requirePermission(PermissionCode.EXAM_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const types = await examService.getExamTypes(req.tenantId!, academicYearId as string);
    return sendSuccess(res, types);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

examRouter.post('/types', requirePermission(PermissionCode.EXAM_MANAGE), async (req: Request, res: Response) => {
  try {
    const type = await examService.createExamType(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, type, 'Exam type created successfully');
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// --- GRADE CONFIGS ---
examRouter.get('/grades', requirePermission(PermissionCode.EXAM_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const grades = await examService.getGradeConfigs(req.tenantId!, academicYearId as string);
    return sendSuccess(res, grades);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// --- EXAM SCHEDULES ---
examRouter.get('/schedules', requirePermission(PermissionCode.EXAM_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId, classId, examTypeId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const schedules = await examService.getExams(
      req.tenantId!,
      academicYearId as string,
      classId as string | undefined,
      examTypeId as string | undefined
    );
    return sendSuccess(res, schedules);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

examRouter.post('/schedules', requirePermission(PermissionCode.EXAM_MANAGE), async (req: Request, res: Response) => {
  try {
    const schedule = await examService.createExamSchedule(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, schedule, 'Exam schedule created successfully');
  } catch (err: any) {
    return sendError(res, 'VALIDATION_ERROR', err.message, null, 400);
  }
});

// --- MARKS ENTRY ---
examRouter.get('/roster/:examId', requirePermission(PermissionCode.EXAM_MARKS_ENTRY), async (req: Request, res: Response) => {
  try {
    const roster = await examService.getExamMarksRoster(req.tenantId!, req.params.examId);
    return sendSuccess(res, roster);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

examRouter.post('/marks/batch', requirePermission(PermissionCode.EXAM_MARKS_ENTRY), async (req: Request, res: Response) => {
  try {
    const { examId, items } = req.body;
    if (!examId || !Array.isArray(items)) {
      return sendError(res, 'VALIDATION_ERROR', 'examId and items array are required', null, 400);
    }
    const result = await examService.saveBatchMarks(req.tenantId!, req.user!.userId, examId, items);
    return sendSuccess(res, result, 'Marks recorded successfully');
  } catch (err: any) {
    return sendError(res, 'VALIDATION_ERROR', err.message, null, 400);
  }
});

// --- CLASS RESULTS & RANKING ---
examRouter.get('/results/class', requirePermission(PermissionCode.EXAM_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId, classId, examTypeId, divisionId } = req.query;
    if (!academicYearId || !classId || !examTypeId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId, classId, and examTypeId are required', null, 400);
    }
    const results = await examService.getClassResults(
      req.tenantId!,
      academicYearId as string,
      classId as string,
      examTypeId as string,
      divisionId as string | undefined
    );
    return sendSuccess(res, results);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// --- STUDENT PROGRESS REPORT CARD (પ્રગતિ પત્રક) ---
examRouter.get('/report-card/:studentId', requirePermission(PermissionCode.EXAM_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId, examTypeId } = req.query;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required', null, 400);
    }
    const reportCard = await examService.getStudentReportCard(
      req.tenantId!,
      req.params.studentId,
      academicYearId as string,
      examTypeId as string | undefined
    );
    return sendSuccess(res, reportCard);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
