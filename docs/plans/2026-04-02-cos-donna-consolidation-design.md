# CoS/Donna Consolidation Design

**Date:** 2026-04-02
**Status:** Approved
**Goal:** Eliminate redundancy between CoS repo (MBP) and OpenClaw workspace (Mac Mini). Single source of truth for all Donna config.

---

## Problem

Two parallel systems define Donna's behavior:
- **CoS repo** on MBP: CLAUDE.md, .mcp.json, assets, goals, scripts, tools + dead code (donna-server, scheduler, schedules.yaml)
- **OpenClaw workspace** on Mac Mini: SOUL.md, AGENTS.md, TOOLS.md, ROUTINES.md, USER.md, IDENTITY.md, HEARTBEAT.md, skills/, scripts/ (1054 lines of config)

They share no sync mechanism for config. Updates to one don't reach the other. Silent drift.

Additionally:
- 13 MBP slash commands reference CoS paths but are never used
- donna-server/ is dead (Railway deleted Feb 25)
- scheduler/ is mostly dead (only git-sync active)
- MBP cron jobs reference CoS paths unnecessarily
- Stale repos on Mini (fractionalcpo-website, iran-war-tracker, ux-tear-down)

## Architecture: Before vs After

### Before
```
MBP                                    Mac Mini
CoS repo (full clone)                  CoS repo (stale clone, git-pull)
  CLAUDE.md (MBP config)              OpenClaw workspace
  .mcp.json (business MCP)              SOUL.md      (duplicated config)
  assets/ (context files)               AGENTS.md    (duplicated config)
  goals.yaml                            TOOLS.md     (duplicated config)
  scripts/                              ROUTINES.md  (duplicated config)
  tools/                                USER.md      (pure duplicate)
  donna-server/ (DEAD)                  IDENTITY.md  (7 lines)
  scheduler/ (mostly DEAD)              MEMORY.md    (runtime state)
  schedules.yaml (DEAD)                 memory/      (runtime state)
  whatsapp-mcp/ (paused)                skills/      (duplicated)
13 slash commands (DEAD)                scripts/     (duplicated)
8 cron jobs -> CoS paths                vault/       (runtime state)
git-sync -> pushes CoS hourly         9 OpenClaw cron jobs
```

### After
```
Mac Mini (SOURCE OF TRUTH)             MBP (THIN CLIENT)
CoS repo (canonical)                   ~/.claude.json (global MCP servers)
  CLAUDE.md (shared config)            /code/CLAUDE.md (workspace routing)
  donna/                               3 private cron jobs (SSH to Mini)
    soul.md                            (no CoS clone)
    agents.md
    tools.md
    routines.md
    heartbeat.md
    skills/
  assets/
  goals.yaml
  scripts/
  tools/
OpenClaw workspace (RUNTIME ONLY)
  BOOT.md (thin pointer to CoS)
  MEMORY.md (Donna's runtime memory)
  memory/ (daily logs)
  vault/ (Obsidian sync)
  acknowledged-alerts.md, etc.
OpenClaw cron jobs (all business + moved from MBP)
```

## Key Decisions

### 1. CoS repo = single source of truth (git-backed)
Everything that defines Donna's behavior lives here:
- `donna/` directory: soul, agents, tools, routines, heartbeat, skills
- `assets/`: company context, meeting preps, cron reports
- `goals.yaml`, `scripts/`, `tools/`
- `CLAUDE.md`: unified config for both MBP interactive and Mini autonomous

### 2. OpenClaw workspace = runtime state only
Ephemeral, frequently-updated data stays here:
- `MEMORY.md`: updated by Donna every session
- `memory/`: 56+ daily log files
- `vault/`: Obsidian sync, personal data
- `acknowledged-alerts.md`, `heartbeat-state.json`
- Thin `BOOT.md` pointing to `~/code/CoS/donna/` for config

### 3. MBP becomes thin client
- Business MCP servers (Notion, Apollo, Gmail x3, Calendar x2, Fellow, Clay) move to global `~/.claude.json`
- No CoS clone needed
- Claude Code launches from `/Users/vahid/code/` (workspace root)
- 3 private cron jobs read from Mini via SSH

### 4. All business cron jobs move to Mini
- review-queue, task-check, research-freshness become OpenClaw cron jobs
- git-sync launchd job deleted (nothing to sync from MBP)

### 5. Dead code removed
- `donna-server/` (preserved on GitHub)
- `schedules.yaml`
- `scheduler/` (entire directory)
- `planning/`
- 13 MBP slash commands
- `CoS/.claude/agents/` (move useful ones to `~/.claude/agents/`)
- `USER.md` + `IDENTITY.md` on Mini (absorbed into donna/soul.md)

### 6. Stale Mini repos cleaned
- `fractionalcpo-website/` -> delete, re-clone as `fcpo-websites/` if needed
- `iran-war-tracker/` -> rename to `warmap/`
- `ux-tear-down/` -> evaluate, likely delete

### 7. Broken OpenClaw cron jobs fixed
- `donna-inbox-sync`: 4 consecutive timeouts
- `hourly-time-check`: timing out
- `ali-debt-email-march`: dead one-shot, remove

## Reference Update Map

| Location | Files | Action |
|----------|-------|--------|
| MBP `~/.claude/commands/` | 13 command files | DELETE all |
| MBP `~/.claude/cron/*.sh` | 8 scripts | 3 delete (move to Mini), 3 update to SSH, 2 unchanged |
| MBP `~/.claude/projects/.../memory/` | MEMORY.md, cross-project-patterns.md, patterns.md | Update CoS path refs |
| MBP `/code/CLAUDE.md` | workspace routing | Update project map, remove CoS entry |
| MBP `~/.claude/CLAUDE.md` | global config | Update CoS references |
| MBP `~/.claude/tests/validate-commands.sh` | test file | DELETE |
| Mini OpenClaw workspace | AGENTS.md, TOOLS.md, ROUTINES.md, SOUL.md, USER.md, IDENTITY.md | Replace with thin BOOT.md |
| Mini OpenClaw cron jobs.json | 9 jobs | Update prompts referencing workspace config |

## Rollback Strategy

Every phase gets a checkpoint:
1. Git tag on CoS repo: `pre-consolidation-2026-04-02`
2. Tar backup of OpenClaw workspace on Mini
3. MBP crontab backup
4. OpenClaw cron jobs export
5. Git tag after each implementation phase

## QA Plan

1. File reference scan: grep all config/memory files for stale paths
2. MCP server test: verify all servers connect from MBP global config
3. OpenClaw cron dry-run: trigger each job, verify config reads from CoS
4. MBP cron test: run each private job, verify SSH reads work
5. Interactive session test: launch Claude Code from /Users/vahid/code/, verify full context
6. Git sync test: push change to CoS on GitHub, verify Mini pulls
7. Cross-reference validation: no dangling paths anywhere
