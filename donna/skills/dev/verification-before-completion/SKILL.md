---
name: dev-verification
description: "Use before claiming work is complete, fixed, or passing — evidence before assertions, always."
---

# Verification Before Completion

**The Iron Law:** Never claim success without proof. Run it, see the output, then report.

## The Gate

Before saying "done," "fixed," "passing," or "complete," you MUST:

1. **Run the relevant command** (test suite, build, linter, the actual feature)
2. **Read the output** — not just the exit code, the actual output
3. **Confirm it matches expectations** — expected values, no warnings, no skipped tests
4. **Report with evidence** — quote the output that proves it works

If ANY step fails, you are not done. Fix and re-verify.

## Common Failures

| Claim | Required Evidence |
|-------|------------------|
| "Tests pass" | Full test output showing pass count and zero failures |
| "Bug is fixed" | Reproduction test that previously failed now passes |
| "Feature works" | Demo of the feature producing correct output |
| "Build succeeds" | Build output with no errors or warnings |
| "Refactor is safe" | Full test suite passing, diff review showing no behavior change |
| "Config is correct" | Application starts and behaves as expected |

## Rules
- Run the FULL test suite, not just the test you wrote
- Check for warnings, not just errors
- If tests were skipped, find out why
- Verify in the actual environment, not just in your head
- If you cannot verify (no test suite, no way to run it), say so explicitly — do not pretend

## Red Flags
- "This should work" (without running it)
- "Tests pass" (without showing output)
- "I verified" (without saying what you ran)
- Reporting success from a partial test run
- Claiming a fix works based on reading the code, not running it
