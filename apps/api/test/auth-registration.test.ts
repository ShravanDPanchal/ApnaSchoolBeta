import request from 'supertest';
import { app } from '../src/main';
import { prisma } from '../src/database/prisma';

describe('Real Authentication & OTP Registration Test Suite', () => {
  const testMobile = '9879912345';
  const testEmail = 'newadmin@testschool.edu.in';
  const testPassword = 'SecurePassword@123';
  let devOtp: string;
  let authToken: string;

  beforeAll(async () => {
    // Clean up test records if existed before
    const existing = await prisma.user.findFirst({
      where: { OR: [{ phone: testMobile }, { email: testEmail }] },
      include: { userTenants: true },
    });
    if (existing) {
      for (const ut of existing.userTenants) {
        await prisma.tenant.delete({ where: { id: ut.tenantId } }).catch(() => {});
      }
      await prisma.user.delete({ where: { id: existing.id } }).catch(() => {});
    }
    await prisma.otpVerification.deleteMany({ where: { identifier: testMobile } });
  });

  afterAll(async () => {
    // Clean up created test tenant and user
    const user = await prisma.user.findFirst({
      where: { OR: [{ phone: testMobile }, { email: testEmail }] },
      include: { userTenants: true },
    });
    if (user) {
      for (const ut of user.userTenants) {
        await prisma.tenant.delete({ where: { id: ut.tenantId } }).catch(() => {});
      }
      await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    }
    await prisma.otpVerification.deleteMany({ where: { identifier: testMobile } });
    await prisma.$disconnect();
  });

  // --- 1. SEND OTP TESTS ---
  describe('POST /api/v1/auth/send-otp', () => {
    it('AUTH-01: Rejects OTP request with missing identifier', async () => {
      const res = await request(app).post('/api/v1/auth/send-otp').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('AUTH-02: Generates 6-digit OTP for new registration', async () => {
      const res = await request(app).post('/api/v1/auth/send-otp').send({
        identifier: testMobile,
        purpose: 'REGISTRATION',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.identifier).toBe(testMobile);
      expect(res.body.data.devOtp).toMatch(/^[0-9]{6}$/);
      devOtp = res.body.data.devOtp;

      // Verify stored in DB
      const dbRecord = await prisma.otpVerification.findFirst({
        where: { identifier: testMobile, purpose: 'REGISTRATION' },
      });
      expect(dbRecord).toBeDefined();
      expect(dbRecord?.otp).toBe(devOtp);
      expect(dbRecord?.isVerified).toBe(false);
    });

    it('AUTH-03: Blocks registration OTP for existing user', async () => {
      const res = await request(app).post('/api/v1/auth/send-otp').send({
        identifier: 'admin@ssvm.edu.in',
        purpose: 'REGISTRATION',
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  // --- 2. VERIFY OTP TESTS ---
  describe('POST /api/v1/auth/verify-otp', () => {
    it('AUTH-04: Rejects incorrect OTP with 400', async () => {
      const res = await request(app).post('/api/v1/auth/verify-otp').send({
        identifier: testMobile,
        otp: '000000',
        purpose: 'REGISTRATION',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('OTP_INVALID');
    });

    it('AUTH-05: Verifies valid 6-digit OTP and marks verified', async () => {
      const res = await request(app).post('/api/v1/auth/verify-otp').send({
        identifier: testMobile,
        otp: devOtp,
        purpose: 'REGISTRATION',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);

      const dbRecord = await prisma.otpVerification.findFirst({
        where: { identifier: testMobile, purpose: 'REGISTRATION' },
      });
      expect(dbRecord?.isVerified).toBe(true);
    });
  });

  // --- 3. REGISTRATION TESTS ---
  describe('POST /api/v1/auth/register', () => {
    it('AUTH-06: Fully provisions new School, Tenant, Academic Year, CoA, and Admin User', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'કિશનભાઈ પટેલ',
        mobile: testMobile,
        email: testEmail,
        password: testPassword,
        schoolNameGu: 'શ્રી નવસર્જન પ્રાથમિક વિદ્યાલય',
        schoolNameEn: 'Shree Navsarjan Primary School',
        district: 'Rajkot',
        taluka: 'Gondal',
        otp: devOtp,
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      authToken = res.body.data.token;
      expect(res.body.data.user.phone).toBe(testMobile);
      expect(res.body.data.user.schoolNameGu).toBe('શ્રી નવસર્જન પ્રાથમિક વિદ્યાલય');
      expect(res.body.data.user.currentAcademicYearId).toBeDefined();
      expect(res.body.data.user.currentFinancialYearId).toBeDefined();

      const tenantId = res.body.data.user.tenantId;

      // Verify Classes 1 to 8 were created
      const classes = await prisma.class.findMany({ where: { tenantId } });
      expect(classes.length).toBe(8);

      // Verify Chart of Accounts created
      const coa = await prisma.chartOfAccount.findMany({ where: { tenantId } });
      expect(coa.length).toBeGreaterThanOrEqual(4);
    });

    it('AUTH-07: Blocks duplicate registration with same mobile', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'અન્ય વ્યક્તિ',
        mobile: testMobile,
        password: testPassword,
        schoolNameGu: 'અન્ય શાળા',
        otp: devOtp,
      });
      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  // --- 4. LOGIN TESTS ---
  describe('POST /api/v1/auth/login', () => {
    it('AUTH-08: Logs in with registered mobile number & password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: testMobile,
        password: testPassword,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.phone).toBe(testMobile);
    });

    it('AUTH-09: Logs in with registered email & password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: testEmail,
        password: testPassword,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it('AUTH-10: Rejects invalid password with 401', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: testMobile,
        password: 'WrongPassword@999',
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('AUTH-11: Rejects non-existent user with 401', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        identifier: '9999999999',
        password: 'AnyPassword@123',
      });
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  // --- 5. FORGOT PASSWORD & RESET TESTS ---
  describe('POST /api/v1/auth/forgot-password', () => {
    let resetOtp: string;

    it('AUTH-12: Sends OTP for forgot password request', async () => {
      const res = await request(app).post('/api/v1/auth/send-otp').send({
        identifier: testMobile,
        purpose: 'FORGOT_PASSWORD',
      });
      expect(res.status).toBe(200);
      expect(res.body.data.devOtp).toMatch(/^[0-9]{6}$/);
      resetOtp = res.body.data.devOtp;
    });

    it('AUTH-13: Resets password with valid OTP', async () => {
      const newPassword = 'NewSecretPassword@456';
      const res = await request(app).post('/api/v1/auth/forgot-password').send({
        identifier: testMobile,
        otp: resetOtp,
        newPassword,
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify login with new password
      const loginRes = await request(app).post('/api/v1/auth/login').send({
        identifier: testMobile,
        password: newPassword,
      });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toBeDefined();
    });
  });

  // --- 6. GET /me PROFILE TEST ---
  describe('GET /api/v1/auth/me', () => {
    it('AUTH-14: Retrieves profile of authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.phone).toBe(testMobile);
      expect(res.body.data.schoolNameGu).toBe('શ્રી નવસર્જન પ્રાથમિક વિદ્યાલય');
    });
  });
});
