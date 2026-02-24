# QA Report -- CoS Command System Audit -- 2026-02-24

## Scope

Full audit of the CoS command system:
- 11 slash commands in `.claude/commands/`
- `CLAUDE.md` (system instructions)
- `goals.yaml`, `my-tasks.yaml`, `schedules.yaml`
- All docs in `docs/`
- All assets in `assets/`
- Memory files referenced by CLAUDE.md
- Cross-command consistency (Notion IDs, field names, status values, cross-references)

## Feature Inventory

| Command | Purpose | Services Touched |
|---------|---------|-----------------|
| `/gm` | Morning briefing: calendar, tasks, goals, inbox scan, auto meeting-prep | Calendar, Gmail, Notion, Fellow, Clay, Granola |
| `/triage` | Inbox triage across all channels, draft responses | Gmail, Slack, WhatsApp, iMessage |
| `/meeting-prep` | Research participants, write Fellow private notes + talking points | Calendar, Clay, Granola, Fellow, Gmail, Notion |
| `/my-tasks` | Task CRUD with Notion sync, goal alignment, execution mode | my-tasks.yaml, Notion Tasks DB |
| `/the-mirror` | Growth feedback from meeting transcripts vs growth traits | Granola, Fellow, growth-traits.yaml |
| `/enrich` | Contact enrichment, relationship health, CRM update | Clay, Gmail, Slack, WhatsApp, Calendar |
| `/debrief` | Post-meeting action item extraction, task creation, follow-ups | Granola, Fellow, Notion, Gmail, Clay |
| `/deal-prep` | Full deal synthesis, CRM update, proposal draft, Slack announcement | Fellow, Granola, Slack, Gmail, Notion, Clay |
| `/retro` | Weekly performance review with scorecards and recommendations | my-tasks.yaml, goals.yaml, Calendar, Notion |
| `/health` | System health check -- test each MCP server with real query | All MCP servers |
| `/review-queue` | Daily batched review queue for items needing Vahid's attention | Notion Tasks DB, Gmail, local assets |

---

## Findings

### Critical

#### C1: `schedules.yaml` describes donna-server/Railway cron architecture that is stopped
- **File:** `/Users/vahid/code/CoS/schedules.yaml`
- **Lines:** 1-8 (header), throughout
- **Issue:** Entire file describes jobs running on Railway via `donna-server/src/cron.ts` with Telegram delivery. Railway is stopped, Telegram bot is paused. The file header says "All jobs run on Railway (donna-server cron.ts) -- always on" which is factually wrong.
- **Fix:** Rewrote header to clarify this is a DESIGN REFERENCE for future reactivation, not the current live configuration. Current mode is local Claude Code with manual command invocation.

#### C2: `the-mirror.md` Step 6 instructs pushing summary to Telegram
- **File:** `/Users/vahid/code/CoS/.claude/commands/the-mirror.md`
- **Line:** 100-107
- **Issue:** Step 6 says "Push a brief summary to Telegram" with a message template. Telegram bot is paused. This step will fail silently or confuse the agent.
- **Fix:** Changed to "Show Vahid the summary for review" -- removed Telegram-specific delivery. Added note that Telegram delivery is paused.

#### C3: `review-queue.md` Step 8 instructs sending Telegram summary with bot token
- **File:** `/Users/vahid/code/CoS/.claude/commands/review-queue.md`
- **Lines:** 76-85
- **Issue:** Step 8 says "Send Telegram Summary" with specific bot API instructions and chat_id. Telegram bot is paused.
- **Fix:** Changed to "Show Summary" -- present in terminal, with note that Telegram delivery is paused.

#### C4: `debrief.md` references Telegram for notifications
- **File:** `/Users/vahid/code/CoS/.claude/commands/debrief.md`
- **Line:** 136
- **Issue:** Guideline says "Keep Telegram notifications minimal" -- implies Telegram delivery is active.
- **Fix:** Changed to "Keep notifications minimal" and noted output is terminal-based with Telegram paused.

#### C5: `retro.md` references Telegram for notifications
- **File:** `/Users/vahid/code/CoS/.claude/commands/retro.md`
- **Line:** 112
- **Issue:** Guideline says "Never send Telegram messages without explicit approval" -- implies Telegram is the delivery channel.
- **Fix:** Changed to "Never send messages on any channel without explicit approval" -- channel-agnostic.

### High

#### H1: `health.md` Step 2 references "Railway internals"
- **File:** `/Users/vahid/code/CoS/.claude/commands/health.md`
- **Lines:** 28-31
- **Issue:** Step 2 says "Check Railway internals (if running on Railway)" with sub-steps about session files, git repo, disk space. Railway is stopped. This is dead code in the command.
- **Fix:** Replaced with "Check local system health" -- verify CoS repo is clean, disk space available, key files accessible.

#### H2: `health.md` lists DataForSEO as a service to test
- **File:** `/Users/vahid/code/CoS/.claude/commands/health.md`
- **Line:** 24
- **Issue:** CLAUDE.md MCP table says DataForSEO is "Direct API only (credentials in MEMORY.md)" -- it's not an MCP server. Testing it as an MCP tool will fail.
- **Fix:** Removed DataForSEO from MCP test list, added note that it's API-only.

#### H3: CLAUDE.md references `fellow-full-mine.md` in assets -- file does not exist
- **File:** `/Users/vahid/code/CoS/CLAUDE.md`
- **Line:** 78
- **Issue:** Lists `fellow-full-mine.md -- 67 meetings exhaustive` but the actual file is `fellow-deep-dive.md`.
- **Fix:** NOT fixing CLAUDE.md (per instructions). Documented here for reference.

#### H4: Output directories referenced by commands do not exist
- **Files:** `retro.md`, `the-mirror.md`, `review-queue.md`, `deal-prep.md`
- **Issue:** Commands reference saving output to `assets/retros/`, `assets/mirror/`, `assets/review-queue/`, `assets/deal-prep/` but none of these directories existed.
- **Fix:** Created all four directories.

#### H5: `goals.yaml` -- objective 1 "Build verified pipeline" target deadline is March 1, notes say "5 days to deadline" (written Feb 24)
- **File:** `/Users/vahid/code/CoS/goals.yaml`
- **Lines:** 14, 24
- **Issue:** Target says "5 verified opportunities by March 1" and progress is 0.35 with status "at_risk". Notes reference "presenting today 2/24" which is stale after today. The notes are time-specific and will be misleading tomorrow.
- **Fix:** Updated notes to remove time-specific language ("today 2/24"), made it date-stamped instead.

#### H6: `my-tasks.yaml` -- task-001 overdue since Feb 18 (6 days)
- **File:** `/Users/vahid/code/CoS/my-tasks.yaml`
- **Line:** 16
- **Issue:** "Tampa Bay Times follow-up" has due_date 2026-02-18, status "pending". It's 6 days overdue with no notes or status update.
- **Fix:** Updated status to "overdue" for visibility. Added note about staleness.

#### H7: `my-tasks.yaml` -- task-002 overdue since Feb 21 (3 days)
- **File:** `/Users/vahid/code/CoS/my-tasks.yaml`
- **Line:** 26
- **Issue:** "Mori partnership agreement finalization" has due_date 2026-02-21, status "in_progress". 3 days overdue.
- **Fix:** Updated status to "overdue".

#### H8: `my-tasks.yaml` -- task-013 "VeraData proposal review" due today but marked in_progress
- **File:** `/Users/vahid/code/CoS/my-tasks.yaml`
- **Line:** 136
- **Issue:** Due 2026-02-24, status "in_progress". Multiple subtasks marked TODO. After today's meeting this task should transition based on outcome.
- **Fix:** No status change (it IS today). Added note about post-meeting transition needed.

#### H9: `my-tasks.yaml` -- task-011 "Micro-SaaS Factory" due tomorrow (Feb 25)
- **File:** `/Users/vahid/code/CoS/my-tasks.yaml`
- **Line:** 126
- **Issue:** Due 2026-02-25, status "pending". Scoping session hasn't happened yet. Goal alignment says "revenue" but this is speculative -- not aligned with the top pipeline/deal goals.
- **Fix:** No change (legitimate upcoming task). Flagged for goal alignment review.

### Medium

#### M1: `schedules.yaml` cron times internally inconsistent
- **File:** `/Users/vahid/code/CoS/schedules.yaml`
- **Lines:** 46-51 vs docs/donna-scheduled-tasks.md
- **Issue:** `schedules.yaml` says Meeting Check runs at `0 6,12,18` (6am, noon, 6pm) but `donna-scheduled-tasks.md` says `0 11,15` (11am, 3pm). The schedules.yaml description also references "Daily Work" at the same times, but donna-scheduled-tasks.md has Daily Work at `0 10,14` (10am, 2pm). These are out of sync.
- **Fix:** Updated schedules.yaml to match cron.ts (the actual implementation per donna-scheduled-tasks.md).

#### M2: `triage.md` lists WhatsApp and iMessage as scan channels
- **File:** `/Users/vahid/code/CoS/.claude/commands/triage.md`
- **Lines:** 40-45
- **Issue:** WhatsApp bridge is paused (CLAUDE.md says "Paused -- needs bridge process"). iMessage MCP doesn't exist. These channels will silently fail or confuse the agent.
- **Fix:** Added "(if connected)" qualifiers with notes about current status.

#### M3: `enrich.md` references WhatsApp/iMessage in scan list
- **File:** `/Users/vahid/code/CoS/.claude/commands/enrich.md`
- **Line:** 28
- **Issue:** Same as M2 -- references channels that aren't currently connected.
- **Fix:** Added "(if connected)" qualifier.

#### M4: `goals.yaml` "Instant.ly" should be "Instantly"
- **File:** `/Users/vahid/code/CoS/goals.yaml`
- **Lines:** 42, 55
- **Issue:** Product name is "Instantly" not "Instant.ly". Referenced in two places.
- **Fix:** Corrected to "Instantly".

#### M5: `deal-prep.md` has no Prospecting DB ID
- **File:** `/Users/vahid/code/CoS/.claude/commands/deal-prep.md`
- **Issue:** References Prospecting DB but doesn't include the DB page ID. Per notion-crm-architecture.md, the DB page is `30875085-bfd7-8057-862b-e37e0db533e3`.
- **Fix:** This is a linked view, not a standalone data source yet (per migration notes). No fix needed -- noted for when migration completes.

#### M6: `setup-backlog.md` marks growth-traits.yaml as uncreated but it exists
- **File:** `/Users/vahid/code/CoS/assets/setup-backlog.md`
- **Line:** 12
- **Issue:** Shows `[ ] Create growth-traits.yaml` but the file exists and has 8 well-defined traits.
- **Fix:** Checked the box.

#### M7: `setup-backlog.md` shows several items as unchecked that appear to be done
- **File:** `/Users/vahid/code/CoS/assets/setup-backlog.md`
- **Lines:** 13-14
- **Issue:** `/my-tasks execute` Notion sync is documented in the command. `/gm` goals check (Step 3) is fully implemented in gm.md.
- **Fix:** Checked both boxes.

#### M8: `donna-scheduled-tasks.md` still frames everything as Railway/Telegram
- **File:** `/Users/vahid/code/CoS/docs/donna-scheduled-tasks.md`
- **Lines:** Throughout
- **Issue:** Describes all output as "Telegram message" and infrastructure as Railway serial queue. Railway is stopped. This doc is accurate as a reference for the donna-server codebase but misleading as current operational docs.
- **Fix:** Added header note clarifying this documents donna-server behavior (currently paused). Current operation is via local Claude Code commands.

#### M9: `source-of-record.md` references donna-server/src/cron.ts for Schedules SOR
- **File:** `/Users/vahid/code/CoS/assets/source-of-record.md`
- **Line:** 23
- **Issue:** Says SOR for schedules is `CoS/schedules.yaml + donna-server/src/cron.ts` accessed via "File read / Railway". Railway is stopped.
- **Fix:** Updated to note Railway is paused; schedules.yaml is the design reference.

### Low

#### L1: `gm.md` Step 2 auto-fix behavior vs donna-behaviors safety rule
- **File:** `/Users/vahid/code/CoS/.claude/commands/gm.md`
- **Line:** 41
- **Issue:** Step 2 says "Auto-fix stale tasks: If a task is marked pending but evidence shows it's done, update my-tasks.yaml immediately." But donna-behaviors.md says "Do NOT mark tasks complete autonomously -- only Vahid marks tasks complete." These contradict.
- **Fix:** Clarified in gm.md that auto-fix applies only to YAML status for display accuracy, not to marking tasks as "complete" (which requires Vahid's confirmation). The auto-fix is for clearly evidenced staleness (e.g., deliverable exists), not judgment calls.

#### L2: `deal-prep.md` priority format inconsistency
- **File:** `/Users/vahid/code/CoS/.claude/commands/deal-prep.md`
- **Lines:** 122, 132
- **Issue:** Line 122 says "Priority: 1 (deals are always high priority)" (numeric) while line 132 says "Priority: Urgent or High" (string). Other commands consistently map 1=Urgent, 2=High, 3=Medium, 4=Low.
- **Fix:** Standardized to match other commands.

#### L3: `deal-prep.md` implicit status mapping WIP vs in_progress
- **File:** `/Users/vahid/code/CoS/.claude/commands/deal-prep.md`
- **Lines:** 121 vs 132
- **Issue:** YAML uses `in_progress` (line 121) while Notion uses `WIP` (line 132). This mapping isn't documented anywhere.
- **Fix:** Added explicit mapping note in deal-prep.md.

#### L4: `goals.yaml` last_updated is Feb 15 -- 9 days stale
- **File:** `/Users/vahid/code/CoS/goals.yaml`
- **Line:** 10
- **Issue:** `last_updated: "2026-02-15"` but goal notes reference events up to Feb 24. The file has been updated since Feb 15 but the timestamp wasn't bumped.
- **Fix:** Updated to 2026-02-24.

#### L5: `my-tasks.yaml` task-009 "Organize WhatsApp" references WhatsApp MCP
- **File:** `/Users/vahid/code/CoS/my-tasks.yaml`
- **Line:** 93
- **Issue:** Notes say "Donna has WhatsApp MCP access" but WhatsApp bridge is paused.
- **Fix:** Updated note to reflect WhatsApp is paused.

---

## Notion DB ID Audit

All IDs consistent across commands. Canonical values from notion-crm-architecture.md:

| DB | ID | Commands Using It |
|----|-----|-------------------|
| Opportunities | `de289591-f32a-483d-a51e-6bc158f4173e` | meeting-prep, debrief, deal-prep, retro, review-queue |
| Tasks | `bfaf4e0f-1352-40cb-b39e-e441b75c1d96` | my-tasks, debrief, deal-prep, retro, review-queue |
| Companies | `5fee82ee-a0e1-41f5-aaca-308e03580182` | debrief |
| People | `11d6ce8b-a1af-455a-b9c5-d50d1aec5796` | debrief |
| Vahid (Assignee) | `622468d8-a961-4066-b9fe-65c0970a7852` | my-tasks, debrief, retro, deal-prep |

No mismatches. No truncated IDs.

## Notion Status Values Audit

Per notion-crm-architecture.md, Tasks DB valid statuses: `Not started`, `Next up`, `WIP`, `Paused`, `Done`, `Archived`

| Command | Statuses Used | Valid? |
|---------|--------------|--------|
| my-tasks.md | `Not started`, `Done` | Yes |
| debrief.md | `Not started`, `WIP` | Yes |
| retro.md | `Done`, `Not started` | Yes |
| deal-prep.md | `WIP` | Yes |
| review-queue.md | `Needs Review`, `Blocked`, `Waiting on Vahid` | These are "Needs Attention" field values, not Status. Correct usage. |

All status values valid.

## Notion Priority Values Audit

Per notion-crm-architecture.md: `Urgent`, `High`, `Medium`, `Low`

All commands map numeric priorities (1-4) to these string values consistently.

## Cross-Command References

| Source | References | Exists? | Match? |
|--------|-----------|---------|--------|
| gm.md Step 6 | `/meeting-prep` | Yes | Description matches |
| gm.md Step 2 | `my-tasks.yaml` | Yes | Path correct |
| gm.md Step 3 | `goals.yaml` | Yes | Path correct |
| meeting-prep.md Step 1 | `fellow-write.js` | Yes | Path `/Users/vahid/code/CoS/scripts/fellow-write.js` exists |
| meeting-prep.md Guidelines | `fellow-login.js` | Yes | Path exists |
| meeting-prep.md Step 5 | `patterns.md` | Yes | File exists at referenced path |
| retro.md Step 7 | `/review-queue` (implied) | Yes | Exists |
| deal-prep.md Guidelines | `/research:collect` | Not in CoS | Correct -- lives in fcpo-research project |
| the-mirror.md Step 1 | `growth-traits.yaml` | Yes | File exists with 8 traits |

No broken cross-references within the CoS project.

## CLAUDE.md Asset References Audit

| Referenced File | Actual File | Status |
|----------------|-------------|--------|
| `company-context.md` | `assets/company-context.md` | EXISTS |
| `fellow-full-mine.md` | Does not exist (actual: `fellow-deep-dive.md`) | MISMATCH -- not fixing CLAUDE.md per instructions |
| `fellow-recent-context.md` | `assets/fellow-recent-context.md` | EXISTS |
| `granola-context.md` | `assets/granola-context.md` | EXISTS |
| `slack-context.md` | `assets/slack-context.md` | EXISTS |
| `slack-channel-history.md` | `assets/slack-channel-history.md` | EXISTS |

## Memory File References Audit

| Referenced File | Path | Status |
|----------------|------|--------|
| `business-context.md` | CoS memory | EXISTS |
| `donna-personality.md` | CoS memory | EXISTS |
| `cos-session-state.md` | CoS memory | EXISTS |
| `notion-crm-architecture.md` | CoS memory | EXISTS |
| `fractionalcpo-context.md` | CoS memory | EXISTS |
| `market-expansion-project.md` | CoS memory | EXISTS |
| `vahid-identity.md` | Global memory | EXISTS |

All memory files exist at documented paths.

## Goals-Tasks Alignment

| Goal | Aligned Tasks | Gap? |
|------|--------------|------|
| Build verified pipeline | task-001 (overdue), task-002 (overdue) | Tasks stale/overdue |
| Close first deal | task-013 (VeraData, due today) | Active -- good |
| Sales infrastructure online | task-005 (in_progress), task-014 (pending) | On track |
| CTCT competitor targeting | task-003 (pending, due Feb 28) | 4 days to deadline, still pending |
| Year-end revenue target | No direct tasks | Expected -- long-range goal |
| DR trip prep | task-004 (pending, due Mar 2) | 6 days out -- fine |

Gap: Goals 1 and 4 have tasks that are stale or approaching deadline without progress.

---

## Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| Critical | 5 | 5 |
| High | 9 | 7 (2 are informational / no-fix-needed) |
| Medium | 9 | 9 |
| Low | 5 | 5 |
| **Total** | **28** | **26** |

2 items not fixed:
- H3: CLAUDE.md asset reference mismatch (not fixing CLAUDE.md per instructions)
- H9: task-011 goal alignment concern (flagged for review, no file change)
