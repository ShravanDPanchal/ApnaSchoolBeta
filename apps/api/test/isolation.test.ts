import { studentService } from '../src/modules/student/student.service';
import { prisma } from '../src/database/prisma';

describe('Multi-Tenant Data Isolation Tests', () => {
  let tenant1Id: string;
  let tenant2Id: string;

  beforeAll(async () => {
    const t1 = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    const t2 = await prisma.tenant.findFirst({ where: { code: 'SKV' } });
    if (!t1 || !t2) throw new Error('Run seed before running tests');
    tenant1Id = t1.id;
    tenant2Id = t2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Tenant 1 (SSVM) cannot see Tenant 2 (SKV) students in queries', async () => {
    const t1Students = await studentService.getStudents(tenant1Id, {});
    const t2Students = await studentService.getStudents(tenant2Id, {});

    // Ensure students exist in both tenants
    expect(t1Students.students.length).toBeGreaterThan(0);
    expect(t2Students.students.length).toBeGreaterThan(0);

    // Verify no Tenant 2 GR numbers appear in Tenant 1 results
    const t1GRNumbers = t1Students.students.map((s) => s.grNumber);
    expect(t1GRNumbers).not.toContain('SKV-501');

    // Verify Tenant 2 only sees its own students
    const t2GRNumbers = t2Students.students.map((s) => s.grNumber);
    expect(t2GRNumbers).toContain('SKV-501');
    expect(t2GRNumbers).not.toContain('1001');
  });

  test('2. Requesting a student by ID from another tenant throws NOT_FOUND', async () => {
    const skvStudent = await prisma.student.findFirst({ where: { tenantId: tenant2Id } });
    expect(skvStudent).toBeDefined();

    // Tenant 1 attempts to fetch Tenant 2's student ID
    await expect(
      studentService.getStudentById(tenant1Id, skvStudent!.id)
    ).rejects.toThrow('STUDENT_NOT_FOUND');
  });
});
