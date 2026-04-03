---
name: dev-systematic-debugging
description: "Use when encountering any bug, test failure, or unexpected behavior — investigate before fixing."
---

# Systematic Debugging

**Iron Law:** Understand the bug before fixing it. A fix without understanding is a new bug waiting to happen.

## The 4 Phases

### Phase 1: Observe
Gather facts. Do not guess.
- What is the exact error message or unexpected behavior?
- What is the expected behavior?
- When did it start? What changed?
- Can you reproduce it reliably?

Read logs, stack traces, and error output carefully. The answer is usually in the output.

### Phase 2: Hypothesize
Form 2-3 hypotheses ranked by likelihood. For each:
- What would be true if this hypothesis is correct?
- What test would confirm or eliminate it?

Start with the most likely. Do NOT fix anything yet.

### Phase 3: Test
For each hypothesis:
1. Design a minimal test that distinguishes this hypothesis from others
2. Run it. Record the result.
3. If confirmed → move to Phase 4. If eliminated → next hypothesis.

If all hypotheses fail, return to Phase 1 with new observations.

### Phase 4: Fix
1. Write a test that reproduces the bug (it should fail)
2. Implement the minimal fix
3. Run the reproducing test (it should pass)
4. Run the full test suite (nothing else broke)
5. Explain WHY the bug happened, not just what you changed

## Rationalization Table

| Excuse | Truth |
|--------|-------|
| "I know what the problem is" | Then prove it with a test in 30 seconds |
| "Let me just try this quick fix" | Quick fixes mask root causes |
| "It is probably X" | "Probably" is not evidence. Check. |
| "This worked before" | Something changed. Find what. |

## Red Flags
- Changing code without understanding the failure
- Multiple changes at once ("shotgun debugging")
- Skipping the reproduction step
- Fixing symptoms instead of root cause
- "It works now" without explaining why
