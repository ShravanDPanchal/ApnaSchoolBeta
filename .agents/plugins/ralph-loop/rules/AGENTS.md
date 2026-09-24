# Ralph Loop Rules

- **Never Ignore Failing Tests**: If a test suite fails after a modification, it must be resolved before marking the task complete.
- **Root Cause Fixes**: Fix the underlying defect in logic or implementation; do not modify or delete tests solely to make them pass unless the requirements themselves changed.
- **Iterative Loop Budget**: Systematically test, isolate, patch, and re-test within a controlled loop budget (up to 5 self-healing iterations).
