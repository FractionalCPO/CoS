# Architecture Comparison — CoS vs Mike's Template vs OpenClaw

**Created:** 2026-02-24
**Purpose:** Reference doc comparing architectural approaches across three systems.

---

## Systems Compared

1. **Mike Murchison's claude-chief-of-staff** — The original template this project forked from. CEO of Ada. 16 files, MIT license. https://github.com/mimurchison/claude-chief-of-staff
2. **OpenClaw** — Large-scale open-source personal AI assistant (~224K stars, ~7,150 files). Gateway + agent + channel architecture. https://github.com/openclaw/openclaw
3. **Our CoS** — Vahid's evolved system. Claude Code + Agent SDK + donna-server on Railway.

---

## Side-by-Side

| Dimension | Mike's Template | Our CoS | OpenClaw |
|-----------|----------------|---------|----------|
| **Files** | 16 | ~100+ | ~7,150 |
| **Commands** | 4 (gm, triage, my-tasks, enrich) | 11 (+ meeting-prep, review-queue, retro, debrief, deal-prep, health, the-mirror) | Skills platform + ClawHub registry |
| **Runtime** | None (cron → CLI) | donna-server on Railway (Agent SDK + grammy) | Gateway WS process (always-on, self-hosted) |
| **Channels** | Whatever MCP you wire up | Telegram (bot) + Slack (MCP) | 15+ native (WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Teams...) |
| **Memory** | None | File-based (memory/, assets/, yaml) + Notion dual-write | Plugin-based (core, LanceDB) |
| **CRM** | Markdown contact files | Contacts + Notion CRM (entity + workflow DBs) | None built-in |
| **Scheduling** | schedules.yaml + external cron | 8 cron jobs in donna-server (node-cron) | Built-in cron + webhooks |
| **Voice** | None | OpenAI Whisper + TTS | Voice Wake + Talk Mode (ElevenLabs) |
| **Mobile/Desktop** | None | None | macOS menu bar, iOS, Android |
| **Multi-agent** | Single CLAUDE.md | Single agent, serial job queue | Per-channel agent isolation |
| **Config paradigm** | Single CLAUDE.md with {{PLACEHOLDERS}} | CLAUDE.md + goals.yaml + my-tasks.yaml + schedules.yaml + memory files | openclaw.json + workspace prompts (AGENTS.md, SOUL.md, TOOLS.md) |
| **Deployment** | Local only | Railway (donna-server) + local (Claude Code) | Self-hosted (daemon/launchd/systemd) |
| **Install** | install.sh with sed placeholders | Manual, deeply personalized | openclaw onboard wizard |

---

## What We Added Beyond Mike's Template

1. **donna-server** — Always-on Agent SDK runtime on Railway. 8 scheduled jobs, Telegram webhooks, voice, git-sync. Mike had none.
2. **7 new commands** — meeting-prep, review-queue, retro, debrief, deal-prep, health, the-mirror.
3. **Agents** — meeting-prep.md and crm-updater.md as autonomous roles.
4. **Notion dual-write** — Full CRM with entity/workflow DBs. Mike = flat markdown only.
5. **Memory system** — Session state, cross-project patterns, per-project memory dirs.
6. **Assets library** — Meeting preps, context dumps, deal briefs, writing style analysis.
7. **Growth tracking** — growth-traits.yaml + /the-mirror.
8. **WhatsApp bridge** — Go bridge + Python MCP server.
9. **Multi-project routing** — Workspace root CLAUDE.md routes to CoS, research, GTM, etc.

---

## What OpenClaw Has That We Don't

| Feature | What It Is | Relevance to Us |
|---------|-----------|-----------------|
| **Channel abstraction** | Clean src/channels/ with normalize/outbound/actions | High — our Telegram is baked into donna-server |
| **Gateway protocol** | WS-based control plane routing messages → agents | Medium — would decouple channels from agent logic |
| **Multi-agent routing** | Per-channel/account isolated agents | Low for now — single user, two channels |
| **Plugin/extension system** | npm plugins, ClawHub registry, workspace skills | Medium — our skills are markdown files |
| **Companion apps** | macOS menu bar, iOS, Android | Low priority |
| **Security model** | DM pairing, sandbox modes, per-channel allowlists | Low — we have basic bot auth |
| **Browser control** | CDP-based browser automation | Covered by Playwright MCP |
| **Canvas/A2UI** | Agent-driven visual workspace | Not relevant |

---

## What We Have That OpenClaw Doesn't

| Feature | Why It Matters |
|---------|---------------|
| **Business CRM** | Notion dual-write, entity/workflow separation, pipeline stages |
| **Goal-driven prioritization** | goals.yaml actively referenced in triage, scheduling, tasks |
| **Meeting intelligence** | Fellow + Granola, prep → debrief → action items workflow |
| **Contact relationship management** | Tiered contacts, staleness cadence, Apollo/Clay enrichment |
| **Research toolkit** | fcpo-research for competitive intelligence |

---

## Patterns Worth Stealing

### From OpenClaw
- **Workspace prompt separation** — AGENTS.md (identity), SOUL.md (personality), TOOLS.md (capabilities). Cleaner than monolithic CLAUDE.md.
- **Channel abstraction** — Common interface for messaging channels. Would allow adding Discord/Signal without rewriting core.
- **Skills as packages** — Skills with dependencies/config vs flat markdown.

### From Mike (things we may have drifted from)
- **Simplicity** — His 16-file system is opinionated minimalism. Our 100+ files and 14 MCP servers are powerful but complex. Worth periodic pruning.

---

## Key Architectural Gap

The biggest gap vs OpenClaw: **no channel abstraction layer**. Telegram logic is baked into donna-server, Slack comes via MCP. Adding a new channel means writing new integration code from scratch. A channel abstraction would let us plug in new channels with minimal effort.
