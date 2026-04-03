---
name: dev-tdd
description: "Use when implementing any feature or bugfix. Tests first, always — no exceptions."
---

# Test-Driven Development

**The Iron Law:** Write a failing test BEFORE writing implementation code. No exceptions.

## RED-GREEN-REFACTOR

### RED: Write a Failing Test
1. Write the smallest test that captures the next requirement
2. Run the test. Watch it fail. Read the failure message.
3. If the test passes without new code, the test is wrong or the feature already exists.

### GREEN: Make It Pass
1. Write the MINIMUM code to make the test pass
2. No clever abstractions. No "while I am here" additions. Just make it green.
3. Run the test. Confirm it passes. Run the full suite — nothing else broke.

### REFACTOR: Clean Up
1. Only refactor when tests are green
2. Improve structure, remove duplication, clarify names
3. Run tests after every change. Stay green.

Then repeat. Next test. Next requirement.

## Rationalization Table

These are lies. Do not believe them:

| Excuse | Truth |
|--------|-------|
| "This is too simple to test" | Simple things break. Test it. |
| "I will add tests after" | You will not. Write them now. |
| "The test would be trivial" | Then it takes 30 seconds. Write it. |
| "I need to see the shape first" | The test IS the shape. Start there. |
| "This is just a refactor" | Refactors break things. Tests catch that. |
| "It is just a config change" | Config changes cause outages. Test it. |

## Rules
- One test at a time. Do not write a batch of tests and then implement.
- Run tests after EVERY change — not just at the end.
- If a test is hard to write, the design is wrong. Fix the design.
- Test behavior, not implementation details.
- Name tests as sentences: `test_user_can_reset_password_with_valid_token`

## Red Flags
- Writing implementation before any test exists
- Multiple failing tests at once
- Tests that test the framework, not the feature
- "All tests pass" without showing the output
- Refactoring while tests are red
