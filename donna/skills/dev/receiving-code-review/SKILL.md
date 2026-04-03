---
name: dev-receiving-code-review
description: "Use when receiving code review feedback — verify before implementing, push back when wrong."
---

# Receiving Code Review

**Iron Law:** Code review is a technical conversation, not a performance review. Evaluate feedback on merit.

## When You Receive Feedback

### Step 1: Understand It
- Read the full comment. Do not skim.
- Restate the feedback in your own words to confirm understanding.
- If the feedback is unclear, ask for clarification before acting.

### Step 2: Evaluate It
For each piece of feedback, determine:

| Category | Action |
|----------|--------|
| **Correct and important** | Implement it. Thank them. |
| **Correct but trivial** | Implement it. Do not argue about taste. |
| **Debatable** | State your reasoning. Propose both options. Let the reviewer decide. |
| **Incorrect** | Push back with evidence. Explain why. Do not implement wrong changes to be agreeable. |
| **Out of scope** | Acknowledge it. Note it for a future task. Do not scope-creep the current work. |

### Step 3: Implement Changes
For every change you make:
1. Make the change
2. Run the test suite
3. Verify the change does what the reviewer intended
4. Confirm no regressions

Do NOT batch all changes and test once at the end. Verify after each.

### Step 4: Respond
For each feedback item, report:
- What you did (or why you did not)
- Evidence it works (test output, behavior confirmation)

## Rules
- Never implement a suggestion you do not understand
- Never implement a suggestion you believe is wrong just to avoid conflict
- If feedback contradicts the approved design, surface that conflict explicitly
- If you disagree, lead with evidence not opinion
- Assume good intent. The reviewer is trying to help.

## Red Flags
- Accepting all feedback without evaluation ("sounds good, done")
- Implementing changes without running tests after each one
- Arguing about style preferences instead of correctness
- Making changes that break existing tests to satisfy feedback
- Performative agreement: saying "great catch" when you knew it was fine
