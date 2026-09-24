import { Router, Request, Response } from 'express';
import multer from 'multer';
import { studentService } from './student.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const studentRouter = Router();

studentRouter.use(authMiddleware);

studentRouter.get('/', requirePermission(PermissionCode.STUDENTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { classId, divisionId, academicYearId, status, search, page, limit } = req.query;
    const result = await studentService.getStudents(req.tenantId!, {
      classId: classId as string,
      divisionId: divisionId as string,
      academicYearId: academicYearId as string,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });
    return sendSuccess(res, result.students, undefined, result.meta);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

studentRouter.get('/import-template', requirePermission(PermissionCode.STUDENTS_IMPORT, PermissionCode.STUDENTS_CREATE), async (req: Request, res: Response) => {
  try {
    const workbook = await studentService.getImportTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student_import_template.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

studentRouter.post('/import', requirePermission(PermissionCode.STUDENTS_CREATE, PermissionCode.STUDENTS_IMPORT), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return sendError(res, 'VALIDATION_ERROR', 'No Excel file provided in request', null, 400);
    }
    const { academicYearId } = req.body;
    if (!academicYearId) {
      return sendError(res, 'VALIDATION_ERROR', 'academicYearId is required for import', null, 400);
    }

    const result = await studentService.importStudentsFromBuffer(req.tenantId!, req.user!.userId, academicYearId, req.file.buffer);
    return sendSuccess(res, result, `Successfully processed import (${result.importedCount} imported)`);
  } catch (err: any) {
    return sendError(res, 'IMPORT_FAILED', err.message, null, 400);
  }
});

studentRouter.post('/promote', requirePermission(PermissionCode.STUDENTS_UPDATE), async (req: Request, res: Response) => {
  try {
    const result = await studentService.promoteStudents(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, result, `Successfully promoted ${result.promotedCount} students`);
  } catch (err: any) {
    return sendError(res, 'PROMOTION_FAILED', err.message, null, 400);
  }
});

studentRouter.post('/transfer', requirePermission(PermissionCode.STUDENTS_UPDATE), async (req: Request, res: Response) => {
  try {
    const result = await studentService.transferOrWithdrawStudent(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, result, 'Student transferred and Leaving Certificate issued');
  } catch (err: any) {
    return sendError(res, 'TRANSFER_FAILED', err.message, null, 400);
  }
});

studentRouter.get('/export/excel', requirePermission(PermissionCode.STUDENTS_EXPORT), async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    const workbook = await studentService.exportStudentsExcel(req.tenantId!, classId as string);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

studentRouter.get('/:id', requirePermission(PermissionCode.STUDENTS_VIEW), async (req: Request, res: Response) => {
  try {
    const student = await studentService.getStudentById(req.tenantId!, req.params.id);
    return sendSuccess(res, student);
  } catch (err: any) {
    if (err.message === 'STUDENT_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'Student not found', null, 404);
    }
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

studentRouter.post('/:id/documents', requirePermission(PermissionCode.STUDENTS_UPDATE), async (req: Request, res: Response) => {
  try {
    const doc = await studentService.addStudentDocument(req.tenantId!, req.user!.userId, req.params.id, req.body);
    return sendSuccess(res, doc, 'Document attached successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'UPLOAD_FAILED', err.message, null, 400);
  }
});

studentRouter.get('/:id/documents', requirePermission(PermissionCode.STUDENTS_VIEW), async (req: Request, res: Response) => {
  try {
    const docs = await studentService.getStudentDocuments(req.tenantId!, req.params.id);
    return sendSuccess(res, docs);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

studentRouter.post('/', requirePermission(PermissionCode.STUDENTS_CREATE), async (req: Request, res: Response) => {
  try {
    const student = await studentService.createStudent(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, student, 'Student created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'CREATION_FAILED', err.message, null, 400);
  }
});

studentRouter.patch('/:id', requirePermission(PermissionCode.STUDENTS_UPDATE), async (req: Request, res: Response) => {
  try {
    const student = await studentService.updateStudent(req.tenantId!, req.user!.userId, req.params.id, req.body);
    return sendSuccess(res, student, 'Student updated successfully');
  } catch (err: any) {
    return sendError(res, 'UPDATE_FAILED', err.message, null, 400);
  }
});
