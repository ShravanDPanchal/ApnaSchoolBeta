import { timetableService } from '../src/modules/timetable/timetable.service';
import { prisma } from '../src/database/prisma';

describe('Timetable Engine & Conflict Detection Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let class1Id: string;
  let class2Id: string;
  let class3Id: string;
  let teacher1Id: string;
  let teacher2Id: string;
  let teacher3Id: string;
  let subject1Id: string;
  let subject2Id: string;
  let period1Id: string;

  beforeAll(async () => {
    const tenant = await prisma.tenant.findFirst({ where: { code: 'SSVM' } });
    if (!tenant) throw new Error('Run seed before running tests');
    tenantId = tenant.id;

    const user = await prisma.user.findFirst({ where: { email: 'admin@ssvm.edu.in' } });
    userId = user!.id;

    const currentYear = await prisma.academicYear.findFirst({ where: { tenantId, name: '2026-27' } });
    academicYearId = currentYear!.id;

    const c1 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 1 } });
    const c2 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 2 } });
    const c3 = await prisma.class.findFirst({ where: { tenantId, numericOrder: 3 } });
    class1Id = c1!.id;
    class2Id = c2!.id;
    class3Id = c3!.id;

    const s1 = await prisma.staff.findFirst({ where: { tenantId, employeeId: 'EMP-001' } });
    const s2 = await prisma.staff.findFirst({ where: { tenantId, employeeId: 'EMP-002' } });
    teacher1Id = s1!.id;
    teacher2Id = s2!.id;

    // Create a 3rd teacher for room conflict testing
    const s3 = await prisma.staff.upsert({
      where: { tenantId_employeeId: { tenantId, employeeId: 'EMP-099' } },
      update: {},
      create: {
        tenantId,
        employeeId: 'EMP-099',
        firstNameEn: 'Nirav',
        lastNameEn: 'Pandya',
        firstNameGu: 'નીરવ',
        lastNameGu: 'પંડ્યા',
        designation: 'Teacher',
        staffType: 'TEACHING',
      },
    });
    teacher3Id = s3.id;

    // Subjects
    const sub1 = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId, code: 'GUJ-01' } },
      update: {},
      create: { tenantId, nameEn: 'Gujarati', nameGu: 'ગુજરાતી', code: 'GUJ-01' },
    });
    const sub2 = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId, code: 'MATH-01' } },
      update: {},
      create: { tenantId, nameEn: 'Mathematics', nameGu: 'ગણિત', code: 'MATH-01' },
    });
    subject1Id = sub1.id;
    subject2Id = sub2.id;

    // Periods
    const periods = await timetableService.getPeriods(tenantId, academicYearId);
    period1Id = periods[0].id;

    // Clear existing timetable test entries
    await prisma.timetableEntry.deleteMany({ where: { tenantId, academicYearId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1. Saves a valid timetable entry without conflicts', async () => {
    const entry = await timetableService.saveTimetableEntry(tenantId, userId, {
      academicYearId,
      classId: class1Id,
      periodId: period1Id,
      subjectId: subject1Id,
      staffId: teacher1Id,
      dayOfWeek: 1, // Monday
      roomName: 'Room 101',
    });

    expect(entry).toBeDefined();
    expect(entry.staffId).toBe(teacher1Id);
    expect(entry.dayOfWeek).toBe(1);
  });

  test('2. Detects and rejects Teacher Conflict when teacher is double-booked', async () => {
    // Attempt to book teacher 1 in class 2 during Monday Period 1 (already teaching Class 1)
    await expect(
      timetableService.saveTimetableEntry(tenantId, userId, {
        academicYearId,
        classId: class2Id,
        periodId: period1Id,
        subjectId: subject2Id,
        staffId: teacher1Id, // Same teacher!
        dayOfWeek: 1,
        roomName: 'Room 102',
      })
    ).rejects.toThrow(/Teacher Conflict|શિક્ષક સંઘર્ષ/);
  });

  test('3. Detects and rejects Room Conflict when room is double-booked', async () => {
    // Assign teacher 2 to class 2 in Room 101 (Room 101 is already booked by Class 1 during Monday Period 1)
    await expect(
      timetableService.saveTimetableEntry(tenantId, userId, {
        academicYearId,
        classId: class2Id,
        periodId: period1Id,
        subjectId: subject2Id,
        staffId: teacher2Id,
        dayOfWeek: 1,
        roomName: 'Room 101', // Same room!
      })
    ).rejects.toThrow(/Room Conflict|રૂમ સંઘર્ષ/);
  });

  test('4. Successfully retrieves Class Timetable Grid', async () => {
    const timetable = await timetableService.getClassTimetable(tenantId, academicYearId, class1Id);
    expect(timetable.periods.length).toBeGreaterThan(0);
    expect(timetable.grid[1][period1Id]).toBeDefined();
    expect(timetable.grid[1][period1Id].roomName).toBe('Room 101');
  });

  test('5. Successfully retrieves Teacher Timetable Grid', async () => {
    const teacherTimetable = await timetableService.getTeacherTimetable(tenantId, academicYearId, teacher1Id);
    expect(teacherTimetable.teacherNameGu).toBeDefined();
    expect(teacherTimetable.totalWeeklyPeriods).toBeGreaterThan(0);
    expect(teacherTimetable.grid[1][period1Id]).toBeDefined();
  });
});
