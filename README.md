# CoS — Chief of Staff

Vahid Jozi's AI Chief of Staff system, powered by Claude Code.

## What It Does

An always-on AI operating system that handles inbox triage, meeting prep, task execution, and relationship management — running 24/7 on Railway via Telegram.

## Architecture

```
CoS/
├── CLAUDE.md              # System config — personality, MCP servers, rules
├── goals.yaml             # Current priorities and goals
├── my-tasks.yaml          # Task tracking (dual-write with Notion)
├── growth-traits.yaml     # Personal growth tracking
├── schedules.yaml         # Automation schedule reference
├── assets/                # Context files, meeting preps, research
├── contacts/              # Relationship profiles (Tier 1-3)
├── docs/                  # System docs and reference
├── donna-server/          # Runtime server (Railway) — Telegram bot + Railway cron
├── scripts/               # Utility scripts (Fellow integration)
├── tests/                 # Command validation tests
└── whatsapp-mcp/          # WhatsApp bridge (Go, separate repo)
```

## donna-server (Railway)

The runtime server runs 8 scheduled jobs (~12 oneShot() calls/day):

| Job | Schedule | What it does |
|-----|----------|-------------|
| morningBriefing | 8:00 AM Mon-Fri | Calendar, tasks, goals, urgent inbox |
| inboxPreProcess | 9am, 1pm, 5pm Mon-Fri | Draft email replies in Gmail |
| meetingPrep | 8:15 AM Mon-Fri | Research participants, push to Fellow |
| meetingCheck | 11am, 3pm Mon-Fri | Pre-meeting context + post-meeting debrief |
| dailyWork | 10am, 2pm Mon-Fri | Execute safe tasks from Notion |
| eveningTriage | 5:30 PM Mon-Fri | End-of-day wrap, tomorrow's prep |
| systemHealthCheck | 6am, 6pm daily | Test all MCP servers |
| gitAutoSync | hourly | Commit + push changes to GitHub |

Stack: Claude Agent SDK, grammy (Telegram), node-cron, OpenAI (voice), Railway.

## MCP Servers

Notion, Gmail (x2), Calendar (x2), Fellow, Granola, Clay, Apollo, Firecrawl, Slack (local only).

## Local vs Railway

- **Railway (donna-server)**: Scheduled jobs, Telegram bot, always-on
- **Local (Claude Code)**: WhatsApp, Slack, DataForSEO, hands-on research, complex tasks
