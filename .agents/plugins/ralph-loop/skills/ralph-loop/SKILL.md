---
name: ralph-loop
description: Activate this skill when running autonomous coding loops, test-driven development (TDD), self-healing debug cycles, fixing broken builds or tests, or iterating until 100% test pass rate is achieved.
---

# Ralph Loop (Autonomous TDD & Self-Healing Loop)

The **Ralph Loop** is a closed-loop iterative software engineering protocol designed to achieve robust, regression-free code through continuous automated feedback.

---

## The RALPH Protocol

```text
┌─────────────────────────────────────────────────────────┐
│                    THE RALPH CYCLE                      │
│                                                         │
│   [R] Red Test / Spec Definition                        │
│          │                                              │
│          ▼                                              │
│   [A] Actionable Code Modification                      │
│          │                                              │
│          ▼                                              │
│   [L] Lint, Build & Test Verification                   │
│          │                                              │
│          ├───► All Green? ───► [Done / Refactor]        │
│          │                                              │
│          ▼ (Failures detected)                          │
│   [P] Problem Isolation & Root Cause Analysis           │
│          │                                              │
│          ▼                                              │
│   [H] Heal, Patch & Loop Back to [L]                    │
└─────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Instructions

### 1. [R] - Red Test Definition
- Before writing or fixing complex features, establish the test expectation.
- Identify existing unit/integration tests or write a new test specifying expected behavior.
- Ensure the test cleanly reproduces the desired feature or bug.

### 2. [A] - Actionable Modification
- Formulate a precise, targeted fix or feature implementation.
- Make surgical code edits rather than sweeping unstructured rewrites.
- Ensure types, imports, and interface contracts are consistent.

### 3. [L] - Lint, Build & Test Execution
- Run verification immediately:
  ```bash
  npm test
  npm run build
  ```
- Collect the complete output (exit code, stdout, stderr, test assertions).

### 4. [P] - Problem Isolation
- If any test or build fails:
  - Extract the failing assertion, expected vs actual values, and stack trace line numbers.
  - Read the exact file lines mentioned in the stack trace.
  - Formulate a hypothesis for why the failure occurred.
  - Check whether previous passing tests broke (prevent regression).

### 5. [H] - Heal & Iterate
- Apply corrective patch addressing the root cause.
- Re-run step **[L]**.
- Repeat until all tests and builds pass with zero errors.
- Limit: If after 5 iterations a fundamental architectural mismatch is identified, re-evaluate the premise or clarify requirements.
