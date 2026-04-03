---
name: meeting-prep
description: Research participants and write context briefs for upcoming meetings. Use when preparing for external calls, 1:1s, sales/discovery, or partner meetings.
metadata: { "openclaw": { "emoji": "📋" } }
---

# Meeting Prep

Prepare Vahid for meetings by researching participants and writing context briefs.

## When to Use

- Morning run Phase 3 (prep today's meetings)
- On-demand when Vahid asks to prep a specific meeting
- When a new external meeting appears on the calendar

## Which Meetings to Prep

**Prep:** external calls, 1:1s with non-team, sales/discovery, partner meetings, board calls
**Skip:** standups, daily check-ins, lunch blocks, deep work blocks, internal syncs

## Process

### Step 1: Identify Meetings

Check calendar for meetings needing prep:
```bash
gog calendar events primary --from <today>T00:00:00Z --to <tomorrow>T00:00:00Z --account vahid@fractionalcpo.com
gog calendar events primary --from <today>T00:00:00Z --to <tomorrow>T00:00:00Z --account hi@vahidjozi.com
```

### Step 2: Check for Deal Context

Before researching participants:
1. Extract company name from meeting title or attendee domains
2. Search Notion Opportunities DB (`de289591-f32a-483d-a51e-6bc158f4173e`) for an active opportunity
3. If deal exists: pull stage, notes, linked people, next action date

### Step 3: Research Each Participant

For each meeting that needs prep, research in this order:
1. **Apollo** — company enrichment, role, title, company size
2. **Fellow** — prior meeting notes and action items (use Fellow skill endpoints)
3. **Email** — `gog gmail search "from:participant@domain.com" --max 10 --account vahid@fractionalcpo.com`
4. **Notion** — search Companies/People DBs for prior context
5. **Web search** — if other sources are thin, search for the person + company

For PE contacts, also research: portfolio companies, recent acquisitions, leadership changes.

### Step 4: Write the Brief

Write to `/Users/claw/.openclaw/workspace/vault/💼 work/🏢 fcpo/📋 meeting-prep/prep-YYYY-MM-DD-<meeting>.md`:

```markdown
# [Meeting Title] — [Date]

## Who
[Name] — [Role] — [Company] (1 line)

## Why
Why are we talking, what's the relationship (1-2 lines)

## Last Time
Summary of last interaction, if any (1 line)

## Deal Status (if applicable)
Stage: [stage] | Pricing: [if discussed] | Timeline: [if known]
Open items: [from opportunity notes]

## Strategic Play
What does a good outcome look like (1-2 lines)

## Watch Out
Landmines, sensitivities, things to avoid (1 line, if applicable)

## Open Items
Pending action items from prior meetings

## Talking Points
1. [Short, scannable — one line each]
2. [3-5 points max]
3. [Discovery calls: soft, open-ended questions only]
```

### Step 5: Report

Message Vahid on Telegram:
- Which meetings were prepped
- Key context highlight for each (1 line)
- Any open action items from prior meetings

## Meeting Type → Talking Point Style

| Type | Style |
|------|-------|
| Discovery/Intro | Soft, relationship-first. Let them surface pain. NEVER show research. |
| Follow-up | Reference prior conversation. Advance specific threads. |
| Internal 1:1 | Status updates, blockers, decisions needed. |
| Sales/Pitch | Problem → solution framing. Case study ready. |

## Notes

- For Fellow writes (talking points, private notes), use: `node /Users/claw/code/CoS/scripts/fellow-write.js`
- Always use absolute paths (vault: `/Users/claw/.openclaw/workspace/vault/`)
- Read existing prep files before writing — don't duplicate
