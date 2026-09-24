---
name: gsd
description: Activate this skill when the user wants to Get Shit Done (GSD), execute an end-to-end task thoroughly, run in autonomous milestone execution mode, or finish complex implementations with zero fluff and full automated verification.
---

# GET SHIT DONE (GSD) Protocol

The **GSD (Get Shit Done)** protocol is an autonomous execution system. It prioritizes action, decisive execution, automated self-verification, and high signal-to-noise ratio.

---

## Core Tenets

1. **Zero Fluff**: Do not ask unnecessary or trivial questions. If a decision is reasonable and idiomatic, make it, execute it, and document the rationale.
2. **Autonomous Tenacity**: Do not halt halfway through a task or quit on the first encountered error. Exhaust all automated diagnostic and self-healing pathways first.
3. **Milestone-Driven Execution**: Break large goals into atomic, verifiable sub-steps and complete them sequentially.
4. **Automated Verification Gate**: Code is not "done" until automated tests, builds, and type checks pass cleanly.

---

## 4-Phase Execution Workflow

### Phase 1: Context & Milestone Planning
1. **Analyze Context**: Read relevant files, dependencies, schema definitions, and configs.
2. **Define Milestones**: Split the user objective into sequential, manageable milestones.
3. Document the roadmap clearly before making changes.

### Phase 2: Relentless Implementation
1. For each milestone:
   - Make atomic, clean edits using precise replace tools.
   - Preserve existing code comments and adhere to project styling.
   - Implement comprehensive error handling and type-safety.
2. Maintain high velocity without sacrificing code quality.

### Phase 3: Verification & Automated Healing
1. Run project builds and test suites:
   - `npm test` or workspace-specific test targets.
   - `npm run build` or typecheck commands.
2. If failures occur:
   - Read the exact stack trace and compiler diagnostics.
   - Diagnose the root cause immediately.
   - Apply fixes and re-run verification until all gates are green.

### Phase 4: Delivery & Walkthrough
1. Confirm all milestones are completed and verified.
2. Present a concise, structured delivery report detailing accomplishments, key decisions, and test results.
