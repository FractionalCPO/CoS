---
name: build-eval
description: Use when you make a mistake that gets corrected, when a task is marked needs_review due to quality, or when Vahid explicitly corrects your output. Governs error logging, auto-drafting test cases, and running quality gates before presenting output.
---

# Build Eval

## When to Log an Error

Log to `/Users/claw/.openclaw/workspace/vault/⚙️ ops/🤖 donna/evals/error-log.jsonl` whenever:
- Vahid corrects your output in any channel
- A task is marked `needs_review` due to output quality (not approval workflow)
- You catch a self-violation before sending (log it anyway — pattern matters)

**Log format (one JSON object per line):**
{"timestamp":"<ISO8601>","task_type":"<email-copy|notion-writes|morning-briefing|etc>","trigger":"correction|needs_review|self-caught","input":"<what you were asked>","bad_output":"<what you produced or almost produced>","correction":"<what Vahid said or what the correct output is>","source":"donna"}

## When to Auto-Draft an Eval Case

After logging: count entries in error-log.jsonl where `task_type` matches and `timestamp` is within last 30 days.
If error-log.jsonl does not exist yet, treat the count as 0 and skip drafting.

If count >= 2: draft a test case and trigger lobster approval:
1. Write draft case to `vault/⚙️ ops/🤖 donna/evals/<task_type>/pending.yaml`
2. Message Vahid via Telegram: "I've made the same mistake on [task_type] twice. I drafted an eval case to prevent it. Approve it? [case summary]"
3. Use lobster for approval flow — pause until Vahid responds
4. On approval: move case from pending.yaml to cases.yaml
5. On rejection: clear pending.yaml, log rejection

**Case format:**
- id: "<task_type prefix>-<NNN>"
  description: "<one line>"
  expected: PASS | FAIL
  violations: ["<rule-id>"]
  input: >
    <the prompt or task description>
  output: >
    <the bad output that triggered this case>

## When to Run Evals (Quality Gate)

Before presenting ANY output of a task_type to Vahid:

1. Count approved cases in `vault/⚙️ ops/🤖 donna/evals/<task_type>/cases.yaml`
2. If count >= 3: ALWAYS run eval (proactive mode)
3. If count < 3: check error-log for entries of same task_type in last 30 days
   - If entries exist: run eval against available cases
   - If no entries: skip (no history, no gate)

**How to run an eval:**
- For each case in cases.yaml where expected = FAIL: your output must NOT match that pattern
- For the scorer.md rubric: score your draft output against every rule
- If any rule FAILs: DO NOT present the output. Fix it first. Then re-score.
- Only present output that scores OVERALL: PASS

## Scorer Location
vault/⚙️ ops/🤖 donna/evals/<task_type>/scorer.md

Load and apply before every gated output.

## Never
- Never present output that failed a scorer check without fixing it first
- Never skip the quality gate once proactive mode is active for a task_type
- Never create a pending.yaml case without triggering lobster approval
