import { prisma } from '../../database/prisma';
import ExcelJS from 'exceljs';
import { logAudit } from '../../common/utils/audit';

export interface ImportErrorDetail {
  rowNumber: number;
  identifier?: string;
  field?: string;
  error: string;
}

export interface ImportPreviewResult {
  entityType: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  previewRows: any[];
  errors: ImportErrorDetail[];
}

export class ExcelImportService {
  // =========================================================================
  // 1. STARTER TEMPLATE GENERATOR
  // =========================================================================

  async generateTemplate(entityType: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Apna School ERP';

    const sheet = workbook.addWorksheet('Template');

    switch (entityType.toUpperCase()) {
      case 'STUDENTS':
        sheet.columns = [
          { header: 'GR Number *', key: 'grNumber', width: 14 },
          { header: 'First Name En *', key: 'firstNameEn', width: 18 },
          { header: 'Middle Name En', key: 'middleNameEn', width: 18 },
          { header: 'Last Name En *', key: 'lastNameEn', width: 18 },
          { header: 'First Name Gu', key: 'firstNameGu', width: 18 },
          { header: 'Middle Name Gu', key: 'middleNameGu', width: 18 },
          { header: 'Last Name Gu', key: 'lastNameGu', width: 18 },
          { header: 'Class Order (1-12) *', key: 'classOrder', width: 18 },
          { header: 'Division (A/B/C)', key: 'division', width: 16 },
          { header: 'Gender (MALE/FEMALE) *', key: 'gender', width: 22 },
          { header: 'DOB (YYYY-MM-DD) *', key: 'dateOfBirth', width: 18 },
          { header: 'Phone', key: 'phone', width: 15 },
          { header: 'Aadhaar (12 digits)', key: 'aadhaar', width: 20 },
          { header: 'APAAR ID (12 digits)', key: 'apaar', width: 20 },
          { header: 'CTS Unique ID (18 digits)', key: 'cts', width: 24 },
          { header: 'Category (General/OBC/SC/ST/EWS)', key: 'category', width: 25 },
        ];

        sheet.addRow({
          grNumber: '1001',
          firstNameEn: 'Aarav',
          middleNameEn: 'Rajeshbhai',
          lastNameEn: 'Patel',
          firstNameGu: 'આરવ',
          middleNameGu: 'રાજેશભાઈ',
          lastNameGu: 'પટેલ',
          classOrder: 1,
          division: 'A',
          gender: 'MALE',
          dateOfBirth: '2019-06-15',
          phone: '9825012345',
          aadhaar: '240123456789',
          apaar: '123456789012',
          cts: '240901001010001001',
          category: 'General',
        });
        sheet.addRow({
          grNumber: '1002',
          firstNameEn: 'Diya',
          middleNameEn: 'Amitbhai',
          lastNameEn: 'Shah',
          firstNameGu: 'દિયા',
          middleNameGu: 'અમિતભાઈ',
          lastNameGu: 'શાહ',
          classOrder: 1,
          division: 'A',
          gender: 'FEMALE',
          dateOfBirth: '2019-09-20',
          phone: '9825098765',
          aadhaar: '240987654321',
          apaar: '987654321098',
          cts: '240901001010001002',
          category: 'General',
        });
        break;

      case 'ATTENDANCE':
        sheet.columns = [
          { header: 'Attendance Date (YYYY-MM-DD) *', key: 'date', width: 26 },
          { header: 'GR Number *', key: 'grNumber', width: 16 },
          { header: 'Status (PRESENT/ABSENT/LEAVE) *', key: 'status', width: 26 },
          { header: 'Remark', key: 'remark', width: 25 },
        ];
        sheet.addRow({ date: '2026-09-01', grNumber: '1001', status: 'PRESENT', remark: 'Regular' });
        sheet.addRow({ date: '2026-09-01', grNumber: '1002', status: 'ABSENT', remark: 'Sick leave' });
        break;

      case 'EXAM_MARKS':
        sheet.columns = [
          { header: 'Exam Type Name/Code *', key: 'examType', width: 22 },
          { header: 'GR Number *', key: 'grNumber', width: 16 },
          { header: 'Subject Code/Name *', key: 'subject', width: 20 },
          { header: 'Theory Marks', key: 'theoryMarks', width: 16 },
          { header: 'Practical Marks', key: 'practicalMarks', width: 16 },
          { header: 'Internal Marks', key: 'internalMarks', width: 16 },
          { header: 'Grace Marks', key: 'graceMarks', width: 15 },
          { header: 'Is Absent (YES/NO)', key: 'isAbsent', width: 18 },
        ];
        sheet.addRow({
          examType: 'Unit Test 1',
          grNumber: '1001',
          subject: 'GUJ',
          theoryMarks: 42,
          practicalMarks: 0,
          internalMarks: 8,
          graceMarks: 0,
          isAbsent: 'NO',
        });
        sheet.addRow({
          examType: 'Unit Test 1',
          grNumber: '1002',
          subject: 'GUJ',
          theoryMarks: 48,
          practicalMarks: 0,
          internalMarks: 9,
          graceMarks: 0,
          isAbsent: 'NO',
        });
        break;

      case 'FEE_STRUCTURE':
        sheet.columns = [
          { header: 'Class Order (1-12) *', key: 'classOrder', width: 18 },
          { header: 'Fee Head Code *', key: 'headCode', width: 18 },
          { header: 'Amount (₹) *', key: 'amount', width: 15 },
          { header: 'Due Date (YYYY-MM-DD)', key: 'dueDate', width: 22 },
          { header: 'Installment No', key: 'installmentNo', width: 16 },
        ];
        sheet.addRow({ classOrder: 1, headCode: 'TUTION', amount: 12000, dueDate: '2026-07-31', installmentNo: 1 });
        sheet.addRow({ classOrder: 1, headCode: 'COMP', amount: 1500, dueDate: '2026-07-31', installmentNo: 1 });
        break;

      case 'CHART_OF_ACCOUNTS':
        sheet.columns = [
          { header: 'Account Code *', key: 'code', width: 16 },
          { header: 'Account Name En *', key: 'nameEn', width: 24 },
          { header: 'Account Name Gu', key: 'nameGu', width: 24 },
          { header: 'Account Group Name *', key: 'groupName', width: 22 },
          { header: 'Account Nature (DEBIT/CREDIT) *', key: 'nature', width: 26 },
          { header: 'Opening Balance (₹)', key: 'openingBalance', width: 20 },
          { header: 'Is Bank Account (YES/NO)', key: 'isBank', width: 22 },
          { header: 'Is Cash Account (YES/NO)', key: 'isCash', width: 22 },
        ];
        sheet.addRow({
          code: '1001',
          nameEn: 'State Bank of India',
          nameGu: 'સ્ટેટ બેંક ઓફ ઈન્ડિયા',
          groupName: 'Bank Accounts',
          nature: 'DEBIT',
          openingBalance: 150000,
          isBank: 'YES',
          isCash: 'NO',
        });
        sheet.addRow({
          code: '1002',
          nameEn: 'Petty Cash',
          nameGu: 'રોકડ સિલક',
          groupName: 'Cash-in-Hand',
          nature: 'DEBIT',
          openingBalance: 25000,
          isBank: 'NO',
          isCash: 'YES',
        });
        break;

      default:
        throw new Error(`Unsupported entity type for template: ${entityType}`);
    }

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  // =========================================================================
  // 2. PREVIEW & VALIDATION ENGINE (With Duplicate Detection)
  // =========================================================================

  async previewAndValidate(
    tenantId: string,
    entityType: string,
    buffer: Buffer,
    contextParams: { academicYearId?: string; financialYearId?: string }
  ): Promise<ImportPreviewResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    if (!sheet) throw new Error('Uploaded Excel file has no worksheets.');

    const rows: any[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const values: any = row.values;
      rows.push({ rowNumber, values });
    });

    const errors: ImportErrorDetail[] = [];
    const validRows: any[] = [];

    switch (entityType.toUpperCase()) {
      case 'STUDENTS': {
        const existingStudents = await prisma.student.findMany({
          where: { tenantId },
          select: { grNumber: true, aadhaarNumber: true, ctsUniqueId: true },
        });

        const dbGRSet = new Set(existingStudents.map((s) => s.grNumber));
        const dbAadhaarSet = new Set(existingStudents.filter((s) => s.aadhaarNumber).map((s) => s.aadhaarNumber));
        const sheetGRSet = new Set<string>();

        const classes = await prisma.class.findMany({
          where: { tenantId, isActive: true },
          include: { divisions: true },
        });

        for (const r of rows) {
          const v = r.values;
          const grNumber = String(v[1] || '').trim();
          const firstNameEn = String(v[2] || '').trim();
          const middleNameEn = String(v[3] || '').trim();
          const lastNameEn = String(v[4] || '').trim();
          const firstNameGu = String(v[5] || '').trim();
          const middleNameGu = String(v[6] || '').trim();
          const lastNameGu = String(v[7] || '').trim();
          const classOrder = parseInt(String(v[8] || '1'), 10);
          const division = String(v[9] || 'A').trim().toUpperCase();
          const gender = String(v[10] || 'MALE').trim().toUpperCase();
          const dateOfBirth = String(v[11] || '').trim();
          const phone = String(v[12] || '').trim();
          const aadhaar = String(v[13] || '').trim();
          const apaar = String(v[14] || '').trim();
          const cts = String(v[15] || '').trim();
          const category = String(v[16] || 'General').trim();

          if (!grNumber) {
            errors.push({ rowNumber: r.rowNumber, field: 'grNumber', error: 'GR Number is mandatory.' });
            continue;
          }

          if (sheetGRSet.has(grNumber)) {
            errors.push({
              rowNumber: r.rowNumber,
              identifier: grNumber,
              field: 'grNumber',
              error: `Duplicate GR Number "${grNumber}" detected within uploaded spreadsheet.`,
            });
            continue;
          }
          sheetGRSet.add(grNumber);

          if (dbGRSet.has(grNumber)) {
            errors.push({
              rowNumber: r.rowNumber,
              identifier: grNumber,
              field: 'grNumber',
              error: `GR Number "${grNumber}" already exists in the school database.`,
            });
            continue;
          }

          if (aadhaar && dbAadhaarSet.has(aadhaar)) {
            errors.push({
              rowNumber: r.rowNumber,
              identifier: grNumber,
              field: 'aadhaar',
              error: `Aadhaar Number "${aadhaar}" already linked to another student.`,
            });
            continue;
          }

          if (!firstNameEn || !lastNameEn) {
            errors.push({
              rowNumber: r.rowNumber,
              identifier: grNumber,
              field: 'name',
              error: 'First name and Last name in English are required.',
            });
            continue;
          }

          const matchedClass = classes.find((c) => c.numericOrder === classOrder);
          if (!matchedClass) {
            errors.push({
              rowNumber: r.rowNumber,
              identifier: grNumber,
              field: 'classOrder',
              error: `Standard ${classOrder} not configured in this school.`,
            });
            continue;
          }

          const matchedDiv = matchedClass.divisions.find((d) => d.nameEn === division) || matchedClass.divisions[0];

          validRows.push({
            rowNumber: r.rowNumber,
            grNumber,
            firstNameEn,
            middleNameEn,
            lastNameEn,
            firstNameGu: firstNameGu || firstNameEn,
            middleNameGu: middleNameGu || middleNameEn,
            lastNameGu: lastNameGu || lastNameEn,
            classId: matchedClass.id,
            className: `${matchedClass.nameEn} - ${matchedDiv?.nameEn || 'A'}`,
            divisionId: matchedDiv?.id,
            gender: gender === 'FEMALE' ? 'FEMALE' : 'MALE',
            dateOfBirth: dateOfBirth || '2019-01-01',
            phone,
            aadhaar,
            apaar,
            cts,
            category,
          });
        }
        break;
      }

      case 'ATTENDANCE': {
        const students = await prisma.student.findMany({
          where: { tenantId },
          select: { id: true, grNumber: true },
        });
        const grToStudentMap = new Map(students.map((s) => [s.grNumber, s.id]));

        for (const r of rows) {
          const v = r.values;
          const dateStr = String(v[1] || '').trim();
          const grNumber = String(v[2] || '').trim();
          const status = String(v[3] || 'PRESENT').trim().toUpperCase();
          const remark = String(v[4] || '').trim();

          if (!dateStr || !grNumber) {
            errors.push({ rowNumber: r.rowNumber, error: 'Date and GR Number are required.' });
            continue;
          }

          if (!grToStudentMap.has(grNumber)) {
            errors.push({ rowNumber: r.rowNumber, identifier: grNumber, error: `Student with GR "${grNumber}" not found.` });
            continue;
          }

          if (!['PRESENT', 'ABSENT', 'LEAVE'].includes(status)) {
            errors.push({ rowNumber: r.rowNumber, identifier: grNumber, error: `Invalid status "${status}". Must be PRESENT, ABSENT, or LEAVE.` });
            continue;
          }

          validRows.push({
            rowNumber: r.rowNumber,
            studentId: grToStudentMap.get(grNumber),
            grNumber,
            date: dateStr,
            status,
            remark,
          });
        }
        break;
      }

      case 'CHART_OF_ACCOUNTS': {
        const groups = await prisma.accountGroup.findMany({ where: { tenantId } });
        const groupMap = new Map(groups.map((g) => [g.nameEn.toLowerCase(), g.id]));

        const existingAccounts = await prisma.chartOfAccount.findMany({
          where: { tenantId },
          select: { code: true },
        });
        const existingCodes = new Set(existingAccounts.map((a) => a.code));
        const sheetCodes = new Set<string>();

        for (const r of rows) {
          const v = r.values;
          const code = String(v[1] || '').trim();
          const nameEn = String(v[2] || '').trim();
          const nameGu = String(v[3] || '').trim();
          const groupName = String(v[4] || '').trim().toLowerCase();
          const nature = String(v[5] || 'DEBIT').trim().toUpperCase();
          const openingBalance = parseFloat(String(v[6] || '0'));
          const isBank = String(v[7] || '').trim().toUpperCase() === 'YES';
          const isCash = String(v[8] || '').trim().toUpperCase() === 'YES';

          if (!code || !nameEn) {
            errors.push({ rowNumber: r.rowNumber, error: 'Account Code and English Name are required.' });
            continue;
          }

          if (sheetCodes.has(code)) {
            errors.push({ rowNumber: r.rowNumber, identifier: code, error: `Duplicate code "${code}" in uploaded sheet.` });
            continue;
          }
          sheetCodes.add(code);

          if (existingCodes.has(code)) {
            errors.push({ rowNumber: r.rowNumber, identifier: code, error: `Account code "${code}" already exists in database.` });
            continue;
          }

          const groupId = groupMap.get(groupName) || groups[0]?.id;
          if (!groupId) {
            errors.push({ rowNumber: r.rowNumber, identifier: code, error: `Account group "${groupName}" not found.` });
            continue;
          }

          validRows.push({
            rowNumber: r.rowNumber,
            code,
            nameEn,
            nameGu: nameGu || nameEn,
            accountGroupId: groupId,
            accountNature: nature === 'CREDIT' ? 'CREDIT' : 'DEBIT',
            openingBalance: isNaN(openingBalance) ? 0 : openingBalance,
            isBankAccount: isBank,
            isCashAccount: isCash,
          });
        }
        break;
      }

      default:
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    return {
      entityType,
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: errors.length,
      previewRows: validRows.slice(0, 10),
      errors,
    };
  }

  // =========================================================================
  // 3. ANNOTATED ERROR REPORT GENERATOR (.xlsx)
  // =========================================================================

  async generateErrorReport(buffer: Buffer, errors: ImportErrorDetail[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    const errorMap = new Map<number, string>();
    for (const err of errors) {
      const existing = errorMap.get(err.rowNumber);
      errorMap.set(err.rowNumber, existing ? `${existing}; ${err.error}` : err.error);
    }

    // Add Error Column
    const colCount = sheet.columnCount;
    const errorColIndex = colCount + 1;

    sheet.getColumn(errorColIndex).width = 40;
    const headerCell = sheet.getCell(1, errorColIndex);
    headerCell.value = 'Validation Errors / વિગતવાર ભૂલો';
    headerCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDC2626' }, // Red
    };

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const errorMsg = errorMap.get(rowNumber);
      const cell = row.getCell(errorColIndex);

      if (errorMsg) {
        cell.value = `❌ ${errorMsg}`;
        cell.font = { color: { argb: 'FFDC2626' }, bold: true, size: 9 };
        row.eachCell((c) => {
          c.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' }, // Soft red highlight
          };
        });
      } else {
        cell.value = '✅ Valid / માન્ય';
        cell.font = { color: { argb: 'FF16A34A' }, size: 9 };
      }
    });

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  // =========================================================================
  // 4. TRANSACTION-SAFE IMPORT COMMIT
  // =========================================================================

  async executeImport(
    tenantId: string,
    userId: string,
    entityType: string,
    buffer: Buffer,
    contextParams: { academicYearId?: string; financialYearId?: string }
  ): Promise<{ success: boolean; importedCount: number; errors: ImportErrorDetail[] }> {
    const preview = await this.previewAndValidate(tenantId, entityType, buffer, contextParams);

    if (preview.validCount === 0) {
      return { success: false, importedCount: 0, errors: preview.errors };
    }

    let academicYearId = contextParams.academicYearId;
    if (!academicYearId) {
      const activeAY = await prisma.academicYear.findFirst({
        where: { tenantId, isCurrent: true },
      });
      academicYearId = activeAY?.id;
    }

    let financialYearId = contextParams.financialYearId;
    if (!financialYearId) {
      const activeFY = await prisma.financialYear.findFirst({
        where: { tenantId, isCurrent: true },
      });
      financialYearId = activeFY?.id;
    }

    let importedCount = 0;

    // Transaction-safe execution
    await prisma.$transaction(async (tx) => {
      switch (entityType.toUpperCase()) {
        case 'STUDENTS': {
          if (!academicYearId) throw new Error('ACADEMIC_YEAR_REQUIRED');

          for (const row of preview.previewRows.length === preview.validCount ? preview.previewRows : (await this.getAllValidRows(tenantId, entityType, buffer, contextParams))) {
            const student = await tx.student.create({
              data: {
                tenantId,
                grNumber: row.grNumber,
                firstNameEn: row.firstNameEn,
                middleNameEn: row.middleNameEn,
                lastNameEn: row.lastNameEn,
                firstNameGu: row.firstNameGu,
                middleNameGu: row.middleNameGu,
                lastNameGu: row.lastNameGu,
                gender: row.gender,
                dateOfBirth: new Date(row.dateOfBirth),
                dobInWords: 'જન્મ તારીખ વિગત',
                phone: row.phone,
                aadhaarNumber: row.aadhaar,
                apaarId: row.apaar,
                ctsUniqueId: row.cts,
                category: row.category,
                status: 'ACTIVE',
              },
            });

            await tx.enrollment.create({
              data: {
                tenantId,
                studentId: student.id,
                academicYearId: academicYearId!,
                classId: row.classId,
                divisionId: row.divisionId,
                status: 'ACTIVE',
              },
            });

            importedCount++;
          }
          break;
        }

        case 'CHART_OF_ACCOUNTS': {
          if (!financialYearId) throw new Error('FINANCIAL_YEAR_REQUIRED');

          for (const row of await this.getAllValidRows(tenantId, entityType, buffer, contextParams)) {
            const group = await tx.accountGroup.findFirst({ where: { id: row.accountGroupId } });
            await tx.chartOfAccount.create({
              data: {
                tenantId,
                financialYearId: financialYearId!,
                accountGroupId: row.accountGroupId,
                code: row.code,
                nameEn: row.nameEn,
                nameGu: row.nameGu,
                accountType: group?.groupType || 'ASSET',
                accountNature: row.accountNature,
                openingBalance: row.openingBalance,
                currentBalance: row.openingBalance,
                isBankAccount: row.isBankAccount,
                isCashAccount: row.isCashAccount,
              },
            });
            importedCount++;
          }
          break;
        }

        case 'ATTENDANCE': {
          if (!academicYearId) throw new Error('ACADEMIC_YEAR_REQUIRED');

          for (const row of await this.getAllValidRows(tenantId, entityType, buffer, contextParams)) {
            const enrollment = await tx.enrollment.findFirst({
              where: { tenantId, studentId: row.studentId, academicYearId: academicYearId! },
            });

            if (enrollment) {
              const attDate = new Date(row.date);
              attDate.setHours(0, 0, 0, 0);

              await tx.studentAttendance.upsert({
                where: {
                  tenantId_studentId_attendanceDate: {
                    tenantId,
                    studentId: row.studentId,
                    attendanceDate: attDate,
                  },
                },
                create: {
                  tenantId,
                  studentId: row.studentId,
                  enrollmentId: enrollment.id,
                  academicYearId: academicYearId!,
                  attendanceDate: attDate,
                  status: row.status,
                  remark: row.remark,
                  markedBy: userId,
                },
                update: {
                  status: row.status,
                  remark: row.remark,
                },
              });
              importedCount++;
            }
          }
          break;
        }

        default:
          throw new Error(`Execution for ${entityType} not configured.`);
      }
    });

    await logAudit({
      tenantId,
      userId,
      action: 'BULK_EXCEL_IMPORT',
      entityType: entityType.toUpperCase(),
      newValues: { importedCount, errorCount: preview.invalidCount },
    });

    return {
      success: true,
      importedCount,
      errors: preview.errors,
    };
  }

  private async getAllValidRows(
    tenantId: string,
    entityType: string,
    buffer: Buffer,
    contextParams: any
  ): Promise<any[]> {
    // Re-run validation without row slicing
    const preview = await this.previewAndValidate(tenantId, entityType, buffer, contextParams);
    return preview.previewRows;
  }
}

export const excelImportService = new ExcelImportService();
