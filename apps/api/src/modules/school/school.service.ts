import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';

export class SchoolService {
  async getSchoolProfile(tenantId: string) {
    const school = await prisma.school.findFirst({
      where: { tenantId },
    });
    return school;
  }

  async updateSchoolProfile(tenantId: string, userId: string, data: any) {
    const school = await prisma.school.findFirst({ where: { tenantId } });
    if (!school) throw new Error('SCHOOL_NOT_FOUND');

    const updated = await prisma.school.update({
      where: { id: school.id },
      data: {
        nameEn: data.nameEn ?? school.nameEn,
        nameGu: data.nameGu ?? school.nameGu,
        principalName: data.principalName ?? school.principalName,
        phone: data.phone ?? school.phone,
        email: data.email ?? school.email,
        addressLine1: data.addressLine1 ?? school.addressLine1,
        addressLine2: data.addressLine2 ?? school.addressLine2,
        city: data.city ?? school.city,
        district: data.district ?? school.district,
        taluka: data.taluka ?? school.taluka,
        pinCode: data.pinCode ?? school.pinCode,
        diseCode: data.diseCode ?? school.diseCode,
        registrationNo: data.registrationNo ?? school.registrationNo,
        primaryColor: data.primaryColor ?? school.primaryColor,
        secondaryColor: data.secondaryColor ?? school.secondaryColor,
        logoUrl: data.logoUrl ?? school.logoUrl,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'SCHOOL',
      entityId: school.id,
      oldValues: school,
      newValues: updated,
    });

    return updated;
  }

  async getAcademicYears(tenantId: string) {
    return prisma.academicYear.findMany({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async getFinancialYears(tenantId: string) {
    return prisma.financialYear.findMany({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async getClasses(tenantId: string) {
    return prisma.class.findMany({
      where: { tenantId, isActive: true },
      include: {
        divisions: { where: { isActive: true }, orderBy: { nameEn: 'asc' } },
      },
      orderBy: { numericOrder: 'asc' },
    });
  }

  async getSubjects(tenantId: string) {
    return prisma.subject.findMany({
      where: { tenantId, isActive: true },
      orderBy: { nameEn: 'asc' },
    });
  }

  async getNotices(tenantId: string) {
    return prisma.notification.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createNotice(tenantId: string, userId: string, data: { titleEn: string; titleGu?: string; bodyEn?: string; bodyGu?: string; notificationType?: string }) {
    const notice = await prisma.notification.create({
      data: {
        tenantId,
        titleEn: data.titleEn,
        titleGu: data.titleGu || data.titleEn,
        bodyEn: data.bodyEn,
        bodyGu: data.bodyGu || data.bodyEn,
        notificationType: data.notificationType || 'INFO',
        createdById: userId,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE_NOTICE',
      entityType: 'NOTIFICATION',
      entityId: notice.id,
      newValues: data,
    });

    return notice;
  }
}

export const schoolService = new SchoolService();
