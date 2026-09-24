# Apna School (અપના સ્કૂલ) — White-Label School ERP & Accounting SaaS

A production-grade, white-label School ERP, Operations, and Double-Entry Accounting Platform purpose-built for primary and secondary schools in Gujarat, India.

---

## Key Highlights

- **Gujarati-First (ગુજરાતી પ્રથમ) & English**: Native bilingual UI with Gujarati typography (`Noto Sans Gujarati` & `Anek Gujarati`).
- **Authentic Deshi Nama Rojmel (દેશી નામા રોજમેળ)**: Full Jamaican/Udhar daybook workflow with daily automated Aakharo balance validation.
- **Enterprise Double-Entry Accounting**: Real-time balance invariant ($\sum \text{Debits} = \sum \text{Credits}$), General Ledger, Cash/Bank Books, and Trial Balance.
- **Statutory eGR (electronic General Register)**: Immutable student records, APAAR ID (12-digit), CTS 18-digit ID, DOB in words, and caste categories.
- **Government Portal Data Exports**: Pre-formatted one-click CSV exports for **CTS (Child Tracking System)**, **VSK (Vidya Samiksha Kendra)**, **UDISE+**, and **SAS Gujarat**.
- **Fast Classroom Attendance**: Instant 1-click batch marking.
- **Fee Management & 3-Ply Receipts**: Class-wise fee structures, concessions, and statutory receipts.
- **Multi-Tenant White-Labeling**: School-specific names, logos, and custom color themes with strict data isolation.
- **Mobile Android Client (Flutter)**: Clean architecture Flutter app with offline sync and quick teacher workflows.

---

## Monorepo Architecture

```
apna-school/
├── apps/
│   ├── api/          # Express/Node.js + Prisma TypeScript Backend
│   ├── web/          # Next.js 14 + Tailwind CSS + Lucide Icons Web Frontend
│   └── mobile/       # Flutter Android App (Clean Architecture + Riverpod)
├── packages/
│   └── shared-types/ # Shared TypeScript types, enums & Indian formatters
└── docker/           # Docker Compose & container files
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Types & Generate Database
```bash
npm --workspace=packages/shared-types run build
npm --workspace=apps/api run prisma:migrate
npm --workspace=apps/api run db:seed
```

### 3. Run Automated Tests
```bash
npm --workspace=apps/api run test:accounting
npm --workspace=apps/api run test:isolation
```

### 4. Start Development Servers
```bash
# Terminal 1: Backend API (Port 3001)
npm --workspace=apps/api run dev

# Terminal 2: Web App (Port 3000)
npm --workspace=apps/web run dev
```

---

## Demo Credentials (Seeded)

| Role | School | Email | Password |
|---|---|---|---|
| **School Admin** | Shree Saraswati Vidya Mandir (`SSVM`) | `admin@ssvm.edu.in` | `Password@123` |
| **Accountant** | Shree Saraswati Vidya Mandir (`SSVM`) | `accountant@ssvm.edu.in` | `Password@123` |
| **Super Admin** | Platform Owner | `superadmin@apnaschool.com` | `Password@123` |
