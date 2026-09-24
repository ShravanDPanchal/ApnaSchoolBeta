import { Router, Request, Response } from 'express';
import multer from 'multer';
import { reportsService } from './reports.service';
import { reportingService, ReportFilterDto } from './reporting.service';
import { excelImportService } from './excel-import.service';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { requirePermission } from '../../common/guards/permissions.guard';
import { PermissionCode } from '@apna-school/shared-types';
import { sendSuccess, sendError } from '../../common/utils/response';
import { prisma } from '../../database/prisma';

export const reportsRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

reportsRouter.use(authMiddleware);

// =========================================================================
// 1. SCHOOL REPORTS
// =========================================================================

reportsRouter.get('/school/:type', requirePermission(PermissionCode.REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const format = (req.query.format as string) || 'json';
    const filters: ReportFilterDto = req.query as any;
    const tenantId = req.tenantId!;

    const school = await prisma.school.findFirst({ where: { tenantId } });

    let reportResult: any;
    switch (type.toLowerCase()) {
      case 'students':
        reportResult = await reportingService.getStudentReport(tenantId, filters);
        break;
      case 'attendance':
        reportResult = await reportingService.getAttendanceReport(tenantId, filters);
        break;
      case 'staff':
        reportResult = await reportingService.getStaffReport(tenantId, filters);
        break;
      case 'timetable':
        reportResult = await reportingService.getTimetableReport(tenantId, filters);
        break;
      case 'examination':
      case 'exams':
        reportResult = await reportingService.getExaminationReport(tenantId, filters);
        break;
      case 'report-cards':
        reportResult = await reportingService.getReportCards(tenantId, filters);
        break;
      default:
        return sendError(res, 'INVALID_REPORT_TYPE', `Unknown school report: ${type}`, null, 400);
    }

    if (format === 'excel') {
      const buffer = await reportingService.generateExcelReport(
        reportResult.title || `${type.toUpperCase()} Report`,
        reportResult,
        school || undefined
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'print') {
      const html = reportingService.generatePrintHtml(
        reportResult.title || `${type.toUpperCase()} Report`,
        reportResult,
        school || undefined
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }

    return sendSuccess(res, reportResult);
  } catch (err: any) {
    return sendError(res, 'REPORT_ERROR', err.message, null, 500);
  }
});

// =========================================================================
// 2. FEES REPORTS
// =========================================================================

reportsRouter.get('/fees/:type', requirePermission(PermissionCode.FEES_VIEW, PermissionCode.REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const format = (req.query.format as string) || 'json';
    const filters: ReportFilterDto = req.query as any;
    const tenantId = req.tenantId!;

    const school = await prisma.school.findFirst({ where: { tenantId } });

    let reportResult: any;
    switch (type.toLowerCase()) {
      case 'collection':
        reportResult = await reportingService.getFeeCollectionReport(tenantId, filters);
        break;
      case 'outstanding':
        reportResult = await reportingService.getOutstandingFeesReport(tenantId, filters);
        break;
      case 'daily':
        reportResult = await reportingService.getDailyCollectionReport(tenantId, filters);
        break;
      case 'monthly':
        reportResult = await reportingService.getMonthlyCollectionReport(tenantId, filters);
        break;
      case 'student-statement':
        if (!filters.studentId) {
          return sendError(res, 'STUDENT_ID_REQUIRED', 'studentId query param is required for student statement', null, 400);
        }
        reportResult = await reportingService.getStudentFeeStatement(tenantId, filters.studentId, filters.academicYearId);
        break;
      default:
        return sendError(res, 'INVALID_REPORT_TYPE', `Unknown fees report: ${type}`, null, 400);
    }

    if (format === 'excel') {
      const buffer = await reportingService.generateExcelReport(
        reportResult.title || `${type.toUpperCase()} Report`,
        reportResult,
        school || undefined
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="fee_${type}_report.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'print') {
      const html = reportingService.generatePrintHtml(
        reportResult.title || `${type.toUpperCase()} Report`,
        reportResult,
        school || undefined
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }

    return sendSuccess(res, reportResult);
  } catch (err: any) {
    return sendError(res, 'REPORT_ERROR', err.message, null, 500);
  }
});

// =========================================================================
// 3. ACCOUNTING & ROJMEL REPORTS
// =========================================================================

reportsRouter.get('/accounting/:type', requirePermission(PermissionCode.ACCOUNTING_REPORTS_VIEW, PermissionCode.REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const format = (req.query.format as string) || 'json';
    const filters: ReportFilterDto = req.query as any;
    const tenantId = req.tenantId!;

    const school = await prisma.school.findFirst({ where: { tenantId } });

    let reportResult: any;
    switch (type.toLowerCase()) {
      case 'rojmel':
        reportResult = await reportingService.getRojmelReport(tenantId, filters);
        break;
      case 'cash-book':
        reportResult = await reportingService.getCashBookReport(tenantId, filters);
        break;
      case 'bank-book':
        reportResult = await reportingService.getBankBookReport(tenantId, filters);
        break;
      case 'ledger':
      case 'account-statement':
        if (!filters.accountId) {
          // If no specific accountId is passed, pick the first active account or return an overview
          const firstAccount = await prisma.chartOfAccount.findFirst({ where: { tenantId, isActive: true } });
          if (!firstAccount) {
            return sendError(res, 'ACCOUNT_NOT_FOUND', 'No accounts found to generate ledger.', null, 404);
          }
          reportResult = await reportingService.getLedgerReport(tenantId, firstAccount.id, filters);
        } else {
          reportResult = await reportingService.getLedgerReport(tenantId, filters.accountId, filters);
        }
        break;
      case 'trial-balance':
        reportResult = await reportingService.getTrialBalanceReport(tenantId, filters);
        break;
      case 'income-expense':
        reportResult = await reportingService.getIncomeExpenseReport(tenantId, filters);
        break;
      case 'voucher-register':
        reportResult = await reportingService.getVoucherRegister(tenantId, filters);
        break;
      case 'receipt-register':
        reportResult = await reportingService.getVoucherRegister(tenantId, filters, 'RECEIPT');
        break;
      case 'payment-register':
        reportResult = await reportingService.getVoucherRegister(tenantId, filters, 'PAYMENT');
        break;
      case 'grant-report':
        reportResult = await reportingService.getGrantReport(tenantId, filters);
        break;
      default:
        return sendError(res, 'INVALID_REPORT_TYPE', `Unknown accounting report: ${type}`, null, 400);
    }

    if (format === 'excel') {
      const buffer = await reportingService.generateExcelReport(
        reportResult.title || `${type.toUpperCase()} Report`,
        reportResult,
        school || undefined
      );
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="accounting_${type}_report.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'print') {
      const html = reportingService.generatePrintHtml(
        reportResult.title || `${type.toUpperCase()} Report`,
        reportResult,
        school || undefined
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }

    return sendSuccess(res, reportResult);
  } catch (err: any) {
    return sendError(res, 'REPORT_ERROR', err.message, null, 500);
  }
});

// =========================================================================
// 4. EXCEL IMPORT SUITE
// =========================================================================

// Download Template
reportsRouter.get('/import/template/:entity', requirePermission(PermissionCode.STUDENTS_IMPORT, PermissionCode.REPORTS_VIEW, PermissionCode.ACCOUNTING_COA_MANAGE), async (req: Request, res: Response) => {
  try {
    const { entity } = req.params;
    const buffer = await excelImportService.generateTemplate(entity);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${entity.toLowerCase()}_template.xlsx"`);
    return res.send(buffer);
  } catch (err: any) {
    return sendError(res, 'TEMPLATE_ERROR', err.message, null, 400);
  }
});

// Preview & Validate File
reportsRouter.post('/import/preview/:entity', requirePermission(PermissionCode.STUDENTS_IMPORT, PermissionCode.ACCOUNTING_COA_MANAGE, PermissionCode.EXAM_MANAGE), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { entity } = req.params;
    if (!req.file) {
      return sendError(res, 'FILE_REQUIRED', 'Please upload an Excel (.xlsx) file.', null, 400);
    }

    const preview = await excelImportService.previewAndValidate(req.tenantId!, entity, req.file.buffer, {
      academicYearId: req.body.academicYearId,
      financialYearId: req.body.financialYearId,
    });

    return sendSuccess(res, preview);
  } catch (err: any) {
    return sendError(res, 'PREVIEW_ERROR', err.message, null, 400);
  }
});

// Generate Annotated Error Report
reportsRouter.post('/import/error-report', requirePermission(PermissionCode.STUDENTS_IMPORT, PermissionCode.REPORTS_EXPORT), upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'FILE_REQUIRED', 'Excel file is required.', null, 400);
    }

    let errors = [];
    try {
      errors = typeof req.body.errors === 'string' ? JSON.parse(req.body.errors) : req.body.errors || [];
    } catch {
      errors = [];
    }

    const buffer = await excelImportService.generateErrorReport(req.file.buffer, errors);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="import_errors_annotated.xlsx"');
    return res.send(buffer);
  } catch (err: any) {
    return sendError(res, 'ERROR_REPORT_FAILED', err.message, null, 500);
  }
});

// Commit Transaction-Safe Bulk Import
reportsRouter.post('/import/commit/:entity', requirePermission(PermissionCode.STUDENTS_IMPORT, PermissionCode.ACCOUNTING_COA_MANAGE, PermissionCode.EXAM_MANAGE), upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { entity } = req.params;
    if (!req.file) {
      return sendError(res, 'FILE_REQUIRED', 'Excel file is required.', null, 400);
    }

    const result = await excelImportService.executeImport(req.tenantId!, req.user!.userId, entity, req.file.buffer, {
      academicYearId: req.body.academicYearId,
      financialYearId: req.body.financialYearId,
    });

    if (!result.success) {
      return sendError(res, 'IMPORT_FAILED', 'Import rejected due to validation errors.', result, 422);
    }

    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, 'IMPORT_ERROR', err.message, null, 500);
  }
});

// =========================================================================
// 5. GOVERNMENT PORTAL EXPORTS (Existing backwards compatibility)
// =========================================================================

reportsRouter.get('/gov-export/:portal', requirePermission(PermissionCode.REPORTS_VIEW), async (req: Request, res: Response) => {
  try {
    const portal = req.params.portal.toUpperCase() as any;
    const { format } = req.query;

    if (format === 'csv') {
      const csv = await reportsService.exportGovernmentCSV(req.tenantId!, portal);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${portal.toLowerCase()}_export.csv`);
      return res.send(csv);
    }

    const data = await reportsService.getGovernmentExportData(req.tenantId!, portal);
    return sendSuccess(res, data);
  } catch (err: any) {
    return sendError(res, 'SERVER_ERROR', err.message, null, 500);
  }
});
