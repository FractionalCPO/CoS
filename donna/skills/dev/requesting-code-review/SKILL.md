---
name: dev-requesting-code-review
description: "Use after completing implementation — self-review against the checklist before presenting work."
---

# Requesting Code Review

**Iron Law:** Review your own work before presenting it. Catch what you can, present what remains.

## Self-Review Checklist

Before saying "done," walk through every item:

### 1. Plan Alignment
- [ ] Every task in the plan is implemented
- [ ] No tasks were skipped or deferred without noting it
- [ ] No scope was added beyond the plan
- [ ] The implementation matches the approved design

### 2. Code Quality
- [ ] No commented-out code
- [ ] No debug print statements or temporary logging
- [ ] No hardcoded values that should be configurable
- [ ] Variable and function names are clear
- [ ] Error handling covers failure cases
- [ ] No duplicated code that should be extracted

### 3. Architecture
- [ ] Follows existing patterns in the codebase
- [ ] No unnecessary new abstractions
- [ ] Dependencies flow in the right direction
- [ ] No circular imports or references

### 4. Testing
- [ ] Every new behavior has a test
- [ ] Tests are testing behavior, not implementation
- [ ] Edge cases are covered
- [ ] Full test suite passes (with output)

### 5. Completeness
- [ ] Config files updated if needed
- [ ] Documentation updated if public API changed
- [ ] No TODO comments without a corresponding tracked task

## Presentation Format

After self-review, present:

```
## Summary
<what was built and why, 1-3 sentences>

## Changes
<files changed, what each change does>

## Self-Review Findings
<anything you caught and fixed, or flagged for discussion>

## Test Results
<paste actual test output>

## Open Questions
<anything you are unsure about>
```

## Red Flags
- Presenting work without running the self-review checklist
- "Everything looks good" without specifics
- Skipping the test output
- Hiding known issues instead of flagging them
