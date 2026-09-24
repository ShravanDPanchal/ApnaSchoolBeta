# Apna School ERP — Architecture & System Design

## 1. High-Level System Architecture

Apna School is an enterprise-grade, white-label school management and Deshi Nama accounting ERP tailored specifically for Gujarat education institutions (GSEB, GCERT, Gujarat Primary & Secondary Education Board).

```
                            WHITE-LABEL SAAS PLATFORM
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │                          │                          │
        School Tenant A            School Tenant B            School Tenant C
       (Shree Saraswati)         (Sheth K.V. High)           (Adarsh Vidyalaya)
             │                          │                          │
      Custom Branding            Custom Branding            Custom Branding
             │                          │                          │
     Multi-Role Users           Multi-Role Users           Multi-Role Users
             │                          │                          │
     Isolated SQLite/DB         Isolated SQLite/DB         Isolated SQLite/DB
```

---

## 2. Core Unbroken Operational Chains

A defining pillar of this ERP is that **every financial and operational action triggers real, downstream database transactions** rather than superficial UI counters.

### A. Student Fee Collection Chain
```
[Student Admission / eGR]
         │
         ▼
[Class Fee Structure Master] ── (Heads: Tuition, Term, Computer, Library)
         │
         ▼
[Student Fee Liability Demand] ── (Amount, Net Dues, Concessions, Fines)
         │
         ▼
[Fee Collection / Payment] ── (Cash, Bank Transfer, UPI, Cheque)
         │
         ├───────────────────────────────────────────┐
         ▼                                           ▼
[3-Ply Statutory Receipt]               [Automatic Journal Entry (Receipt)]
(Student, Office, Bank Copies)             Debit: Cash-in-Hand / Bank A/c
                                           Credit: Fee Income Account
                                                     │
                                                     ▼
                                        [Chart of Accounts Balances]
                                                     │
                                                     ▼
                                        [Daily Rojmel (Aakharo - Jama Side)]
                                                     │
                                                     ▼
                                        [Account General Ledger Statement]
                                                     │
                                                     ▼
                                        [Government & School Audit Reports]
```

### B. Expense Disbursement Chain
```
[Expense Voucher Creation] ── (Expense Head, Payee, Purpose, Voucher No.)
         │
         ▼
[Administrative Approval & Settlement]
         │
         ▼
[Automatic Journal Entry (Payment)]
Debit: Expense Account Head
Credit: Cash-in-Hand / Bank Account
         │
         ▼
[Chart of Accounts Balance Recalculation]
         │
         ▼
[Daily Rojmel (Aakharo - Udhar Side)]
         │
         ▼
[General Ledger & Trial Balance Parity]
```

---

## 3. Monorepo Organization

```
/
├── apps/
│   ├── api/             # Express.js REST API, Prisma ORM, Double-Entry & Rojmel Engines
│   ├── web/             # Next.js 14 App Router, Tailwind CSS, Lucide Icons, Bilingual UI
│   └── mobile/          # Flutter Native Android / iOS Application
│
├── packages/
│   └── shared-types/    # TypeScript interfaces, DTOs, Enums, Gujarati numeric formatters
│
├── docs/                # Permanent architectural & design documentation
│   ├── ARCHITECTURE.md
│   ├── ACCOUNTING.md
│   ├── DATABASE.md
│   ├── LOCALIZATION.md
│   └── TESTING.md
│
└── AGENTS.md            # Operational instructions & Rule 24 modification protocol
```
