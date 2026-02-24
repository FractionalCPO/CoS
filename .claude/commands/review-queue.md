# /review-queue — Daily Review Queue

## Description
Batch all items needing Vahid's review into a single prioritized list. Run on-demand or as part of daily workflow (mornings are deep work — don't interrupt). High-priority items can surface in AM if there's a pileup.

## Usage
- `/review-queue` — run the daily review queue
- `/review-queue urgent` — run AM check for high-priority pileup only

## Instructions

### Step 0: Get Current Time

Run `date '+%A %Y-%m-%d %H:%M %Z'` to get the current day, date, and timezone.

### Step 1: Scan Notion Tasks DB

Query the Notion Tasks DB (`bfaf4e0f-1352-40cb-b39e-e441b75c1d96`) using `mcp__claude_ai_Notion__notion-search` for:
- Items with "Needs Attention" set to "Needs Review", "Blocked", or "Waiting on Vahid"
- Items assigned to Vahid that are overdue
- Items updated in the last 24 hours that may need a decision

### Step 2: Check Debrief Drafts

Scan `/Users/vahid/code/CoS/assets/` for recent debrief files (last 48 hours):
- Any debrief drafts not yet reviewed or sent
- Meeting follow-ups pending approval

### Step 3: Check Email Drafts

If Gmail MCP is connected, check both accounts for draft emails:
- `gmail-hi` and `gmail-fcpo` — list drafts
- Flag drafts older than 24 hours (they're stalling)

### Step 4: Pipeline Decisions

Query Notion for pipeline items needing decisions:
- **Prospecting DB** — leads in "Ready" or "Outreach" status needing next action
- **Opportunities DB** (`de289591-f32a-483d-a51e-6bc158f4173e`) — deals needing follow-up, proposals to send, negotiations stalled
- Flag anything that's been in the same status for 5+ days

### Step 5: Prioritize and Batch

Assign priority to each item:

| Priority | Criteria |
|----------|----------|
| **P0** | Revenue-impacting, time-sensitive (expiring proposals, hot leads going cold) |
| **P1** | Blocking others' work, overdue tasks, stale drafts |
| **P2** | Routine reviews, non-urgent approvals, FYI items |

### Step 6: Present the Queue

Format as:

```
REVIEW QUEUE — [Date] ([count] items)

P0 — URGENT
1. [Item] — [context in 1 line] — Suggested action: [action]

P1 — TODAY
2. [Item] — [context] — Suggested action: [action]
3. [Item] — [context] — Suggested action: [action]

P2 — WHEN YOU HAVE A MINUTE
4. [Item] — [context] — Suggested action: [action]

SUMMARY: [X] items need review. [Y] are urgent. Estimated time: [Z] min.
```

### Step 7: Save Full Report

Save the full report to `/Users/vahid/code/CoS/assets/review-queue/review-queue-YYYY-MM-DD.md`.

### Step 8: Present Summary

Show a 2-3 line summary:
```
[count] items need your review. [urgent count] urgent.
Top: [highest priority item in 1 line]
Full report saved — run /review-queue for details
```

(Note: Telegram delivery is paused. Present in terminal. **Never send messages on any channel without explicit approval.**)

### Guidelines

- Don't interrupt mornings. Default run is 11:30am ET.
- If `/review-queue urgent` is run and there are 0 P0 items, just say "nothing urgent" and exit.
- Always include a suggested action — don't just list items, tell Vahid what to do with each one.
- Estimated review time should be realistic (2-3 min per item).
- If the queue is empty, celebrate it: "inbox zero on reviews. nice."
- Items that appear 3+ days in a row should be escalated in priority with a note.
