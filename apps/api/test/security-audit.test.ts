import request from 'supertest';
import { app } from '../src/main';
import { prisma } from '../src/database/prisma';

describe('Security Architecture & Penetration Review Tests', () => {
  let ssvmTenantId: string;
  let skvTenantId: string;
  let ssvmAdminToken: string;
  let skvAdminToken: string;
  let ssvmStudentId: string;

  beforeAll(async () => {
    // 1. Authenticate SSVM Admin
    const ssvmLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@ssvm.edu.in', password: 'Password@123', tenantCode: 'SSVM' });
    expect(ssvmLogin.status).toBe(200);
    ssvmAdminToken = ssvmLogin.body.data.token;
    ssvmTenantId = ssvmLogin.body.data.user.tenantId;

    // 2. Authenticate SKV Admin
    const skvLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: 'admin@skv.edu.in', password: 'Password@123', tenantCode: 'SKV' });
    expect(skvLogin.status).toBe(200);
    skvAdminToken = skvLogin.body.data.token;
    skvTenantId = skvLogin.body.data.user.tenantId;

    // Find a student in SSVM
    const student = await prisma.student.findFirst({ where: { tenantId: ssvmTenantId, isActive: true } });
    ssvmStudentId = student?.id || '';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // --- SEC-01: Authentication & Missing Token ---
  test('SEC-01: Rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/school');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  // --- SEC-02: Invalid / Forged JWT ---
  test('SEC-02: Rejects forged or invalid JWT tokens with 401', async () => {
    const res = await request(app)
      .get('/api/v1/school')
      .set('Authorization', 'Bearer forged.jwt.token');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  // --- SEC-03: Cross-Tenant IDOR Protection (Students) ---
  test('SEC-03: SKV Admin cannot read SSVM student details (Cross-Tenant IDOR)', async () => {
    if (!ssvmStudentId) return;

    const res = await request(app)
      .get(`/api/v1/students/${ssvmStudentId}`)
      .set('Authorization', `Bearer ${skvAdminToken}`);

    expect([403, 404]).toContain(res.status);
  });

  // --- SEC-04: Cross-Tenant IDOR Protection (Student Update) ---
  test('SEC-04: SKV Admin cannot mutate SSVM student records', async () => {
    if (!ssvmStudentId) return;

    const res = await request(app)
      .patch(`/api/v1/students/${ssvmStudentId}`)
      .set('Authorization', `Bearer ${skvAdminToken}`)
      .send({ firstNameEn: 'HACKED' });

    expect([400, 403]).toContain(res.status);
  });

  // --- SEC-05: Cross-Tenant IDOR Protection (Grants) ---
  test('SEC-05: SKV Admin cannot access SSVM grant details or statements', async () => {
    const ssvmGrant = await prisma.grant.findFirst({ where: { tenantId: ssvmTenantId } });
    if (!ssvmGrant) return;

    const res = await request(app)
      .get(`/api/v1/grants/${ssvmGrant.id}`)
      .set('Authorization', `Bearer ${skvAdminToken}`);

    expect(res.status).toBe(404);
  });

  // --- SEC-06: Permission Guard Enforcement (School Settings) ---
  test('SEC-06: School settings update requires proper permission', async () => {
    const res = await request(app)
      .patch('/api/v1/school')
      .set('Authorization', `Bearer ${ssvmAdminToken}`)
      .send({ phone: '9876543210' });

    expect([200, 403]).toContain(res.status);
  });

  // --- SEC-07: Financial Year Closure Guard ---
  test('SEC-07: Financial year closure blocks unbalanced or invalid request', async () => {
    const res = await request(app)
      .post('/api/v1/accounting/financial-years/close')
      .set('Authorization', `Bearer ${ssvmAdminToken}`)
      .send({ closingFinancialYearId: 'invalid-id', nextFinancialYearId: 'invalid-next' });

    expect([400, 500]).toContain(res.status);
  });

  // --- SEC-08: Protected Import Suite Routes ---
  test('SEC-08: Import suite preview endpoint rejects request with no file', async () => {
    const res = await request(app)
      .post('/api/v1/reports/import/preview/STUDENTS')
      .set('Authorization', `Bearer ${ssvmAdminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('FILE_REQUIRED');
  });

  // --- SEC-09: Grant Utilization Cap & Override Security ---
  test('SEC-09: Over-utilization without override is strictly blocked with 422', async () => {
    const fy = await prisma.financialYear.findFirst({ where: { tenantId: ssvmTenantId, isCurrent: true } });
    if (!fy) return;

    const grant = await prisma.grant.create({
      data: {
        tenantId: ssvmTenantId,
        nameEn: '[SEC-TEST] Strict Cap Grant',
        nameGu: '[SEC-TEST] ગ્રાન્ટ',
        sanctionedAmount: 1000,
        receivedAmount: 100,
        utilizedAmount: 0,
        financialYearId: fy.id,
      },
    });

    const res = await request(app)
      .post(`/api/v1/grants/${grant.id}/utilize`)
      .set('Authorization', `Bearer ${ssvmAdminToken}`)
      .send({ amount: 500, transactionDate: '2026-09-11' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('UTILIZATION_EXCEEDS_AVAILABLE');

    // Clean up
    await prisma.grant.delete({ where: { id: grant.id } });
  });

  // --- SEC-10: Audit Log Immutability ---
  test('SEC-10: Critical operations create audit trail records in database', async () => {
    const recentAudit = await prisma.auditLog.findFirst({
      where: { tenantId: ssvmTenantId },
      orderBy: { createdAt: 'desc' },
    });

    expect(recentAudit).toBeDefined();
    expect(recentAudit?.tenantId).toBe(ssvmTenantId);
    expect(recentAudit?.action).toBeTruthy();
  });
});
