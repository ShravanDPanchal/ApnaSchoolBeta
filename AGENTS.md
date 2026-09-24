# Apna School Workspace Agent Guidelines

This repository is configured with **GSD (Get Shit Done)**, **Ralph Loop (Autonomous TDD)**, and **CodeRabbit Code Review** workflows.

---

## 1. GSD (Get Shit Done) Protocol
- **Action-Oriented**: Decompose complex tasks into clear, atomic milestones.
- **Autonomous Execution**: Take initiative on architecture and technical implementation details following best practices.
- **No Incomplete Code**: Do not leave unfinished tasks or stubbed placeholders in final implementations.

---

## 2. Ralph Loop (Autonomous TDD & Feedback Cycle)
- **Continuous Validation**: After implementing code changes, execute build and test suites (`npm test`, `npm run build`).
- **Self-Healing Loop**: If tests or compilation steps fail, analyze stack traces, isolate the root cause, and apply targeted fixes iteratively until 100% green.
- **Zero Regressions**: Ensure modifications do not break previously passing test suites.

---

## 3. CodeRabbit Review Standard
- **High-Signal Audits**: Review code for security vulnerabilities, edge-case null handling, SQL/DB query efficiency, and architectural modularity.
- **Actionable Feedback**: Pair every identified code smell or bug with a concrete, runnable replacement suggestion.

---

## 4. Core Operational Chains (Mandatory Data Integrity)
Every agent MUST maintain unbroken financial and operational relationships:

### Student Fee Collection Chain:
`Student` → `FeeStructure` → `StudentFee` → `Payment` → `3-Ply Receipt` → `Accounting Journal Transaction` → `Cash/Bank Account` → `Rojmel (Aakharo)` → `General Ledger` → `Reports`

### Expense Disbursement Chain:
`Expense Request` → `Approval` → `Payment Voucher` → `Accounting Journal` → `Cash/Bank Account` → `Rojmel (Udhar)` → `General Ledger`

*Never create disconnected UI mockups or stubbed balances.*

---

## 5. Gujarati-First Unified Architecture
- Maintain a single, unified application with deep runtime localization (`gu` / `en`).
- Do not build separate apps for different languages.
- Support bilingual database schema (`nameEn`/`nameGu`, `addressEn`/`addressGu`), UI toggles, and GSEB-compliant Gujarati PDF/HTML report generators.

---

## 6. Multi-Tenant White-Label Architecture
- Maintain strict multi-tenancy: Platform → School/Tenant → Branding/Users/Data.
- Every business table MUST include `tenantId`.
- Queries and mutations MUST enforce tenant isolation at both middleware and service layer.

---

## 7. Mandatory Code Modification Protocol (Rule 24)
Before modifying existing code, you MUST follow these 11 steps:
1. **Inspect** the current project and file contents.
2. **Understand** existing architecture and conventions.
3. **Do not unnecessarily rewrite** working code.
4. **Reuse** existing components, helpers, and utilities.
5. **Check database migrations** and schema definitions.
6. **Check existing tests** to prevent breaking assertions.
7. **Check related modules** for downstream impacts.
8. **Implement the smallest safe change** required.
9. **Run automated tests** (`npm test`, `npx jest`).
10. **Fix regressions autonomously** until all tests pass.
11. **Only then report completion**.

*Never say "implemented successfully" merely because code was generated. Verify that it actually works.*
