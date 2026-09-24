import { staffService } from '../src/modules/staff/staff.service';
import { prisma } from '../src/database/prisma';

describe('Staff & Teacher Management Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let class1Id: string;
  const testEmpId = 'EMP-088';

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

    // Cleanup previous test run records
    await prisma.teacherAssignment.deleteMany({ where: { staff: { employeeId: testEmpId, tenantId } } });
    await prisma.staff.deleteMany({ where: { employeeId: testEmpId, tenantId } });
  });

  afterAll(async () => {
    await prisma.teacherAssignment.deleteMany({ where: { staff: { employeeId: testEmpId, tenantId } } });
    await prisma.staff.deleteMany({ where: { employeeId: testEmpId, tenantId } });
    await prisma.$disconnect();
  });

  test('1. Creates new staff member with salary and qualification details', async () => {
    const staff = await staffService.createStaff(tenantId, userId, {
      employeeId: testEmpId,
      firstNameEn: 'Pravinbhai',
      lastNameEn: 'Solanki',
      firstNameGu: 'પ્રવિણભાઈ',
      lastNameGu: 'સોલંકી',
      designation: 'Assistant Teacher (Science)',
      department: 'Upper Primary',
      qualification: 'B.Sc., B.Ed.',
      salaryAmount: 32000,
      phone: '9825199999',
    });

    expect(staff).toBeDefined();
    expect(staff.employeeId).toBe(testEmpId);
    expect(staff.salaryAmount).toBe(32000);
  });

  test('2. Assigns teacher as Class Teacher for Standard 1', async () => {
    const staff = await prisma.staff.findFirst({ where: { tenantId, employeeId: testEmpId } });
    expect(staff).toBeDefined();

    const assignment = await staffService.assignTeacher(tenantId, userId, {
      staffId: staff!.id,
      classId: class1Id,
      academicYearId,
      isClassTeacher: true,
    });

    expect(assignment).toBeDefined();
    expect(assignment.isClassTeacher).toBe(true);
    expect(assignment.classId).toBe(class1Id);
  });

  test('3. Updates staff designation and contact information', async () => {
    const staff = await prisma.staff.findFirst({ where: { tenantId, employeeId: testEmpId } });
    expect(staff).toBeDefined();

    const updated = await staffService.updateStaff(tenantId, userId, staff!.id, {
      designation: 'Senior Science Teacher',
      salaryAmount: 35000,
    });

    expect(updated.designation).toBe('Senior Science Teacher');
    expect(updated.salaryAmount).toBe(35000);
  });
});
