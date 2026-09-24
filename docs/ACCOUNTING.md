# Deshi Nama Rojmel & Double-Entry Accounting Architecture

## 1. Statutory Accounting Parity

Apna School ERP maintains statutory mathematical balance between modern **Double-Entry Accrual Accounting** and traditional Gujarati **Deshi Nama Rojmel (શ્રી રોજમેળ)**.

```
                  FINANCIAL TRANSACTION
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
  Standard Double-Entry              Deshi Nama Rojmel
  ---------------------              -----------------
  Debit / Credit Lines               Jama (જમા) / Udhar (ઉધાર)
  Chart of Accounts                  Aakharo (આખરો)
  General Ledger                     Cash / Bank Book (રોકડ મેળ / બેંક મેળ)
  Trial Balance                      Khatavahi (ખાતાવહી)
```

---

## 2. Rojmel Mathematical Invariants

In Gujarat Deshi Nama, the daily daybook closes with the **Aakharo (આખરો)** balancing equation:

$$\text{Total Jama Side} \equiv \text{Total Udhar Side}$$

Where:
$$\text{Total Jama} = \text{Opening Cash} + \text{Opening Bank} + \sum \text{Day Jama Receipts}$$
$$\text{Total Udhar} = \sum \text{Day Udhar Payments} + \text{Closing Cash} + \text{Closing Bank}$$

### Opening Balance Carryover:
$$\text{Opening Balance}(D_n) \equiv \text{Closing Balance}(D_{n-1})$$

---

## 3. Account Group Structure (Chart of Accounts)

1. **ASSET (મિલકત)** — Normal Nature: DEBIT
   - 1000: Cash in Hand (શ્રી રોકડ સિલક)
   - 1100: Bank Accounts (બેંક ખાતા)
   - 1200: Receivables & Advances (લેણાં)
2. **LIABILITY (દેવું)** — Normal Nature: CREDIT
   - 2000: Sundry Payables & Caution Deposits (અનામત / ચૂકવવાપાત્ર)
3. **EQUITY / CAPITAL (મૂડી)** — Normal Nature: CREDIT
   - 3000: Trust Endowment & Corpus Fund (ટ્રસ્ટ મૂડી ભંડોળ)
4. **INCOME / REVENUE (આવક)** — Normal Nature: CREDIT
   - 4000: Student Tuition Fees (શિક્ષણ ફી)
   - 4100: Term, Computer & Activity Fees (સત્ર / કોમ્પ્યુટર ફી)
   - 4200: Government Maintenance Grants (સરકારી નિભાવ ગ્રાન્ટ)
5. **EXPENSE (ખર્ચ)** — Normal Nature: DEBIT
   - 5000: Staff Salaries & Allowances (કર્મચારી પગાર ભથ્થાં)
   - 5100: Educational Stationery & Printing (સ્ટેશનરી અને છાપકામ)
   - 5200: Repairs & School Maintenance (સમારકામ અને નિભાવ)
