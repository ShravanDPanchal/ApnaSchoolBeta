# REST API Reference & Endpoints

All endpoints are versioned under `/api/v1` and require `Authorization: Bearer <JWT_TOKEN>` unless noted as public.

---

## 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `POST` | `/auth/login` | Authenticate user with identifier, password & tenant code | Public |
| `GET` | `/auth/me` | Fetch active user session claims and tenant context | Authenticated |
| `PATCH` | `/auth/locale` | Update user preferred locale (`gu` / `en`) | Authenticated |

---

## 2. Students & Admissions (`/api/v1/students`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `GET` | `/students` | List students with search, class filter and pagination | `STUDENTS_VIEW` |
| `POST` | `/students` | Create student admission (eGR) with auto-enrollment | `STUDENTS_MANAGE` |
| `GET` | `/students/:id` | Get complete student profile and documents | `STUDENTS_VIEW` |
| `PATCH` | `/students/:id` | Update student profile metadata | `STUDENTS_MANAGE` |
| `POST` | `/students/promote` | Promote batch students to next academic year | `STUDENTS_MANAGE` |
| `POST` | `/students/transfer` | Withdraw student & generate Leaving Certificate (LC) | `STUDENTS_MANAGE` |
| `POST` | `/students/import` | Bulk import students from validated Excel file | `STUDENTS_MANAGE` |
| `GET` | `/students/export/excel` | Export styled Excel sheet with school letterhead | `STUDENTS_VIEW` |

---

## 3. Fees & Statutory Receipts (`/api/v1/fees`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `GET` | `/fees/structures` | List fee structures for class/academic year | `FEES_VIEW` |
| `POST` | `/fees/structures` | Create new class fee structure | `FEES_MANAGE` |
| `GET` | `/fees/student/:studentId` | Get student fee demands and dues | `FEES_VIEW` |
| `POST` | `/fees/collect` | Collect payment, update dues, auto-post journal entry | `FEES_COLLECT` |
| `GET` | `/fees/receipt/:paymentId` | Generate 3-Ply statutory receipt (Student/Office/Bank) | `FEES_VIEW` |
| `POST` | `/fees/refund` | Refund fee payment and reverse accounting journal | `FEES_MANAGE` |

---

## 4. Accounting & Rojmel (`/api/v1/accounting`, `/api/v1/rojmel`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `GET` | `/accounting/accounts` | Chart of Accounts with real-time balances | `ACCOUNTING_COA_MANAGE` |
| `POST` | `/accounting/accounts` | Create account under Asset, Liability, Income, Expense | `ACCOUNTING_COA_MANAGE` |
| `POST` | `/accounting/journal-entries` | Post double-entry journal (Debits == Credits) | `ACCOUNTING_ENTRIES_MANAGE` |
| `POST` | `/accounting/vouchers/payment` | Disburse expense voucher with cash/bank leg | `ACCOUNTING_ENTRIES_MANAGE` |
| `GET` | `/accounting/ledger/:id` | Account ledger statement with running balance | `ACCOUNTING_ENTRIES_VIEW` |
| `GET` | `/accounting/cash-book` | Cash Book statement matching cash-in-hand | `ACCOUNTING_ENTRIES_VIEW` |
| `GET` | `/accounting/trial-balance` | Trial Balance verifying arithmetic parity | `ACCOUNTING_ENTRIES_VIEW` |
| `GET` | `/rojmel/day-view` | Daily Deshi Nama Rojmel Aakharo (Jama == Udhar) | `ROJMEL_VIEW` |
| `POST` | `/rojmel/quick-entry` | Quick 1-click Jama / Udhar entry in Rojmel | `ROJMEL_MANAGE` |
| `GET` | `/rojmel/monthly-view` | 31-day month grid with daily carryovers | `ROJMEL_VIEW` |
| `GET` | `/rojmel/head-wise-summary` | Income & expense breakdown for financial year | `ROJMEL_VIEW` |

---

## 5. Grants (`/api/v1/grants`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| `GET` | `/grants` | List grants with type, status & search filters | `GRANTS_VIEW` |
| `POST` | `/grants` | Create new grant account master | `GRANTS_MANAGE` |
| `POST` | `/grants/:id/receive` | Record grant receipt against sanctioned limit | `GRANTS_MANAGE` |
| `POST` | `/grants/:id/utilize` | Record expenditure within available balance | `GRANTS_MANAGE` |
| `POST` | `/grants/:id/request-override`| Request override for excess expenditure | `GRANTS_OVERRIDE_REQUEST` |
| `GET` | `/grants/:id/statement` | Running balance ledger statement | `GRANTS_VIEW` |
