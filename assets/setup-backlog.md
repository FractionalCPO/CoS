# CoS Setup Backlog

Unstructured items from Vahid, captured 2026-02-20. Work through one by one.

## In Progress

### A. New CoS Commands (scope fix + build)
- [x] Move ALL CoS commands from `~/.claude/commands/cos/` → `CoS/.claude/commands/` (symlinked back for global access)
- [x] Notion Tasks DB discovered — `bfaf4e0f-1352-40cb-b39e-e441b75c1d96` in FractionalCPO workspace. Documented in notion-crm-architecture.md.
- [x] Mike's "learning goal" feature researched — it's goals.yaml as a constant filter, not a standalone feature. Already partially covered by our goals.yaml.
- [ ] Build `/review-queue` — daily items for Vahid to review, before lunch ~11:30am, batched
- [ ] Create `growth-traits.yaml` — principles/traits for The Mirror (extract from Granola therapy sessions)
- [ ] Enhance `/my-tasks execute` — auto-sync completed tasks to Notion Tasks DB, draft-not-send for messages
- [ ] Enhance `/gm` with goals check (Step 3: stalled goals, calendar/goal alignment, goal-aligned work for today)

### B. Cron Automation
- [ ] `/retro` cron — Friday 4pm → Telegram summary + link to saved report
- [ ] `/the-mirror` cron — Sunday noon → Telegram summary + link to saved report
- [ ] `/review-queue` cron — daily ~11:30am (NOT mornings — deep work time)
- [ ] `/debrief` cron — 15 min after each meeting (needs calendar-aware trigger)

### C. Notion Sync
- [x] Tasks DB identified: `bfaf4e0f-1352-40cb-b39e-e441b75c1d96`, Client field = fCPO, Assignee = Vahid
- [ ] Wire task sync into `/debrief` and `/my-tasks` (create tasks in Notion Tasks DB)
- [ ] Wire retro summary sync to Notion

### D. Telegram Optimization
- [ ] All cron messages: summarized + link to full content (Notion URL or local file path)
- [ ] Only ask questions on Telegram when genuinely needs Vahid's input
- [ ] Full reports saved locally, Telegram gets 2-3 line summary

## Queued (do next)

### E0. Learn from Edits (Feedback Loop)
- [ ] When Vahid edits a draft/output, Donna diffs before/after
- [ ] Extracts pattern ("shortened this", "removed formal sign-off", "added numbers")
- [ ] Writes learning to memory files (writing-calibration.md, preferences-learned.md)
- [ ] Future outputs incorporate the learning
- [ ] Mike has this — we don't. Critical for system self-improvement.

### E0b. Contact Enrich + Clay.earth as SOR
- [ ] How does /enrich integrate with Clay.earth? Currently uses local contacts/ files
- [ ] Vahid's SOR is Clay.earth — need to design: Clay as SOR with local cache, or local SOR with Clay sync?
- [ ] Clay MCP tools available: searchContacts, getContact, createContact, updateContact, getNotes, createNote, getEvents, getEmails
- [ ] Decision needed: which direction does data flow? Clay → contacts/ → Notion? Or contacts/ → Clay?
- [ ] Enrich should pull from Clay first, then fill gaps from Apollo/email/calendar

### E. Relationship Deepening Agent
- [ ] Design and build (Vahid wants to spend time on this after current batch)
- [ ] CoS-scoped agent in `CoS/.claude/agents/`
- [ ] Integrates with: Clay, contacts/, Granola, email history
- [ ] Purpose: proactively deepen key relationships, suggest touchpoints, track cadence

### F. CoS Setup Guide Walkthrough
- [ ] Walk through Mike's install.sh as a checklist
- [ ] Fill in gaps: goals freshness, preferences, writing samples, constraints
- [ ] Update `growth-traits.yaml` with Vahid's actual traits (from Granola therapy)
- [ ] Update tasks that are stale (task-001 overdue since Feb 18)
- [ ] Writing style samples (global CLAUDE.md still says "NEEDED")

## Queued (later)

### G. Folder Structure Cleanup
Reorganize /Users/vahid/code/ from 12 flat dirs to 6 clean groups:
- `fcpo-gtm/` — AEO, ALO, lead-list-creator, research (renamed from company-research)
- `fcpo-websites/` — jan-2026 (renamed from "fCPO website jan 2026")
- `tools/` — linkedin-posting-system, slack-screenshot-gen, mac-inventory (renamed from utilities)
- `CoS/` — unchanged
- `clients/` — keep (CtCt)
- `_archive/` — absorb micro-saas-factory
- Rename all dirs to kebab-case (no spaces)
- Update: git remotes, CLAUDE.md paths, symlinks, hooks, cron scripts
- **Careful:** company-research has its own .git — needs remote update

### H. Vivo Notion Workspace Access
- Notion MCP integration only sees FractionalCPO workspace
- Vivo workspace (personal tasks) is either a separate workspace or doesn't exist yet
- Action: Grant Claude AI integration access to Vivo workspace in Notion settings
- Once accessible, map the workspace and document the Tasks DB for personal task sync
- **RULE: Personal tasks → Vivo Tasks DB. Business tasks → fCPO Tasks DB. Never mix.**

## Resolved Questions

1. **Notion Tasks DB**: Use existing Tasks DB (`bfaf4e0f`). Set `Client: fCPO`, `Assignee: Vahid`, `Workstream` as appropriate.
2. **The Mirror frequency**: Sunday noon. Include "one thing to change next week" → feed into morning briefing.
3. **Review queue timing**: ~11:30am daily (before lunch, NOT mornings = deep work). Batched. High-priority only in AM if pileup.
4. **Mike's "learning goal"**: Not a standalone feature — it's goals.yaml as a constant filter across all Claude interactions. Add goals check to `/gm` and use goals.yaml for alignment checks.
5. **Command scoping**: Source of truth in `CoS/.claude/commands/`, symlinked to `~/.claude/commands/cos/` for global access.
