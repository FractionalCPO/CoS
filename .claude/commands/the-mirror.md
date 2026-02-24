# /the-mirror — Personal Growth Feedback

## Description
Extracts honest, actionable feedback from meeting transcripts and interactions. Holds a mirror up to Vahid's communication, leadership, and decision-making patterns — checked against the principles and traits he's actively working on.

Named after the idea that the best coaches don't tell you what to do — they show you what you're already doing.

## Usage
- `/the-mirror` — run the periodic growth review (last 7 days of meetings)
- `/the-mirror "meeting name"` — extract feedback from a specific meeting
- `/the-mirror traits` — review and update the growth traits file

## Growth Traits File
Location: `/Users/vahid/code/CoS/growth-traits.yaml`

This file defines the principles and traits Vahid is actively working on. The Mirror checks every meeting transcript against these traits and surfaces specific moments — both strengths and areas for growth.

## Instructions

### Step 1: Load Growth Traits

Read `/Users/vahid/code/CoS/growth-traits.yaml` for the active traits being tracked.

If the file doesn't exist, create it with defaults inferred from CLAUDE.md:
- Decision speed (avoid shame-delay pattern)
- Direct communication (say the hard thing)
- Scope discipline (don't expand without stating it)
- Closing loops (finish before starting new)
- Strategic patience (don't rush to fill silence)
- Active listening (ask before solving)
- Energy management (recognize fatigue patterns)

### Step 2: Gather Meeting Transcripts

For the review period:
1. **Granola** — fetch all meetings via `mcp__claude_ai_Granola__list_meetings` and `get_meeting_transcript`
2. **Fellow** — fetch via `mcp__claude_ai_Fellow_ai__search_meetings` and `get_meeting_transcript`

For a specific meeting, find just that one.

### Step 3: Analyze Each Meeting

For each transcript, evaluate against each active growth trait:

**Look for:**
- Moments where Vahid demonstrated the trait well (reinforcement)
- Moments where the trait was missed or could improve (growth edge)
- Patterns across meetings (recurring strength or recurring gap)

**Be specific.** Don't say "could communicate more directly." Say: "In the Courtney call at 14:32, when discussing Ryan's transition, you circled the topic for 3 minutes before stating the decision. The direct version: 'Ryan's last day is March 14. Here's the coverage plan.'"

**Extract call-level feedback:**
For each meeting, note:
- 1-2 things done well (with specific quotes/moments)
- 1-2 growth edges (with specific quotes/moments and a suggested alternative)

### Step 4: Aggregate Patterns

Across all meetings in the review period:
- Which traits are consistently strong?
- Which traits keep showing up as growth edges?
- Any new patterns emerging that aren't in the traits file?
- Progress compared to previous Mirror reviews (if stored)

### Step 5: Present the Mirror

```
THE MIRROR — [date range]
[N] meetings reviewed

STRENGTHS (consistently showing up)
[+] [Trait]: [Pattern observed across meetings]
   Example: "[Specific moment from a specific meeting]"

GROWTH EDGES (recurring opportunities)
[~] [Trait]: [Pattern observed]
   Example: "[Specific moment]"
   Try instead: "[Concrete alternative behavior]"

CALL-BY-CALL
[Meeting 1 — date]
  + [Strength moment]
  → [Growth edge + suggestion]

[Meeting 2 — date]
  + [Strength moment]
  → [Growth edge + suggestion]

TREND
[If previous Mirror data exists: are growth edges improving?]

ONE THING TO FOCUS ON THIS WEEK
[Single most impactful trait to practice, with a specific situation coming up where it applies]
```

### Step 6: Save & Sync

1. Save the full Mirror report to `/Users/vahid/code/CoS/assets/mirror/mirror-YYYY-MM-DD.md`
2. Update `growth-traits.yaml` with any new observations or progress notes
3. Present a brief summary to Vahid:
   ```
   [mirror] The Mirror — [N] calls reviewed
   Strengths: [trait], [trait]
   Work on: [trait]
   Focus this week: [one thing]
   Full report: saved locally
   ```
   (Note: Telegram delivery is paused. Present in terminal.)

### Guidelines
- **Honest but constructive.** This isn't therapy — it's coaching. Be direct.
- **Always quote specific moments.** Vague feedback is useless.
- **Balance positive and growth.** Minimum 1 strength per meeting reviewed.
- **Don't repeat yourself.** If the same edge showed up in the last Mirror, note progress (or lack thereof).
- **Connect to stakes.** "This matters because [specific business impact]."
- **Never share this externally.** This is private self-development data.
- **Never send messages on any channel without explicit approval** — show the summary draft first. (Telegram delivery is paused.)
- **Frequency:** Weekly by default (Friday, after retro). Can be triggered per-meeting for immediate feedback.
- **ADHD/OCD context:** Frame growth edges as systems to build, not willpower to exert. "Add a 10-second pause before responding" > "Be more patient."
