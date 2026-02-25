# CoS — Chief of Staff

Vahid Jozi's AI Chief of Staff system, powered by Claude Code (local).

## What It Does

An AI operating system that handles inbox triage, meeting prep, task execution, and relationship management — running locally via Claude Code with 14 MCP server integrations.

## Architecture

```
CoS/
├── CLAUDE.md              # System config — personality, MCP servers, rules
├── goals.yaml             # Current priorities and goals
├── my-tasks.yaml          # Task tracking (dual-write with Notion)
├── growth-traits.yaml     # Personal growth tracking
├── schedules.yaml         # Automation schedule (design reference)
├── assets/                # Context files, meeting preps, research
├── contacts/              # Relationship profiles (Tier 1-3)
├── docs/                  # System docs and reference
├── donna-server/          # Runtime server (paused) — code preserved for reactivation
├── scheduler/             # Local launchd-based job scheduler
├── scripts/               # Utility scripts (Fellow integration)
├── tests/                 # Command validation tests
└── whatsapp-mcp/          # WhatsApp bridge (Go, separate repo, paused)
```

## How It Runs

```bash
cd /Users/vahid/code/CoS && source .env && claude
```

11 slash commands: `/gm`, `/triage`, `/meeting-prep`, `/my-tasks`, `/retro`, `/review-queue`, `/debrief`, `/enrich`, `/deal-prep`, `/health`, `/the-mirror`

## MCP Servers

Notion, Gmail (x2), Calendar (x2), Fellow, Granola, Clay, Apollo, Firecrawl, Slack, Playwright.

## donna-server (paused)

Runtime server was on Railway (deleted Feb 25, 2026). Code preserved at `donna-server/` and GitHub (`FractionalCPO/donna-server.git`). See `donna-server/docs/ARCHITECTURE-HISTORY.md` for full timeline.
