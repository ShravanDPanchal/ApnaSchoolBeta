import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';

export interface TimetableEntryDto {
  id?: string;
  academicYearId: string;
  classId: string;
  divisionId?: string;
  periodId: string;
  subjectId: string;
  staffId: string;
  dayOfWeek: number; // 1 = Monday, 6 = Saturday
  roomName?: string;
}

export class TimetableService {
  async getPeriods(tenantId: string, academicYearId: string) {
    let periods = await prisma.timetablePeriod.findMany({
      where: { tenantId, academicYearId, isActive: true },
      orderBy: { periodNumber: 'asc' },
    });

    if (periods.length === 0) {
      // Seed default 8 periods + morning assembly + recess
      periods = await this.setupDefaultPeriods(tenantId, academicYearId);
    }

    return periods;
  }

  async setupDefaultPeriods(tenantId: string, academicYearId: string) {
    const defaultPeriods = [
      { periodNumber: 1, nameEn: 'Period 1', nameGu: 'તાસ ૧', startTime: '07:30', endTime: '08:15', isBreak: false },
      { periodNumber: 2, nameEn: 'Period 2', nameGu: 'તાસ ૨', startTime: '08:15', endTime: '09:00', isBreak: false },
      { periodNumber: 3, nameEn: 'Recess (રીસેસ)', nameGu: 'મધ્યાહ્ન રીસેસ', startTime: '09:00', endTime: '09:20', isBreak: true },
      { periodNumber: 4, nameEn: 'Period 3', nameGu: 'તાસ ૩', startTime: '09:20', endTime: '10:05', isBreak: false },
      { periodNumber: 5, nameEn: 'Period 4', nameGu: 'તાસ ૪', startTime: '10:05', endTime: '10:50', isBreak: false },
      { periodNumber: 6, nameEn: 'Period 5', nameGu: 'તાસ ૫', startTime: '10:50', endTime: '11:35', isBreak: false },
      { periodNumber: 7, nameEn: 'Period 6', nameGu: 'તાસ ૬', startTime: '11:35', endTime: '12:15', isBreak: false },
    ];

    const created = [];
    for (const p of defaultPeriods) {
      const rec = await prisma.timetablePeriod.upsert({
        where: { tenantId_academicYearId_periodNumber: { tenantId, academicYearId, periodNumber: p.periodNumber } },
        update: {},
        create: {
          tenantId,
          academicYearId,
          ...p,
        },
      });
      created.push(rec);
    }
    return created;
  }

  // --- CONFLICT DETECTION & ENTRY UPSERT ---
  async saveTimetableEntry(tenantId: string, userId: string, dto: TimetableEntryDto) {
    const period = await prisma.timetablePeriod.findFirst({
      where: { id: dto.periodId, tenantId },
    });
    if (!period) throw new Error('PERIOD_NOT_FOUND');

    const dayMap: Record<string, number> = {
      MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6, SUNDAY: 7,
    };
    const dayOfWeek = typeof dto.dayOfWeek === 'string'
      ? (dayMap[dto.dayOfWeek] || parseInt(dto.dayOfWeek, 10) || 1)
      : Number(dto.dayOfWeek) || 1;

    // Resolve subject if subjectName passed
    let subjectId = dto.subjectId || null;
    if (!subjectId && (dto as any).subjectName) {
      const subjectName = String((dto as any).subjectName).trim();
      let sub = await prisma.subject.findFirst({
        where: { tenantId, nameGu: subjectName },
      });
      if (!sub) {
        sub = await prisma.subject.findFirst({
          where: { tenantId, nameEn: subjectName },
        });
      }
      if (!sub) {
        sub = await prisma.subject.create({
          data: {
            tenantId,
            code: subjectName.substring(0, 4).toUpperCase(),
            nameGu: subjectName,
            nameEn: subjectName,
          },
        });
      }
      subjectId = sub.id;
    }

    // 1. CONFLICT CHECK 1: Teacher Conflict
    // Is this teacher already teaching another class during this exact day and period?
    if (dto.staffId) {
      const teacherConflict = await prisma.timetableEntry.findFirst({
        where: {
          tenantId,
          academicYearId: dto.academicYearId,
          staffId: dto.staffId,
          dayOfWeek: dayOfWeek,
          periodId: dto.periodId,
          isActive: true,
          ...(dto.id ? { id: { not: dto.id } } : {}),
          classId: { not: dto.classId },
        },
        include: {
          class: true,
          staff: true,
          subject: true,
        },
      });

      if (teacherConflict) {
        const teacherName = teacherConflict.staff
          ? `${teacherConflict.staff.firstNameGu} ${teacherConflict.staff.lastNameGu}`
          : 'શિક્ષક';
        const conflictingClass = teacherConflict.class.nameGu;
        throw new Error(
          `શિક્ષક સંઘર્ષ (Teacher Conflict): ${teacherName} આ સમયે (${period.nameGu}) ધોરણ ${conflictingClass} માં પહેલેથી જ રોકાયેલા છે.`
        );
      }
    }

    // 2. CONFLICT CHECK 2: Room Conflict
    // If a room is specified, is it already booked by another class during this day and period?
    if (dto.roomName && dto.roomName.trim()) {
      const roomConflict = await prisma.timetableEntry.findFirst({
        where: {
          tenantId,
          academicYearId: dto.academicYearId,
          roomName: dto.roomName.trim(),
          dayOfWeek: dayOfWeek,
          periodId: dto.periodId,
          isActive: true,
          ...(dto.id ? { id: { not: dto.id } } : {}),
          classId: { not: dto.classId },
        },
        include: {
          class: true,
        },
      });

      if (roomConflict) {
        throw new Error(
          `રૂમ સંઘર્ષ (Room Conflict): રૂમ ${dto.roomName} આ સમયે (${period.nameGu}) ધોરણ ${roomConflict.class.nameGu} દ્વારા રોકાયેલો છે.`
        );
      }
    }

    // 3. Upsert entry for this class, division, day and period
    const existingEntry = await prisma.timetableEntry.findFirst({
      where: {
        tenantId,
        academicYearId: dto.academicYearId,
        classId: dto.classId,
        divisionId: dto.divisionId || null,
        periodId: dto.periodId,
        dayOfWeek: dayOfWeek,
        isActive: true,
      },
    });

    let entry;
    if (existingEntry) {
      entry = await prisma.timetableEntry.update({
        where: { id: existingEntry.id },
        data: {
          subjectId: subjectId || existingEntry.subjectId,
          staffId: dto.staffId || null,
          roomName: dto.roomName || null,
        },
        include: {
          class: true,
          subject: true,
          staff: true,
          period: true,
        },
      });
    } else {
      entry = await prisma.timetableEntry.create({
        data: {
          tenantId,
          academicYearId: dto.academicYearId,
          classId: dto.classId,
          divisionId: dto.divisionId || null,
          periodId: dto.periodId,
          subjectId: subjectId,
          staffId: dto.staffId || null,
          dayOfWeek: dayOfWeek,
          roomName: dto.roomName || null,
        },
        include: {
          class: true,
          subject: true,
          staff: true,
          period: true,
        },
      });
    }

    await logAudit({
      tenantId,
      userId,
      action: 'SAVE_TIMETABLE_ENTRY',
      entityType: 'TIMETABLE_ENTRY',
      entityId: entry.id,
      newValues: { classId: dto.classId, subjectId: subjectId, staffId: dto.staffId, day: dayOfWeek },
    });

    return entry;
  }

  // --- CLASS TIMETABLE GRID ---
  async getClassTimetable(tenantId: string, academicYearId: string, classId: string, divisionId?: string) {
    const [periods, entries] = await Promise.all([
      this.getPeriods(tenantId, academicYearId),
      prisma.timetableEntry.findMany({
        where: {
          tenantId,
          academicYearId,
          classId,
          ...(divisionId ? { divisionId } : {}),
          isActive: true,
        },
        include: {
          subject: true,
          staff: true,
          period: true,
        },
      }),
    ]);

    // Format grid [Day 1..6][Period 1..N]
    const grid: Record<number, Record<string, any>> = {
      1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {},
    };

    for (const entry of entries) {
      grid[entry.dayOfWeek][entry.periodId] = {
        id: entry.id,
        subjectNameGu: entry.subject?.nameGu,
        subjectNameEn: entry.subject?.nameEn,
        subjectCode: entry.subject?.code,
        teacherNameGu: entry.staff ? `${entry.staff.firstNameGu} ${entry.staff.lastNameGu}` : '',
        teacherNameEn: entry.staff ? `${entry.staff.firstNameEn} ${entry.staff.lastNameEn}` : '',
        roomName: entry.roomName,
        staffId: entry.staffId,
        subjectId: entry.subjectId,
      };
    }

    return {
      classId,
      periods,
      grid,
    };
  }

  // --- TEACHER TIMETABLE GRID ---
  async getTeacherTimetable(tenantId: string, academicYearId: string, staffId: string) {
    const [periods, entries, staff] = await Promise.all([
      this.getPeriods(tenantId, academicYearId),
      prisma.timetableEntry.findMany({
        where: {
          tenantId,
          academicYearId,
          staffId,
          isActive: true,
        },
        include: {
          class: true,
          division: true,
          subject: true,
          period: true,
        },
      }),
      prisma.staff.findFirst({ where: { id: staffId, tenantId } }),
    ]);

    if (!staff) throw new Error('STAFF_NOT_FOUND');

    const grid: Record<number, Record<string, any>> = {
      1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {},
    };

    for (const entry of entries) {
      grid[entry.dayOfWeek][entry.periodId] = {
        id: entry.id,
        classNameGu: entry.class.nameGu,
        classNameEn: entry.class.nameEn,
        divisionNameEn: entry.division?.nameEn,
        subjectNameGu: entry.subject?.nameGu,
        subjectNameEn: entry.subject?.nameEn,
        roomName: entry.roomName,
      };
    }

    return {
      staffId,
      teacherNameGu: `${staff.firstNameGu} ${staff.lastNameGu}`,
      teacherNameEn: `${staff.firstNameEn} ${staff.lastNameEn}`,
      designation: staff.designation,
      periods,
      grid,
      totalWeeklyPeriods: entries.length,
    };
  }
}

export const timetableService = new TimetableService();
