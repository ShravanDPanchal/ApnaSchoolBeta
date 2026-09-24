import { AccountGroupType, AccountNature, JournalEntryType, JournalEntryStatus, RojmelEntryType, PaymentMode } from './enums';

export interface AccountGroupDto {
  id: string;
  tenantId: string;
  nameEn: string;
  nameGu: string;
  parentId?: string | null;
  groupType: AccountGroupType;
  isSystem: boolean;
  sequenceOrder?: number;
  isActive: boolean;
}

export interface ChartOfAccountDto {
  id: string;
  tenantId: string;
  accountGroupId: string;
  code: string;
  nameEn: string;
  nameGu: string;
  accountType: AccountGroupType;
  accountNature: AccountNature;
  openingBalance: number;
  currentBalance: number;
  financialYearId: string;
  isBankAccount: boolean;
  isCashAccount: boolean;
  isSystem: boolean;
  isActive: boolean;
  accountGroup?: AccountGroupDto;
}

export interface JournalLineDto {
  id?: string;
  accountId: string;
  accountName?: string;
  accountNameGu?: string;
  debitAmount: number;
  creditAmount: number;
  narration?: string;
}

export interface JournalEntryDto {
  id: string;
  tenantId: string;
  entryNumber: string;
  financialYearId: string;
  entryDate: string; // YYYY-MM-DD
  entryType: JournalEntryType;
  narration?: string;
  totalAmount: number;
  referenceType?: string;
  referenceId?: string;
  voucherNumber?: string;
  status: JournalEntryStatus;
  reversalOf?: string;
  reversedById?: string;
  cancellationReason?: string;
  createdBy: string;
  createdByName?: string;
  approvedBy?: string;
  createdAt: string;
  lines: JournalLineDto[];
}

export interface CreateJournalEntryDto {
  financialYearId: string;
  entryDate: string;
  entryType: JournalEntryType;
  narration?: string;
  voucherNumber?: string;
  referenceType?: string;
  referenceId?: string;
  lines: {
    accountId: string;
    debitAmount: number;
    creditAmount: number;
    narration?: string;
  }[];
}



export interface CreateAccountGroupDto {
  nameEn: string;
  nameGu: string;
  parentId?: string | null;
  groupType: AccountGroupType;
  sequenceOrder?: number;
}

export interface CreateAccountDto {
  accountGroupId: string;
  code: string;
  nameEn: string;
  nameGu: string;
  accountType: AccountGroupType;
  accountNature: AccountNature;
  openingBalance?: number;
  financialYearId: string;
  isBankAccount?: boolean;
  isCashAccount?: boolean;
  bankDetails?: {
    bankName: string;
    branchName?: string;
    accountNumber: string;
    ifscCode?: string;
    accountType?: string;
  };
}

export interface UpdateAccountDto {
  nameEn?: string;
  nameGu?: string;
  accountGroupId?: string;
  openingBalance?: number;
  isActive?: boolean;
}

export interface CreateReceiptVoucherDto {
  financialYearId: string;
  date: string; // YYYY-MM-DD
  incomeAccountId: string; // Credit Head
  paymentAccountId: string; // Debit Head (Cash or Bank)
  amount: number;
  paymentMode: PaymentMode;
  referenceNo?: string;
  voucherNumber?: string;
  narration?: string;
}

export interface CreatePaymentVoucherDto {
  financialYearId: string;
  date: string; // YYYY-MM-DD
  expenseAccountId: string; // Debit Head
  paymentAccountId: string; // Credit Head (Cash or Bank)
  amount: number;
  paymentMode: PaymentMode;
  payeeName?: string;
  referenceNo?: string;
  voucherNumber?: string;
  narration?: string;
}

export interface CreateContraVoucherDto {
  financialYearId: string;
  date: string; // YYYY-MM-DD
  fromAccountId: string; // Credit Account (e.g. Cash withdrawn from or Bank transferred from)
  toAccountId: string; // Debit Account (e.g. Bank deposited into or Cash received into)
  amount: number;
  transferType: 'CASH_DEPOSIT' | 'CASH_WITHDRAWAL' | 'BANK_TRANSFER';
  referenceNo?: string;
  voucherNumber?: string;
  narration?: string;
}

export interface CreateAdjustmentVoucherDto {
  financialYearId: string;
  date: string; // YYYY-MM-DD
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  referenceNo?: string;
  voucherNumber?: string;
  narration?: string;
}

export interface CashBookItemDto {
  date: string;
  entryNumber: string;
  voucherNumber?: string;
  accountNameEn: string;
  accountNameGu: string;
  narration?: string;
  receiptAmount: number; // Inflow / Jama
  paymentAmount: number; // Outflow / Udhar
  runningBalance: number;
}

export interface CashBookStatementDto {
  financialYearId: string;
  fromDate: string;
  toDate: string;
  openingBalance: number;
  items: CashBookItemDto[];
  totalReceipts: number;
  totalPayments: number;
  closingBalance: number;
}

export interface BankBookAccountStatementDto {
  accountId: string;
  accountCode: string;
  bankName: string;
  accountNumber: string;
  openingBalance: number;
  items: {
    date: string;
    entryNumber: string;
    voucherNumber?: string;
    accountNameEn: string;
    accountNameGu: string;
    narration?: string;
    depositAmount: number;
    withdrawalAmount: number;
    runningBalance: number;
  }[];
  totalDeposits: number;
  totalWithdrawals: number;
  closingBalance: number;
}

export interface BankBookStatementDto {
  financialYearId: string;
  fromDate: string;
  toDate: string;
  totalOpeningBalance: number;
  accounts: BankBookAccountStatementDto[];
  grandTotalDeposits: number;
  grandTotalWithdrawals: number;
  totalClosingBalance: number;
}

export interface IncomeExpenseItemDto {
  accountId: string;
  code: string;
  nameEn: string;
  nameGu: string;
  groupNameEn: string;
  groupNameGu: string;
  amount: number;
}

export interface IncomeExpenseStatementDto {
  financialYearId: string;
  financialYearName: string;
  fromDate: string;
  toDate: string;
  incomes: IncomeExpenseItemDto[];
  totalIncome: number;
  expenses: IncomeExpenseItemDto[];
  totalExpense: number;
  netSurplusOrDeficit: number; // Positive = Surplus (બચત / નફો), Negative = Deficit (ખોટ)
  isSurplus: boolean;
}

export interface HeadWiseReportDto {
  financialYearId: string;
  accountType: AccountGroupType;
  heads: {
    accountId: string;
    code: string;
    nameEn: string;
    nameGu: string;
    groupNameEn: string;
    groupNameGu: string;
    totalAmount: number;
    monthBreakdown: { month: string; amount: number }[];
  }[];
  grandTotal: number;
}

export interface MonthlyFinancialSummaryDto {
  financialYearId: string;
  months: {
    monthName: string; // e.g., 'April 2026', 'May 2026'
    totalIncome: number;
    totalExpense: number;
    netSurplus: number;
    cashInflow: number;
    cashOutflow: number;
  }[];
  totalAnnualIncome: number;
  totalAnnualExpense: number;
  annualSurplus: number;
}

export interface CloseFinancialYearDto {
  closingFinancialYearId: string;
  nextFinancialYearId: string;
  retainedEarningsAccountId?: string; // e.g. 2001 or 3001 Capital/General Reserve
  reason?: string;
}

export interface YearlyFinancialSummaryDto {
  financialYearId: string;
  financialYearName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  totalIncome: number;
  totalExpense: number;
  netSurplus: number;
  totalAssetsAndLiabilities: number;
}

