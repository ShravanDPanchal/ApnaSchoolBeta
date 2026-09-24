# Testing & QA Verification Standards

## 1. Automated Test Suites (13 Suites, 151 Tests)

All 13 test suites are automated and executed via Jest against actual database states:

1. `test/e2e-workflow.test.ts` (25 tests): 25-step end-to-end lifecycle verification.
2. `test/security-audit.test.ts` (10 tests): Tenant isolation, IDOR, token tampering, and role authorization.
3. `test/accounting.test.ts` (16 tests): Double-entry journal balance, Chart of Accounts, Vouchers, FY rollover.
4. `test/fees-accounting.test.ts` (8 tests): Fee demands, partial payments, 3-ply receipts, refund reversals.
5. `test/grants.test.ts` (30 tests): Grant receipts, utilization limits, override approval workflows.
6. `test/reporting-center.test.ts` (25 tests): School, fee, accounting reports, Excel & PDF exports.
7. `test/rojmel.test.ts` (10 tests): Deshi Nama daybook Aakharo parity, contra transfers, monthly grids.
8. `test/student-lifecycle.test.ts` (5 tests): Admission, promotion, transfer/LC, Excel batch import.
9. `test/exam-results.test.ts` (7 tests): Component marks, GSEB grade mapping, grace marks, merit ranks.
10. `test/staff.test.ts` (3 tests): Teacher master, class teacher assignment, profile updates.
11. `test/isolation.test.ts` (2 tests): Multi-tenant boundary verification.
12. `test/timetable-conflicts.test.ts` (5 tests): Teacher & room double-booking conflict detection.
13. `test/attendance-leave.test.ts` (5 tests): Batch student attendance, staff punch, leave types.

---

## 2. Test Execution Commands

```bash
# Run entire backend test suite
npm --workspace=apps/api run test

# Run specific E2E workflow suite
npx jest e2e-workflow.test.ts --runInBand --forceExit

# Typecheck API codebase
npm --workspace=apps/api run typecheck

# Build frontend Next.js production bundle
npm --workspace=apps/web run build
```
