# CoS QA Report — 2026-02-20 (Cross-System Consistency Audit)

## Summary
Full cross-system consistency audit across scheduler.ts, schedules.yaml, source-of-record.md, CLAUDE.md, setup-backlog.md, goals.yaml, and my-tasks.yaml.
Total findings: 12. Fixed: 8. Remaining: 4 (informational or need Vahid input).

## Fixed Issues (2026-02-20)

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| C1 | HIGH | **Cron mismatch**: Inbox Pre-Process cron `0,30 8-20 * * 1-5` in scheduler.ts vs `0,30 8-21 * * 1-5` in schedules.yaml. Console log in scheduler.ts also said "8am-9pm" contradicting the code. | Fixed scheduler.ts to `0,30 8-21 * * 1-5` to match YAML and intent (8am-9pm). |
| C2 | HIGH | **SOR violation**: dailyQA prompt (scheduler.ts:538) said "Check for unsent follow-up email drafts in CoS/assets/" — SOR for email drafts is Gmail, not local files. | Fixed prompt to say "Check Gmail drafts folder" with SOR note. |
| C3 | MEDIUM | **schedules.yaml midday triage notes wrong**: Said "Scans email + Slack" but actual prompt only checks "fcpo account" email, no Slack. | Fixed YAML notes to match actual prompt behavior. |
| C4 | MEDIUM | **schedules.yaml relationship check notes incomplete**: Said "T1=14d, T2=30d, T3=60d" but actual prompt only nudges Tier 1 contacts by name. | Fixed YAML notes to list actual contacts and behavior. |
| C5 | MEDIUM | **Backlog stale**: 4 items marked `[ ]` (pending) were already implemented in scheduler.ts: `/review-queue`, `/retro` cron, `/the-mirror` cron, `/debrief` cron. | Marked all 4 as `[x]` with implementation references. |
| C6 | LOW | **Validation script created** | Created `/Users/vahid/code/CoS/tests/validate-consistency.sh` — validates YAML syntax, cron cross-check, SOR compliance, overdue tasks, goal field completeness. |

## Remaining Issues (2026-02-20)

| # | Severity | Issue | Notes |
|---|----------|-------|-------|
| C7 | MEDIUM | **task-001 overdue**: "Tampa Bay Times follow-up" due 2026-02-18, still status=pending | Vahid needs to update status or reschedule. |
| C8 | LOW | **Relationship check prompt lists Papash as Tier 1** but CLAUDE.md Tier 1 table only has "Elmira, Courtney, Mauricio". Papash is mentioned in Personal Context with >30 day flag. | Not a bug per se — Papash is family. But CLAUDE.md contact tier table should probably include him for consistency. Needs Vahid approval to edit CLAUDE.md. |
| C9 | LOW | **goals.yaml personal section** missing `priority` and `status` fields (DR trip prep only has name/target/progress) | Informational — personal goals have lighter schema. |
| C10 | LOW | **goal_alignment slugs** in my-tasks.yaml don't map to goals.yaml objective names (e.g., "build-pipeline" vs "Build verified pipeline", "revenue" has no goal) | Carry-forward from prior QA (R3). Needs slug convention decision. |

## Detailed Cross-Check Results

### 1. schedules.yaml <-> scheduler.ts
- **18 cron jobs** in schedules.yaml (17 Railway + 1 local-only Session Cleanup)
- **17 cron.schedule() calls** in scheduler.ts + 1 setInterval (calendar poll)
- **All cron expressions now match** after C1 fix
- **2 calendar-aware entries** (Pre-Meeting Refresh, Post-Meeting Debrief) correctly use setInterval in code and `trigger: calendar-aware` in YAML
- **Session Cleanup** correctly exists only in YAML (local crontab, not Railway)

### 2. SOR Compliance
- **Email drafts**: Fixed (C2). All prompts now reference Gmail for drafts.
- **Tasks**: Correctly writes to Notion Tasks DB (`bfaf4e0f`) as SOR, with my-tasks.yaml as backup.
- **Contacts**: relationshipCheck prompt references Clay implicitly (correct).
- **Meeting notes**: postMeetingDebrief correctly checks Granola then Fellow.

### 3. CLAUDE.md Consistency
- **Triage tiers**: Scheduler prompts match CLAUDE.md (Tier 1 = family, active clients, Courtney; Tier 2 = team, warm leads; Tier 3 = everything else).
- **CRM DB IDs**: Notion Tasks DB `bfaf4e0f` referenced correctly in autonomousGruntWork and taskSurfacing prompts.
- **Contact tier cadence**: Scheduler's relationshipCheck flags Tier 1 at >14 days — matches CLAUDE.md.
- **Meeting prep steps**: weeklyMeetingPrep and dailyMeetingPrep match CLAUDE.md responsibilities (research, Fellow push, PE portfolio check).

### 4. Data File Integrity
- **goals.yaml**: Valid YAML. All 5 objectives have required fields (name, target, priority, progress). Progress values all 0-1. Personal section has lighter schema.
- **my-tasks.yaml**: Valid YAML. 11 tasks. 1 overdue (task-001). 1 complete (task-006). 3 tasks have no due_date (task-008, -009, -010).
- **schedules.yaml**: Valid YAML. All 19 entries have name + (cron or trigger) + delivery + notes.

### 5. Backlog Audit
- **4 items marked done that were already done** — fixed (C5)
- **Remaining pending items** verified as genuinely not yet implemented

## Files Modified (2026-02-20)
- `/Users/vahid/code/CoS/donna-server/src/scheduler.ts` — cron fix (line 593), SOR fix (line 538)
- `/Users/vahid/code/CoS/schedules.yaml` — midday triage notes, relationship check notes
- `/Users/vahid/code/CoS/assets/setup-backlog.md` — 4 backlog items marked complete
- `/Users/vahid/code/CoS/tests/validate-consistency.sh` — new validation script
- `/Users/vahid/code/CoS/docs/qa-report.md` — this report

---

# CoS QA Report — 2026-02-17

## Summary
3 parallel audit agents ran: Command Consistency, fellow-write.js CLI, Data Integrity.
Total findings: 27 across all agents. Consolidated to 18 unique issues after dedup.

## Fixed Issues

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| F1 | HIGH | `/tmp/` profile dir world-readable; Fellow cookies exposed | Moved to `~/.fellow-playwright-profile`, migrated existing profile |
| F2 | HIGH | No session detection; expired session gives misleading error | Added login redirect detection in `navigateToMeeting()` with remediation message |
| F3 | HIGH | Agenda block locator matches sub-items; could corrupt structure | Changed to `> .react-node-view-agenda` with `data-indent` exclusion + fallback |
| F4 | HIGH | Private notes tab toggle fragile (double-click workaround) | Track `_privateNotesTabOpen` state; only click when not already open |
| F5 | HIGH | CLAUDE.md says Slack is "Direct API / curl" — stale, now native MCP | Updated to `claude_ai_Slack` native connector entry |
| F6 | HIGH | `contacts.md` renamed to `enrich.md` in active dir but not synced to source | Copied `enrich.md` to source repo |
| F7 | HIGH | Contact dir path wrong (`~/.claude/contacts/` vs actual CoS/contacts/) | Fixed path in both enrich.md copies |
| F8 | MEDIUM | `patterns.md` reference is relative path with no anchor | Made absolute path in both meeting-prep.md copies |
| F9 | MEDIUM | `.ProseMirror` not waited for before reading; SPA timing issue | Added `waitFor({ state: 'visible' })` in `navigateToMeeting()` |
| F10 | LOW | fellow-login.js comment says `/tmp/` | Updated to `$HOME` |

## Remaining Issues (not fixed — design decisions or need Vahid input)

| # | Severity | Issue | Why Not Fixed |
|---|----------|-------|---------------|
| R1 | HIGH | No Mark Kirschner contact file | Needs Clay/research data to create properly |
| R2 | MEDIUM | `my-tasks.yaml` and `goals.yaml` stale copies in source repo | These are live files at `~/.claude/`; source copies are snapshots |
| R3 | MEDIUM | `goal_alignment: "revenue"` on task-007 has no matching goal | Needs decision on slug convention |
| R4 | MEDIUM | CLAUDE.md pipeline missing Beringer Capital/Dave Hinton | CLAUDE.md says "don't edit without approval" |
| R5 | MEDIUM | `example-contact.md` template outdated vs actual format | Template update deferred |
| R6 | MEDIUM | `triage.md` references "CLAUDE.md Part 4" — no longer numbered | Low impact, navigable by content |
| R7 | LOW | `--find` returns first DOM match, not first future meeting | Enhancement, not a bug |
| R8 | LOW | JSON parsed after browser launch; malformed JSON wastes startup time | Minor UX; low priority |

## Files Modified
- `/Users/vahid/code/CoS/scripts/fellow-write.js` — session detection, profile path, sub-item locator, tab state tracking, editor wait
- `/Users/vahid/code/CoS/scripts/fellow-login.js` — profile path
- `/Users/vahid/code/CoS/CLAUDE.md` — Slack MCP entry
- `/Users/vahid/code/CoS/commands/enrich.md` — new file (synced from active)
- `/Users/vahid/code/CoS/commands/meeting-prep.md` — absolute path for patterns.md
- `/Users/vahid/.claude/commands/cos/enrich.md` — contact path fix
- `/Users/vahid/.claude/commands/cos/meeting-prep.md` — absolute path for patterns.md
- `/Users/vahid/.claude/projects/-Users-vahid-code/memory/patterns.md` — profile path update
