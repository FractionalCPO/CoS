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
