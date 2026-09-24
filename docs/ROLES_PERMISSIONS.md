# Role-Based Access Control (RBAC) Matrix

## 1. System Roles

1. **SUPER_ADMIN (પ્લેટફોર્મ સુપર એડમિન)**: Platform administrator managing tenants, billing, and global settings.
2. **SCHOOL_ADMIN / PRINCIPAL (આચાર્ય / શાળા સંચાલક)**: Full authority over academic sessions, staff, fees, accounting, and reports within their tenant.
3. **ACCOUNTANT (હિસાબનીશ / એકાઉન્ટન્ટ)**: Access to Rojmel, Double-Entry, Fees Collection, Expense Vouchers, and Financial Statements.
4. **TEACHER (શિક્ષક / વર્ગશિક્ષક)**: Access to Daily Attendance, Timetable, Examination Marks Entry, and Student Progress Reports.
5. **CLERK (ઓફિસ કારકુન)**: Student General Register (eGR) entry, document verification, Leaving Certificates.
6. **PARENT / STUDENT (વાલી / વિદ્યાર્થી)**: Read-only access to child attendance, fee receipts, timetable, notices, and Progress Report Cards (*પ્રગતિ પત્રક*).

---

## 2. Granular Permissions Matrix

| Permission Code | Super Admin | School Admin | Accountant | Teacher | Clerk | Parent |
|-----------------|:-----------:|:------------:|:----------:|:-------:|:-----:|:------:|
| `STUDENTS_VIEW` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `STUDENTS_MANAGE` | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `ATTENDANCE_VIEW` | ✅ | ✅ | ❌ | ✅ | ✅ | 👁️ (Own) |
| `ATTENDANCE_MANAGE` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `FEES_VIEW` | ✅ | ✅ | ✅ | ❌ | ✅ | 👁️ (Own) |
| `FEES_COLLECT` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `FEES_MANAGE` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ACCOUNTING_COA_MANAGE` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ACCOUNTING_ENTRIES_VIEW` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ACCOUNTING_ENTRIES_MANAGE`| ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ROJMEL_VIEW` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `ROJMEL_MANAGE` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GRANTS_VIEW` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GRANTS_MANAGE` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GRANTS_OVERRIDE_APPROVE` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `TIMETABLE_MANAGE` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `EXAM_MARKS_ENTRY` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| `REPORTS_VIEW` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
