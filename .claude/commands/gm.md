# /gm — Morning Briefing

## Description
Start your day with a structured briefing: today's calendar, priority tasks,
urgent messages, and upcoming deadlines. Know exactly what matters before
you open your inbox.

## Instructions

You are running the morning briefing for Vahid. Follow these steps
in order, collecting information before presenting the final briefing.

### Step 0: Get Current Time

Run `date '+%A %Y-%m-%d %H:%M %Z'` to get the current day, date, and timezone. Never guess the day of week — always verify.

### Step 1: Calendar Review

Fetch today's calendar events using `list-events` with today's date range.

For each event, note:
- Time and duration
- Title and attendees
- Whether it requires preparation
- Any conflicts or back-to-back meetings

Flag:
- Meetings that conflict with hard constraints (e.g., dinner time)
- Back-to-back meetings with no buffer
- Meetings with no clear agenda or purpose

### Step 2: Task Review (with freshness check)

Read `/Users/vahid/code/CoS/my-tasks.yaml`. Before presenting tasks, **verify each pending/overdue task is actually still open**:

1. Cross-reference against:
   - `/Users/vahid/.claude/projects/-Users-vahid-code/memory/cos-session-state.md` — work completed in recent sessions
   - CoS CLAUDE.md MCP table — integration tasks may already be done
   - Recent git logs across `/Users/vahid/code/` projects — shipped work
   - File existence checks — if the deliverable exists, the task is done
2. **Auto-fix stale tasks**: If a task is marked pending but evidence shows it's done, update `my-tasks.yaml` immediately. Don't present stale data.
3. Then identify:
   - Tasks due TODAY (urgent)
   - Tasks OVERDUE (critical — should have been done)
   - Tasks due in the next 3 days (approaching)
   - Tasks that can be completed today given the calendar

### Step 3: Goals Check

Read `/Users/vahid/code/CoS/goals.yaml` and briefly assess:
- Which goals have stalled (no progress update in 7+ days)?
- Does today's calendar align with the highest-priority goals?
- Any goal-aligned work that should be scheduled today?

### Step 4: Inbox Quick Scan (if email MCP is connected)

Do a quick scan of email for anything urgent:
- Search for emails from the last 12 hours
- Flag Tier 1 items (from key contacts, marked urgent, or time-sensitive)
- Don't do a full triage — just surface what's critical

### Step 5: Present the Briefing

Format the briefing as follows:

```
Good morning. It's [Day], [Date]. Here's your day:

CALENDAR ([count] meetings)
- [time]  [title] ([duration]) [any flags]
- ...

[If applicable: "Heads up: [conflict or concern]"]

TASKS
- DUE TODAY: [list or "Nothing due today"]
- OVERDUE: [list or "All clear"]
- APPROACHING: [list of next 3 days]

GOALS
- [Brief status on top 1-2 goals, especially if stalled]

URGENT
- [Any Tier 1 items from inbox, or "No urgent items"]

FOCUS RECOMMENDATION
Based on your calendar and priorities, here's what I'd focus on today:
1. [Top priority]
2. [Second priority]
3. [Third priority, if time allows]
```

### Guidelines

- Be concise. The whole briefing should fit on one screen.
- Lead with the most important information.
- If there are no urgent items, say so — that's good news.
- The focus recommendation should reflect goal alignment.
- If today's calendar is misaligned with goals, say so explicitly.
- End with an offer: "Want me to run a full triage or prep for any of these meetings?"

### Step 6: Meeting Prep (Auto)

After presenting the briefing, automatically run `/meeting-prep` for all meetings
that need it today. This means:
1. Read each meeting's Fellow note to check existing content
2. Research participants
3. Write context brief into Fellow Private Notes
4. Write talking points into Fellow Talking Points section
5. Report which meetings were prepped

Do this automatically — don't wait for Vahid to ask.
