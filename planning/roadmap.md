# CoS Roadmap

**Last updated:** 2026-02-24

---

## Completed (as of Feb 2026)

### Phase 1: Chat ✓
- [x] Telegram bot (webhook mode)
- [x] Claude Agent SDK integration with Donna personality
- [x] Per-chat conversation memory
- [x] Telegram security (allowed chat ID only)
- [x] Railway deployment (auto-deploy on push to main)
- [x] Voice notes (Whisper transcription + TTS)

### Phase 2: Scheduled Jobs ✓
- [x] Cron-based scheduler (node-cron, 8 jobs)
- [x] Morning briefing (8am ET)
- [x] Inbox pre-process (9am, 1pm, 5pm)
- [x] Meeting prep (8:15am)
- [x] Meeting check (11am, 3pm)
- [x] Daily work execution (10am, 2pm)
- [x] Evening triage (5:30pm)
- [x] System health check (6am, 6pm)
- [x] Git auto-sync (hourly)
- [x] Serial job queue (prevents OOM from parallel oneShot() calls)

### Phase 3: Proactive Intelligence ✓
- [x] 11 Claude Code commands (gm, triage, my-tasks, enrich, meeting-prep, review-queue, retro, debrief, deal-prep, health, the-mirror)
- [x] Autonomous agents (meeting-prep, crm-updater)
- [x] Notion CRM dual-write
- [x] Contact relationship management (19 profiles, tiered)
- [x] Growth trait tracking (the-mirror)
- [x] WhatsApp bridge (Go + Python MCP)

---

## Current State

donna-server is live on Railway, running 8 cron jobs (~14 oneShot calls/day). Claude Code skills handle complex local work. Two channels: Telegram (bot) + Slack (MCP). Memory is file-based + Notion.

---

## Potential Next Steps (Not Prioritized)

These are ideas surfaced from the architecture comparison, NOT committed work. Prioritize based on revenue impact and current goals.

### Channel Abstraction
- Extract common channel interface from donna-server
- Move Telegram-specific logic behind the abstraction
- Enable adding new channels (Discord, Signal, SMS) without rewriting core
- Relevance: Low until there's a need for a third channel

### Prompt Separation (OpenClaw Pattern)
- Split monolithic CLAUDE.md into focused files:
  - `AGENT.md` — Identity, role, responsibilities
  - `STYLE.md` — Writing style, tone, examples
  - `TOOLS.md` — MCP servers, source routing
  - `RULES.md` — Hard rules, guardrails
- Keep CLAUDE.md as a thin loader that references these
- Relevance: Medium — would reduce cognitive load when editing

### Skills as Packages
- Move beyond flat markdown command files
- Skills with their own config, dependencies, test fixtures
- Relevance: Low — current markdown skills work fine

### Slack Upgrade
- Agents & Assistants API (requires Business+ plan)
- Streaming responses
- Chat/History tab UX
- Relevance: Blocked on Slack plan upgrade

### donna-server Improvements
- Session memory improvements (beyond 24h TTL)
- Better error recovery for failed cron jobs
- Metrics/observability for job execution
- Relevance: Medium — depends on reliability issues encountered
