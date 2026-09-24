import { Router, Request, Response } from 'express';
import { feesService } from './fees.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';

export const feesRouter = Router();

feesRouter.use(authMiddleware);

// --- FEE HEADS ---
feesRouter.get('/heads', requirePermission(PermissionCode.FEES_VIEW), async (req: Request, res: Response) => {
  try {
    const heads = await feesService.getFeeHeads(req.tenantId!);
    return sendSuccess(res, heads);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

feesRouter.post('/heads', requirePermission(PermissionCode.FEES_STRUCTURE_MANAGE), async (req: Request, res: Response) => {
  try {
    const head = await feesService.createFeeHead(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, head, 'Fee head created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'VALIDATION_ERROR', err.message, null, 400);
  }
});

// --- FEE STRUCTURES ---
feesRouter.get('/structures', requirePermission(PermissionCode.FEES_VIEW), async (req: Request, res: Response) => {
  try {
    const { academicYearId, classId } = req.query;
    const structures = await feesService.getFeeStructures(req.tenantId!, academicYearId as string, classId as string);
    return sendSuccess(res, structures);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

feesRouter.post('/structures', requirePermission(PermissionCode.FEES_STRUCTURE_MANAGE), async (req: Request, res: Response) => {
  try {
    const structure = await feesService.createFeeStructure(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, structure, 'Fee structure created successfully', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'VALIDATION_ERROR', err.message, null, 400);
  }
});

// --- STUDENT FEES & DISCOUNTS / FINES ---
feesRouter.get('/student/:studentId', requirePermission(PermissionCode.FEES_VIEW), async (req: Request, res: Response) => {
  try {
    const fees = await feesService.getStudentFees(req.tenantId!, req.params.studentId);
    return sendSuccess(res, fees);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

feesRouter.post('/discount', requirePermission(PermissionCode.FEES_STRUCTURE_MANAGE), async (req: Request, res: Response) => {
  try {
    const result = await feesService.applyDiscountOrConcession(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, result, 'Discount/Concession applied successfully');
  } catch (err: any) {
    return sendError(res, 'VALIDATION_ERROR', err.message, null, 400);
  }
});

feesRouter.post('/fine', requirePermission(PermissionCode.FEES_STRUCTURE_MANAGE), async (req: Request, res: Response) => {
  try {
    const result = await feesService.applyLateFine(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, result, 'Late fine applied successfully');
  } catch (err: any) {
    return sendError(res, 'VALIDATION_ERROR', err.message, null, 400);
  }
});

// --- FEE COLLECTION & REFUND ---
feesRouter.post('/collect', requirePermission(PermissionCode.FEES_COLLECT), async (req: Request, res: Response) => {
  try {
    const payment = await feesService.collectFee(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, payment, 'Fee collected and receipt generated', undefined, 201);
  } catch (err: any) {
    return sendError(res, 'PAYMENT_FAILED', err.message, null, 400);
  }
});

feesRouter.post('/refund', requirePermission(PermissionCode.FEES_REFUND), async (req: Request, res: Response) => {
  try {
    const result = await feesService.refundOrCancelPayment(req.tenantId!, req.user!.userId, req.body);
    return sendSuccess(res, result, 'Fee payment cancelled/refunded and accounting ledger reversed');
  } catch (err: any) {
    return sendError(res, 'REFUND_FAILED', err.message, null, 400);
  }
});

feesRouter.get('/receipt/:paymentId', requirePermission(PermissionCode.FEES_VIEW), async (req: Request, res: Response) => {
  try {
    const receipt = await feesService.getReceiptDetails(req.tenantId!, req.params.paymentId);
    return sendSuccess(res, receipt);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

feesRouter.get('/payments', requirePermission(PermissionCode.FEES_VIEW), async (req: Request, res: Response) => {
  try {
    const payments = await feesService.getRecentPayments(req.tenantId!);
    return sendSuccess(res, payments);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

feesRouter.get('/outstanding', requirePermission(PermissionCode.FEES_VIEW), async (req: Request, res: Response) => {
  try {
    const { classId } = req.query;
    const summary = await feesService.getOutstandingFeesSummary(req.tenantId!, classId as string);
    return sendSuccess(res, summary);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

// --- COLLECTION REPORTS ---
feesRouter.get('/reports/daily', requirePermission(PermissionCode.REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date) {
      return sendError(res, 'VALIDATION_ERROR', 'date (YYYY-MM-DD) is required', null, 400);
    }
    const report = await feesService.getDailyCollectionReport(req.tenantId!, date as string);
    return sendSuccess(res, report);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});

feesRouter.get('/reports/monthly', requirePermission(PermissionCode.REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return sendError(res, 'VALIDATION_ERROR', 'month and year are required', null, 400);
    }
    const report = await feesService.getMonthlyCollectionReport(
      req.tenantId!,
      parseInt(month as string, 10),
      parseInt(year as string, 10)
    );
    return sendSuccess(res, report);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
