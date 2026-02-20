# /retro — Weekly Performance Review

## Description
Review the CoS system's performance over the past week. Score goal progress, task completion rate, relationship health, and time alignment. Surface what's working, what's slipping, and what to change.

## Usage
- `/retro` — run the weekly retro (default: last 7 days)
- `/retro month` — run a monthly retro

## Instructions

### Step 1: Gather Data

Read all of these:
1. **Tasks** — `/Users/vahid/code/CoS/my-tasks.yaml`: completion rate, late tasks, early completions, tasks added vs completed
2. **Goals** — `/Users/vahid/code/CoS/goals.yaml`: progress delta since last update, any goals stalled
3. **Calendar** — list events for the review period: count meetings, categorize by goal alignment
4. **Session state** — `cos-session-state.md`: what Claude worked on
5. **Contacts** — check for stale relationships by tier
6. **Notion** — check Prospecting pipeline and Opportunities DB (`de289591-f32a-483d-a51e-6bc158f4173e`): any movement? Any leads gone cold?

### Step 2: Score Each Area

Rate 1-5 for each:

| Area | What It Measures |
|------|-----------------|
| **Goal Progress** | Are OKRs advancing at the pace needed to hit targets? |
| **Task Velocity** | Completion rate, overdue %, tasks executed vs just tracked |
| **Time Alignment** | % of calendar spent on goal-aligned activities |
| **Relationship Health** | Contact cadence by tier, stale relationships |
| **Pipeline Movement** | Leads progressing, opportunities advancing, deals closing |
| **System Health** | Is the CoS system itself improving? Skills added, bugs fixed, coverage expanding? |

### Step 3: Identify Patterns

- What got done that moved the needle?
- What didn't get done that should have?
- Where did time go that wasn't goal-aligned?
- Which relationships need attention?
- What did Claude do well? What did Claude miss?

### Step 4: Present the Retro

```
WEEKLY RETRO — [date range]

SCORECARD
Goal Progress:      [X/5] [brief note]
Task Velocity:      [X/5] [completed/total, late count]
Time Alignment:     [X/5] [% goal-aligned meetings]
Relationship Health: [X/5] [stale contacts]
Pipeline Movement:  [X/5] [leads advanced/stalled]
System Health:      [X/5] [improvements made]

Overall: [X/5]

WINS
- [What went well this week]

MISSES
- [What slipped, with specific task/goal references]

PATTERNS
- [Recurring issues or positive trends]

RECOMMENDATIONS
1. [Specific action for next week]
2. [System improvement to make]
3. [Priority shift if needed]

ITEMS FOR VAHID TO REVIEW
- [Specific items that need his attention/decision]
```

### Step 5: Update Goals

If progress has changed, update `/Users/vahid/code/CoS/goals.yaml` with new progress values and notes.

### Step 6: Sync to Notion

Push the retro summary to Notion Tasks DB (`bfaf4e0f-1352-40cb-b39e-e441b75c1d96`) using `mcp__claude_ai_Notion__notion-create-pages`:

1. **Create a retro page** with:
   - **Name**: `Weekly Retro — [date range]` (or `Monthly Retro — [month]`)
   - **Client**: fCPO
   - **Assignee**: `622468d8-a961-4066-b9fe-65c0970a7852` (Vahid)
   - **Status**: `Done`
   - **Due date**: retro date
   - **Priority**: Low (4)
   - **Body content**: full retro output (scorecard, wins, misses, patterns, recommendations)
2. **Check for existing retro page** — search Notion for a page with matching title to avoid duplicates. If found, update it using `mcp__claude_ai_Notion__notion-update-page` instead of creating a new one.
3. **Create tasks from recommendations** — for each actionable recommendation from Step 4, create a task in both YAML and Notion Tasks DB with the same property mapping:
   - **Client**: fCPO
   - **Assignee**: `622468d8-a961-4066-b9fe-65c0970a7852` (Vahid)
   - **Priority**: infer from recommendation urgency
   - **Due date**: next retro date (7 days) unless more urgent
   - **Status**: `Not started`
   - Store `notion_id` in YAML
4. **Verify** — fetch the created/updated pages back to confirm they were written correctly.

### Step 7: Queue Review Items

If there are items Vahid needs to personally review (drafts, strategy decisions, approvals), compile them into a "Review Queue" and present them. Schedule a 30-minute review block on his calendar if one doesn't exist this week.

### Guidelines
- Be honest. If goals are at risk, say so clearly.
- Don't pad scores. A 2/5 is fine — it's a signal, not a judgment.
- Recommendations should be specific and actionable, not generic.
- Monthly retros should include trend lines (are scores improving over time?).
- This runs as a cron job on Fridays at 4pm → pushed to Telegram as a summary with full report saved locally.
