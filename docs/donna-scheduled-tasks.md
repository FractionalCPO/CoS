# Donna Scheduled Tasks — Full Reference

**Source:** `/Users/vahid/code/CoS/donna-server/src/scheduler.ts`
**Timezone:** All schedules run in `America/Toronto` (ET)
**Last updated:** 2026-02-22

---

## Overview

Donna runs 18 scheduled jobs across 10 categories. Two of them (`preMeetingRefresh` and `postMeetingDebrief`) run as a 5-minute polling interval rather than cron. All jobs use the `oneShot` agent, which means they spin up a full Claude agent call, execute the prompt, and return a result. Output is delivered via Telegram unless marked silent.

---

## Category: Inbox Pre-Process

### `inboxPreProcess`

- **Cron:** `0,30 8-21 * * 1-5`
- **Human-readable:** Every 30 minutes from 8:00 AM to 9:30 PM ET, Monday–Friday (fires at :00 and :30 of each hour in that window)
- **What it does:** Checks both Gmail accounts (`hi@vahidjozi.com` and `vahid@fractionalcpo.com`) for unread emails from the last 30 minutes. Triages each email into Tier 1 (family, active clients, Courtney), Tier 2 (team, warm leads), or Tier 3 (everything else). For Tier 1 and Tier 2, creates a Gmail draft reply in Vahid's voice following the exact writing style from CLAUDE.md. Skips Tier 3 unless time-sensitive.
- **Scope:** Gmail (both accounts — `gmail-hi` and `gmail-fcpo`)
- **Output:** Telegram message listing count of emails processed, count of drafts created, and a 1-line summary per draft. Silent (SKIP) if no new emails.
- **Safety:** Creates Gmail drafts only. **NEVER sends.** Explicitly stated in the prompt: "NEVER send — only create drafts in Gmail."
- **Dependencies:** `gmail-hi`, `gmail-fcpo`
- **Current status on Railway:** BROKEN — Gmail MCP requires token refresh each session; tokens are not available on Railway. All draft creation will fail silently or error.

---

## Category: Daily Ops

### `morningBriefing`

- **Cron:** `0 8 * * 1-5`
- **Human-readable:** Monday–Friday at 8:00 AM ET
- **What it does:** Runs the `/gm` routine — checks calendar, tasks, goals, and unread emails. Synthesizes into a morning briefing in Donna's voice. Leads with what needs attention today. Under 15 lines. No greetings.
- **Scope:** Calendar (both), Gmail (both), Notion Tasks DB
- **Output:** Telegram message, always sent (no SKIP condition)
- **Safety:** Read-only synthesis. No writes.
- **Dependencies:** `calendar-hi`, `calendar-fcpo`, `gmail-hi`, `gmail-fcpo`, `notion`
- **Current status on Railway:** PARTIALLY BROKEN — Notion is available. Calendar and Gmail are not. Will produce a degraded briefing using only Notion data, or fail entirely depending on how the agent handles missing tools.

### `middayTriage`

- **Cron:** `0 12 * * 1-5`
- **Human-readable:** Monday–Friday at 12:00 PM ET
- **What it does:** Checks unread work emails on the `fcpo` account only. Flags Tier 1 items (family, active clients, Courtney). Skips if nothing urgent.
- **Scope:** Gmail (`gmail-fcpo`)
- **Output:** Telegram message (3–5 lines) if urgent items found. Silent (SKIP) otherwise.
- **Safety:** Read-only. No writes.
- **Dependencies:** `gmail-fcpo`
- **Current status on Railway:** BROKEN — Gmail MCP not available on Railway.

### `eveningTriage`

- **Cron:** `0 17 * * 1-5`
- **Human-readable:** Monday–Friday at 5:00 PM ET
- **What it does:** Three-part end-of-day wrap-up: (1) checks unread work emails for anything that can't wait, (2) checks Notion Tasks DB for tasks completed today and produces a wins summary, (3) checks for tasks due tomorrow. Also incorporates `todaysDebriefs` — if any post-meeting debriefs ran during the day, includes a "Today's meetings" section summarizing tasks created and follow-ups. Clears the `todaysDebriefs` buffer after reporting.
- **Scope:** Gmail (`gmail-fcpo`), Notion Tasks DB, in-memory debrief buffer
- **Output:** Telegram message (5–8 lines, structured). Silent (SKIP) only if nothing across all three checks.
- **Safety:** Read-only on Gmail and Notion. Clears in-memory buffer (no external side effects).
- **Dependencies:** `gmail-fcpo`, `notion`
- **Current status on Railway:** PARTIALLY BROKEN — Notion is available. Gmail is not. Will produce partial output (Notion tasks only), or the agent may report Gmail as unavailable.

---

## Category: Task Execution

### `taskCheck`

- **Cron:** `0 8,10,14,16,18,20 * * 1-5`
- **Human-readable:** Monday–Friday at 8:00 AM, 10:00 AM, 2:00 PM, 4:00 PM, 6:00 PM, and 8:00 PM ET (6 times per day)
- **What it does:** Checks Notion for overdue tasks. Sends a brief nudge if any are overdue. Silent if nothing overdue.
- **Scope:** Notion Tasks DB
- **Output:** Telegram message (2–4 lines) if overdue tasks found. Silent (SKIP) otherwise.
- **Safety:** Read-only.
- **Dependencies:** `notion`
- **Current status on Railway:** WORKS — Notion is available on Railway.

### `reviewQueue`

- **Cron:** `30 11 * * 1-5`
- **Human-readable:** Monday–Friday at 11:30 AM ET
- **What it does:** Runs `/review-queue` — scans Notion Tasks DB for items needing review, checks for pending debrief drafts, email drafts, and pipeline decisions. Batches into P0/P1/P2 priority. Sends a brief count summary.
- **Scope:** Notion Tasks DB, Gmail drafts folder
- **Output:** Telegram message (3–4 lines with item counts). Silent (SKIP) if nothing to review.
- **Safety:** Read-only.
- **Dependencies:** `notion`, `gmail-fcpo`
- **Current status on Railway:** PARTIALLY BROKEN — Notion portion works. Gmail drafts check will fail.

### `autonomousGruntWork`

- **Cron:** `30 9 * * 1-5`
- **Human-readable:** Monday–Friday at 9:30 AM ET
- **What it does:** Safe background work only. Targets a narrow list of tasks that require no human judgment: (1) contact enrichment via Clay/Apollo, (2) CRM data cleanup — fills missing fields on Companies/People DB entries, (3) research freshness re-runs on tracked companies, (4) Notion/YAML sync repair. Explicitly will NOT draft content, make decisions, send messages, create/modify tasks, or do anything requiring priority judgment.
- **Scope:** Notion (Tasks DB + Companies DB + People DB), `my-tasks.yaml`, Clay, Apollo
- **Output:** Telegram message: background work done + tasks ready for collaborative execution. Silent (SKIP) if nothing to do.
- **Safety:** Does not mark tasks complete (only Vahid marks tasks complete). Does not draft content. Does not send messages. Explicitly constrained to data enrichment and sync repair.
- **Dependencies:** `notion`, `claude_ai_Clay_earth`, `apollo`, local filesystem (`my-tasks.yaml`)
- **Current status on Railway:** PARTIALLY WORKS — Notion and Apollo available. Clay (Anthropic connector) availability on Railway is unclear — it's an Anthropic-side connector, not a local MCP. Filesystem access to `my-tasks.yaml` depends on Railway volume mount.

### `taskSurfacing`

- **Cron:** `0 10 * * 1-5`
- **Human-readable:** Monday–Friday at 10:00 AM ET
- **What it does:** Checks Notion Tasks DB and `my-tasks.yaml` for overdue, due-today, and ready-to-work-on tasks. Checks today's calendar for time gaps. Picks 1–2 highest-priority tasks that fit into available calendar gaps and provides a 1-line execution plan for each. Invites Vahid to say "go" on Telegram to start.
- **Scope:** Notion Tasks DB, `my-tasks.yaml`, Calendar
- **Output:** Telegram message (under 5 lines). Silent (SKIP) if nothing actionable.
- **Safety:** Read-only. No task creation or modification.
- **Dependencies:** `notion`, `calendar-hi`, `calendar-fcpo`
- **Current status on Railway:** PARTIALLY BROKEN — Notion works. Calendar not available on Railway.

---

## Category: Meeting Prep

### `weeklyMeetingPrep`

- **Cron:** `15 8 * * 1`
- **Human-readable:** Monday at 8:15 AM ET
- **What it does:** Deep research pass for all meetings the full week (Mon–Fri). For each meeting: researches each participant via Clay, Granola history, Fellow notes, and recent emails; writes a strategic context brief; pushes talking points to Fellow; saves detailed prep files locally. PE contacts trigger full portfolio research.
- **Scope:** Calendar, Clay, Granola, Fellow, Gmail (recent emails), local filesystem (prep files)
- **Output:** Telegram summary listing each meeting with 1-line context and Fellow push status (under 10 lines). Always sends (no SKIP condition).
- **Safety:** Creates Fellow entries and local files. Does not send emails.
- **Dependencies:** `calendar-hi`, `calendar-fcpo`, `claude_ai_Clay_earth`, `granola`, `fellow`, `gmail-fcpo`, `gmail-hi`
- **Current status on Railway:** BROKEN — Calendar, Granola, Fellow, and Gmail are not available on Railway. Will fail to fetch any meaningful data.

### `dailyMeetingPrep`

- **Cron:** `15 8 * * 2-5`
- **Human-readable:** Tuesday–Friday at 8:15 AM ET
- **What it does:** Daily refresh pass for today's meetings only. Skips standups, daily check-ins, lunch/deep work blocks. For each meeting that needs prep: checks if Fellow already has talking points and updates them, researches new context since the weekly prep (new emails, Slack, news), refreshes Fellow talking points with new info, writes a private notes brief with today's strategic angle.
- **Scope:** Calendar, Fellow, Gmail (recent emails), Slack, Granola
- **Output:** Telegram summary listing each prepped meeting with 1-line key context (under 8 lines). Silent (SKIP) if no meetings need prep today.
- **Safety:** Updates Fellow entries. Creates brief files. Does not send emails.
- **Dependencies:** `calendar-hi`, `calendar-fcpo`, `fellow`, `gmail-fcpo`, `gmail-hi`, `claude_ai_Slack`, `granola`
- **Current status on Railway:** BROKEN — Calendar, Fellow, Gmail, and Granola are not available on Railway. Slack (Anthropic connector) availability on Railway is unclear.

---

## Category: Meeting Tasks

### `preMeetingRefresh`

- **Schedule:** Polling interval — every 5 minutes, 8:00 AM–7:00 PM ET, Monday–Friday (implemented via `setInterval`, not cron)
- **Human-readable:** Every 5 minutes during business hours weekdays
- **What it does:** Checks calendar for any meeting starting in the next 15–20 minutes. For each upcoming meeting: checks for new emails, Slack messages, or context since morning prep; checks Fellow for open action items from prior meetings with the same person. Sends a 2–3 line heads-up if new context exists. Tracks already-checked meetings in the `preppedMeetings` Set to avoid duplicate alerts. Resets that Set daily.
- **Scope:** Calendar, Gmail, Slack, Fellow
- **Output:** Telegram message (2–3 lines: "your call with X in 15 — heads up: [new context]"). Silent (SKIP) if nothing upcoming or no new context. Also emits `MEETING_ID:<identifier>` on the last line for internal tracking (stripped before sending).
- **Safety:** Read-only.
- **Dependencies:** `calendar-hi`, `calendar-fcpo`, `gmail-fcpo`, `gmail-hi`, `claude_ai_Slack`, `fellow`
- **Current status on Railway:** BROKEN — Calendar, Gmail, and Fellow are not available on Railway. Will always SKIP or fail.

### `postMeetingDebrief`

- **Schedule:** Polling interval — every 5 minutes, 8:00 AM–7:00 PM ET, Monday–Friday (same `setInterval` as `preMeetingRefresh`)
- **Human-readable:** Every 5 minutes during business hours weekdays (runs in the same polling loop as pre-meeting refresh)
- **What it does:** Checks calendar for any meeting that ended 15–30 minutes ago. For each recently ended meeting: finds transcript in Granola first, then Fellow; extracts action items (tasks for Vahid, tasks for others, key decisions, follow-ups needed); creates tasks in Notion Tasks DB; updates `my-tasks.yaml`; creates Gmail draft follow-up emails (NEVER sends); updates contact file if one exists. Tracks already-debriefed meetings in the `debriefedMeetings` Set. Results are stored in `todaysDebriefs` array for batching into the evening triage — NOT sent to Telegram immediately.
- **Scope:** Calendar, Granola, Fellow, Notion Tasks DB, `my-tasks.yaml`, Gmail (drafts), contact files
- **Output:** Silent — no Telegram message. Returns `DEBRIEF_SUMMARY: [meeting title] — [N] tasks created, [N] follow-ups drafted` internally, which gets stored in `todaysDebriefs` buffer and surfaced at 5 PM via `eveningTriage`. Also emits `MEETING_ID:<identifier>` for internal deduplication tracking.
- **Safety:** Creates Notion tasks and Gmail drafts. Does NOT send emails. Does NOT mark tasks complete.
- **Dependencies:** `calendar-hi`, `calendar-fcpo`, `granola`, `fellow`, `notion`, `gmail-fcpo`, `gmail-hi`, local filesystem (`my-tasks.yaml`, contact files)
- **Current status on Railway:** BROKEN — Calendar, Granola, Fellow, and Gmail are not available. Notion is available but the job depends on calendar data to trigger.

---

## Category: Performance Review

### `weeklyRetro`

- **Cron:** `0 16 * * 5`
- **Human-readable:** Friday at 4:00 PM ET
- **What it does:** Runs `/retro` — reviews the past 7 days across: goal progress, task completion, time alignment, relationship health, pipeline movement, system health. Produces scores and a top recommendation. Saves the full report.
- **Scope:** Notion Tasks DB, Calendar, Fellow, Granola, Gmail
- **Output:** Telegram summary (5–6 lines with scores and top recommendation). Always sends (no SKIP condition).
- **Safety:** Writes a local report file. Read-only on all data sources.
- **Dependencies:** `notion`, `calendar-hi`, `calendar-fcpo`, `fellow`, `granola`, `gmail-fcpo`
- **Current status on Railway:** PARTIALLY BROKEN — Notion works. Calendar, Fellow, and Granola are not available. Will produce a degraded retro based only on Notion data.

---

## Category: Self-Improvement

### `theMirror`

- **Cron:** `0 12 * * 0`
- **Human-readable:** Sunday at 12:00 PM ET
- **What it does:** Analyzes meeting transcripts from the past 7 days against Vahid's growth traits. Finds specific moments of strength and growth edges. Produces a focus recommendation for the coming week.
- **Scope:** Granola (meeting transcripts), Fellow (meeting notes)
- **Output:** Telegram message (3–4 lines: top strength, top growth edge, one focus for the week). Always sends (no SKIP condition).
- **Safety:** Read-only.
- **Dependencies:** `granola`, `fellow`
- **Current status on Railway:** BROKEN — Granola and Fellow are not available on Railway. Will produce an empty or fabricated analysis.

### `systemSelfImprovement`

- **Cron:** `0 21 * * 1-5`
- **Human-readable:** Monday–Friday at 9:00 PM ET
- **What it does:** Donna audits herself and fixes everything she can. Seven-part audit: (1) check Railway logs for failed jobs and fix root causes, (2) review scheduler prompts for quality issues and rewrite bad ones, (3) check `/commands` for outdated paths or DB IDs and fix them, (4) run validation tests and fix all failures, (5) review CLAUDE.md responsibilities for automation gaps and propose new jobs, (6) write new skills or improvements directly to `CoS/.claude/commands/`, (7) read `source-of-record.md` and fix any SOR violations. Fixes everything found without limiting to 1–2 items. Items with uncertain impact are proposed rather than executed.
- **Scope:** Railway logs, `scheduler.ts`, `.claude/commands/`, test suite, `CLAUDE.md`, `source-of-record.md`, local filesystem
- **Output:** Telegram message (5–10 lines: what was fixed, what was improved, what is proposed). Silent (SKIP) if genuinely nothing to improve.
- **Safety:** Writes to `.claude/commands/` and may rewrite prompts in `scheduler.ts`. Items requiring Vahid's judgment are surfaced as proposals, not executed. This is the highest-autonomy job in the scheduler.
- **Dependencies:** Local filesystem access, Railway log access
- **Current status on Railway:** PARTIALLY WORKS — Can read/write local files and logs on Railway. The actual fixes it can apply depend on which MCP servers are available to test.

---

## Category: Relationships

### `relationshipCheck`

- **Cron:** `0 9 * * 1`
- **Human-readable:** Monday at 9:00 AM ET
- **What it does:** Weekly relationship check. Nudges about Tier 1 contacts: Elmira, Courtney, Mauricio, Papash. Flags any contact with no recent contact in over 14 days.
- **Scope:** Clay (contact last-contact dates), Calendar (recent meetings), Gmail (recent threads)
- **Output:** Telegram message (3–4 lines). Always sends (no SKIP condition).
- **Safety:** Read-only.
- **Dependencies:** `claude_ai_Clay_earth`, `calendar-hi`, `calendar-fcpo`, `gmail-hi`
- **Current status on Railway:** PARTIALLY BROKEN — Clay (Anthropic connector) availability on Railway is unclear. Calendar and Gmail not available. Job will likely fail to pull meaningful last-contact data.

---

## Category: Research & Pipeline

### `researchFreshness`

- **Cron:** `0 20 * * 0`
- **Human-readable:** Sunday at 8:00 PM ET
- **What it does:** Scans company research data for staleness (research older than 30 days). Flags companies with incomplete research buckets. Reports count of stale companies and top priority refresh.
- **Scope:** Local company research files (`/Users/vahid/code/company-research/`), Notion (Companies DB)
- **Output:** Telegram message (2–3 lines). Silent (SKIP) if all research is fresh.
- **Safety:** Read-only.
- **Dependencies:** Local filesystem, `notion`
- **Current status on Railway:** PARTIALLY WORKS — Notion available. Local filesystem access on Railway depends on volume mount configuration. The `company-research` directory must be accessible from the Railway container.

### `pipelineTriggerScan`

- **Cron:** `30 10 * * 1`
- **Human-readable:** Monday at 10:30 AM ET
- **What it does:** Runs `/research:trigger-scan` — scans all tracked companies for trigger signals (leadership changes, funding, layoffs, product launches, PE activity). Scores each for outreach timing. Reports top 3 by trigger score.
- **Scope:** Notion (Companies DB / Prospecting DB), Firecrawl (web signals), Apollo (enrichment), DataForSEO
- **Output:** Telegram message (3–5 lines: top 3 companies with signal type). Silent (SKIP) if no new triggers.
- **Safety:** Read-only scanning. Does not modify pipeline status or initiate outreach.
- **Dependencies:** `notion`, `firecrawl`, `apollo`, `dfs-mcp`
- **Current status on Railway:** WORKS — Notion, Firecrawl, and Apollo are all available on Railway.

---

## Category: System Health

### `dailyQA`

- **Cron:** `0 22 * * 1-5`
- **Human-readable:** Monday–Friday at 10:00 PM ET
- **What it does:** Five-part system health check: (1) Notion/YAML sync — compares Tasks DB against `my-tasks.yaml`, fixes drift by creating missing Notion entries or updating YAML with `notion_id`s, (2) Notion CRM health — flags top 3 Companies/People entries with missing key fields, (3) Fellow — counts open action items older than 7 days, (4) stale Gmail drafts — flags unsent follow-up drafts older than 2 days, (5) MCP server health — runs a simple query on each server (Notion, Gmail, Calendar, Fellow, Granola) to confirm responsiveness.
- **Scope:** Notion (Tasks DB, Companies DB, People DB), `my-tasks.yaml`, Fellow, Gmail (drafts folder), Calendar
- **Output:** Telegram message (5–8 lines): sync status, stale item counts, system status with any down MCP servers listed. Silent (SKIP) if everything is perfectly healthy.
- **Safety:** Writes to Notion and `my-tasks.yaml` for sync repair. Read-only on all other sources.
- **Dependencies:** `notion`, `gmail-fcpo`, `gmail-hi`, `calendar-hi`, `calendar-fcpo`, `fellow`, `granola`
- **Current status on Railway:** PARTIALLY WORKS — Notion available and sync repair will work. Gmail, Calendar, Fellow, and Granola health checks will fail/time out. The MCP status section will explicitly report these as down.

---

## Summary Table

| Job | Category | Schedule | Railway Status | Broken Because |
|-----|----------|----------|----------------|----------------|
| `inboxPreProcess` | Inbox Pre-Process | Every 30 min, 8am–9:30pm, Mon–Fri | BROKEN | Gmail not on Railway |
| `morningBriefing` | Daily Ops | Mon–Fri 8:00 AM | PARTIAL | Calendar + Gmail missing; Notion works |
| `middayTriage` | Daily Ops | Mon–Fri 12:00 PM | BROKEN | Gmail not on Railway |
| `eveningTriage` | Daily Ops | Mon–Fri 5:00 PM | PARTIAL | Gmail missing; Notion tasks portion works |
| `taskCheck` | Task Execution | Mon–Fri 6x/day (8am–8pm) | WORKS | Notion only — available |
| `reviewQueue` | Task Execution | Mon–Fri 11:30 AM | PARTIAL | Notion works; Gmail drafts check fails |
| `autonomousGruntWork` | Task Execution | Mon–Fri 9:30 AM | PARTIAL | Notion + Apollo work; Clay unclear; filesystem depends on volume |
| `taskSurfacing` | Task Execution | Mon–Fri 10:00 AM | PARTIAL | Notion works; Calendar missing |
| `weeklyMeetingPrep` | Meeting Prep | Monday 8:15 AM | BROKEN | Calendar, Granola, Fellow, Gmail all missing |
| `dailyMeetingPrep` | Meeting Prep | Tue–Fri 8:15 AM | BROKEN | Calendar, Fellow, Gmail, Granola all missing |
| `preMeetingRefresh` | Meeting Tasks | Every 5 min, 8am–7pm, Mon–Fri | BROKEN | Calendar, Gmail, Fellow all missing |
| `postMeetingDebrief` | Meeting Tasks | Every 5 min, 8am–7pm, Mon–Fri | BROKEN | Calendar, Granola, Fellow, Gmail all missing |
| `weeklyRetro` | Performance Review | Friday 4:00 PM | PARTIAL | Notion works; Calendar, Fellow, Granola missing |
| `theMirror` | Self-Improvement | Sunday 12:00 PM | BROKEN | Granola + Fellow both missing |
| `systemSelfImprovement` | Self-Improvement | Mon–Fri 9:00 PM | PARTIAL | File writes work; MCP testing limited to available servers |
| `relationshipCheck` | Relationships | Monday 9:00 AM | PARTIAL/BROKEN | Clay unclear on Railway; Calendar + Gmail missing |
| `researchFreshness` | Research & Pipeline | Sunday 8:00 PM | PARTIAL | Notion works; local filesystem depends on volume mount |
| `pipelineTriggerScan` | Research & Pipeline | Monday 10:30 AM | WORKS | Notion + Firecrawl + Apollo all available |
| `dailyQA` | System Health | Mon–Fri 10:00 PM | PARTIAL | Notion sync repair works; Gmail, Calendar, Fellow, Granola health checks will fail |

### Jobs that fully work on Railway (2)
- `taskCheck` — Notion only
- `pipelineTriggerScan` — Notion + Firecrawl + Apollo

### Jobs that partially work on Railway (8)
- `morningBriefing` — Notion tasks, no calendar or email context
- `eveningTriage` — Notion tasks + debrief buffer, no email
- `reviewQueue` — Notion scan, no Gmail drafts check
- `autonomousGruntWork` — Notion + Apollo enrichment, Clay uncertain
- `taskSurfacing` — Notion tasks, no calendar gap analysis
- `weeklyRetro` — Notion tasks only, no meeting data
- `systemSelfImprovement` — File fixes work, MCP testing limited
- `researchFreshness` — Notion works, local files need volume mount
- `dailyQA` — Notion sync repair works, all non-Notion health checks fail

### Jobs that are fully broken on Railway (9)
- `inboxPreProcess` — requires Gmail
- `middayTriage` — requires Gmail
- `weeklyMeetingPrep` — requires Calendar, Granola, Fellow, Gmail
- `dailyMeetingPrep` — requires Calendar, Fellow, Gmail, Granola
- `preMeetingRefresh` — requires Calendar, Gmail, Fellow
- `postMeetingDebrief` — requires Calendar, Granola, Fellow, Gmail
- `theMirror` — requires Granola, Fellow
- `relationshipCheck` — requires Clay/Calendar/Gmail, all unavailable

---

## Notes on MCP Availability

**Available on Railway:** Notion, Firecrawl, Apollo, DataForSEO

**Not available on Railway (require local token refresh or local process):**
- Gmail (`gmail-hi`, `gmail-fcpo`) — OAuth tokens require per-session refresh via `gmail_refresh_token` tool
- Calendar (`calendar-hi`, `calendar-fcpo`) — same OAuth constraint
- Fellow — local MCP server
- Granola — local MCP server

**Unclear on Railway:**
- Clay (`claude_ai_Clay_earth`) — Anthropic-side connector; may work if the connector is globally available, but not confirmed
- Slack (`claude_ai_Slack`) — same question as Clay; Anthropic connector

**The core gap** is that the most valuable jobs (meeting prep, inbox processing, debrief) depend on Gmail + Calendar + Fellow/Granola — none of which are available on Railway. Until those MCPs are bridged (e.g., via OAuth token injection at deploy time or a separate proxy service), those jobs will fail silently or error on every run.
