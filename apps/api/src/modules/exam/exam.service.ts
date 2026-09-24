import { prisma } from '../../database/prisma';
import { logAudit } from '../../common/utils/audit';

export interface BatchMarksItem {
  studentId: string;
  enrollmentId: string;
  theoryMarks?: number | null;
  practicalMarks?: number | null;
  internalMarks?: number | null;
  graceMarks?: number | null;
  isAbsent?: boolean;
  isExempted?: boolean;
  remark?: string;
}

export interface CreateExamTypeDto {
  academicYearId: string;
  nameEn: string;
  nameGu: string;
  maxMarksDefault?: number;
  passingPercentage?: number;
  weightage?: number;
  sequenceOrder?: number;
}

export interface CreateExamScheduleDto {
  academicYearId: string;
  examTypeId: string;
  classId: string;
  subjectId: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  theoryMax?: number;
  practicalMax?: number;
  internalMax?: number;
  maxMarks: number;
  passingMarks: number;
}

export interface GraceRuleOptions {
  maxGracePerSubject?: number; // default 5
  maxTotalGrace?: number; // default 10
}

export class ExamService {
  // --- DEFAULT GRADE CONFIGURATION ---
  private defaultGrades = [
    { grade: 'A1', minPercentage: 91, maxPercentage: 100, gradePoint: 10, descriptionEn: 'Outstanding', descriptionGu: 'ઉત્કૃષ્ટ' },
    { grade: 'A2', minPercentage: 81, maxPercentage: 90.99, gradePoint: 9, descriptionEn: 'Excellent', descriptionGu: 'ઉત્તમ' },
    { grade: 'B1', minPercentage: 71, maxPercentage: 80.99, gradePoint: 8, descriptionEn: 'Very Good', descriptionGu: 'ઘણું સારું' },
    { grade: 'B2', minPercentage: 61, maxPercentage: 70.99, gradePoint: 7, descriptionEn: 'Good', descriptionGu: 'સારું' },
    { grade: 'C1', minPercentage: 51, maxPercentage: 60.99, gradePoint: 6, descriptionEn: 'Fair', descriptionGu: 'સંતોષકારક' },
    { grade: 'C2', minPercentage: 41, maxPercentage: 50.99, gradePoint: 5, descriptionEn: 'Average', descriptionGu: 'સાધારણ' },
    { grade: 'D', minPercentage: 33, maxPercentage: 40.99, gradePoint: 4, descriptionEn: 'Passing', descriptionGu: 'ઉત્તીર્ણ' },
    { grade: 'E', minPercentage: 0, maxPercentage: 32.99, gradePoint: 0, descriptionEn: 'Needs Improvement', descriptionGu: 'સુધારણા જરૂરી' },
  ];

  async getGradeConfigs(tenantId: string, academicYearId: string) {
    const existing = await prisma.gradeConfig.findMany({
      where: { tenantId, academicYearId },
      orderBy: { minPercentage: 'desc' },
    });

    if (existing.length > 0) return existing;

    // Auto-seed default GSEB grading scale if not present
    for (const g of this.defaultGrades) {
      await prisma.gradeConfig.create({
        data: {
          tenantId,
          academicYearId,
          grade: g.grade,
          minPercentage: g.minPercentage,
          maxPercentage: g.maxPercentage,
          gradePoint: g.gradePoint,
          descriptionEn: g.descriptionEn,
          descriptionGu: g.descriptionGu,
        },
      });
    }

    return prisma.gradeConfig.findMany({
      where: { tenantId, academicYearId },
      orderBy: { minPercentage: 'desc' },
    });
  }

  // --- EXAM TYPES ---
  async getExamTypes(tenantId: string, academicYearId: string) {
    const types = await prisma.examType.findMany({
      where: { tenantId, academicYearId, isActive: true },
      orderBy: { sequenceOrder: 'asc' },
    });

    if (types.length > 0) return types;

    // Seed standard Gujarat school exam types if empty
    const defaults = [
      { nameEn: 'Unit Test 1', nameGu: 'એકમ કસોટી ૧ (જુલાઈ)', maxMarksDefault: 25, passingPercentage: 33, sequenceOrder: 1 },
      { nameEn: 'First Semester Exam', nameGu: 'પ્રથમ સત્ર પરીક્ષા (ઓક્ટોબર)', maxMarksDefault: 100, passingPercentage: 33, sequenceOrder: 2 },
      { nameEn: 'Unit Test 2', nameGu: 'એકમ કસોટી ૨ (જાન્યુઆરી)', maxMarksDefault: 25, passingPercentage: 33, sequenceOrder: 3 },
      { nameEn: 'Second Semester / Annual Exam', nameGu: 'દ્વિતીય સત્ર / વાર્ષિક પરીક્ષા (એપ્રિલ)', maxMarksDefault: 100, passingPercentage: 33, sequenceOrder: 4 },
      { nameEn: 'Re-Examination', nameGu: 'પુનઃ / પૂરક પરીક્ષા', maxMarksDefault: 100, passingPercentage: 33, sequenceOrder: 5 },
    ];

    for (const d of defaults) {
      await prisma.examType.create({
        data: {
          tenantId,
          academicYearId,
          nameEn: d.nameEn,
          nameGu: d.nameGu,
          maxMarksDefault: d.maxMarksDefault,
          passingPercentage: d.passingPercentage,
          sequenceOrder: d.sequenceOrder,
        },
      });
    }

    return prisma.examType.findMany({
      where: { tenantId, academicYearId, isActive: true },
      orderBy: { sequenceOrder: 'asc' },
    });
  }

  async createExamType(tenantId: string, userId: string, dto: CreateExamTypeDto) {
    const examType = await prisma.examType.create({
      data: {
        tenantId,
        academicYearId: dto.academicYearId,
        nameEn: dto.nameEn,
        nameGu: dto.nameGu,
        maxMarksDefault: dto.maxMarksDefault,
        passingPercentage: dto.passingPercentage ?? 33,
        weightage: dto.weightage ?? 100,
        sequenceOrder: dto.sequenceOrder,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'EXAM_TYPE',
      entityId: examType.id,
      newValues: examType,
    });

    return examType;
  }

  // --- EXAM SCHEDULES ---
  async getExams(tenantId: string, academicYearId: string, classId?: string, examTypeId?: string) {
    return prisma.exam.findMany({
      where: {
        tenantId,
        ...(academicYearId ? { examType: { academicYearId } } : {}),
        classId: classId ? classId : undefined,
        examTypeId: examTypeId ? examTypeId : undefined,
        isActive: true,
      },
      include: {
        examType: true,
        class: true,
        subject: true,
        _count: {
          select: { marks: true },
        },
      },
      orderBy: [{ examDate: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createExamSchedule(tenantId: string, userId: string, dto: CreateExamScheduleDto) {
    // Validate that passingMarks <= maxMarks
    if (dto.passingMarks > dto.maxMarks) {
      throw new Error('Passing marks cannot be greater than maximum marks.');
    }

    const theoryMax = dto.theoryMax ?? null;
    const practicalMax = dto.practicalMax ?? null;
    const internalMax = dto.internalMax ?? null;

    const subSum = (theoryMax || 0) + (practicalMax || 0) + (internalMax || 0);
    if (subSum > 0 && Math.abs(subSum - dto.maxMarks) > 0.01) {
      // Warn or adjust
    }

    const exam = await prisma.exam.create({
      data: {
        tenantId,
        examTypeId: dto.examTypeId,
        classId: dto.classId,
        subjectId: dto.subjectId,
        examDate: dto.examDate ? new Date(dto.examDate) : null,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        theoryMax,
        practicalMax,
        internalMax,
        maxMarks: dto.maxMarks,
        passingMarks: dto.passingMarks,
      },
      include: {
        examType: true,
        class: true,
        subject: true,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'EXAM_SCHEDULE',
      entityId: exam.id,
      newValues: exam,
    });

    return exam;
  }

  // --- MARKS ENTRY ROSTER & BATCH SAVING ---
  async getExamMarksRoster(tenantId: string, examId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId },
      include: {
        class: true,
        subject: true,
        examType: true,
      },
    });

    if (!exam) throw new Error('EXAM_NOT_FOUND');

    // Get all active enrolled students in this class
    const students = await prisma.student.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        isActive: true,
        enrollments: {
          some: {
            classId: exam.classId,
            academicYearId: exam.examType.academicYearId,
            isActive: true,
          },
        },
      },
      include: {
        enrollments: {
          where: {
            classId: exam.classId,
            academicYearId: exam.examType.academicYearId,
            isActive: true,
          },
          take: 1,
        },
        marks: {
          where: { examId },
          take: 1,
        },
      },
      orderBy: { grNumber: 'asc' },
    });

    return {
      exam,
      roster: students.map((s) => {
        const enr = s.enrollments[0];
        const m = s.marks[0];
        return {
          studentId: s.id,
          enrollmentId: enr?.id,
          grNumber: s.grNumber,
          rollNumber: enr?.rollNumber,
          firstNameEn: s.firstNameEn,
          lastNameEn: s.lastNameEn,
          firstNameGu: s.firstNameGu,
          lastNameGu: s.lastNameGu,
          theoryMarks: m?.theoryMarks ?? null,
          practicalMarks: m?.practicalMarks ?? null,
          internalMarks: m?.internalMarks ?? null,
          graceMarks: m?.graceMarks ?? 0,
          totalMarks: m?.totalMarks ?? null,
          grade: m?.grade ?? null,
          isAbsent: m?.isAbsent ?? false,
          isExempted: m?.isExempted ?? false,
          remark: m?.remark ?? '',
        };
      }),
    };
  }

  async saveBatchMarks(tenantId: string, userId: string, examId: string, items: BatchMarksItem[]) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, tenantId },
      include: { examType: true },
    });
    if (!exam) throw new Error('EXAM_NOT_FOUND');

    const gradeConfigs = await this.getGradeConfigs(tenantId, exam.examType.academicYearId);

    const results = await prisma.$transaction(async (tx) => {
      const saved = [];
      for (const item of items) {
        let totalMarks: number | null = null;
        let grade: string | null = null;

        if (item.isAbsent) {
          totalMarks = 0;
          grade = 'AB';
        } else if (item.isExempted) {
          totalMarks = null;
          grade = 'EX';
        } else {
          // Calculate components with 2-decimal rounding
          const t = item.theoryMarks !== null && item.theoryMarks !== undefined ? Number(item.theoryMarks) : null;
          const p = item.practicalMarks !== null && item.practicalMarks !== undefined ? Number(item.practicalMarks) : null;
          const i = item.internalMarks !== null && item.internalMarks !== undefined ? Number(item.internalMarks) : null;
          const g = item.graceMarks !== null && item.graceMarks !== undefined ? Number(item.graceMarks) : 0;

          // Component validation
          if (t !== null && exam.theoryMax && t > exam.theoryMax) {
            throw new Error(`Theory marks (${t}) exceed maximum allowable (${exam.theoryMax}) for student ID ${item.studentId}`);
          }
          if (p !== null && exam.practicalMax && p > exam.practicalMax) {
            throw new Error(`Practical marks (${p}) exceed maximum allowable (${exam.practicalMax}) for student ID ${item.studentId}`);
          }
          if (i !== null && exam.internalMax && i > exam.internalMax) {
            throw new Error(`Internal marks (${i}) exceed maximum allowable (${exam.internalMax}) for student ID ${item.studentId}`);
          }

          const sum = (t ?? 0) + (p ?? 0) + (i ?? 0) + g;
          totalMarks = Math.round(sum * 100) / 100;

          if (totalMarks > exam.maxMarks) {
            throw new Error(`Total marks (${totalMarks}) exceed maximum marks (${exam.maxMarks})`);
          }

          // Calculate percentage and determine grade
          const pct = exam.maxMarks > 0 ? (totalMarks / exam.maxMarks) * 100 : 0;
          grade = this.lookupGrade(pct, gradeConfigs);
        }

        const markRecord = await tx.marks.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: item.studentId,
            },
          },
          update: {
            theoryMarks: item.isAbsent ? null : item.theoryMarks,
            practicalMarks: item.isAbsent ? null : item.practicalMarks,
            internalMarks: item.isAbsent ? null : item.internalMarks,
            graceMarks: item.isAbsent ? 0 : (item.graceMarks ?? 0),
            totalMarks,
            grade,
            isAbsent: !!item.isAbsent,
            isExempted: !!item.isExempted,
            remark: item.remark || null,
            enteredBy: userId,
            enrollmentId: item.enrollmentId,
          },
          create: {
            tenantId,
            examId,
            studentId: item.studentId,
            enrollmentId: item.enrollmentId,
            theoryMarks: item.isAbsent ? null : item.theoryMarks,
            practicalMarks: item.isAbsent ? null : item.practicalMarks,
            internalMarks: item.isAbsent ? null : item.internalMarks,
            graceMarks: item.isAbsent ? 0 : (item.graceMarks ?? 0),
            totalMarks,
            grade,
            isAbsent: !!item.isAbsent,
            isExempted: !!item.isExempted,
            remark: item.remark || null,
            enteredBy: userId,
          },
        });
        saved.push(markRecord);
      }
      return saved;
    });

    await logAudit({
      tenantId,
      userId,
      action: 'UPDATE',
      entityType: 'EXAM_MARKS',
      entityId: examId,
      newValues: { count: results.length },
    });

    return { success: true, count: results.length, marks: results };
  }

  // --- AUTOMATIC GRACE MARKS CALCULATION ENGINE ---
  applyGraceRules(
    subjectScores: Array<{
      subjectId: string;
      maxMarks: number;
      passingMarks: number;
      rawTotal: number;
      isAbsent: boolean;
      isExempted: boolean;
    }>,
    options: GraceRuleOptions = {}
  ) {
    const maxGracePerSubject = options.maxGracePerSubject ?? 5;
    const maxTotalGrace = options.maxTotalGrace ?? 10;

    let availableGrace = maxTotalGrace;
    return subjectScores.map((subj) => {
      if (subj.isAbsent || subj.isExempted) {
        return { ...subj, graceApplied: 0, finalTotal: subj.rawTotal, isPassed: false, isGrace: false };
      }

      if (subj.rawTotal >= subj.passingMarks) {
        return { ...subj, graceApplied: 0, finalTotal: subj.rawTotal, isPassed: true, isGrace: false };
      }

      const deficit = Math.round((subj.passingMarks - subj.rawTotal) * 100) / 100;
      if (deficit <= maxGracePerSubject && deficit <= availableGrace) {
        availableGrace -= deficit;
        return {
          ...subj,
          graceApplied: deficit,
          finalTotal: subj.passingMarks,
          isPassed: true,
          isGrace: true,
        };
      }

      return {
        ...subj,
        graceApplied: 0,
        finalTotal: subj.rawTotal,
        isPassed: false,
        isGrace: false,
      };
    });
  }

  // --- CLASS RESULT & RANKING COMPUTATION ENGINE ---
  async getClassResults(
    tenantId: string,
    academicYearId: string,
    classId: string,
    examTypeId: string,
    divisionId?: string
  ) {
    // 1. Fetch Class, Academic Year, and Exam Type
    const [cls, examType, gradeConfigs, exams] = await Promise.all([
      prisma.class.findFirst({ where: { id: classId, tenantId } }),
      prisma.examType.findFirst({ where: { id: examTypeId, tenantId } }),
      this.getGradeConfigs(tenantId, academicYearId),
      prisma.exam.findMany({
        where: { tenantId, classId, examTypeId, isActive: true },
        include: { subject: true },
        orderBy: { subject: { code: 'asc' } },
      }),
    ]);

    if (!cls || !examType) throw new Error('CLASS_OR_EXAM_TYPE_NOT_FOUND');

    // 2. Fetch enrolled students
    const students = await prisma.student.findMany({
      where: {
        tenantId,
        status: 'ACTIVE',
        isActive: true,
        enrollments: {
          some: {
            classId,
            academicYearId,
            ...(divisionId ? { divisionId } : {}),
            isActive: true,
          },
        },
      },
      include: {
        enrollments: {
          where: { classId, academicYearId, isActive: true },
          take: 1,
        },
        marks: {
          where: {
            exam: { examTypeId, classId },
          },
          include: {
            exam: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { grNumber: 'asc' },
    });

    // 3. Compute student results
    const computedStudents = students.map((s) => {
      const enr = s.enrollments[0];
      let grandMaxMarks = 0;
      let totalObtained = 0;
      let totalGrace = 0;
      let passedSubjectsCount = 0;
      let failedSubjectsCount = 0;
      let absentSubjectsCount = 0;
      let exemptedSubjectsCount = 0;

      const subjectResults = exams.map((ex) => {
        const mark = s.marks.find((m) => m.examId === ex.id);
        const isAbsent = mark?.isAbsent ?? false;
        const isExempted = mark?.isExempted ?? false;
        const theoryMarks = mark?.theoryMarks ?? null;
        const practicalMarks = mark?.practicalMarks ?? null;
        const internalMarks = mark?.internalMarks ?? null;
        const graceMarks = mark?.graceMarks ?? 0;
        const totalMarks = mark?.totalMarks ?? null;
        const grade = mark?.grade ?? null;

        let isPassed = false;
        if (!isExempted && !isAbsent && totalMarks !== null) {
          isPassed = totalMarks >= ex.passingMarks;
          grandMaxMarks += ex.maxMarks;
          totalObtained += totalMarks;
          totalGrace += graceMarks;

          if (isPassed) {
            passedSubjectsCount++;
          } else {
            failedSubjectsCount++;
          }
        } else if (isAbsent) {
          absentSubjectsCount++;
          grandMaxMarks += ex.maxMarks;
          failedSubjectsCount++;
        } else if (isExempted) {
          exemptedSubjectsCount++;
        }

        return {
          examId: ex.id,
          subjectId: ex.subject.id,
          subjectNameEn: ex.subject.nameEn,
          subjectNameGu: ex.subject.nameGu,
          subjectCode: ex.subject.code,
          theoryMax: ex.theoryMax,
          theoryMarks,
          practicalMax: ex.practicalMax,
          practicalMarks,
          internalMax: ex.internalMax,
          internalMarks,
          graceMarks,
          totalMarks,
          maxMarks: ex.maxMarks,
          passingMarks: ex.passingMarks,
          grade,
          isPassed,
          isAbsent,
          isExempted,
          hasGrace: graceMarks > 0,
        };
      });

      totalObtained = Math.round(totalObtained * 100) / 100;
      const percentage = grandMaxMarks > 0 ? Math.round((totalObtained / grandMaxMarks) * 10000) / 100 : 0;
      const overallGrade = this.lookupGrade(percentage, gradeConfigs);

      // Result Status Determination
      let resultStatus: 'PASSED' | 'PASSED_WITH_GRACE' | 'RE_EXAM_ELIGIBLE' | 'FAILED' | 'ABSENT' | 'WITHHELD' = 'PASSED';
      const nonExemptCount = exams.length - exemptedSubjectsCount;

      if (absentSubjectsCount === nonExemptCount && nonExemptCount > 0) {
        resultStatus = 'ABSENT';
      } else if (failedSubjectsCount === 0 && nonExemptCount > 0) {
        resultStatus = totalGrace > 0 ? 'PASSED_WITH_GRACE' : 'PASSED';
      } else if (failedSubjectsCount >= 1 && failedSubjectsCount <= 2) {
        resultStatus = 'RE_EXAM_ELIGIBLE';
      } else {
        resultStatus = 'FAILED';
      }

      return {
        studentId: s.id,
        enrollmentId: enr?.id,
        grNumber: s.grNumber,
        rollNumber: enr?.rollNumber,
        firstNameEn: s.firstNameEn,
        lastNameEn: s.lastNameEn,
        firstNameGu: s.firstNameGu,
        lastNameGu: s.lastNameGu,
        gender: s.gender,
        grandMaxMarks,
        totalObtained,
        totalGrace,
        percentage,
        overallGrade,
        passedSubjectsCount,
        failedSubjectsCount,
        absentSubjectsCount,
        exemptedSubjectsCount,
        resultStatus,
        subjectResults,
        rank: null as number | null,
      };
    });

    // 4. Compute Dense Ranks for students who PASSED or PASSED_WITH_GRACE
    const eligibleForRank = computedStudents
      .filter((s) => s.resultStatus === 'PASSED' || s.resultStatus === 'PASSED_WITH_GRACE')
      .sort((a, b) => b.percentage - a.percentage);

    let currentRank = 1;
    for (let i = 0; i < eligibleForRank.length; i++) {
      if (i > 0 && eligibleForRank[i].percentage < eligibleForRank[i - 1].percentage) {
        currentRank = currentRank + 1;
      }
      eligibleForRank[i].rank = currentRank;
    }

    // 5. Class Summary Statistics
    const totalStudents = computedStudents.length;
    const passedStudents = computedStudents.filter((s) => s.resultStatus === 'PASSED' || s.resultStatus === 'PASSED_WITH_GRACE').length;
    const reExamStudents = computedStudents.filter((s) => s.resultStatus === 'RE_EXAM_ELIGIBLE').length;
    const failedStudents = computedStudents.filter((s) => s.resultStatus === 'FAILED').length;
    const absentStudents = computedStudents.filter((s) => s.resultStatus === 'ABSENT').length;
    const overallPassPercentage = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 10000) / 100 : 0;

    return {
      class: cls,
      examType,
      academicYearId,
      exams,
      summary: {
        totalStudents,
        passedStudents,
        reExamStudents,
        failedStudents,
        absentStudents,
        overallPassPercentage,
      },
      students: computedStudents,
    };
  }

  // --- PROGRESS REPORT CARD (પ્રગતિ પત્રક) ---
  async getStudentReportCard(tenantId: string, studentId: string, academicYearId: string, examTypeId?: string) {
    const [student, school, gradeConfigs, examTypes] = await Promise.all([
      prisma.student.findFirst({
        where: { id: studentId, tenantId },
        include: {
          studentParents: { include: { parent: true } },
          enrollments: {
            where: { academicYearId, isActive: true },
            include: { class: true, division: true },
            take: 1,
          },
        },
      }),
      prisma.school.findFirst({ where: { tenantId } }),
      this.getGradeConfigs(tenantId, academicYearId),
      this.getExamTypes(tenantId, academicYearId),
    ]);

    if (!student || student.enrollments.length === 0) {
      throw new Error('STUDENT_OR_ENROLLMENT_NOT_FOUND');
    }

    const enrollment = student.enrollments[0];
    const targetExamTypeId = examTypeId || examTypes[0]?.id;

    // Get Class Results to fetch this student's rank and comparative performance
    const classResults = await this.getClassResults(
      tenantId,
      academicYearId,
      enrollment.classId,
      targetExamTypeId,
      enrollment.divisionId || undefined
    );

    const studentResult = classResults.students.find((s) => s.studentId === studentId);

    // Fetch Student Attendance statistics for the academic year
    const attendanceStats = await prisma.studentAttendance.groupBy({
      by: ['status'],
      where: {
        tenantId,
        studentId,
        academicYearId,
      },
      _count: true,
    });

    const presentDays = attendanceStats.find((a) => a.status === 'PRESENT')?._count || 0;
    const absentDays = attendanceStats.find((a) => a.status === 'ABSENT')?._count || 0;
    const totalWorkingDays = presentDays + absentDays || 220;
    const attendancePercentage = totalWorkingDays > 0 ? Math.round((presentDays / totalWorkingDays) * 10000) / 100 : 0;

    const primaryParent = student.studentParents.find((sp) => sp.isPrimary)?.parent || student.studentParents[0]?.parent;

    return {
      school: {
        nameEn: school?.nameEn,
        nameGu: school?.nameGu,
        diseCode: school?.diseCode,
        registrationNo: school?.registrationNo,
        addressLine1: school?.addressLine1,
        city: school?.city,
        district: school?.district,
        logoUrl: school?.logoUrl,
        primaryColor: school?.primaryColor,
      },
      student: {
        id: student.id,
        grNumber: student.grNumber,
        rollNumber: enrollment.rollNumber,
        fullNameEn: `${student.firstNameEn} ${student.middleNameEn || ''} ${student.lastNameEn}`.trim(),
        fullNameGu: `${student.firstNameGu} ${student.middleNameGu || ''} ${student.lastNameGu}`.trim(),
        gender: student.gender,
        dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
        dobInWords: student.dobInWords,
        apaarId: student.apaarId,
        ctsUniqueId: student.ctsUniqueId,
        parentNameEn: primaryParent ? `${primaryParent.firstNameEn} ${primaryParent.lastNameEn || ''}`.trim() : '',
        parentNameGu: primaryParent ? `${primaryParent.firstNameGu || primaryParent.firstNameEn} ${primaryParent.lastNameGu || ''}`.trim() : '',
        classNameEn: enrollment.class.nameEn,
        classNameGu: enrollment.class.nameGu,
        divisionNameEn: enrollment.division?.nameEn || 'A',
        divisionNameGu: enrollment.division?.nameGu || 'અ',
        academicYear: '2026-27',
      },
      examType: classResults.examType,
      result: studentResult,
      attendance: {
        presentDays,
        absentDays,
        totalWorkingDays,
        attendancePercentage,
      },
      qualitativeEvaluation: {
        cleanliness: 'A (ઉત્તમ)',
        discipline: 'A (ઉત્તમ)',
        cooperation: 'A (સહકાર્ય)',
        sportsAndArts: 'B+ (સારું)',
      },
      gradeScale: gradeConfigs,
      teacherRemark: studentResult?.resultStatus === 'PASSED' || studentResult?.resultStatus === 'PASSED_WITH_GRACE'
        ? 'અભિનંદન! તેજસ્વી પરિણામ પ્રાપ્ત કર્યું છે. (Congratulations! Excellent Academic Performance)'
        : 'વધુ મહેનતની જરૂર છે. (Needs more practice and regular attendance)',
    };
  }

  // --- HELPER: LOOKUP GRADE BOUNDARY ---
  lookupGrade(percentage: number, gradeConfigs: any[]): string {
    const rounded = Math.round(percentage * 100) / 100;
    for (const g of gradeConfigs) {
      if (rounded >= g.minPercentage && rounded <= g.maxPercentage + 0.01) {
        return g.grade;
      }
    }
    return percentage >= 33 ? 'D' : 'E';
  }
}

export const examService = new ExamService();
