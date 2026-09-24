import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/prisma';
import { config } from '../../config';
import { UserRole, AccountGroupType, AccountNature, PermissionCode } from '@apna-school/shared-types';
import { logAudit } from '../../common/utils/audit';
import { sendSmsOtp } from '../../common/utils/sms';

export interface RegisterSchoolDto {
  name: string;
  mobile: string;
  email?: string;
  password: string;
  schoolNameGu: string;
  schoolNameEn?: string;
  district?: string;
  taluka?: string;
  diseCode?: string;
  otp: string;
}

export class AuthService {
  /**
   * Send 6-digit OTP to mobile or email
   */
  async sendOtp(identifier: string, purpose: 'REGISTRATION' | 'LOGIN' | 'FORGOT_PASSWORD', metadata?: any) {
    const cleanId = identifier.trim();
    if (!cleanId) {
      throw new Error('IDENTIFIER_REQUIRED');
    }

    const isPhone = /^[0-9]{10}$/.test(cleanId.replace(/\D/g, ''));
    const isEmail = cleanId.includes('@');

    if (!isPhone && !isEmail) {
      throw new Error('INVALID_PHONE_OR_EMAIL');
    }

    const normalizedIdentifier = isPhone ? cleanId.replace(/\D/g, '') : cleanId.toLowerCase();

    // Validate existence based on purpose
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedIdentifier }, { email: normalizedIdentifier }],
      },
    });

    if (purpose === 'REGISTRATION' && existingUser) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    if ((purpose === 'LOGIN' || purpose === 'FORGOT_PASSWORD') && !existingUser) {
      throw new Error('USER_NOT_FOUND');
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate prior unverified OTPs for this identifier and purpose
    await prisma.otpVerification.deleteMany({
      where: {
        identifier: normalizedIdentifier,
        purpose,
        isVerified: false,
      },
    });

    // Store in database
    await prisma.otpVerification.create({
      data: {
        identifier: normalizedIdentifier,
        otp,
        purpose,
        expiresAt,
        isVerified: false,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Dispatch Real SMS via configured Gateway (Fast2SMS / 2Factor / Twilio / MSG91)
    if (isPhone) {
      await sendSmsOtp({
        to: normalizedIdentifier,
        otp,
        purpose,
      }).catch((err) => console.error('[SMS Dispatch Error]:', err));
    }

    return {
      identifier: normalizedIdentifier,
      purpose,
      expiresInSeconds: 600,
      devOtp: process.env.NODE_ENV === 'test' ? otp : undefined,
      message: 'OTP sent successfully',
    };
  }

  /**
   * Verify 6-digit OTP code
   */
  async verifyOtp(identifier: string, otp: string, purpose: string) {
    const cleanId = identifier.trim();
    const isPhone = /^[0-9]{10}$/.test(cleanId.replace(/\D/g, ''));
    const normalizedIdentifier = isPhone ? cleanId.replace(/\D/g, '') : cleanId.toLowerCase();

    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        identifier: normalizedIdentifier,
        purpose,
        isVerified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('OTP_NOT_FOUND');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new Error('OTP_EXPIRED');
    }

    if (otpRecord.attempts >= 5) {
      throw new Error('OTP_MAX_ATTEMPTS_EXCEEDED');
    }

    if (otpRecord.otp !== otp.trim()) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new Error('OTP_INVALID');
    }

    // Mark verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isVerified: true },
    });

    return {
      success: true,
      verified: true,
      identifier: normalizedIdentifier,
    };
  }

  /**
   * Register a brand new School & Admin User with automated full provisioning
   */
  async register(data: RegisterSchoolDto) {
    const cleanPhone = data.mobile.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('INVALID_PHONE');
    }

    const cleanEmail = data.email ? data.email.trim().toLowerCase() : `${cleanPhone}@apnaschool.edu.in`;

    // 1. Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ phone: cleanPhone }, { email: cleanEmail }],
      },
    });

    if (existing) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    // 2. Verify OTP
    const verifiedOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: cleanPhone,
        purpose: 'REGISTRATION',
        isVerified: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!verifiedOtp && data.otp) {
      // Try verifying inline if not already verified
      await this.verifyOtp(cleanPhone, data.otp, 'REGISTRATION');
    } else if (!verifiedOtp) {
      throw new Error('OTP_VERIFICATION_REQUIRED');
    }

    const schoolGu = data.schoolNameGu.trim();
    const schoolEn = data.schoolNameEn?.trim() || schoolGu;
    const adminName = data.name.trim();

    // 3. Generate unique tenant slug and code
    const baseCode = schoolEn
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 4)
      .toUpperCase() || 'SCH';
    const randCodeNum = Math.floor(1000 + Math.random() * 9000);
    const tenantCode = `${baseCode}${randCodeNum}`;
    const tenantSlug = `${baseCode.toLowerCase()}-${randCodeNum}`;

    const passwordHash = await bcrypt.hash(data.password, 10);

    // 4. Ensure baseline permissions exist
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

    const allPerms = await prisma.permission.findMany();

    // 5. Transactional Provisioning
    const result = await prisma.$transaction(async (tx) => {
      // 5.1 Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: `${schoolGu} (${schoolEn})`,
          slug: tenantSlug,
          code: tenantCode,
          subscriptionPlan: 'PRO',
        },
      });

      // 5.2 Create School Profile
      const school = await tx.school.create({
        data: {
          tenantId: tenant.id,
          nameEn: schoolEn,
          nameGu: schoolGu,
          code: tenantCode,
          district: data.district || 'Gujarat',
          taluka: data.taluka || '',
          state: 'Gujarat',
          phone: cleanPhone,
          email: cleanEmail,
          principalName: adminName,
          primaryColor: '#007ed4',
          secondaryColor: '#EEAA00',
          schoolType: 'PRIMARY',
          medium: 'GUJARATI',
          board: 'GSEB',
          diseCode: data.diseCode || '',
        },
      });

      // 5.3 Academic Year & Financial Year (2026-27)
      const academicYear = await tx.academicYear.create({
        data: {
          tenantId: tenant.id,
          name: '2026-27',
          startDate: new Date('2026-06-01'),
          endDate: new Date('2027-04-30'),
          isCurrent: true,
        },
      });

      const financialYear = await tx.financialYear.create({
        data: {
          tenantId: tenant.id,
          name: '2026-27',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2027-03-31'),
          isCurrent: true,
        },
      });

      // 5.4 Roles & Permissions
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
        const role = await tx.role.create({
          data: {
            tenantId: tenant.id,
            name: rName,
            displayNameEn: rName.replace('_', ' '),
            displayNameGu:
              rName === UserRole.ACCOUNTANT ? 'હિસાબનીશ' : rName === UserRole.PRINCIPAL ? 'આચાર્ય' : 'શિક્ષક / એડમિન',
            isSystemRole: true,
          },
        });
        roleMap[rName] = role;

        for (const p of allPerms) {
          await tx.rolePermission.create({
            data: { roleId: role.id, permissionId: p.id },
          });
        }
      }

      // 5.5 Chart of Accounts (Deshi Nama Structure)
      const groupAsset = await tx.accountGroup.create({
        data: {
          tenantId: tenant.id,
          nameEn: 'Current Assets',
          nameGu: 'ચાલુ મિલકતો',
          groupType: AccountGroupType.ASSET,
          isSystem: true,
        },
      });
      const groupIncome = await tx.accountGroup.create({
        data: {
          tenantId: tenant.id,
          nameEn: 'Fee & Operating Income',
          nameGu: 'ફી અને પ્રવૃત્તિ આવક',
          groupType: AccountGroupType.INCOME,
          isSystem: true,
        },
      });
      const groupExpense = await tx.accountGroup.create({
        data: {
          tenantId: tenant.id,
          nameEn: 'Operating Expenses',
          nameGu: 'સંચાલન ખર્ચ',
          groupType: AccountGroupType.EXPENSE,
          isSystem: true,
        },
      });

      // Cash in Hand
      await tx.chartOfAccount.create({
        data: {
          tenantId: tenant.id,
          accountGroupId: groupAsset.id,
          code: '1001',
          nameEn: 'Cash in Hand',
          nameGu: 'શ્રી રોકડ સિલક ખાતું',
          accountType: AccountGroupType.ASSET,
          accountNature: AccountNature.DEBIT,
          openingBalance: 0,
          currentBalance: 0,
          financialYearId: financialYear.id,
          isCashAccount: true,
          isSystem: true,
        },
      });

      // Bank Account
      await tx.chartOfAccount.create({
        data: {
          tenantId: tenant.id,
          accountGroupId: groupAsset.id,
          code: '1002',
          nameEn: 'State Bank of India (Main)',
          nameGu: 'શ્રી બેંક ઓફ ઇન્ડિયા ખાતું',
          accountType: AccountGroupType.ASSET,
          accountNature: AccountNature.DEBIT,
          openingBalance: 0,
          currentBalance: 0,
          financialYearId: financialYear.id,
          isBankAccount: true,
          isSystem: true,
        },
      });

      // Tuition Fee Income
      const tuitionAcc = await tx.chartOfAccount.create({
        data: {
          tenantId: tenant.id,
          accountGroupId: groupIncome.id,
          code: '3001',
          nameEn: 'Tuition Fee Income',
          nameGu: 'શ્રી શિક્ષણ ફી આવક ખાતું',
          accountType: AccountGroupType.INCOME,
          accountNature: AccountNature.CREDIT,
          openingBalance: 0,
          currentBalance: 0,
          financialYearId: financialYear.id,
        },
      });

      // Salary Expense
      await tx.chartOfAccount.create({
        data: {
          tenantId: tenant.id,
          accountGroupId: groupExpense.id,
          code: '4001',
          nameEn: 'Staff Salary Expense',
          nameGu: 'શ્રી શિક્ષક પગાર ખર્ચ ખાતું',
          accountType: AccountGroupType.EXPENSE,
          accountNature: AccountNature.DEBIT,
          openingBalance: 0,
          currentBalance: 0,
          financialYearId: financialYear.id,
        },
      });

      // 5.6 Fee Heads
      await tx.feeHead.create({
        data: {
          tenantId: tenant.id,
          nameEn: 'Tuition Fee',
          nameGu: 'શિક્ષણ ફી',
          code: 'TUTION',
          accountId: tuitionAcc.id,
        },
      });
      await tx.feeHead.create({
        data: {
          tenantId: tenant.id,
          nameEn: 'Term Fee',
          nameGu: 'સત્ર ફી',
          code: 'TERM',
          accountId: tuitionAcc.id,
        },
      });

      // 5.7 Classes (Std 1 to 8 with Div A and B)
      const gujaratiClassNames = ['ધો. ૧', 'ધો. ૨', 'ધો. ૩', 'ધો. ૪', 'ધો. ૫', 'ધો. ૬', 'ધો. ૭', 'ધો. ૮'];
      for (let i = 1; i <= 8; i++) {
        const cls = await tx.class.create({
          data: {
            tenantId: tenant.id,
            nameEn: `Std ${i}`,
            nameGu: gujaratiClassNames[i - 1],
            numericOrder: i,
          },
        });
        await tx.division.create({
          data: { tenantId: tenant.id, classId: cls.id, nameEn: 'A', nameGu: 'અ', capacity: 40 },
        });
        await tx.division.create({
          data: { tenantId: tenant.id, classId: cls.id, nameEn: 'B', nameGu: 'બ', capacity: 40 },
        });
      }

      // 5.8 Create User & Admin Relation
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          preferredLocale: 'gu',
        },
      });

      const userTenant = await tx.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          isDefault: true,
        },
      });

      await tx.userRole.create({
        data: {
          userTenantId: userTenant.id,
          roleId: roleMap[UserRole.SCHOOL_ADMIN].id,
        },
      });

      // 5.9 Create Staff Record
      await tx.staff.create({
        data: {
          tenantId: tenant.id,
          userId: user.id,
          employeeId: 'EMP-001',
          firstNameEn: adminName,
          lastNameEn: '',
          firstNameGu: adminName,
          lastNameGu: '',
          designation: 'Principal / Admin',
          phone: cleanPhone,
          email: cleanEmail,
          joiningDate: new Date(),
          staffType: 'TEACHING',
        },
      });

      return { tenant, school, user, academicYear, financialYear };
    });

    // Clean up OTP record
    await prisma.otpVerification.deleteMany({
      where: { identifier: cleanPhone, purpose: 'REGISTRATION' },
    });

    // Return instant login session
    return this.login(cleanPhone, data.password, result.tenant.code);
  }

  /**
   * Reset password via OTP
   */
  async resetPassword(identifier: string, otp: string, newPassword: string) {
    const cleanId = identifier.trim();
    const isPhone = /^[0-9]{10}$/.test(cleanId.replace(/\D/g, ''));
    const normalizedIdentifier = isPhone ? cleanId.replace(/\D/g, '') : cleanId.toLowerCase();

    // Verify OTP
    await this.verifyOtp(normalizedIdentifier, otp, 'FORGOT_PASSWORD');

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: normalizedIdentifier }, { email: normalizedIdentifier }],
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await prisma.otpVerification.deleteMany({
      where: { identifier: normalizedIdentifier, purpose: 'FORGOT_PASSWORD' },
    });

    return { success: true, message: 'Password reset successfully' };
  }

  /**
   * User Login with Email / Phone + Password
   */
  async login(identifier: string, password: string, tenantCode?: string) {
    const cleanId = identifier.trim();
    const isPhone = /^[0-9]{10}$/.test(cleanId.replace(/\D/g, ''));
    const normalizedIdentifier = isPhone ? cleanId.replace(/\D/g, '') : cleanId.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedIdentifier }, { phone: normalizedIdentifier }],
      },
      include: {
        userTenants: {
          include: {
            tenant: {
              include: {
                schools: true,
                academicYears: { where: { isCurrent: true } },
                financialYears: { where: { isCurrent: true } },
              },
            },
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Select tenant
    let selectedUserTenant = user.userTenants[0];
    if (tenantCode) {
      const match = user.userTenants.find(
        (ut) =>
          ut.tenant.code.toLowerCase() === tenantCode.toLowerCase() ||
          ut.tenant.slug.toLowerCase() === tenantCode.toLowerCase()
      );
      if (match) selectedUserTenant = match;
    }

    if (!selectedUserTenant && !user.isSuperAdmin) {
      throw new Error('NO_TENANT_ASSIGNED');
    }

    const tenant = selectedUserTenant?.tenant;
    const school = tenant?.schools[0];
    const userRole = selectedUserTenant?.userRoles[0]?.role;
    const roleName = (userRole?.name as UserRole) || (user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.TEACHER);

    // Collect permissions
    const permissions: string[] = [];
    if (selectedUserTenant?.userRoles) {
      for (const ur of selectedUserTenant.userRoles) {
        for (const rp of ur.role.rolePermissions) {
          permissions.push(rp.permission.code);
        }
      }
    }

    // Create JWT payload
    const payload = {
      userId: user.id,
      tenantId: tenant?.id || '',
      email: user.email || '',
      phone: user.phone || '',
      role: roleName,
      isSuperAdmin: user.isSuperAdmin,
      permissions,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAudit({
      tenantId: tenant?.id,
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      newValues: { role: roleName },
    });

    return {
      token,
      user: {
        userId: user.id,
        tenantId: tenant?.id || '',
        tenantCode: tenant?.code || '',
        email: user.email,
        phone: user.phone,
        preferredLocale: user.preferredLocale as 'gu' | 'en',
        role: roleName,
        permissions,
        schoolNameEn: school?.nameEn || tenant?.name || 'Apna School Platform',
        schoolNameGu: school?.nameGu || tenant?.name || 'અપના સ્કૂલ પ્લેટફોર્મ',
        schoolLogo: school?.logoUrl,
        primaryColor: school?.primaryColor || '#1E40AF',
        secondaryColor: school?.secondaryColor || '#F59E0B',
        currentAcademicYearId: tenant?.academicYears[0]?.id,
        currentFinancialYearId: tenant?.financialYears[0]?.id,
      },
      availableTenants: user.userTenants.map((ut) => ({
        tenantId: ut.tenant.id,
        tenantCode: ut.tenant.code,
        name: ut.tenant.name,
      })),
    };
  }

  async getProfile(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userTenants: {
          where: { tenantId },
          include: {
            tenant: {
              include: {
                schools: true,
                academicYears: { where: { isCurrent: true } },
                financialYears: { where: { isCurrent: true } },
              },
            },
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new Error('USER_NOT_FOUND');

    const ut = user.userTenants[0];
    const tenant = ut?.tenant;
    const school = tenant?.schools[0];
    const role = ut?.userRoles[0]?.role?.name || (user.isSuperAdmin ? UserRole.SUPER_ADMIN : UserRole.TEACHER);

    const permissions: string[] = [];
    if (ut?.userRoles) {
      for (const ur of ut.userRoles) {
        for (const rp of ur.role.rolePermissions) {
          permissions.push(rp.permission.code);
        }
      }
    }

    return {
      userId: user.id,
      tenantId: tenant?.id || '',
      tenantCode: tenant?.code || '',
      email: user.email,
      phone: user.phone,
      preferredLocale: user.preferredLocale,
      role,
      permissions,
      schoolNameEn: school?.nameEn || tenant?.name,
      schoolNameGu: school?.nameGu || tenant?.name,
      schoolLogo: school?.logoUrl,
      primaryColor: school?.primaryColor || '#1E40AF',
      secondaryColor: school?.secondaryColor || '#F59E0B',
      currentAcademicYearId: tenant?.academicYears[0]?.id,
      currentFinancialYearId: tenant?.financialYears[0]?.id,
    };
  }

  async updateLocale(userId: string, locale: 'gu' | 'en') {
    await prisma.user.update({
      where: { id: userId },
      data: { preferredLocale: locale },
    });
    return { success: true, locale };
  }
}

export const authService = new AuthService();

