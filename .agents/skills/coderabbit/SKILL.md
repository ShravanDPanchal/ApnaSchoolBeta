---
name: coderabbit
description: Activate this skill when reviewing code, analyzing pull requests, evaluating git diffs, performing code audits, auditing security and performance, or running automated CodeRabbit-style reviews.
---

# CodeRabbit AI Code Review Protocol

The **CodeRabbit Review Protocol** provides comprehensive, context-aware code reviews. It analyzes structural impact, potential bugs, security vulnerabilities, performance regressions, and style adherence.

---

## Review Dimensions

When reviewing code or diffs, evaluate across five dimensions:

1. **Correctness & Logic**: Race conditions, unhandled null/undefined, off-by-one errors, boundary conditions, edge cases.
2. **Security & Vulnerabilities**: OWASP Top 10, SQL/NoSQL injection, unauthorized access, sensitive data leakage, improper input validation.
3. **Architecture & Clean Code**: SOLID principles, modularity, DRY, dependency hygiene, proper separation of concerns.
4. **Performance & Scalability**: N+1 database queries, inefficient algorithms, excessive allocations, unindexed lookups, memory leaks.
5. **Testing & Observability**: Test coverage of new code paths, assertions quality, logging and error monitoring.

---

## CodeRabbit Review Report Structure

Format reviews using the following standardized markdown format:

```markdown
# 🐰 CodeRabbit Review Summary

## 📊 High-Level Overview
- **Changes Summary**: Brief description of what was changed and why.
- **Risk Assessment**: `Low` | `Medium` | `High` (with rationale).
- **Architecture Impact**: Summary of module changes or dependency shifts.

---

## 🔍 Critical Issues & Bugs
*(If none found, state "No critical issues detected.")*
- **[File & Line Range]**: Issue description.
  - **Problem**: Why this causes a failure or bug.
  - **Recommendation**: Exact replacement or fix.

---

## 🛡️ Security & Performance Observations
- **Security**: Analysis of auth, inputs, and sanitization.
- **Performance**: Analysis of query efficiency, caching, or compute overhead.

---

## 💡 Code Quality & Refactoring Suggestions
- Actionable suggestions to improve readability, maintainability, and idioms.

---

## 🧪 Verification & Test Recommendations
- List specific unit/integration test cases that should be added to prevent regressions.
```
