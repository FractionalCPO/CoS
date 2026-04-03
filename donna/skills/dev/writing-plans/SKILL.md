---
name: dev-writing-plans
description: "Use when you have a spec or design to break into implementation steps, before touching code."
---

# Writing Plans

**Iron Law:** Never start coding without a written plan. Plans are the contract between thinking and doing.

## What Makes a Good Plan

Each task must be:
- **Bite-sized:** 2-5 minutes of work
- **Specific:** exact file paths, function names, line ranges
- **Complete:** contains the actual code to write (not "implement the thing")
- **Testable:** includes the test that proves it works
- **Ordered:** dependencies are sequenced correctly

## Process

### 1. Read the Design
Start from the design doc (from brainstorming). If there is no design doc, stop and run brainstorming first.

### 2. Survey Existing Code
Read every file that will be touched. Note:
- Current patterns and conventions
- Import styles, naming conventions, error handling
- Test patterns already in use

### 3. Write the Plan
Structure:

```
## Plan: <feature name>

### Task 1: <what>
- File: <exact path>
- Action: create | modify | delete
- Code:
  ```<lang>
  <the actual code>
  ```
- Test:
  ```<lang>
  <the test code>
  ```

### Task 2: ...
```

### 4. Apply Principles
- **TDD:** every task has a test written before the implementation
- **DRY:** if code is duplicated, extract it
- **YAGNI:** if it is not in the design, it is not in the plan
- **Small commits:** each task = one logical commit

### 5. Save and Confirm
Save the plan to `workspace/plans/<feature-name>.md`.

Ask: **"Plan ready. Want to start implementing?"**

Do not begin implementation until confirmed.

## Red Flags
- Tasks longer than 5 minutes
- Tasks that say "implement X" without showing the code
- No tests in the plan
- Plan diverges from the approved design
