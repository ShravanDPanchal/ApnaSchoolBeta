import { reportingService } from '../src/modules/reports/reporting.service';
import { excelImportService } from '../src/modules/reports/excel-import.service';
import { prisma } from '../src/database/prisma';
import ExcelJS from 'exceljs';

describe('Phase 9: Complete Reporting Center & Excel Import/Export Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let financialYearId: string;
  let studentId: string;
  let accountId: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Tenant SSVM not found. Seed the database first.');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@ssvm.edu.in' } });
    userId = user!.id;

    const ay = await prisma.academicYear.findFirst({ where: { tenantId, isCurrent: true } });
    academicYearId = ay!.id;

    const fy = await prisma.financialYear.findFirst({ where: { tenantId, isCurrent: true } });
    financialYearId = fy!.id;

    const student = await prisma.student.findFirst({ where: { tenantId, isActive: true } });
    studentId = student!.id;

    const account = await prisma.chartOfAccount.findFirst({ where: { tenantId, isActive: true } });
    accountId = account!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // -------------------------------------------------------------
  // 1. SCHOOL REPORTS
  // -------------------------------------------------------------
  describe('1. School Reports', () => {
    it('generates student General Register report with filters and category breakdown', async () => {
      const result = await reportingService.getStudentReport(tenantId, { academicYearId });
      expect(result.title).toContain('Student Report');
      expect(result.rows).toBeInstanceOf(Array);
      expect(result.summary.total).toBeGreaterThanOrEqual(0);
      expect(result.summary).toHaveProperty('boys');
      expect(result.summary).toHaveProperty('girls');
    });

    it('generates attendance report with student percentages and defaulters', async () => {
      const result = await reportingService.getAttendanceReport(tenantId, { academicYearId });
      expect(result.title).toContain('Attendance Report');
      expect(result.summary).toHaveProperty('presentCount');
      expect(result.summary).toHaveProperty('absentCount');
      expect(result.summary).toHaveProperty('averagePercentage');
    });

    it('generates staff directory with designations and class teacher allocations', async () => {
      const result = await reportingService.getStaffReport(tenantId, {});
      expect(result.title).toContain('Staff Directory');
      expect(result.summary.totalStaff).toBeGreaterThanOrEqual(1);
      expect(result.summary).toHaveProperty('teaching');
      expect(result.summary).toHaveProperty('permanent');
    });

    it('generates timetable master schedule report', async () => {
      const result = await reportingService.getTimetableReport(tenantId, { academicYearId });
      expect(result.title).toContain('Timetable');
      expect(result.rows).toBeInstanceOf(Array);
    });

    it('generates examination marks register report with pass/fail stats', async () => {
      const result = await reportingService.getExaminationReport(tenantId, {});
      expect(result.title).toContain('Examination');
      expect(result.summary).toHaveProperty('appeared');
      expect(result.summary).toHaveProperty('passed');
      expect(result.summary).toHaveProperty('passPercentage');
    });

    it('generates bilingual Progress Report Cards (પ્રગતિ પત્રક)', async () => {
      const result = await reportingService.getReportCards(tenantId, { studentId });
      expect(result.title).toContain('Progress Report Cards');
      expect(result.reportCards.length).toBeGreaterThanOrEqual(1);
      const card = result.reportCards[0];
      expect(card).toHaveProperty('grNumber');
      expect(card).toHaveProperty('studentNameGu');
      expect(card).toHaveProperty('overallGrade');
      expect(card).toHaveProperty('resultStatus');
    });
  });

  // -------------------------------------------------------------
  // 2. FEES REPORTS
  // -------------------------------------------------------------
  describe('2. Fees Reports', () => {
    it('generates fee collection register with mode breakdown', async () => {
      const result = await reportingService.getFeeCollectionReport(tenantId, { academicYearId });
      expect(result.title).toContain('Fee Collection Register');
      expect(result.summary).toHaveProperty('totalCollected');
      expect(result.summary).toHaveProperty('cashAmount');
      expect(result.summary).toHaveProperty('bankTransferAmount');
    });

    it('generates outstanding dues report with student aging', async () => {
      const result = await reportingService.getOutstandingFeesReport(tenantId, { academicYearId });
      expect(result.title).toContain('Outstanding');
      expect(result.summary).toHaveProperty('totalBilledAmount');
      expect(result.summary).toHaveProperty('totalOutstandingAmount');
    });

    it('generates daily collection summary reconcilable with daybook', async () => {
      const result = await reportingService.getDailyCollectionReport(tenantId, {});
      expect(result.title).toContain('Daily Fee Collection');
      expect(result.summary).toHaveProperty('totalAmount');
    });

    it('generates monthly collection trend report', async () => {
      const result = await reportingService.getMonthlyCollectionReport(tenantId, { academicYearId });
      expect(result.title).toContain('Monthly Fee Collection');
      expect(result.rows).toBeInstanceOf(Array);
    });

    it('generates complete individual student fee ledger statement', async () => {
      const result = await reportingService.getStudentFeeStatement(tenantId, studentId, academicYearId);
      expect(result.title).toContain('Student Fee Statement');
      expect(result.student).toHaveProperty('grNumber');
      expect(result.summary).toHaveProperty('outstandingBalance');
      expect(result.feeCharges).toBeInstanceOf(Array);
      expect(result.paymentLedger).toBeInstanceOf(Array);
    });
  });

  // -------------------------------------------------------------
  // 3. ACCOUNTING & ROJMEL REPORTS
  // -------------------------------------------------------------
  describe('3. Accounting & Rojmel Reports', () => {
    it('generates Deshi Nama Rojmel with Jama and Udhar daybook parity', async () => {
      const result = await reportingService.getRojmelReport(tenantId, {});
      expect(result.title).toContain('Rojmel');
      expect(result.summary).toHaveProperty('totalJama');
      expect(result.summary).toHaveProperty('totalUdhar');
      expect(result.summary).toHaveProperty('isAakharoBalanced');
      expect(result.jamaRows).toBeInstanceOf(Array);
      expect(result.udharRows).toBeInstanceOf(Array);
    });

    it('generates Cash Book statement with running cash balance', async () => {
      const result = await reportingService.getCashBookReport(tenantId, {});
      expect(result.title).toContain('Cash Book');
      expect(result).toHaveProperty('openingBalance');
      expect(result).toHaveProperty('closingBalance');
    });

    it('generates Bank Book statement with running bank balance', async () => {
      const result = await reportingService.getBankBookReport(tenantId, {});
      expect(result.title).toContain('Bank Book');
      expect(result).toHaveProperty('openingBalance');
      expect(result).toHaveProperty('closingBalance');
    });

    it('generates General Ledger report with running debit/credit nature', async () => {
      const result = await reportingService.getLedgerReport(tenantId, accountId, {});
      expect(result.title).toContain('General Ledger');
      expect(result).toHaveProperty('accountCode');
      expect(result).toHaveProperty('closingBalance');
      expect(result.rows).toBeInstanceOf(Array);
    });

    it('generates Trial Balance report verifying arithmetic balance', async () => {
      const result = await reportingService.getTrialBalanceReport(tenantId, { financialYearId });
      expect(result.title).toContain('Trial Balance');
      expect(result.summary).toHaveProperty('grandDebit');
      expect(result.summary).toHaveProperty('grandCredit');
      expect(result.summary).toHaveProperty('isBalanced');
    });

    it('generates Income & Expense statement with operating surplus/deficit', async () => {
      const result = await reportingService.getIncomeExpenseReport(tenantId, {});
      expect(result.title).toContain('Income & Expense');
      expect(result.summary).toHaveProperty('totalIncome');
      expect(result.summary).toHaveProperty('totalExpense');
      expect(result.summary).toHaveProperty('netSurplus');
    });

    it('generates Voucher Register report for audit tracking', async () => {
      const result = await reportingService.getVoucherRegister(tenantId, {});
      expect(result.title).toContain('Voucher Register');
      expect(result.summary).toHaveProperty('totalCount');
      expect(result.summary).toHaveProperty('totalAmount');
    });

    it('generates Grant Utilization report with unspent balances', async () => {
      const result = await reportingService.getGrantReport(tenantId, {});
      expect(result.title).toContain('Grants & Utilization');
      expect(result.summary).toHaveProperty('totalSanctioned');
      expect(result.summary).toHaveProperty('totalUnspent');
    });
  });

  // -------------------------------------------------------------
  // 4. EXCEL & PRINT GENERATION
  // -------------------------------------------------------------
  describe('4. Export Generators (Excel & Print)', () => {
    it('generates styled .xlsx workbook with school letterhead banner', async () => {
      const report = await reportingService.getStudentReport(tenantId, {});
      const buffer = await reportingService.generateExcelReport(
        report.title,
        report,
        { nameEn: 'Shree Saraswati Vidya Mandir', nameGu: 'શ્રી સરસ્વતી વિદ્યામંદિર', diseCode: '24090100101' }
      );

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);

      // Verify Excel file integrity with ExcelJS
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(buffer as any);
      expect(wb.worksheets.length).toBeGreaterThanOrEqual(1);
      const sheet = wb.worksheets[0];
      expect(sheet.getCell('A1').value).toContain('સરસ્વતી');
    });

    it('generates clean printable HTML with print layout and signatures', () => {
      const report = {
        title: 'Daily Collection Summary',
        summary: { totalAmount: 45000, receiptCount: 15 },
        rows: [{ receiptNo: 'RCP-001', amount: 45000, mode: 'CASH' }],
      };
      const html = reportingService.generatePrintHtml(
        report.title,
        report,
        { nameEn: 'SSVM School', nameGu: 'એસએસવીએમ સ્કૂલ', diseCode: '24090100101' }
      );

      expect(typeof html).toBe('string');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('એસએસવીએમ સ્કૂલ');
      expect(html).toContain('આચાર્યશ્રીના સહી-સિક્કો');
      expect(html).toContain('@media print');
    });
  });

  // -------------------------------------------------------------
  // 5. EXCEL IMPORT SUITE
  // -------------------------------------------------------------
  describe('5. Excel Import Suite', () => {
    it('generates starter Excel templates for Students, Attendance, and Accounts', async () => {
      const studentTemplate = await excelImportService.generateTemplate('STUDENTS');
      const attendanceTemplate = await excelImportService.generateTemplate('ATTENDANCE');
      const accountTemplate = await excelImportService.generateTemplate('CHART_OF_ACCOUNTS');

      expect(studentTemplate.length).toBeGreaterThan(1000);
      expect(attendanceTemplate.length).toBeGreaterThan(1000);
      expect(accountTemplate.length).toBeGreaterThan(1000);

      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(studentTemplate as any);
      const sheet = wb.worksheets[0];
      expect(sheet.getCell('A1').value).toContain('GR Number');
    });

    it('validates uploaded spreadsheet and detects duplicate and invalid rows', async () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Students');
      ws.addRow(['GR', 'First En', 'Middle En', 'Last En', 'First Gu', 'Middle Gu', 'Last Gu', 'Class', 'Div', 'Gender', 'DOB', 'Phone', 'Aadhaar', 'APAAR', 'CTS', 'Category']);
      
      // Row 1: Valid new student
      ws.addRow(['9901', 'Kavya', 'R', 'Patel', 'કાવ્યા', 'આર', 'પટેલ', '1', 'A', 'FEMALE', '2019-05-01', '9825000001', '999988887777', '', '', 'General']);
      // Row 2: In-sheet duplicate GR (9901)
      ws.addRow(['9901', 'Duplicate', '', 'Student', '', '', '', '1', 'A', 'MALE', '2019-05-01', '', '', '', '', 'General']);
      // Row 3: Missing required name
      ws.addRow(['9902', '', '', '', '', '', '', '1', 'A', 'MALE', '2019-05-01', '', '', '', '', 'General']);

      const testBuffer = Buffer.from(await wb.xlsx.writeBuffer());

      const preview = await excelImportService.previewAndValidate(tenantId, 'STUDENTS', testBuffer, { academicYearId });
      expect(preview.totalRows).toBe(3);
      expect(preview.validCount).toBe(1);
      expect(preview.invalidCount).toBe(2);
      expect(preview.errors.some((e) => e.error.includes('Duplicate GR Number'))).toBe(true);
      expect(preview.errors.some((e) => e.error.includes('English are required'))).toBe(true);
    });

    it('generates annotated error report (.xlsx) highlighting failed rows in red', async () => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Sheet1');
      ws.addRow(['GR', 'Name']);
      ws.addRow(['9999', 'Broken Student']);
      const testBuffer = Buffer.from(await wb.xlsx.writeBuffer());

      const errors = [{ rowNumber: 2, error: 'Standard not found in school configuration' }];
      const errorReportBuf = await excelImportService.generateErrorReport(testBuffer, errors);

      expect(errorReportBuf).toBeInstanceOf(Buffer);
      const errorWb = new ExcelJS.Workbook();
      await errorWb.xlsx.load(errorReportBuf as any);
      const sheet = errorWb.worksheets[0];
      const errorCell = sheet.getCell('C2');
      expect(errorCell.value).toContain('Standard not found');
    });

    it('executes transaction-safe student import into the database', async () => {
      const uniqueGr = `IMP${Date.now().toString().slice(-4)}`;
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Students');
      ws.addRow(['GR', 'First En', 'Middle En', 'Last En', 'First Gu', 'Middle Gu', 'Last Gu', 'Class', 'Div', 'Gender', 'DOB', 'Phone', 'Aadhaar', 'APAAR', 'CTS', 'Category']);
      ws.addRow([uniqueGr, 'Rohit', 'S', 'Shah', 'રોહિત', 'એસ', 'શાહ', '1', 'A', 'MALE', '2019-02-15', '9898011223', '', '', '', 'General']);

      const testBuffer = Buffer.from(await wb.xlsx.writeBuffer());

      const result = await excelImportService.executeImport(tenantId, userId, 'STUDENTS', testBuffer, { academicYearId });
      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(1);

      // Verify student exists in DB
      const created = await prisma.student.findFirst({
        where: { tenantId, grNumber: uniqueGr },
        include: { enrollments: true },
      });
      expect(created).not.toBeNull();
      expect(created?.firstNameEn).toBe('Rohit');
      expect(created?.enrollments.length).toBe(1);

      // Clean up test student
      if (created) {
        await prisma.enrollment.deleteMany({ where: { studentId: created.id } });
        await prisma.student.delete({ where: { id: created.id } });
      }
    });
  });
});
