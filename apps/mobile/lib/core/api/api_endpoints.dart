class ApiEndpoints {
  // Use 10.0.2.2 for Android emulator to access localhost, or host IP for physical device
  static const String defaultBaseUrl = 'http://10.0.2.2:3001/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String profile = '/auth/me';

  // Dashboard
  static const String dashboardAdmin = '/dashboard/admin';

  // Students
  static const String students = '/students';
  static String studentDetails(String id) => '/students/$id';

  // Attendance
  static const String fastBatchAttendance = '/attendance/student/fast-batch';
  static const String studentAttendanceToday = '/attendance/student/today';

  // Timetable
  static const String timetablePeriods = '/timetable/periods';
  static String timetableClass(String classId) => '/timetable/class/$classId';
  static String timetableTeacher(String teacherId) => '/timetable/teacher/$teacherId';

  // Fees
  static const String feeHeads = '/fees/heads';
  static const String feeStructures = '/fees/structures';
  static String studentFees(String studentId) => '/fees/student/$studentId';
  static const String collectFee = '/fees/collect';

  // Rojmel & Accounting
  static const String rojmelDayView = '/rojmel/day-view';
  static const String rojmelMonthlyView = '/rojmel/monthly-view';
  static const String accountingVoucherReceipt = '/accounting/vouchers/receipt';
  static const String accountingVoucherPayment = '/accounting/vouchers/payment';
  static const String accountingAccounts = '/accounting/accounts';
  static const String accountingJournalEntries = '/accounting/journal-entries';

  // Reports
  static const String schoolReports = '/reports/school';
  static const String feeReports = '/reports/fees';
  static const String accountingReports = '/reports/accounting';

  // School Master & Notices
  static const String schoolProfile = '/school';
  static const String schoolClasses = '/school/classes';
  static const String notices = '/school/notices';
}
