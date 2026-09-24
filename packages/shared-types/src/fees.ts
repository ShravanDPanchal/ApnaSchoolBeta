import { FeeStatus, PaymentMode } from './enums';

export interface FeeHeadDto {
  id: string;
  tenantId: string;
  nameEn: string;
  nameGu: string;
  code: string;
  accountId?: string;
  isRefundable: boolean;
  isActive: boolean;
}

export interface FeeStructureDto {
  id: string;
  tenantId: string;
  academicYearId: string;
  classId: string;
  classNameEn?: string;
  classNameGu?: string;
  feeHeadId: string;
  feeHeadNameEn?: string;
  feeHeadNameGu?: string;
  amount: number;
  dueDate?: string;
  installmentNo: number;
  isActive: boolean;
}

export interface StudentFeeDto {
  id: string;
  tenantId: string;
  studentId: string;
  studentNameEn?: string;
  studentNameGu?: string;
  grNumber?: string;
  classNameEn?: string;
  divisionNameEn?: string;
  feeStructureId: string;
  feeHeadNameEn?: string;
  feeHeadNameGu?: string;
  amount: number;
  discountAmount: number;
  discountReason?: string;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: FeeStatus;
  dueDate?: string;
}

export interface FeePaymentDto {
  id: string;
  tenantId: string;
  receiptNumber: string;
  studentId: string;
  studentNameEn?: string;
  studentNameGu?: string;
  grNumber?: string;
  classNameEn?: string;
  academicYearId: string;
  paymentDate: string;
  totalAmount: number;
  paymentMode: PaymentMode;
  referenceNo?: string;
  bankName?: string;
  narration?: string;
  status: 'ACTIVE' | 'CANCELLED';
  cancellationReason?: string;
  receivedByName: string;
  createdAt: string;
  items: {
    studentFeeId: string;
    feeHeadNameEn: string;
    feeHeadNameGu: string;
    amount: number;
  }[];
}

export interface CollectFeeRequestDto {
  studentId: string;
  academicYearId: string;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNo?: string;
  bankName?: string;
  depositAccountId: string; // Cash or Bank ChartOfAccount ID
  narration?: string;
  items: {
    studentFeeId: string;
    amount: number;
  }[];
}
