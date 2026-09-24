import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { PermissionCode, UserRole, AccountGroupType, AccountNature, JournalEntryType, RojmelEntryType, PaymentMode } from '@apna-school/shared-types';

export async function seedDatabase() {
  console.log('🌱 Seeding Apna School ERP Database...');

  // 1. Seed Permissions
  const permissionsList = Object.values(PermissionCode);
  for (const code of permissionsList) {
    const parts = code.split('.');
    const module = parts[0];
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: {
        code,
        module,
        displayNameEn: code.replace(/\./g, ' ').toUpperCase(),
        displayNameGu: code.replace(/\./g, ' '),
      },
    });
  }
  console.log(`✅ Seeded ${permissionsList.length} permissions.`);

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@apnaschool.com' },
    update: { passwordHash },
    create: {
      email: 'superadmin@apnaschool.com',
      phone: '9876543210',
      passwordHash,
      isSuperAdmin: true,
      preferredLocale: 'gu',
    },
  });

  // 3. Create Tenant 1: Shree Saraswati Vidya Mandir, Rajkot
  const tenant1 = await prisma.tenant.upsert({
    where: { code: 'SSVM' },
    update: {},
    create: {
      name: 'શ્રી સરસ્વતી વિદ્યા મંદિર (Shree Saraswati Vidya Mandir)',
      slug: 'ssvm-rajkot',
      code: 'SSVM',
      subscriptionPlan: 'ENTERPRISE',
    },
  });

  // School Profile 1
  await prisma.school.upsert({
    where: { id: 'ssvm-school-id' },
    update: {},
    create: {
      id: 'ssvm-school-id',
      tenantId: tenant1.id,
      nameEn: 'Shree Saraswati Vidya Mandir',
      nameGu: 'શ્રી સરસ્વતી વિદ્યા મંદિર',
      code: 'SSVM',
      addressLine1: 'Kalawad Road',
      city: 'Rajkot',
      district: 'Rajkot',
      taluka: 'Rajkot',
      state: 'Gujarat',
      pinCode: '360005',
      phone: '0281-2578900',
      email: 'info@ssvm.edu.in',
      principalName: 'શ્રી રમેશભાઈ પટેલ (Shri Rameshbhai Patel)',
      primaryColor: '#007ed4',
      secondaryColor: '#EEAA00',
      schoolType: 'PRIMARY',
      medium: 'GUJARATI',
      board: 'GSEB',
      diseCode: '24090101234',
    },
  });

  // Academic Year & Financial Year for Tenant 1
  const ay1 = await prisma.academicYear.upsert({
    where: { tenantId_name: { tenantId: tenant1.id, name: '2026-27' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: '2026-27',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-04-30'),
      isCurrent: true,
    },
  });

  const fy1 = await prisma.financialYear.upsert({
    where: { tenantId_name: { tenantId: tenant1.id, name: '2026-27' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  });

  // Roles for Tenant 1
  const allPerms = await prisma.permission.findMany();
  const roleNames = [
    UserRole.SCHOOL_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.ACCOUNTANT,
    UserRole.TEACHER,
    UserRole.CLASS_TEACHER,
    UserRole.OFFICE_STAFF,
  ];

  const roleMap: Record<string, any> = {};
  for (const rName of roleNames) {
    const role = await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant1.id, name: rName } },
      update: {},
      create: {
        tenantId: tenant1.id,
        name: rName,
        displayNameEn: rName.replace('_', ' '),
        displayNameGu: rName === UserRole.ACCOUNTANT ? 'હિસાબનીશ' : rName === UserRole.PRINCIPAL ? 'આચાર્ય' : 'શિક્ષક',
        isSystemRole: true,
      },
    });
    roleMap[rName] = role;

    // Assign all permissions to School Admin / Principal / Accountant
    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id },
      });
    }
  }

  // Users for Tenant 1
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ssvm.edu.in' },
    update: { passwordHash },
    create: {
      email: 'admin@ssvm.edu.in',
      phone: '9825012345',
      passwordHash,
      preferredLocale: 'gu',
    },
  });

  const utAdmin = await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenant1.id } },
    update: {},
    create: { userId: adminUser.id, tenantId: tenant1.id, isDefault: true },
  });

  await prisma.userRole.upsert({
    where: { userTenantId_roleId: { userTenantId: utAdmin.id, roleId: roleMap[UserRole.SCHOOL_ADMIN].id } },
    update: {},
    create: { userTenantId: utAdmin.id, roleId: roleMap[UserRole.SCHOOL_ADMIN].id },
  });

  const accountantUser = await prisma.user.upsert({
    where: { email: 'accountant@ssvm.edu.in' },
    update: { passwordHash },
    create: {
      email: 'accountant@ssvm.edu.in',
      phone: '9825054321',
      passwordHash,
      preferredLocale: 'gu',
    },
  });

  const utAccountant = await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: accountantUser.id, tenantId: tenant1.id } },
    update: {},
    create: { userId: accountantUser.id, tenantId: tenant1.id },
  });

  await prisma.userRole.upsert({
    where: { userTenantId_roleId: { userTenantId: utAccountant.id, roleId: roleMap[UserRole.ACCOUNTANT].id } },
    update: {},
    create: { userTenantId: utAccountant.id, roleId: roleMap[UserRole.ACCOUNTANT].id },
  });

  // Classes & Divisions (Std 1 to Std 8)
  const classRecords: any[] = [];
  const gujaratiClassNames = ['ધો. ૧', 'ધો. ૨', 'ધો. ૩', 'ધો. ૪', 'ધો. ૫', 'ધો. ૬', 'ધો. ૭', 'ધો. ૮'];
  for (let i = 1; i <= 8; i++) {
    const cls = await prisma.class.upsert({
      where: { tenantId_numericOrder: { tenantId: tenant1.id, numericOrder: i } },
      update: {},
      create: {
        tenantId: tenant1.id,
        nameEn: `Std ${i}`,
        nameGu: gujaratiClassNames[i - 1],
        numericOrder: i,
      },
    });
    classRecords.push(cls);

    await prisma.division.upsert({
      where: { classId_nameEn: { classId: cls.id, nameEn: 'A' } },
      update: {},
      create: { tenantId: tenant1.id, classId: cls.id, nameEn: 'A', nameGu: 'અ', capacity: 40 },
    });
    await prisma.division.upsert({
      where: { classId_nameEn: { classId: cls.id, nameEn: 'B' } },
      update: {},
      create: { tenantId: tenant1.id, classId: cls.id, nameEn: 'B', nameGu: 'બ', capacity: 40 },
    });
  }

  // Account Groups & Chart of Accounts (Deshi Nama CoA)
  const groupAsset = await prisma.accountGroup.upsert({
    where: { tenantId_nameEn: { tenantId: tenant1.id, nameEn: 'Current Assets' } },
    update: {},
    create: { tenantId: tenant1.id, nameEn: 'Current Assets', nameGu: 'ચાલુ મિલકતો', groupType: AccountGroupType.ASSET, isSystem: true },
  });
  const groupIncome = await prisma.accountGroup.upsert({
    where: { tenantId_nameEn: { tenantId: tenant1.id, nameEn: 'Fee & Operating Income' } },
    update: {},
    create: { tenantId: tenant1.id, nameEn: 'Fee & Operating Income', nameGu: 'ફી અને પ્રવૃત્તિ આવક', groupType: AccountGroupType.INCOME, isSystem: true },
  });
  const groupExpense = await prisma.accountGroup.upsert({
    where: { tenantId_nameEn: { tenantId: tenant1.id, nameEn: 'Operating Expenses' } },
    update: {},
    create: { tenantId: tenant1.id, nameEn: 'Operating Expenses', nameGu: 'સંચાલન ખર્ચ', groupType: AccountGroupType.EXPENSE, isSystem: true },
  });

  // Cash in Hand (શ્રી રોકડ સિલક ખાતું)
  const cashAcc = await prisma.chartOfAccount.upsert({
    where: { tenantId_code_financialYearId: { tenantId: tenant1.id, code: '1001', financialYearId: fy1.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      accountGroupId: groupAsset.id,
      code: '1001',
      nameEn: 'Cash in Hand',
      nameGu: 'શ્રી રોકડ સિલક ખાતું',
      accountType: AccountGroupType.ASSET,
      accountNature: AccountNature.DEBIT,
      openingBalance: 35000,
      currentBalance: 47500,
      financialYearId: fy1.id,
      isCashAccount: true,
      isSystem: true,
    },
  });

  // Bank Account (શ્રી સ્ટેટ બેંક ઓફ ઇન્ડિયા ખાતું)
  const bankAcc = await prisma.chartOfAccount.upsert({
    where: { tenantId_code_financialYearId: { tenantId: tenant1.id, code: '1002', financialYearId: fy1.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      accountGroupId: groupAsset.id,
      code: '1002',
      nameEn: 'State Bank of India (SBI Main)',
      nameGu: 'શ્રી સ્ટેટ બેંક ઓફ ઇન્ડિયા ખાતું',
      accountType: AccountGroupType.ASSET,
      accountNature: AccountNature.DEBIT,
      openingBalance: 850000,
      currentBalance: 878000,
      financialYearId: fy1.id,
      isBankAccount: true,
      isSystem: true,
    },
  });

  // Tuition Fee Income Account (શ્રી શિક્ષણ ફી આવક ખાતું)
  const tuitionFeeAcc = await prisma.chartOfAccount.upsert({
    where: { tenantId_code_financialYearId: { tenantId: tenant1.id, code: '3001', financialYearId: fy1.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      accountGroupId: groupIncome.id,
      code: '3001',
      nameEn: 'Tuition Fee Income',
      nameGu: 'શ્રી શિક્ષણ ફી આવક ખાતું',
      accountType: AccountGroupType.INCOME,
      accountNature: AccountNature.CREDIT,
      openingBalance: 0,
      currentBalance: 125000,
      financialYearId: fy1.id,
    },
  });

  // Grant Income Account (શ્રી સંયુક્ત શાળા અનુદાન ગ્રાન્ટ ખાતું)
  const grantIncomeAcc = await prisma.chartOfAccount.upsert({
    where: { tenantId_code_financialYearId: { tenantId: tenant1.id, code: '3002', financialYearId: fy1.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      accountGroupId: groupIncome.id,
      code: '3002',
      nameEn: 'Composite School Grant',
      nameGu: 'શ્રી સંયુક્ત શાળા અનુદાન ગ્રાન્ટ ખાતું',
      accountType: AccountGroupType.INCOME,
      accountNature: AccountNature.CREDIT,
      openingBalance: 0,
      currentBalance: 50000,
      financialYearId: fy1.id,
    },
  });

  // Printing & Stationery Expense (શ્રી છાપકામ અને સ્ટેશનરી ખર્ચ ખાતું)
  const stationeryAcc = await prisma.chartOfAccount.upsert({
    where: { tenantId_code_financialYearId: { tenantId: tenant1.id, code: '4001', financialYearId: fy1.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      accountGroupId: groupExpense.id,
      code: '4001',
      nameEn: 'Printing & Stationery Expense',
      nameGu: 'શ્રી છાપકામ અને સ્ટેશનરી ખર્ચ ખાતું',
      accountType: AccountGroupType.EXPENSE,
      accountNature: AccountNature.DEBIT,
      openingBalance: 0,
      currentBalance: 3200,
      financialYearId: fy1.id,
    },
  });

  // Salary Expense (શ્રી શિક્ષક પગાર ખર્ચ ખાતું)
  const salaryAcc = await prisma.chartOfAccount.upsert({
    where: { tenantId_code_financialYearId: { tenantId: tenant1.id, code: '4002', financialYearId: fy1.id } },
    update: {},
    create: {
      tenantId: tenant1.id,
      accountGroupId: groupExpense.id,
      code: '4002',
      nameEn: 'Staff Salary Expense',
      nameGu: 'શ્રી શિક્ષક પગાર ખર્ચ ખાતું',
      accountType: AccountGroupType.EXPENSE,
      accountNature: AccountNature.DEBIT,
      openingBalance: 0,
      currentBalance: 22000,
      financialYearId: fy1.id,
    },
  });

  // Fee Heads
  const tuitionHead = await prisma.feeHead.upsert({
    where: { tenantId_code: { tenantId: tenant1.id, code: 'TUTION' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      nameEn: 'Tuition Fee',
      nameGu: 'શિક્ષણ ફી',
      code: 'TUTION',
      accountId: tuitionFeeAcc.id,
    },
  });

  const termHead = await prisma.feeHead.upsert({
    where: { tenantId_code: { tenantId: tenant1.id, code: 'TERM' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      nameEn: 'Term Fee',
      nameGu: 'સત્ર ફી',
      code: 'TERM',
      accountId: tuitionFeeAcc.id,
    },
  });

  // Fee Structures for Class 1 to 8 (Within FRC limit of ₹15,000 for primary)
  for (const cls of classRecords) {
    await prisma.feeStructure.create({
      data: {
        tenantId: tenant1.id,
        academicYearId: ay1.id,
        classId: cls.id,
        feeHeadId: tuitionHead.id,
        amount: 8000,
        dueDate: new Date('2026-08-15'),
        installmentNo: 1,
      },
    });
    await prisma.feeStructure.create({
      data: {
        tenantId: tenant1.id,
        academicYearId: ay1.id,
        classId: cls.id,
        feeHeadId: termHead.id,
        amount: 1500,
        dueDate: new Date('2026-10-15'),
        installmentNo: 1,
      },
    });
  }

  // Realistic Students (Gujarati names, GR Numbers, APAAR, CTS IDs)
  const demoStudents = [
    { gr: '1001', fnEn: 'Aarav', lnEn: 'Patel', fnGu: 'આરવ', lnGu: 'પટેલ', mnEn: 'Rajeshbhai', mnGu: 'રાજેશભાઈ', gender: 'MALE', dob: '2019-04-12', clsIdx: 0 },
    { gr: '1002', fnEn: 'Diya', lnEn: 'Shah', fnGu: 'દિયા', lnGu: 'શાહ', mnEn: 'Nilesh', mnGu: 'નિલેશ', gender: 'FEMALE', dob: '2019-07-22', clsIdx: 0 },
    { gr: '1003', fnEn: 'Kabir', lnEn: 'Jadeja', fnGu: 'કબીર', lnGu: 'જાડેજા', mnEn: 'Yuvrajsinh', mnGu: 'યુવરાજસિંહ', gender: 'MALE', dob: '2018-02-14', clsIdx: 1 },
    { gr: '1004', fnEn: 'Ananya', lnEn: 'Mehta', fnGu: 'અનન્યા', lnGu: 'મહેતા', mnEn: 'Bhavin', mnGu: 'ભાવિન', gender: 'FEMALE', dob: '2018-09-05', clsIdx: 1 },
    { gr: '1005', fnEn: 'Dev', lnEn: 'Prajapati', fnGu: 'દેવ', lnGu: 'પ્રજાપતિ', mnEn: 'Maheshbhai', mnGu: 'મહેશભાઈ', gender: 'MALE', dob: '2017-05-18', clsIdx: 2 },
    { gr: '1006', fnEn: 'Krupa', lnEn: 'Vyas', fnGu: 'કૃપા', lnGu: 'વ્યાસ', mnEn: 'Hasmukhbhai', mnGu: 'હસમુખભાઈ', gender: 'FEMALE', dob: '2017-11-30', clsIdx: 2 },
    { gr: '1007', fnEn: 'Manan', lnEn: 'Gohil', fnGu: 'મનન', lnGu: 'ગોહિલ', mnEn: 'Dharmendrasinh', mnGu: 'ધર્મેન્દ્રસિંહ', gender: 'MALE', dob: '2016-03-25', clsIdx: 3 },
    { gr: '1008', fnEn: 'Riya', lnEn: 'Solanki', fnGu: 'રિયા', lnGu: 'સોલંકી', mnEn: 'Kiritbhai', mnGu: 'કિરીટભાઈ', gender: 'FEMALE', dob: '2016-08-19', clsIdx: 3 },
    { gr: '1009', fnEn: 'Krish', lnEn: 'Dabhi', fnGu: 'ક્રિશ', lnGu: 'ડાભી', mnEn: 'Govindbhai', mnGu: 'ગોવિંદભાઈ', gender: 'MALE', dob: '2015-01-10', clsIdx: 4 },
    { gr: '1010', fnEn: 'Pooja', lnEn: 'Chauhan', fnGu: 'પૂજા', lnGu: 'ચૌહાણ', mnEn: 'Vijaybhai', mnGu: 'વિજયભાઈ', gender: 'FEMALE', dob: '2015-10-04', clsIdx: 4 },
  ];

  for (const s of demoStudents) {
    const cls = classRecords[s.clsIdx];
    const student = await prisma.student.upsert({
      where: { tenantId_grNumber: { tenantId: tenant1.id, grNumber: s.gr } },
      update: {},
      create: {
        tenantId: tenant1.id,
        grNumber: s.gr,
        admissionNo: `ADM-${s.gr}`,
        firstNameEn: s.fnEn,
        middleNameEn: s.mnEn,
        lastNameEn: s.lnEn,
        firstNameGu: s.fnGu,
        middleNameGu: s.mnGu,
        lastNameGu: s.lnGu,
        gender: s.gender,
        dateOfBirth: new Date(s.dob),
        dobInWords: 'બાર એપ્રિલ બે હજાર ઓગણીસ',
        bloodGroup: 'B+',
        aadhaarNumber: `24567890${s.gr}`,
        apaarId: `12345678${s.gr}`,
        ctsUniqueId: `24090101234${s.gr.padStart(7, '0')}`,
        phone: `98980${s.gr}12`,
        city: 'Rajkot',
        district: 'Rajkot',
        status: 'ACTIVE',
      },
    });

    const enr = await prisma.enrollment.upsert({
      where: {
        tenantId_studentId_academicYearId: {
          tenantId: tenant1.id,
          studentId: student.id,
          academicYearId: ay1.id,
        },
      },
      update: { classId: cls.id },
      create: {
        tenantId: tenant1.id,
        studentId: student.id,
        academicYearId: ay1.id,
        classId: cls.id,
        rollNumber: parseInt(s.gr.slice(-2), 10),
      },
    });

    // Create Student Fee records
    const fsList = await prisma.feeStructure.findMany({
      where: { tenantId: tenant1.id, academicYearId: ay1.id, classId: cls.id },
    });
    for (const fs of fsList) {
      const existingFee = await prisma.studentFee.findFirst({
        where: { tenantId: tenant1.id, studentId: student.id, feeStructureId: fs.id },
      });
      if (!existingFee) {
        await prisma.studentFee.create({
          data: {
            tenantId: tenant1.id,
            studentId: student.id,
            enrollmentId: enr.id,
            feeStructureId: fs.id,
            amount: fs.amount,
            netAmount: fs.amount,
            status: 'PENDING',
          },
        });
      }
    }
  }

  // Create Staff
  await prisma.staff.upsert({
    where: { tenantId_employeeId: { tenantId: tenant1.id, employeeId: 'EMP-001' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      employeeId: 'EMP-001',
      firstNameEn: 'Rameshbhai',
      lastNameEn: 'Patel',
      firstNameGu: 'રમેશભાઈ',
      lastNameGu: 'પટેલ',
      designation: 'Principal',
      department: 'Administration',
      phone: '9825012345',
      email: 'principal@ssvm.edu.in',
      joiningDate: new Date('2015-06-01'),
      staffType: 'TEACHING',
      salaryAmount: 65000,
    },
  });

  await prisma.staff.upsert({
    where: { tenantId_employeeId: { tenantId: tenant1.id, employeeId: 'EMP-002' } },
    update: {},
    create: {
      tenantId: tenant1.id,
      employeeId: 'EMP-002',
      firstNameEn: 'Geetaben',
      lastNameEn: 'Joshi',
      firstNameGu: 'ગીતાબેન',
      lastNameGu: 'જોશી',
      designation: 'Senior Teacher (Mathematics)',
      department: 'Primary Section',
      phone: '9825088990',
      email: 'geeta.joshi@ssvm.edu.in',
      joiningDate: new Date('2018-07-01'),
      staffType: 'TEACHING',
      salaryAmount: 38000,
    },
  });

  // 4. Create Tenant 2: Sant Kabir Vidyalaya, Ahmedabad (For multi-tenant isolation testing)
  const tenant2 = await prisma.tenant.upsert({
    where: { code: 'SKV' },
    update: {},
    create: {
      name: 'સંત કબીર વિદ્યાલય (Sant Kabir Vidyalaya)',
      slug: 'skv-ahmedabad',
      code: 'SKV',
      subscriptionPlan: 'PRO',
    },
  });

  await prisma.school.upsert({
    where: { id: 'skv-school-id' },
    update: {},
    create: {
      id: 'skv-school-id',
      tenantId: tenant2.id,
      nameEn: 'Sant Kabir Vidyalaya',
      nameGu: 'સંત કબીર વિદ્યાલય',
      code: 'SKV',
      city: 'Ahmedabad',
      district: 'Ahmedabad',
      state: 'Gujarat',
      primaryColor: '#0F766E',
      secondaryColor: '#F59E0B',
      schoolType: 'COMBINED',
      medium: 'GUJARATI',
      board: 'GSEB',
    },
  });

  const skvAdmin = await prisma.user.upsert({
    where: { email: 'admin@skv.edu.in' },
    update: { passwordHash },
    create: {
      email: 'admin@skv.edu.in',
      phone: '9879012345',
      passwordHash,
      preferredLocale: 'gu',
    },
  });

  const ut2 = await prisma.userTenant.upsert({
    where: { userId_tenantId: { userId: skvAdmin.id, tenantId: tenant2.id } },
    update: {},
    create: { userId: skvAdmin.id, tenantId: tenant2.id, isDefault: true },
  });

  const skvAdminRole = await prisma.role.findFirst({ where: { tenantId: tenant2.id, name: 'SCHOOL_ADMIN' } });
  if (skvAdminRole) {
    await prisma.userRole.upsert({
      where: { userTenantId_roleId: { userTenantId: ut2.id, roleId: skvAdminRole.id } },
      update: {},
      create: { userTenantId: ut2.id, roleId: skvAdminRole.id },
    });
  }

  // Student in Tenant 2 to test isolation
  await prisma.student.upsert({
    where: { tenantId_grNumber: { tenantId: tenant2.id, grNumber: 'SKV-501' } },
    update: {},
    create: {
      tenantId: tenant2.id,
      grNumber: 'SKV-501',
      firstNameEn: 'Devanshu',
      lastNameEn: 'Shukla',
      firstNameGu: 'દેવાંશુ',
      lastNameGu: 'શુક્લા',
      gender: 'MALE',
      dateOfBirth: new Date('2018-05-10'),
      city: 'Ahmedabad',
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error('Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
