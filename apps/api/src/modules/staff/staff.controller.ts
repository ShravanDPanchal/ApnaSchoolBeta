import { Router, Request, Response } from 'express';
import { staffService } from './staff.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const staffRouter = Router();

staffRouter.use(authMiddleware);

staffRouter.get('/', requirePermission(PermissionCode.STAFF_VIEW), async (req: Request, res: Response) => {
  try {
    const { staffType } = req.query;
    const staff = await staffService.getStaffList(req.tenantId!, staffType as string);
    return sendSuccess(res, staff);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

staffRouter.get('/export/excel', requirePermission(PermissionCode.STAFF_VIEW), async (req: Request, res: Response) => {
  try {
    const workbook = await staffService.exportStaffExcel(req.tenantId!);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=staff_list.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

staffRouter.get('/:id', requirePermission(PermissionCode.STAFF_VIEW), async (req: Request, res: Response) => {
  try {
    const staff = await staffService.getStaffById(req.tenantId!, req.params.id);
    return sendSuccess(res, staff);
  } catch (err: any) {
    if (err.message === 'STAFF_NOT_FOUND') {
      return sendError(res, 'NOT_FOUND', 'Staff member not found', null, 404);
    }
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

staffRouter.post('/', requirePermission(PermissionCode.STAFF_CREATE), async (req: Request, res: Response) => {
  try {
    const staff = await staffService.createStaff(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, staff, 'Staff member added successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'CREATION_FAILED', err.message, null, 400);
  }
});

staffRouter.patch('/:id', requirePermission(PermissionCode.STAFF_UPDATE), async (req: Request, res: Response) => {
  try {
    const staff = await staffService.updateStaff(req.tenantId!, req.user!.userId, req.params.id, req.body);
    return sendSuccess(res, staff, 'Staff updated successfully');
  } catch (err: any) {
    return sendError(res, 'UPDATE_FAILED', err.message, null, 400);
  }
});

staffRouter.post('/assign', requirePermission(PermissionCode.STAFF_ASSIGN, PermissionCode.STAFF_UPDATE), async (req: Request, res: Response) => {
  try {
    const assignment = await staffService.assignTeacher(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, assignment, 'Teacher assigned to class & subject successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'ASSIGNMENT_FAILED', err.message, null, 400);
  }
});
