---
name: triage
description: Scan email and Slack, prioritize by urgency, draft responses in Vahid's voice. Use for inbox triage.
metadata: { "openclaw": { "emoji": "📬" } }
---

# Inbox Triage

Scan all communication channels, classify by urgency, draft responses.

## When to Use

- Morning run Phase 1 (email + slack scan)
- On-demand when Vahid asks to check inbox
- When Vahid says "triage" or "check my inbox"

## Channels (in order)

### 1. Work Email
```bash
gog gmail search 'newer_than:12h' --max 20 --account vahid@fractionalcpo.com
```

### 2. Personal Email
```bash
gog gmail search 'newer_than:12h' --max 20 --account hi@vahidjozi.com
```

### 3. Slack
Check DMs and mentions via Slack tools. Focus on direct messages requiring response.

## Classification

| Tier | Criteria | Action |
|------|----------|--------|
| **Tier 1** | Key contacts, time-sensitive, blocking someone, explicit urgency | Flag NOW |
| **Tier 2** | Important but not urgent, requires thoughtful response, due today | Handle today |
| **Tier 3** | FYI, newsletters, automated notifications, low-stakes | Note or skip |

**Tier assignment factors:**
- Who sent it? (Key contacts = higher tier — check `/Users/claw/code/CoS/assets/company-context.md`)
- Is someone blocked waiting?
- Is there a deadline mentioned?
- Has it been waiting a long time?

## Before Drafting

Verify Vahid hasn't already replied:
- Check sent mail for responses to the same thread
- If already handled, skip entirely

## Draft Responses

For Tier 1 and Tier 2, draft responses that:
- Match Vahid's writing style (read global CLAUDE.md Register section for register rules, soul.md for tone)
- Are send-ready, not starting points
- Include specific time proposals if scheduling (check calendar first)

## Output Format

```
scanned: [channels] ([counts])

TIER 1 — respond now
1. [Sender] — [Subject/summary] ([channel], [wait time])
   draft: "[proposed response]"

TIER 2 — handle today
2. [Sender] — [Subject/summary] ([channel])
   draft: "[proposed response]"

TIER 3 — fyi
3-N. [Brief list]

summary: [X] items need action, [Y] drafts ready
```

## Rules

- NEVER send any message without explicit approval
- Speed matters — triage should take 2-3 minutes, not 10
- Don't over-explain — Vahid knows his contacts
- If nothing urgent: "inbox clear. no items need immediate attention."
- Extract action items from emails → tasks.md if appropriate
