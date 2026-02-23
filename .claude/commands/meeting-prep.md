# /meeting-prep — Meeting Preparation

## Description
Research participants, write context brief into Fellow private notes, and push talking points into Fellow for upcoming meetings.

## Usage
- `/meeting-prep` — prep all remaining meetings today
- `/meeting-prep "Dave Hinton"` — prep a specific meeting by name
- `/meeting-prep tomorrow` — prep all meetings for tomorrow

## Instructions

You are preparing Vahid for meetings. This is a core CoS responsibility.

### Step 0: Check Time & Calendar

Run `date` to get current time. Fetch calendar events using Google Calendar `list-events`.

Identify meetings that need prep:
- **Prep**: external calls, 1:1s with non-team, sales/discovery, partner meetings, board calls
- **Skip**: standups, daily check-ins, lunch blocks, inbox zero, deep work blocks

### Step 0b: Detect Deal Context

Before researching participants, check if this meeting is tied to an active deal:

1. Extract the company name from the meeting title or attendee domains
2. Search Notion Opportunities DB (`de289591-f32a-483d-a51e-6bc158f4173e`) for a matching active opportunity
3. If an active opportunity exists:
   - Pull opportunity details (stage, notes, linked people, next action date)
   - Search Fellow AND Granola for ALL meetings mentioning this company (not just per-person — get the full deal history)
   - Search Slack for threads about this deal (company name, key people's names)
   - Check if a proposal draft or prep doc exists as a child page of the opportunity
   - Include a **Deal Status** section in the private notes brief (Step 4):
     ```
     Deal: [Company] — Stage: [stage]
     Pricing: [if discussed] | Timeline: [if known]
     Open items: [from opportunity notes]
     Last activity: [date + what happened]
     ```
   - Talking points should reference deal-specific threads, not just generic relationship topics

### Step 1: Read the Fellow Note First

For each meeting, use the fellow-write utility to read the existing structure:

```bash
node /Users/vahid/code/CoS/scripts/fellow-write.js --read-structure <meeting-id>
```

This returns JSON with:
- Existing talking points (check if someone already added agenda items)
- Existing action items from prior meetings in the series
- Private notes content
- Whether the note is empty or has content

**If there are existing talking points**, review them and provide feedback:
- Are they specific enough?
- Do they match the strategic context?
- Should any be rephrased, reordered, or removed?
- Report your assessment to Vahid before writing

### Step 2: Research Each Participant

For each meeting that needs prep:

1. **Clay** — search for the contact. Role, company, last interaction, notes.
2. **Granola** — previous meeting history with this person.
3. **Fellow** — previous meeting notes and open action items from the series.
4. **Email** — scan Gmail for recent threads (last 30 days).
5. **LinkedIn/Web** — if Clay data is thin.

For PE contacts, also research:
- The firm's portfolio companies
- Which portcos might need product leadership
- Recent news, acquisitions, leadership changes

### Step 3: Categorize & Plan

| Meeting Type | Talking Point Style |
|-------------|-------------------|
| **Discovery/Intro** | Soft, relationship-first. Let them surface pain. NEVER show research. |
| **Follow-up** | Reference prior conversation. Advance specific threads. |
| **Internal 1:1** | Status updates, blockers, decisions needed. |
| **Sales/Pitch** | Problem → solution framing. Case study ready. |
| **Board/Advisory** | Numbers-first. Decisions and approvals. |

### Step 4: Write the Brief (Private Notes)

Write a context brief into Fellow's **Private Notes** sidebar. This is only visible to Vahid.

The brief should be scannable in 30 seconds. Include:
- **Who**: name, role, company — 1 line
- **Why**: why are we talking, what's the relationship — 1-2 lines
- **Last time**: summary of last interaction (if any) — 1 line
- **Strategic play**: what does a good outcome look like — 1-2 lines
- **Watch out**: any landmines, sensitivities, or things to avoid — 1 line (if applicable)
- **Open items**: any action items from prior meetings still pending

### Step 5: Write Talking Points

Write 3-5 talking points into Fellow's Talking Points section using `()` format.

Rules:
- **Short** — one line each, scannable
- **Discovery calls**: soft, open-ended questions only. See `/Users/vahid/.claude/projects/-Users-vahid-code/memory/patterns.md`.
- **Follow-ups**: reference specific prior threads
- **Never more than 5 points**
- **Append** to existing talking points, don't replace them
- If existing talking points are good, leave them and just add the brief

### Step 6: Push to Fellow

Use the fellow-write utility:

```bash
node /Users/vahid/code/CoS/scripts/fellow-write.js <meeting-id> --inline '{
  "talkingPoints": ["point 1", "point 2"],
  "privateNotes": "Who: ...\nWhy: ...\nLast time: ...\nStrategic play: ...\nWatch out: ..."
}'
```

The utility:
- Reads existing content first (never replaces)
- Appends new talking points after existing ones
- Writes the brief into Fellow's Private Notes sidebar (only Vahid sees it)
- Returns existing content for your review

### Step 7: Save Detailed Prep File

Save expanded prep at `/Users/vahid/code/CoS/assets/meeting-prep-<name>-<date>.md` with full research, strategic play, success criteria.

### Step 8: Report

Tell Vahid:
- Which meetings were prepped
- Any existing talking points you reviewed + your feedback
- Key context highlight for each (1 line)
- Any open action items from prior meetings with same people

## Guidelines

- **PE intro calls**: Soft discovery ONLY. Don't show research. Let them surface pain.
- **PE stages to probe**: pre-investment (diligence), post-investment (setup), pre-exit (optimization)
- **If Fellow session expired**: run `node /Users/vahid/code/CoS/scripts/fellow-login.js` first
- **Read before write** — always check what's already in the note
