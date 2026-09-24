export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  ACCOUNTANT = 'ACCOUNTANT',
  TEACHER = 'TEACHER',
  CLASS_TEACHER = 'CLASS_TEACHER',
  OFFICE_STAFF = 'OFFICE_STAFF',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
}

export enum PermissionCode {
  // Dashboard
  DASHBOARD_VIEW = 'dashboard.view',

  // School Master
  SCHOOL_SETTINGS_VIEW = 'school.settings.view',
  SCHOOL_SETTINGS_UPDATE = 'school.settings.update',
  USERS_MANAGE = 'users.manage',
  ROLES_MANAGE = 'roles.manage',

  // Students
  STUDENTS_VIEW = 'students.view',
  STUDENTS_CREATE = 'students.create',
  STUDENTS_UPDATE = 'students.update',
  STUDENTS_DELETE = 'students.delete',
  STUDENTS_IMPORT = 'students.import',
  STUDENTS_EXPORT = 'students.export',

  // Staff
  STAFF_VIEW = 'staff.view',
  STAFF_CREATE = 'staff.create',
  STAFF_UPDATE = 'staff.update',
  STAFF_DELETE = 'staff.delete',
  STAFF_ASSIGN = 'staff.assign',

  // Attendance
  ATTENDANCE_STUDENT_VIEW = 'attendance.student.view',
  ATTENDANCE_STUDENT_CREATE = 'attendance.student.create',
  ATTENDANCE_STAFF_VIEW = 'attendance.staff.view',
  ATTENDANCE_STAFF_CREATE = 'attendance.staff.create',

  // Timetable
  TIMETABLE_VIEW = 'timetable.view',
  TIMETABLE_MANAGE = 'timetable.manage',

  // Examination
  EXAM_VIEW = 'exam.view',
  EXAM_MANAGE = 'exam.manage',
  EXAM_MARKS_ENTRY = 'exam.marks.entry',

  // Fees
  FEES_STRUCTURE_MANAGE = 'fees.structure.manage',
  FEES_COLLECT = 'fees.collect',
  FEES_VIEW = 'fees.view',
  FEES_REFUND = 'fees.refund',

  // Accounting & Rojmel
  ACCOUNTING_COA_MANAGE = 'accounting.coa.manage',
  ACCOUNTING_ENTRIES_CREATE = 'accounting.entries.create',
  ACCOUNTING_ENTRIES_VIEW = 'accounting.entries.view',
  ACCOUNTING_ENTRIES_REVERSE = 'accounting.entries.reverse',
  ACCOUNTING_REPORTS_VIEW = 'accounting.reports.view',
  ROJMEL_VIEW = 'rojmel.view',
  ROJMEL_ENTRY = 'rojmel.entry',

  // Grants & Expenses
  GRANTS_VIEW = 'grants.view',
  GRANTS_MANAGE = 'grants.manage',
  GRANTS_OVERRIDE_REQUEST = 'grants.override.request',
  GRANTS_OVERRIDE_APPROVE = 'grants.override.approve',
  EXPENSES_CREATE = 'expenses.create',
  EXPENSES_APPROVE = 'expenses.approve',

  // Reports, Docs, Audit, Notifications
  REPORTS_VIEW = 'reports.view',
  REPORTS_EXPORT = 'reports.export',
  DOCUMENTS_MANAGE = 'documents.manage',
  NOTIFICATIONS_SEND = 'notifications.send',
  AUDIT_VIEW = 'audit.view',

  // Platform
  TENANT_MANAGE = 'tenant.manage',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  TRANSFERRED = 'TRANSFERRED',
  WITHDRAWN = 'WITHDRAWN',
  ALUMNI = 'ALUMNI',
  INACTIVE = 'INACTIVE',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  LEAVE = 'LEAVE',
  HOLIDAY = 'HOLIDAY',
}

export enum PaymentMode {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  UPI = 'UPI',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  WAIVED = 'WAIVED',
}

export enum AccountGroupType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  EQUITY = 'EQUITY',
}

export enum AccountNature {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum JournalEntryType {
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT',
  JOURNAL = 'JOURNAL',
  CONTRA = 'CONTRA',
  ADJUSTMENT = 'ADJUSTMENT',
  REVERSAL = 'REVERSAL',
  FEE_RECEIPT = 'FEE_RECEIPT',
}

export enum JournalEntryStatus {
  ACTIVE = 'ACTIVE',
  REVERSED = 'REVERSED',
  CANCELLED = 'CANCELLED',
}

export enum RojmelEntryType {
  JAMA = 'JAMA',   // Credit / Receipts (Left side)
  UDHAR = 'UDHAR', // Debit / Payments (Right side)
}

export enum SchoolType {
  PRIMARY = 'PRIMARY',                     // Std 1 - 8
  SECONDARY = 'SECONDARY',                 // Std 9 - 10
  HIGHER_SECONDARY = 'HIGHER_SECONDARY',   // Std 11 - 12
  COMBINED = 'COMBINED',                   // K - 12
}

export enum SchoolMedium {
  GUJARATI = 'GUJARATI',
  ENGLISH = 'ENGLISH',
  HINDI = 'HINDI',
  SEMI_ENGLISH = 'SEMI_ENGLISH',
}

export enum SchoolBoard {
  GSEB = 'GSEB',
  CBSE = 'CBSE',
  ICSE = 'ICSE',
  STATE_BOARD = 'STATE_BOARD',
}

export enum ExpenseApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  FEE_REMINDER = 'FEE_REMINDER',
  NOTICE = 'NOTICE',
  EXAM_ALERT = 'EXAM_ALERT',
}
