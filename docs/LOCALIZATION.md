# Gujarati-First Localization Architecture

## 1. Core Architectural Principle

**Never build separate applications for different languages.**

Apna School ERP uses a single, unified codebase that dynamically switches presentation, numerals, date formatting, and PDF/HTML letterheads based on the active user session or student profile language preference.

```
                    UNIFIED SCHOOL ERP
                            │
             ┌──────────────┴──────────────┐
             ▼                             ▼
        ગુજરાતી (Default)                 English
             │                             │
        ગુજરાતી UI                     English UI
             │                             │
       Gujarati GSEB PDFs             English CBSE PDFs
             │                             │
     શ્રી રોજમેળ / પ્રગતિ પત્રક       Daybook & Report Cards
```

---

## 2. Standard ERP Terminology Mapping

| English Term | Gujarati Statutory Term | Usage Context |
|--------------|-------------------------|---------------|
| **Dashboard** | **ડેશબોર્ડ** | Executive KPI summary |
| **Students** | **વિદ્યાર્થીઓ (eGR)** | General Register & admissions |
| **Attendance** | **દૈનિક હાજરી** | Student & staff daily punch |
| **Fees** | **ફી અને રસીદ** | Fee demands & 3-ply receipts |
| **Daily Rojmel** | **શ્રી રોજમેળ (દેશી નામા)** | Daily Jama/Udhar daybook |
| **Double-Entry** | **દ્વિનોંધી હિસાબ** | Journal vouchers & Chart of Accounts |
| **Income** | **આવક (જમા બાજુ)** | Receipts & revenue heads |
| **Expense** | **ખર્ચ (ઉધાર બાજુ)** | Vouchers & operational expenditures |
| **Ledger** | **ખાતાવહી** | Running account statements |
| **Trial Balance** | **સરવૈયું / કાચું સરવૈયું** | Arithmetic parity check |
| **Reports** | **અહેવાલો અને સરકારી પત્રકો** | GCERT & GSEB statutory registers |
| **Settings** | **શાળા સેટિંગ્સ** | School profile, board, colors |

---

## 3. Numeric & Currency Localization

The platform includes shared utility functions in `@apna-school/shared-types`:

- `toGujaratiDigits(number | string)`: Converts Western Arabic numerals (`0-9`) to Gujarati characters (`૦-૯`).
- `formatINR(amount, locale)`: Formats amounts with statutory Indian thousand/lakh separators (e.g. `₹ 1,50,000` or `₹ ૧,૫૦,૦૦૦`).
