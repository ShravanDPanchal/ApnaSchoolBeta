import { prisma } from '../../database/prisma';
import { accountingService } from '../accounting/accounting.service';
import { logAudit } from '../../common/utils/audit';
import { CollectFeeRequestDto, JournalEntryType, PaymentMode } from '@apna-school/shared-types';

export interface CreateFeeHeadDto {
  nameEn: string;
  nameGu: string;
  code: string;
  accountId?: string;
  isRefundable?: boolean;
}

export interface CreateFeeStructureDto {
  academicYearId: string;
  classId: string;
  feeHeadId: string;
  amount: number;
  installmentNo?: number;
  dueDate?: string;
}

export interface ApplyDiscountDto {
  studentFeeId: string;
  discountAmount: number;
  discountReason?: string;
  concessionType?: string;
}

export interface ApplyFineDto {
  studentFeeId: string;
  fineAmount: number;
  fineReason?: string;
}

export interface RefundFeeDto {
  feePaymentId: string;
  reason: string;
  refundMode?: string;
  depositAccountId?: string;
}

export class FeesService {
  // --- FEE HEADS ---
  async getFeeHeads(tenantId: string) {
    return prisma.feeHead.findMany({
      where: { tenantId, isActive: true },
      include: { account: true },
      orderBy: { nameEn: 'asc' },
    });
  }

  async createFeeHead(tenantId: string, userId: string, dto: CreateFeeHeadDto) {
    const head = await prisma.feeHead.create({
      data: {
        tenantId,
        nameEn: dto.nameEn,
        nameGu: dto.nameGu,
        code: dto.code.toUpperCase(),
        accountId: dto.accountId || null,
        isRefundable: !!dto.isRefundable,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'FEE_HEAD',
      entityId: head.id,
      newValues: head,
    });

    return head;
  }

  // --- FEE STRUCTURES ---
  async getFeeStructures(tenantId: string, academicYearId?: string, classId?: string) {
    return prisma.feeStructure.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(academicYearId ? { academicYearId } : {}),
        ...(classId ? { classId } : {}),
      },
      include: {
        feeHead: true,
        class: true,
        academicYear: true,
      },
      orderBy: [{ class: { numericOrder: 'asc' } }, { installmentNo: 'asc' }],
    });
  }

  async createFeeStructure(tenantId: string, userId: string, dto: CreateFeeStructureDto) {
    const structure = await prisma.feeStructure.create({
      data: {
        tenantId,
        academicYearId: dto.academicYearId,
        classId: dto.classId,
        feeHeadId: dto.feeHeadId,
        amount: Number(dto.amount),
        installmentNo: dto.installmentNo || 1,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
      include: {
        feeHead: true,
        class: true,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'CREATE',
      entityType: 'FEE_STRUCTURE',
      entityId: structure.id,
      newValues: structure,
    });

    return structure;
  }

  // --- STUDENT FEES & LEDGER ---
  async getStudentFees(tenantId: string, studentId: string) {
    return prisma.studentFee.findMany({
      where: { tenantId, studentId, isActive: true },
      include: {
        feeStructure: {
          include: {
            feeHead: true,
            class: true,
            academicYear: true,
          },
        },
        paymentItems: {
          include: {
            feePayment: true,
          },
        },
      },
      orderBy: { feeStructure: { dueDate: 'asc' } },
    });
  }

  // --- DISCOUNTS, CONCESSIONS & FINES ---
  async applyDiscountOrConcession(tenantId: string, userId: string, dto: ApplyDiscountDto) {
    const sf = await prisma.studentFee.findFirst({
      where: { id: dto.studentFeeId, tenantId },
      include: { feeStructure: { include: { feeHead: true } } },
    });
    if (!sf) throw new Error('STUDENT_FEE_NOT_FOUND');

    const discountAmount = Math.max(0, Number(dto.discountAmount));
    if (discountAmount > sf.amount) {
      throw new Error(`Discount amount (${discountAmount}) cannot exceed total fee amount (${sf.amount})`);
    }

    const netAmount = Math.max(0, sf.amount - discountAmount + (sf.fineAmount || 0));
    let status = 'PENDING';
    if (sf.paidAmount >= netAmount && netAmount > 0) {
      status = 'PAID';
    } else if (sf.paidAmount > 0) {
      status = 'PARTIAL';
    } else if (netAmount === 0 && discountAmount > 0) {
      status = 'PAID'; // 100% concession / RTE
    }

    const updated = await prisma.studentFee.update({
      where: { id: sf.id },
      data: {
        discountAmount,
        discountReason: dto.discountReason || null,
        concessionType: dto.concessionType || null,
        netAmount,
        status,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'APPLY_DISCOUNT',
      entityType: 'STUDENT_FEE',
      entityId: sf.id,
      oldValues: { netAmount: sf.netAmount, discountAmount: sf.discountAmount },
      newValues: { netAmount, discountAmount, concessionType: dto.concessionType },
    });

    return updated;
  }

  async applyLateFine(tenantId: string, userId: string, dto: ApplyFineDto) {
    const sf = await prisma.studentFee.findFirst({
      where: { id: dto.studentFeeId, tenantId },
      include: { feeStructure: { include: { feeHead: true } } },
    });
    if (!sf) throw new Error('STUDENT_FEE_NOT_FOUND');

    const fineAmount = Math.max(0, Number(dto.fineAmount));
    const netAmount = Math.max(0, sf.amount - (sf.discountAmount || 0) + fineAmount);

    let status = sf.status;
    if (sf.paidAmount >= netAmount) {
      status = 'PAID';
    } else if (sf.paidAmount > 0) {
      status = 'PARTIAL';
    } else {
      status = 'PENDING';
    }

    const updated = await prisma.studentFee.update({
      where: { id: sf.id },
      data: {
        fineAmount,
        netAmount,
        status,
      },
    });

    await logAudit({
      tenantId,
      userId,
      action: 'APPLY_FINE',
      entityType: 'STUDENT_FEE',
      entityId: sf.id,
      newValues: { fineAmount, netAmount, fineReason: dto.fineReason },
    });

    return updated;
  }

  // --- FEE COLLECTION & DUAL-ENTRY ACCOUNTING INTEGRATION ---
  async collectFee(tenantId: string, userId: string, dto: CollectFeeRequestDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('At least one fee item must be selected for payment.');
    }

    const totalAmount = dto.items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    if (totalAmount <= 0) {
      throw new Error('Total payment amount must be greater than zero.');
    }

    // 1. Verify each studentFee and protect against OVERPAYMENT
    for (const item of dto.items) {
      const sf = await prisma.studentFee.findFirst({
        where: { id: item.studentFeeId, tenantId },
        include: { feeStructure: { include: { feeHead: true } } },
      });
      if (!sf) throw new Error(`StudentFee record (${item.studentFeeId}) not found.`);

      const remainingDue = Math.round((sf.netAmount - sf.paidAmount) * 100) / 100;
      if (item.amount > remainingDue + 0.01) {
        throw new Error(
          `Payment amount (₹${item.amount}) exceeds outstanding dues (₹${remainingDue}) for ${sf.feeStructure.feeHead.nameEn} / ${sf.feeStructure.feeHead.nameGu}`
        );
      }
    }

    // 2. Generate sequential Receipt Number: REC-YYYY-YY/XXXXX
    const currentYear = new Date().getFullYear();
    const nextYearShort = String(currentYear + 1).slice(-2);
    const count = await prisma.feePayment.count({ where: { tenantId } });
    const receiptNumber = `REC-${currentYear}-${nextYearShort}/${String(count + 1).padStart(5, '0')}`;

    // 3. Fetch student details for narration with strict tenantId scoping
    const student = await prisma.student.findFirst({
      where: { id: dto.studentId, tenantId },
      include: { enrollments: { include: { class: true } } },
    });
    if (!student) throw new Error('STUDENT_NOT_FOUND');

    // 4. Resolve active Financial Year
    const paymentDate = new Date(dto.paymentDate);
    let fy = await prisma.financialYear.findFirst({
      where: {
        tenantId,
        startDate: { lte: paymentDate },
        endDate: { gte: paymentDate },
      },
    });

    if (!fy) {
      fy = await prisma.financialYear.findFirst({
        where: { tenantId, isCurrent: true },
      });
    }
    if (!fy) throw new Error('No active financial year found for fee accounting.');

    // 5. Create Fee Payment and update StudentFee records inside transaction
    const payment = await prisma.$transaction(async (tx) => {
      // Create FeePayment record
      const feePayment = await tx.feePayment.create({
        data: {
          tenantId,
          receiptNumber,
          studentId: dto.studentId,
          academicYearId: dto.academicYearId,
          paymentDate,
          totalAmount: Math.round(totalAmount * 100) / 100,
          paymentMode: dto.paymentMode,
          referenceNo: dto.referenceNo || null,
          bankName: dto.bankName || null,
          narration: dto.narration || `Fee receipt for ${student.firstNameEn} ${student.lastNameEn} (GR: ${student.grNumber})`,
          receivedById: userId,
          status: 'ACTIVE',
          items: {
            create: dto.items.map((item) => ({
              studentFeeId: item.studentFeeId,
              amount: Math.round(Number(item.amount) * 100) / 100,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update each studentFee's paidAmount and status
      for (const item of dto.items) {
        const sf = await tx.studentFee.findUnique({ where: { id: item.studentFeeId } });
        if (!sf) throw new Error(`StudentFee ${item.studentFeeId} not found.`);

        const newPaid = Math.round((sf.paidAmount + item.amount) * 100) / 100;
        let newStatus = 'PENDING';
        if (newPaid >= sf.netAmount - 0.01) {
          newStatus = 'PAID';
        } else if (newPaid > 0) {
          newStatus = 'PARTIAL';
        }

        await tx.studentFee.update({
          where: { id: sf.id },
          data: {
            paidAmount: newPaid,
            status: newStatus,
          },
        });
      }

      return feePayment;
    });

    // 6. Double-Entry Accounting Journal Entry creation:
    // Debit: Cash or Bank Account (from depositAccountId or auto-resolved)
    // Credit: Fee Income Account (from ChartOfAccounts)
    try {
      let depositAccId: string | undefined = dto.depositAccountId;
      if (!depositAccId) {
        if (dto.paymentMode === PaymentMode.CASH) {
          const cashAcc = await prisma.chartOfAccount.findFirst({
            where: { tenantId, financialYearId: fy.id, isCashAccount: true, isActive: true },
          });
          depositAccId = cashAcc?.id;
        } else {
          const bankAcc = await prisma.chartOfAccount.findFirst({
            where: { tenantId, financialYearId: fy.id, isBankAccount: true, isActive: true },
          });
          depositAccId = bankAcc?.id;
        }
      }

      const feeIncomeAccount = await prisma.chartOfAccount.findFirst({
        where: {
          tenantId,
          financialYearId: fy.id,
          accountType: 'INCOME',
          isActive: true,
        },
      });

      if (feeIncomeAccount && depositAccId) {
        const journal = await accountingService.createJournalEntry(tenantId, userId, {
          financialYearId: fy.id,
          entryDate: dto.paymentDate,
          entryType: JournalEntryType.FEE_RECEIPT,
          voucherNumber: receiptNumber,
          referenceType: 'fee_payment',
          referenceId: payment.id,
          narration: `Fee Collection: ${student.firstNameEn} ${student.lastNameEn} (GR: ${student.grNumber}) - Mode: ${dto.paymentMode}`,
          lines: [
            { accountId: depositAccId, debitAmount: totalAmount, creditAmount: 0 },
            { accountId: feeIncomeAccount.id, debitAmount: 0, creditAmount: totalAmount },
          ],
        });

        await prisma.feePayment.update({
          where: { id: payment.id },
          data: { journalEntryId: journal.id },
        });
      }
    } catch (jErr) {
      console.warn('Accounting entry creation warning during fee collection:', jErr);
    }

    await logAudit({
      tenantId,
      userId,
      action: 'COLLECT_FEE',
      entityType: 'FEE_PAYMENT',
      entityId: payment.id,
      newValues: { receiptNumber, totalAmount, student: student.grNumber, paymentMode: dto.paymentMode },
    });

    return (await prisma.feePayment.findUnique({
      where: { id: payment.id },
      include: { items: true },
    })) || payment;
  }

  // --- REFUNDS & PAYMENT CANCELLATIONS ---
  async refundOrCancelPayment(tenantId: string, userId: string, dto: RefundFeeDto) {
    const payment = await prisma.feePayment.findFirst({
      where: { id: dto.feePaymentId, tenantId },
      include: { items: true },
    });
    if (!payment) throw new Error('FEE_PAYMENT_NOT_FOUND');
    if (payment.status === 'CANCELLED' || payment.status === 'REFUNDED') {
      throw new Error('This fee payment is already cancelled or refunded.');
    }

    // 1. Transactionally reverse StudentFee paid amounts & mark payment as REFUNDED
    const cancelled = await prisma.$transaction(async (tx) => {
      for (const item of payment.items) {
        const sf = await tx.studentFee.findUnique({ where: { id: item.studentFeeId } });
        if (sf) {
          const revertedPaid = Math.max(0, Math.round((sf.paidAmount - item.amount) * 100) / 100);
          let newStatus = 'PENDING';
          if (revertedPaid >= sf.netAmount - 0.01 && sf.netAmount > 0) {
            newStatus = 'PAID';
          } else if (revertedPaid > 0) {
            newStatus = 'PARTIAL';
          }

          await tx.studentFee.update({
            where: { id: sf.id },
            data: {
              paidAmount: revertedPaid,
              status: newStatus,
            },
          });
        }
      }

      return tx.feePayment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          cancellationReason: dto.reason,
          cancelledAt: new Date(),
          cancelledById: userId,
        },
      });
    });

    // 2. Reverse double-entry accounting entry if present
    if (payment.journalEntryId) {
      try {
        await accountingService.reverseJournalEntry(
          tenantId,
          userId,
          payment.journalEntryId,
          `Reversal on Fee Refund: ${dto.reason}`
        );
      } catch (revErr) {
        console.warn('Accounting reversal warning on fee refund:', revErr);
      }
    }

    await logAudit({
      tenantId,
      userId,
      action: 'REFUND_FEE',
      entityType: 'FEE_PAYMENT',
      entityId: payment.id,
      newValues: { receiptNumber: payment.receiptNumber, refundAmount: payment.totalAmount, reason: dto.reason },
    });

    return { success: true, payment: cancelled };
  }

  // --- 3-PLY STATUTORY RECEIPT DETAILS ---
  async getReceiptDetails(tenantId: string, feePaymentId: string) {
    const payment = await prisma.feePayment.findFirst({
      where: { id: feePaymentId, tenantId },
      include: {
        student: {
          include: {
            enrollments: {
              where: { isActive: true },
              include: { class: true, division: true, academicYear: true },
              take: 1,
            },
            studentParents: { include: { parent: true } },
          },
        },
        receivedBy: true,
        items: {
          include: {
            studentFee: {
              include: {
                feeStructure: {
                  include: { feeHead: true },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) throw new Error('FEE_PAYMENT_NOT_FOUND');

    const school = await prisma.school.findFirst({ where: { tenantId } });
    const student = payment.student;
    const enr = student.enrollments[0];
    const primaryParent = student.studentParents.find((sp) => sp.isPrimary)?.parent || student.studentParents[0]?.parent;

    const wordsEn = this.convertNumberToEnglishWords(payment.totalAmount);
    const wordsGu = this.convertNumberToGujaratiWords(payment.totalAmount);

    return {
      school: {
        nameEn: school?.nameEn,
        nameGu: school?.nameGu,
        diseCode: school?.diseCode,
        registrationNo: school?.registrationNo,
        addressLine1: school?.addressLine1,
        city: school?.city,
        district: school?.district,
        phone: school?.phone,
        logoUrl: school?.logoUrl,
      },
      receipt: {
        receiptNumber: payment.receiptNumber,
        paymentDate: payment.paymentDate.toISOString().split('T')[0],
        totalAmount: payment.totalAmount,
        amountInWordsEn: wordsEn,
        amountInWordsGu: wordsGu,
        paymentMode: payment.paymentMode,
        referenceNo: payment.referenceNo,
        bankName: payment.bankName,
        status: payment.status,
        cancellationReason: payment.cancellationReason,
        cashierName: `${payment.receivedBy.email}`,
      },
      student: {
        grNumber: student.grNumber,
        rollNumber: enr?.rollNumber,
        studentNameEn: `${student.firstNameEn} ${student.middleNameEn || ''} ${student.lastNameEn}`.trim(),
        studentNameGu: `${student.firstNameGu} ${student.middleNameGu || ''} ${student.lastNameGu}`.trim(),
        parentNameEn: primaryParent ? `${primaryParent.firstNameEn} ${primaryParent.lastNameEn || ''}`.trim() : '',
        parentNameGu: primaryParent ? `${primaryParent.firstNameGu || primaryParent.firstNameEn} ${primaryParent.lastNameGu || ''}`.trim() : '',
        classNameEn: enr?.class?.nameEn,
        classNameGu: enr?.class?.nameGu,
        divisionNameEn: enr?.division?.nameEn || 'A',
        divisionNameGu: enr?.division?.nameGu || 'અ',
        academicYear: enr?.academicYear?.name || '2026-27',
      },
      items: payment.items.map((item) => {
        const sf = item.studentFee;
        const remainingBalance = Math.max(0, Math.round((sf.netAmount - sf.paidAmount) * 100) / 100);
        return {
          feeHeadEn: sf.feeStructure.feeHead.nameEn,
          feeHeadGu: sf.feeStructure.feeHead.nameGu,
          installmentNo: sf.feeStructure.installmentNo,
          netAmount: sf.netAmount,
          paidAmount: item.amount,
          remainingBalance,
        };
      }),
      plyTypes: [
        { key: 'STUDENT_COPY', labelGu: 'વિદ્યાર્થી / વાલી પ્રત (Student Copy)', labelEn: 'Student / Parent Copy' },
        { key: 'OFFICE_COPY', labelGu: 'શાળા કચેરી પ્રત (Office Copy)', labelEn: 'School Office Copy' },
        { key: 'AUDIT_COPY', labelGu: 'ઓડિટ / હિસાબ પ્રત (Audit Copy)', labelEn: 'Accounts / Audit Copy' },
      ],
    };
  }

  // --- COLLECTION REPORTS & ANALYTICS ---
  async getDailyCollectionReport(tenantId: string, dateStr: string) {
    const startDate = new Date(dateStr);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateStr);
    endDate.setHours(23, 59, 59, 999);

    const payments = await prisma.feePayment.findMany({
      where: {
        tenantId,
        paymentDate: { gte: startDate, lte: endDate },
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            enrollments: { include: { class: true, division: true }, take: 1 },
          },
        },
        items: {
          include: {
            studentFee: {
              include: { feeStructure: { include: { feeHead: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalAmount = 0;
    const modeBreakdown: Record<string, number> = { CASH: 0, BANK_TRANSFER: 0, UPI: 0, CHEQUE: 0, ONLINE: 0 };
    const headBreakdown: Record<string, number> = {};

    for (const p of payments) {
      totalAmount += p.totalAmount;
      modeBreakdown[p.paymentMode] = (modeBreakdown[p.paymentMode] || 0) + p.totalAmount;

      for (const it of p.items) {
        const headName = it.studentFee.feeStructure.feeHead.nameGu || it.studentFee.feeStructure.feeHead.nameEn;
        headBreakdown[headName] = (headBreakdown[headName] || 0) + it.amount;
      }
    }

    return {
      date: dateStr,
      totalCount: payments.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      modeBreakdown,
      headBreakdown,
      payments: payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        grNumber: p.student.grNumber,
        studentNameEn: `${p.student.firstNameEn} ${p.student.lastNameEn}`,
        studentNameGu: `${p.student.firstNameGu} ${p.student.lastNameGu}`,
        className: p.student.enrollments[0]?.class?.nameEn,
        amount: p.totalAmount,
        paymentMode: p.paymentMode,
      })),
    };
  }

  async getMonthlyCollectionReport(tenantId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const payments = await prisma.feePayment.findMany({
      where: {
        tenantId,
        paymentDate: { gte: startDate, lte: endDate },
        status: 'ACTIVE',
      },
      include: {
        items: {
          include: {
            studentFee: {
              include: { feeStructure: { include: { feeHead: true } } },
            },
          },
        },
      },
    });

    let totalAmount = 0;
    const modeBreakdown: Record<string, number> = { CASH: 0, BANK_TRANSFER: 0, UPI: 0, CHEQUE: 0, ONLINE: 0 };
    const headBreakdown: Record<string, number> = {};

    for (const p of payments) {
      totalAmount += p.totalAmount;
      modeBreakdown[p.paymentMode] = (modeBreakdown[p.paymentMode] || 0) + p.totalAmount;

      for (const it of p.items) {
        const headName = it.studentFee.feeStructure.feeHead.nameGu || it.studentFee.feeStructure.feeHead.nameEn;
        headBreakdown[headName] = (headBreakdown[headName] || 0) + it.amount;
      }
    }

    return {
      month,
      year,
      totalTransactions: payments.length,
      totalCollected: Math.round(totalAmount * 100) / 100,
      modeBreakdown,
      headBreakdown,
    };
  }

  async getRecentPayments(tenantId: string, limit = 50) {
    return prisma.feePayment.findMany({
      where: { tenantId },
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        student: {
          include: {
            enrollments: {
              include: { class: true, division: true },
              take: 1,
            },
          },
        },
        receivedBy: true,
      },
    });
  }

  async getOutstandingFeesSummary(tenantId: string, classId?: string) {
    const studentFees = await prisma.studentFee.findMany({
      where: {
        tenantId,
        isActive: true,
        status: { in: ['PENDING', 'PARTIAL'] },
        ...(classId ? { enrollment: { classId } } : {}),
      },
      include: {
        student: {
          include: {
            enrollments: { include: { class: true, division: true }, take: 1 },
          },
        },
        feeStructure: { include: { feeHead: true } },
      },
      orderBy: { student: { grNumber: 'asc' } },
    });

    return studentFees.map((sf) => ({
      studentFeeId: sf.id,
      studentId: sf.studentId,
      grNumber: sf.student.grNumber,
      studentNameEn: `${sf.student.firstNameEn} ${sf.student.lastNameEn}`,
      studentNameGu: `${sf.student.firstNameGu} ${sf.student.lastNameGu}`,
      classNameEn: sf.student.enrollments[0]?.class?.nameEn,
      divisionNameEn: sf.student.enrollments[0]?.division?.nameEn,
      feeHeadNameEn: sf.feeStructure.feeHead.nameEn,
      feeHeadNameGu: sf.feeStructure.feeHead.nameGu,
      amount: sf.amount,
      discountAmount: sf.discountAmount,
      fineAmount: sf.fineAmount,
      netAmount: sf.netAmount,
      paidAmount: sf.paidAmount,
      pendingAmount: Math.round((sf.netAmount - sf.paidAmount) * 100) / 100,
      dueDate: sf.dueDate?.toISOString().split('T')[0],
      status: sf.status,
    }));
  }

  // --- HELPER: NUMBER TO WORDS (ENGLISH & GUJARATI) ---
  convertNumberToEnglishWords(num: number): string {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n === 0) return 'Zero';
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return inWords(Math.floor(n / 100)) + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    };

    return inWords(Math.floor(num)) + ' Rupees Only';
  }

  convertNumberToGujaratiWords(num: number): string {
    return `અંકે રૂપિયા ${num} પૂરા`;
  }
}

export const feesService = new FeesService();
