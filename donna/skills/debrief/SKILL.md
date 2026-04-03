---
name: debrief
description: Post-meeting action item extraction from Fellow transcripts. Creates tasks, drafts follow-ups, syncs to Notion.
metadata: { "openclaw": { "emoji": "📝" } }
---

# Meeting Debrief

After a meeting ends, extract action items, decisions, and follow-ups. Create tasks and draft communications.

## When to Use

- Evening debrief routine (reconcile phase)
- On-demand when Vahid says "debrief [meeting]"
- After any important external meeting

## Process

### Step 1: Find the Meeting

Check calendar for recently ended meetings. If Vahid specifies a name, search for it.

```bash
gog calendar events primary --from <today>T00:00:00Z --to <now> --account vahid@fractionalcpo.com
```

### Step 2: Get Fellow's Action Items FIRST

Check what Fellow already extracted — don't duplicate effort:

```bash
curl -s -X POST -H "X-API-KEY: $FELLOW_API_KEY" -H "Content-Type: application/json" \
  -d '{"limit": 5}' \
  "https://fractionalcpo.fellow.app/api/v1/recordings"
```

Parse the JSON response to find the matching recording, then get full details including action items and summary.

### Step 3: Pull the Transcript

Get the full transcript to catch what Fellow missed:

```bash
curl -s -H "X-API-KEY: $FELLOW_API_KEY" -H "Content-Type: application/json" \
  "https://fractionalcpo.fellow.app/api/v1/recording/{recording_id}"
```

Read through looking for:
- Commitments Vahid made ("I'll send you...", "Let me look into...")
- Commitments others made
- Decisions (agreed, deferred, changed)
- Follow-up communication needed (recap emails, intros)
- Deadlines mentioned

### Step 4: Create Tasks

**For Vahid's tasks:**

1. Add to `/Users/claw/.openclaw/workspace/vault/⚙️ ops/✅ tasks.md`:
   - Task ID: unique `task-XXX` (check existing IDs first)
   - Title, due date (from meeting or 3 business days default)
   - Goal alignment (check goals.yaml)
   - Priority: infer from urgency

2. Sync to Notion Tasks DB (`bfaf4e0f-1352-40cb-b39e-e441b75c1d96`):
   - Client: fCPO
   - Assignee: `622468d8-a961-4066-b9fe-65c0970a7852` (Vahid)
   - Verify after writing

**For others' tasks:** Note them for follow-up tracking, don't create tasks.

### Step 5: Draft Follow-ups

For any follow-up emails needed:
- Draft in Vahid's voice. Read soul.md for tone and global CLAUDE.md for register/style examples
- Show draft on Telegram — NEVER send
- For intros: 2-3 sentences max

### Step 6: Update CRM

If the meeting involved a prospect or deal:
- Update Notion Opportunities DB with notes, stage changes (recommend changes, wait for approval)
- Update Companies/People DBs with interaction notes
- Verify all writes

### Step 7: Report

Message Vahid on Telegram:

```
debrief: [meeting title]

[N] tasks created: [brief list]
[N] assigned to others: [who owes what]
decisions: [key decisions]
follow-ups: [draft emails ready for review]
```

## Notes

- Bias toward creating tasks — better to have too many and prune
- If no transcript available, ask Vahid for a verbal summary
- Check if the meeting is recurring — prior action items may carry over
- Always use absolute paths (vault: `/Users/claw/.openclaw/workspace/vault/`)
- For Fellow writes (talking points, private notes), use: `node /Users/claw/code/CoS/scripts/fellow-write.js`
- Parse JSON with `jq` or `python3 -c`
