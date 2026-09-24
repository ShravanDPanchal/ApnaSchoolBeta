import { RojmelEntryType, PaymentMode } from './enums';

export interface RojmelItemDto {
  id: string;
  journalEntryId: string;
  date: string;
  khataPanoNo: string;
  accountCode: string;
  accountId: string;
  accountNameEn: string;
  accountNameGu: string;
  groupNameGu?: string;
  cashAmount: number;
  bankAmount: number;
  totalAmount: number;
  paymentMode: PaymentMode;
  narration: string;
  voucherNumber: string;
  referenceNumber?: string;
  isCash: boolean;
  bankName?: string;
}

export interface RojmelHeadSummaryDto {
  accountId: string;
  code: string;
  nameEn: string;
  nameGu: string;
  groupNameGu?: string;
  jamaAmount: number;
  udharAmount: number;
  netAmount: number;
}

export interface RojmelDayViewDto {
  date: string;
  financialYearId: string;
  financialYearName: string;
  openingCashBalance: number;
  openingBankBalance: number;
  totalOpeningBalance: number;
  jamaEntries: RojmelItemDto[];
  totalCashReceipts: number;
  totalBankReceipts: number;
  totalReceipts: number;
  totalJamaAmount: number; // Opening + Receipts
  udharEntries: RojmelItemDto[];
  totalCashPayments: number;
  totalBankPayments: number;
  totalPayments: number;
  closingCashBalance: number;
  closingBankBalance: number;
  totalClosingBalance: number;
  totalUdharAmount: number; // Payments + Closing
  headSummaries: RojmelHeadSummaryDto[];
  isBalanced: boolean;
  difference: number;
}

export interface RojmelDaySummaryRowDto {
  date: string;
  openingCash: number;
  openingBank: number;
  cashJama: number;
  bankJama: number;
  totalJama: number;
  cashUdhar: number;
  bankUdhar: number;
  totalUdhar: number;
  closingCash: number;
  closingBank: number;
  closingTotal: number;
  entriesCount: number;
  isBalanced: boolean;
}

export interface RojmelMonthlyViewDto {
  financialYearId: string;
  financialYearName: string;
  year: number;
  month: number;
  monthNameEn: string;
  monthNameGu: string;
  openingCash: number;
  openingBank: number;
  totalCashReceipts: number;
  totalBankReceipts: number;
  totalReceipts: number;
  totalCashPayments: number;
  totalBankPayments: number;
  totalPayments: number;
  closingCash: number;
  closingBank: number;
  days: RojmelDaySummaryRowDto[];
  headSummaries: RojmelHeadSummaryDto[];
}

export interface RojmelMonthSummaryRowDto {
  monthIndex: number;
  monthKey: string; // e.g. "2026-04"
  monthNameEn: string;
  monthNameGu: string;
  openingCash: number;
  openingBank: number;
  totalReceipts: number;
  totalPayments: number;
  netSurplusDeficit: number;
  closingCash: number;
  closingBank: number;
  closingTotal: number;
}

export interface RojmelYearlyViewDto {
  financialYearId: string;
  financialYearName: string;
  startDate: string;
  endDate: string;
  openingCash: number;
  openingBank: number;
  totalReceipts: number;
  totalPayments: number;
  netSurplusDeficit: number;
  closingCash: number;
  closingBank: number;
  months: RojmelMonthSummaryRowDto[];
  headSummaries: RojmelHeadSummaryDto[];
}

export interface RojmelEntryCreateDto {
  date: string;
  entryType: RojmelEntryType | 'CONTRA';
  accountId: string; // Income/Expense/Opposite Account
  paymentAccountId: string; // Cash or Bank Account
  amount: number;
  paymentMode?: PaymentMode;
  narration: string;
  voucherNumber?: string;
  referenceNumber?: string;
  chequeNumber?: string;
  chequeDate?: string;
  bankName?: string;
  payeeName?: string;
}

export interface RojmelQuickBatchItemDto {
  entryType: RojmelEntryType | 'CONTRA';
  accountId: string;
  paymentAccountId: string;
  amount: number;
  paymentMode?: PaymentMode;
  narration: string;
  voucherNumber?: string;
  referenceNumber?: string;
}

export interface RojmelQuickBatchDto {
  date: string;
  financialYearId?: string;
  entries: RojmelQuickBatchItemDto[];
}
