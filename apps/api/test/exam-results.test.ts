import { examService } from '../src/modules/exam/exam.service';
import { prisma } from '../src/database/prisma';

describe('Examination, Marks & Result Calculation Engine Tests', () => {
  let tenantId: string;
  let userId: string;
  let academicYearId: string;
  let class1Id: string;
  let subMathId: string;
  let subSciId: string;
  let subEngId: string;
  let examTypeId: string;
  let examMath: any;
  let examSci: any;
  let examEng: any;
  let student1: any;
  let student2: any;
  let student3: any;

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

    const subMath = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId, code: 'MATH-1' } },
      update: {},
      create: { tenantId, nameEn: 'Mathematics', nameGu: 'ગણિત', code: 'MATH-1' },
    });
    const subSci = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId, code: 'SCI-1' } },
      update: {},
      create: { tenantId, nameEn: 'General Science', nameGu: 'સામાન્ય વિજ્ઞાન', code: 'SCI-1' },
    });
    const subEng = await prisma.subject.upsert({
      where: { tenantId_code: { tenantId, code: 'ENG-1' } },
      update: {},
      create: { tenantId, nameEn: 'English', nameGu: 'અંગ્રેજી', code: 'ENG-1' },
    });
    subMathId = subMath.id;
    subSciId = subSci.id;
    subEngId = subEng.id;

    // Create or get ExamType
    const examType = await prisma.examType.upsert({
      where: { id: 'exam-type-sem1-test' },
      update: {},
      create: {
        id: 'exam-type-sem1-test',
        tenantId,
        academicYearId,
        nameEn: 'Semester 1 Final Exam',
        nameGu: 'પ્રથમ સત્ર વાર્ષિક પરીક્ષા',
        maxMarksDefault: 100,
        passingPercentage: 33,
        sequenceOrder: 1,
      },
    });
    examTypeId = examType.id;

    // Create 3 exam schedules (Math, Science, English) with Theory (70), Practical (20), Internal (10) = 100
    examMath = await prisma.exam.create({
      data: {
        tenantId,
        examTypeId,
        classId: class1Id,
        subjectId: subMathId,
        theoryMax: 70,
        practicalMax: 20,
        internalMax: 10,
        maxMarks: 100,
        passingMarks: 33,
      },
    });

    examSci = await prisma.exam.create({
      data: {
        tenantId,
        examTypeId,
        classId: class1Id,
        subjectId: subSciId,
        theoryMax: 70,
        practicalMax: 20,
        internalMax: 10,
        maxMarks: 100,
        passingMarks: 33,
      },
    });

    examEng = await prisma.exam.create({
      data: {
        tenantId,
        examTypeId,
        classId: class1Id,
        subjectId: subEngId,
        theoryMax: 80,
        practicalMax: 0,
        internalMax: 20,
        maxMarks: 100,
        passingMarks: 33,
      },
    });

    // Clean up any test students
    const existingTest = await prisma.student.findMany({
      where: { tenantId, grNumber: { in: ['EXAM-101', 'EXAM-102', 'EXAM-103'] } },
      select: { id: true },
    });
    const sIds = existingTest.map((s) => s.id);
    if (sIds.length > 0) {
      await prisma.marks.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.enrollment.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.student.deleteMany({ where: { id: { in: sIds } } });
    }

    // Create 3 test students and enroll them in Class 1
    student1 = await prisma.student.create({
      data: {
        tenantId,
        grNumber: 'EXAM-101',
        firstNameEn: 'Aarav',
        lastNameEn: 'Patel',
        firstNameGu: 'આરવ',
        lastNameGu: 'પટેલ',
        gender: 'MALE',
        dateOfBirth: new Date('2019-04-15'),
      },
    });
    const enr1 = await prisma.enrollment.create({
      data: {
        tenantId,
        studentId: student1.id,
        academicYearId,
        classId: class1Id,
        rollNumber: 1,
        status: 'ACTIVE',
      },
    });
    student1.enrollmentId = enr1.id;

    student2 = await prisma.student.create({
      data: {
        tenantId,
        grNumber: 'EXAM-102',
        firstNameEn: 'Diya',
        lastNameEn: 'Shah',
        firstNameGu: 'દિયા',
        lastNameGu: 'શાહ',
        gender: 'FEMALE',
        dateOfBirth: new Date('2019-06-20'),
      },
    });
    const enr2 = await prisma.enrollment.create({
      data: {
        tenantId,
        studentId: student2.id,
        academicYearId,
        classId: class1Id,
        rollNumber: 2,
        status: 'ACTIVE',
      },
    });
    student2.enrollmentId = enr2.id;

    student3 = await prisma.student.create({
      data: {
        tenantId,
        grNumber: 'EXAM-103',
        firstNameEn: 'Kavya',
        lastNameEn: 'Mehta',
        firstNameGu: 'કાવ્યા',
        lastNameGu: 'મહેતા',
        gender: 'FEMALE',
        dateOfBirth: new Date('2019-08-10'),
      },
    });
    const enr3 = await prisma.enrollment.create({
      data: {
        tenantId,
        studentId: student3.id,
        academicYearId,
        classId: class1Id,
        rollNumber: 3,
        status: 'ACTIVE',
      },
    });
    student3.enrollmentId = enr3.id;
  });

  afterAll(async () => {
    // Cleanup
    if (examMath) await prisma.marks.deleteMany({ where: { examId: examMath.id } });
    if (examSci) await prisma.marks.deleteMany({ where: { examId: examSci.id } });
    if (examEng) await prisma.marks.deleteMany({ where: { examId: examEng.id } });

    await prisma.exam.deleteMany({ where: { id: { in: [examMath?.id, examSci?.id, examEng?.id].filter(Boolean) } } });
    await prisma.examType.deleteMany({ where: { id: 'exam-type-sem1-test' } });

    const sIds = [student1?.id, student2?.id, student3?.id].filter(Boolean);
    if (sIds.length > 0) {
      await prisma.enrollment.deleteMany({ where: { studentId: { in: sIds } } });
      await prisma.student.deleteMany({ where: { id: { in: sIds } } });
    }

    await prisma.$disconnect();
  });

  test('1. Component summation, decimal precision, and grade mapping for valid marks', async () => {
    // Student 1 in Math: Theory=65.5, Practical=18.5, Internal=9.5 -> Total = 93.5 (A1 grade)
    const result = await examService.saveBatchMarks(tenantId, userId, examMath.id, [
      {
        studentId: student1.id,
        enrollmentId: student1.enrollmentId,
        theoryMarks: 65.5,
        practicalMarks: 18.5,
        internalMarks: 9.5,
      },
    ]);

    expect(result.success).toBe(true);
    expect(result.count).toBe(1);

    const mark = await prisma.marks.findFirst({
      where: { examId: examMath.id, studentId: student1.id },
    });
    expect(mark).toBeDefined();
    expect(mark!.totalMarks).toBe(93.5);
    expect(mark!.grade).toBe('A1');
  });

  test('2. Rejects marks that exceed component maximum values', async () => {
    // examMath theoryMax is 70; attempting 75 should throw an error
    await expect(
      examService.saveBatchMarks(tenantId, userId, examMath.id, [
        {
          studentId: student2.id,
          enrollmentId: student2.enrollmentId,
          theoryMarks: 75.0,
          practicalMarks: 15.0,
          internalMarks: 8.0,
        },
      ])
    ).rejects.toThrow(/exceed maximum/i);
  });

  test('3. Handles absent students correctly (grade AB, total 0)', async () => {
    const result = await examService.saveBatchMarks(tenantId, userId, examMath.id, [
      {
        studentId: student3.id,
        enrollmentId: student3.enrollmentId,
        isAbsent: true,
      },
    ]);

    expect(result.success).toBe(true);
    const mark = await prisma.marks.findFirst({
      where: { examId: examMath.id, studentId: student3.id },
    });
    expect(mark!.isAbsent).toBe(true);
    expect(mark!.totalMarks).toBe(0);
    expect(mark!.grade).toBe('AB');
  });

  test('4. Grace Marks Engine converts near-passing score (deficit <= 5) to passing', () => {
    const subjectScores = [
      { subjectId: '1', maxMarks: 100, passingMarks: 33, rawTotal: 29.5, isAbsent: false, isExempted: false },
      { subjectId: '2', maxMarks: 100, passingMarks: 33, rawTotal: 24.0, isAbsent: false, isExempted: false }, // deficit 9 > 5
      { subjectId: '3', maxMarks: 100, passingMarks: 33, rawTotal: 75.0, isAbsent: false, isExempted: false },
    ];

    const evaluated = examService.applyGraceRules(subjectScores, { maxGracePerSubject: 5, maxTotalGrace: 10 });

    // Subject 1: deficit is 3.5 <= 5 -> Grace applied!
    expect(evaluated[0].isPassed).toBe(true);
    expect(evaluated[0].isGrace).toBe(true);
    expect(evaluated[0].graceApplied).toBe(3.5);
    expect(evaluated[0].finalTotal).toBe(33);

    // Subject 2: deficit is 9 > 5 -> No grace applied
    expect(evaluated[1].isPassed).toBe(false);
    expect(evaluated[1].isGrace).toBe(false);
    expect(evaluated[1].graceApplied).toBe(0);
    expect(evaluated[1].finalTotal).toBe(24.0);

    // Subject 3: already passed -> 0 grace
    expect(evaluated[2].isPassed).toBe(true);
    expect(evaluated[2].isGrace).toBe(false);
    expect(evaluated[2].graceApplied).toBe(0);
  });

  test('5. Grade lookup correctly matches all standard GSEB grade boundaries', () => {
    const configs = [
      { grade: 'A1', minPercentage: 91, maxPercentage: 100 },
      { grade: 'A2', minPercentage: 81, maxPercentage: 90.99 },
      { grade: 'B1', minPercentage: 71, maxPercentage: 80.99 },
      { grade: 'B2', minPercentage: 61, maxPercentage: 70.99 },
      { grade: 'C1', minPercentage: 51, maxPercentage: 60.99 },
      { grade: 'C2', minPercentage: 41, maxPercentage: 50.99 },
      { grade: 'D', minPercentage: 33, maxPercentage: 40.99 },
      { grade: 'E', minPercentage: 0, maxPercentage: 32.99 },
    ];

    expect(examService.lookupGrade(95.0, configs)).toBe('A1');
    expect(examService.lookupGrade(91.0, configs)).toBe('A1');
    expect(examService.lookupGrade(85.5, configs)).toBe('A2');
    expect(examService.lookupGrade(75.0, configs)).toBe('B1');
    expect(examService.lookupGrade(65.0, configs)).toBe('B2');
    expect(examService.lookupGrade(55.0, configs)).toBe('C1');
    expect(examService.lookupGrade(45.0, configs)).toBe('C2');
    expect(examService.lookupGrade(35.0, configs)).toBe('D');
    expect(examService.lookupGrade(32.5, configs)).toBe('E');
    expect(examService.lookupGrade(15.0, configs)).toBe('E');
  });

  test('6. Class Results & Dense Ranking calculation', async () => {
    // Fill all marks for Student 1 (High achiever), Student 2 (Moderate), Student 3 (Needs re-exam)
    // Student 1: Math=93.5, Sci=88.0, Eng=90.0 -> Total=271.5/300 -> 90.5% (A2/A1)
    await examService.saveBatchMarks(tenantId, userId, examSci.id, [
      { studentId: student1.id, enrollmentId: student1.enrollmentId, theoryMarks: 60, practicalMarks: 19, internalMarks: 9 },
    ]);
    await examService.saveBatchMarks(tenantId, userId, examEng.id, [
      { studentId: student1.id, enrollmentId: student1.enrollmentId, theoryMarks: 72, internalMarks: 18 },
    ]);

    // Student 2: Math=60, Sci=65, Eng=70 -> Total=195/300 -> 65.0%
    await examService.saveBatchMarks(tenantId, userId, examMath.id, [
      { studentId: student2.id, enrollmentId: student2.enrollmentId, theoryMarks: 40, practicalMarks: 12, internalMarks: 8 },
    ]);
    await examService.saveBatchMarks(tenantId, userId, examSci.id, [
      { studentId: student2.id, enrollmentId: student2.enrollmentId, theoryMarks: 45, practicalMarks: 12, internalMarks: 8 },
    ]);
    await examService.saveBatchMarks(tenantId, userId, examEng.id, [
      { studentId: student2.id, enrollmentId: student2.enrollmentId, theoryMarks: 55, internalMarks: 15 },
    ]);

    // Student 3: Math=25 (Fail), Sci=50 (Pass), Eng=50 (Pass) -> 1 fail -> RE_EXAM_ELIGIBLE
    await examService.saveBatchMarks(tenantId, userId, examMath.id, [
      { studentId: student3.id, enrollmentId: student3.enrollmentId, theoryMarks: 15, practicalMarks: 5, internalMarks: 5, isAbsent: false },
    ]);
    await examService.saveBatchMarks(tenantId, userId, examSci.id, [
      { studentId: student3.id, enrollmentId: student3.enrollmentId, theoryMarks: 35, practicalMarks: 10, internalMarks: 5 },
    ]);
    await examService.saveBatchMarks(tenantId, userId, examEng.id, [
      { studentId: student3.id, enrollmentId: student3.enrollmentId, theoryMarks: 40, internalMarks: 10 },
    ]);

    const results = await examService.getClassResults(tenantId, academicYearId, class1Id, examTypeId);

    expect(results).toBeDefined();
    expect(results.summary.totalStudents).toBeGreaterThanOrEqual(3);

    const s1Result = results.students.find((s) => s.studentId === student1.id);
    const s2Result = results.students.find((s) => s.studentId === student2.id);
    const s3Result = results.students.find((s) => s.studentId === student3.id);

    expect(s1Result).toBeDefined();
    expect(s1Result!.resultStatus).toBe('PASSED');
    expect(s1Result!.rank).toBe(1);

    expect(s2Result).toBeDefined();
    expect(s2Result!.resultStatus).toBe('PASSED');
    expect(s2Result!.rank).toBe(2);

    expect(s3Result).toBeDefined();
    expect(s3Result!.resultStatus).toBe('RE_EXAM_ELIGIBLE');
    expect(s3Result!.rank).toBeNull(); // not ranked because of re-exam
  });

  test('7. Progress Report Card (પ્રગતિ પત્રક) data generation with bilingual fields', async () => {
    const reportCard = await examService.getStudentReportCard(tenantId, student1.id, academicYearId, examTypeId);

    expect(reportCard).toBeDefined();
    expect(reportCard.student.fullNameGu).toContain('આરવ');
    expect(reportCard.student.fullNameEn).toContain('Aarav');
    expect(reportCard.school.nameGu).toBeDefined();
    expect(reportCard.result).toBeDefined();
    expect(reportCard.result!.percentage).toBeGreaterThan(80);
    expect(reportCard.result!.rank).toBe(1);
    expect(reportCard.teacherRemark).toBeDefined();
    expect(reportCard.attendance).toBeDefined();
  });
});
