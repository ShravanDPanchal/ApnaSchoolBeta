# Database Schema & Entity Relationships

## 1. Overview & Multi-Tenancy Design

The Apna School database schema is managed via **Prisma ORM** (`apps/api/prisma/schema.prisma`). It enforces strict multi-tenancy where all operational and financial models include a `tenantId` foreign key and compound unique constraints.

```
                                  [Tenant]
                                     │
         ┌──────────────┬────────────┼────────────┬──────────────┐
         ▼              ▼            ▼            ▼              ▼
     [School]      [Student]      [Staff]    [AcademicYear] [FinancialYear]
         │              │            │            │              │
         ▼              ▼            ▼            ▼              ▼
      [Class]      [Enrollment]  [Assign]    [ExamType]     [ChartOfAccount]
         │              │                         │              │
         ▼              ▼                         ▼              ▼
     [Division]    [StudentFee]                 [Exam]     [JournalEntry]
                        │                         │              │
                        ▼                         ▼              ▼
                  [FeePayment]                 [Marks]     [JournalLine]
                        │                                        │
                        ▼                                        ▼
                 [FeePaymentItem]                          [Expense/Rojmel]
```

---

## 2. Core Entity Models

### A. Tenancy & Auth
- `Tenant`: Multi-tenant organization container (e.g. `SSVM`, `SKV`).
- `User`: System accounts across roles with hashed credentials (`bcryptjs`).
- `UserTenant`: Many-to-many relationship connecting users to school tenants.
- `Role` & `Permission`: Granular RBAC permissions matrix.

### B. Academics & Students
- `Student`: General Register master (GR Number, APAAR ID, CTS ID, bilingual names).
- `Class` & `Division`: Standard grades (Std 1–12) and sections (A, B, C).
- `Enrollment`: Academic year and class enrollment mapping.
- `StudentAttendance`: Daily presence status (`PRESENT`, `ABSENT`, `HALF_DAY`, `HOLIDAY`).

### C. Fees & Statutory Receipts
- `FeeHead`: Statutory fee heads (Tuition, Term, Computer, Library, Laboratory).
- `FeeStructure`: Standard-wise fee amount and due dates.
- `StudentFee`: Student fee liability demand ledger.
- `FeePayment`: Payment receipts with 3-ply statutory voucher tracking (`STUDENT_COPY`, `OFFICE_COPY`, `BANK_COPY`).

### D. Double-Entry Accounting & Deshi Nama Rojmel
- `AccountGroup`: 5 major groups (`ASSET`, `LIABILITY`, `EQUITY`, `INCOME`, `EXPENSE`).
- `ChartOfAccount`: Ledger accounts with normal balance (`DEBIT`/`CREDIT`) and running balance.
- `JournalEntry`: Double-entry transaction headers (`RECEIPT`, `PAYMENT`, `CONTRA`, `JOURNAL`).
- `JournalLine`: Balanced debit and credit entries ($\sum \text{Debits} = \sum \text{Credits}$).
- `Expense`: Disbursed expenses with invoice attachments and approval workflow.

### E. Grant Management
- `Grant`: Sanctioned government & trust grants (SSA, GSEB, MDM).
- `GrantTransaction`: Receipts, utilizations, and running balance ledger.
- `GrantOverrideRequest`: Authorization workflow for emergency excess expenditures.
