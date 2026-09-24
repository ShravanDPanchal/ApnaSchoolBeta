import { prisma } from '../../database/prisma';
import ExcelJS from 'exceljs';

export class ReportsService {
  async getGovernmentExportData(tenantId: string, portal: 'CTS' | 'UDISE' | 'VSK' | 'SAS', academicYearId?: string) {
    const school = await prisma.school.findFirst({ where: { tenantId } });
    const students = await prisma.student.findMany({
      where: { tenantId, isActive: true },
      include: {
        enrollments: {
          include: { class: true, division: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { grNumber: 'asc' },
    });

    if (portal === 'CTS') {
      return students.map((s) => ({
        'School DISE Code': school?.diseCode || '24090100101',
        'CTS 18-digit Unique ID': s.ctsUniqueId || `240901${s.grNumber.padStart(12, '0')}`,
        'Student Name (English)': `${s.firstNameEn} ${s.middleNameEn || ''} ${s.lastNameEn}`.trim(),
        'વિદ્યાર્થીનું નામ (ગુજરાતી)': `${s.firstNameGu} ${s.middleNameGu || ''} ${s.lastNameGu}`.trim(),
        'GR Number': s.grNumber,
        'Class': s.enrollments[0]?.class?.numericOrder || 1,
        'Division': s.enrollments[0]?.division?.nameEn || 'A',
        'Gender': s.gender,
        'DOB': s.dateOfBirth.toISOString().split('T')[0],
        'Aadhaar': s.aadhaarNumber || '',
        'APAAR ID': s.apaarId || '',
        'Category': s.category || 'General',
        'Status': s.status,
      }));
    }

    if (portal === 'VSK') {
      // Daily attendance payload format for VSK API / CSV
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const attendances = await prisma.studentAttendance.findMany({
        where: { tenantId, attendanceDate: today },
        include: { student: true, enrollment: { include: { class: true, division: true } } },
      });

      return attendances.map((a) => ({
        'DISE_CODE': school?.diseCode || '24090100101',
        'DATE': today.toISOString().split('T')[0],
        'STUDENT_ID': a.student.ctsUniqueId || a.student.grNumber,
        'CLASS': a.enrollment.class.numericOrder,
        'SECTION': a.enrollment.division?.nameEn || 'A',
        'ATTENDANCE_STATUS': a.status === 'PRESENT' ? 'P' : 'A',
      }));
    }

    // Default / UDISE / SAS
    return students.map((s) => ({
      'DISE Code': school?.diseCode || '24090100101',
      'GR No': s.grNumber,
      'Name': `${s.firstNameEn} ${s.lastNameEn}`,
      'Class': s.enrollments[0]?.class?.nameEn,
      'Category': s.category,
      'Aadhaar': s.aadhaarNumber,
    }));
  }

  async exportGovernmentCSV(tenantId: string, portal: 'CTS' | 'UDISE' | 'VSK' | 'SAS') {
    const data = await this.getGovernmentExportData(tenantId, portal);
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((row: any) =>
      headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}

export const reportsService = new ReportsService();
