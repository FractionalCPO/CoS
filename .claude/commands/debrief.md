# /debrief — Post-Meeting Action Item Extraction

## Description
After a meeting ends, extract action items, decisions, and follow-ups from the transcript. Create tasks, draft follow-up emails, and sync everything to Notion.

## Usage
- `/debrief` — debrief the most recent meeting
- `/debrief "Company Name"` — debrief a specific meeting by name
- `/debrief all` — debrief all meetings from today that haven't been debriefed

## Instructions

### Step 1: Find the Meeting

If no argument given, check calendar for the most recently ended meeting (ended within the last 2 hours).

If a name is given, search today's calendar for a matching meeting.

### Step 2: Get the Transcript

Try sources in order:
1. **Granola** — `mcp__claude_ai_Granola__get_meeting_transcript` and `mcp__claude_ai_Granola__get_meetings`
2. **Fellow** — `mcp__claude_ai_Fellow_ai__get_meeting_transcript` and `mcp__claude_ai_Fellow_ai__get_meeting_summary`

If no transcript found and running a single debrief, ask Vahid for a quick verbal summary and work from that. If running `/debrief all` and no transcript is available for a meeting, skip it and flag for manual debrief later.

### Step 3: Extract Action Items

From the transcript, identify:

**A. Tasks for Vahid:**
- Anything Vahid committed to doing
- Anything implicitly expected of Vahid
- Follow-ups mentioned ("I'll send you...", "Let me look into...")

**B. Tasks for Others:**
- What the other person committed to
- What was asked of their team
- Deadlines mentioned

**C. Key Decisions:**
- What was agreed on
- What was explicitly NOT decided (deferred)
- Any changes to scope, timeline, pricing, strategy

**D. Follow-up Communication:**
- Thank-you or recap emails needed
- Introductions promised
- Documents to share

### Step 4: Create Tasks

For each Vahid task:
1. Add to `/Users/vahid/code/CoS/my-tasks.yaml` with:
   - Title: clear, actionable
   - Due date: from meeting context, or 3 business days if unspecified
   - Goal alignment: match to `goals.yaml`
   - Description: include meeting context
   - Priority: infer from urgency signals
2. **Sync to Notion** — create all action items in the Tasks DB (`bfaf4e0f-1352-40cb-b39e-e441b75c1d96`) using `mcp__claude_ai_Notion__notion-create-pages` with:
     - **Client**: fCPO
     - **Assignee**: `622468d8-a961-4066-b9fe-65c0970a7852` (Vahid)
     - **Priority**: infer from urgency (1=Urgent, 2=High, 3=Medium, 4=Low)
     - **Due date**: from meeting context or 3 business days default
     - **Status**: `Not started` for new tasks, `WIP` if already in progress
     - **Description/body**: include meeting context and goal alignment. For pipeline/deal tasks, include a link to the relevant Opportunity page in the description.
     - Store returned `notion_id` in the YAML task entry
   - For pipeline/deal-related updates (stage changes, notes, next-action), update the Opportunity record directly in Opportunities DB (`de289591-f32a-483d-a51e-6bc158f4173e`) — but action items always go to Tasks DB.
   - Contact/company notes → Companies DB (`5fee82ee-a0e1-41f5-aaca-308e03580182`) or People DB (`11d6ce8b-a1af-455a-b9c5-d50d1aec5796`)
   - **Verify** every Notion write — fetch the page back to confirm it was created correctly

For tasks assigned to others:
- Note them in the meeting contact file (if exists in `contacts/`)
- Don't create tasks — just track for follow-up

### Step 5: Draft Follow-ups

For any follow-up emails needed:
- Draft the email in Vahid's voice
- Show draft and wait for approval (NEVER auto-send)
- Include context from the meeting

For introductions:
- Draft the intro email
- CC both parties
- Keep it short — Vahid's intro style is 2-3 sentences max

### Step 6: Update Contact Record

**SOR: Clay.earth** — update the contact in Clay first using `mcp__claude_ai_Clay_earth__updateContact` or `createContact`. Then update the local cache file if one exists in `/Users/vahid/code/CoS/contacts/`:
- Add interaction to history
- Update talking points for next meeting
- Note any personal details mentioned (hobbies, family, travel plans)

If no contact exists in Clay and the person is Tier 1 or Tier 2, create one in Clay first, then create a local cache file.

### Step 7: Sync to Notion

Push a debrief summary to Notion:
- If the contact/company exists in Companies or People DB, add notes
- If there's an active Opportunity, update the status/notes
- **Verify** — fetch back from Notion to confirm

### Step 8: Report

Present a brief summary:

```
DEBRIEF: [Meeting title] ([date])

TASKS CREATED ([count])
- [task-id] [title] — due [date] — [goal]
- ...

ASSIGNED TO OTHERS ([count])
- [person]: [what they committed to]
- ...

DECISIONS
- [decision 1]
- ...

FOLLOW-UPS
- [Draft email to X — ready for review]
- [Intro: X <> Y — draft ready]

NOTION: Synced ✓
```

### Guidelines
- Bias toward creating tasks over skipping them. Better to have too many and prune than to miss something.
- For tasks that are "send message to X", create the task AND draft the message. Don't send.
- Always check if the meeting is part of a recurring series — prior action items may carry over.
- If the transcript mentions a deadline, use it. If not, default to 3 business days.
- Keep output concise: just "[meeting name] debriefed — [N] tasks, [N] follow-ups".
