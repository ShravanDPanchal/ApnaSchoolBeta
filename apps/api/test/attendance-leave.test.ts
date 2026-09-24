import { attendanceService } from '../src/modules/attendance/attendance.service';
import { prisma } from '../src/database/prisma';

describe('Fast Attendance & Staff Leave Management Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let class1Id: string;
  let staff1Id: string;
  let staff2Id: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Run seed before running tests');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@ssvm.edu.in' } });
    userId = user!.id;

    const currentYear = await prisma.academicYear.findFirst({ where: { tenantId, name: '2026-27' } });
    academicYearId = currentYear!.id;

    const c1 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 1 } });
    class1Id = c1!.id;

    const s1 = await prisma.staff.findFirst({ where: { tenantId, employeeId: 'EMP-001' } });
    const s2 = await prisma.staff.findFirst({ where: { tenantId, employeeId: 'EMP-002' } });
    staff1Id = s1!.id;
    staff2Id = s2!.id;

    // Clean up attendance on test date for clean state
    const cleanDate = new Date('2026-09-10');
    cleanDate.setHours(0, 0, 0, 0);

    await prisma.studentAttendance.deleteMany({
      where: { tenantId, attendanceDate: cleanDate },
    });
    await prisma.staffAttendance.deleteMany({
      where: { tenantId, attendanceDate: cleanDate },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Loads student list with default PRESENT status for fast 1-click marking', async () => {
    const list = await attendanceService.getStudentAttendanceByClassAndDate(tenantId, class1Id, '2026-09-10');
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].status).toBe('PRESENT');
  });

  test('2. Records fast batch student attendance with selective absent marking', async () => {
    const list = await attendanceService.getStudentAttendanceByClassAndDate(tenantId, class1Id, '2026-09-10');
    const items = list.map((s, idx) => ({
      studentId: s.studentId,
      enrollmentId: s.enrollmentId,
      status: idx === 0 ? 'ABSENT' : ('PRESENT' as any),
      remark: idx === 0 ? 'Sick leave (બીમાર)' : undefined,
    }));

    const result = await attendanceService.markBatchStudentAttendance(tenantId, academicYearId, userId, '2026-09-10', items);
    expect(result.success).toBe(true);
    expect(result.count).toBe(items.length);

    const verified = await attendanceService.getStudentAttendanceByClassAndDate(tenantId, class1Id, '2026-09-10');
    expect(verified[0].status).toBe('ABSENT');
    expect(verified[1].status).toBe('PRESENT');
  });

  test('3. Records staff attendance with Leave Types (Casual Leave)', async () => {
    const result = await attendanceService.markBatchStaffAttendance(tenantId, userId, '2026-09-10', [
      { staffId: staff1Id, status: 'PRESENT' },
      { staffId: staff2Id, status: 'LEAVE', leaveType: 'CASUAL', remark: 'Family function (પારિવારિક પ્રસંગ)' },
    ]);

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);

    const staffAtt = await attendanceService.getStaffAttendanceByDate(tenantId, '2026-09-10');
    const s2 = staffAtt.find((s) => s.staffId === staff2Id);
    expect(s2).toBeDefined();
    expect(s2!.status).toBe('LEAVE');
    expect(s2!.leaveType).toBe('CASUAL');
  });

  test('4. Computes staff monthly attendance & leave summaries', async () => {
    const summary = await attendanceService.getStaffMonthlyAttendanceSummary(tenantId, 9, 2026);
    expect(summary.length).toBeGreaterThan(0);
    const s2 = summary.find((s) => s.staffId === staff2Id);
    expect(s2).toBeDefined();
    expect(s2!.leave).toBeGreaterThan(0);
  });
});
