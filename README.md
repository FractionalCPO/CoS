# AI Chief of Staff

**Your personal AI operating system built on Claude Code.**

Turn Claude into a proactive chief of staff that manages your inbox, protects your time, deepens your relationships, and keeps you focused on what matters most.

---

## What It Does

AI Chief of Staff transforms Claude Code from a reactive assistant into an always-on operating system organized around four pillars:

### 1. Communicate Faster
Triage your inbox across email, Slack, and messaging. Get draft responses written in your voice, prioritized by urgency. Clear your inbox in minutes instead of hours.

### 2. Stay Focused on Goals
Define your quarterly objectives. Every recommendation, scheduling decision, and priority call is filtered through what you said matters most. Claude pushes back when you drift.

### 3. Deepen Relationships
Maintain a personal CRM of your key contacts. Track interaction history, surface when relationships go stale, and get prep notes before every meeting. Never let an important relationship decay.

### 4. Execute Relentlessly
Task management with teeth. Claude doesn't just remind you — it helps execute. Draft the email, do the research, prep the document. Zero late tasks is the goal.

---

## Quick Start

### Prerequisites

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- Gmail MCP server (for email access)
- Google Calendar MCP server (for scheduling)

### 3 Steps to Get Running

```bash
# 1. Clone this repo
git clone https://github.com/YOUR_USERNAME/claude-chief-of-staff.git
cd claude-chief-of-staff

# 2. Run the installer
chmod +x install.sh
./install.sh

# 3. Start Claude Code and try your first command
claude
# Then type: /gm
```

That's it. You'll get your first morning briefing in under 15 minutes from clone.

---

## Features

### Morning Briefing (`/gm`)
Start every day with a structured briefing: today's calendar, priority tasks, urgent messages, and upcoming deadlines. Know exactly what matters before you open your inbox.

### Inbox Triage (`/triage`)
Scan all connected channels (email, Slack, messaging) and get a prioritized list of items needing your attention. Each item comes with a draft response written in your voice.

| Tier | Action | Example |
|------|--------|---------|
| **Tier 1** | Respond NOW | CEO asking for input on board deck |
| **Tier 2** | Handle today | Customer escalation from your team |
| **Tier 3** | FYI / archive | Newsletter, automated notification |

### Task Management (`/my-tasks`)
Track tasks with due dates, goal alignment, and proactive execution. Claude helps complete tasks, not just track them.

```
/my-tasks add "Draft Q1 board update" --due 2026-03-15 --goal "board-communication"
/my-tasks list
/my-tasks execute
```

### Contact Enrichment (`/enrich`)
Build and maintain a personal CRM. Track when you last spoke with key contacts, get alerts when relationships go stale, and prep for meetings with full context.

### Smart Scheduling
Every meeting proposal is checked against your goals, availability, and energy patterns. Claude explains *why* a time slot is optimal, not just that it's open.

### Goal-Aligned Prioritization
Define your objectives in `goals.yaml`. Claude references them constantly — when triaging email, proposing meetings, or deciding what task to work on next.

---

## What's Included

```
claude-chief-of-staff/
├── CLAUDE.md                    # Your AI operating system config
├── install.sh                   # One-command setup
├── goals.yaml                   # Quarterly objectives template
├── my-tasks.yaml                # Task tracking
├── schedules.yaml               # Automation schedules
├── contacts/
│   └── example-contact.md       # Contact file template
├── commands/
│   ├── gm.md                    # Morning briefing
│   ├── triage.md                # Inbox triage
│   ├── my-tasks.md              # Task management
│   └── enrich.md                # Contact enrichment
└── docs/
    ├── setup-guide.md           # Detailed setup walkthrough
    ├── mcp-servers.md           # MCP server installation
    └── customization.md         # Make it yours
```

---

## MCP Servers

AI Chief of Staff works with whatever MCP servers you have connected. More servers = more capability.

| Server | Required? | What It Enables |
|--------|-----------|-----------------|
| Gmail | **Yes** | Email triage, drafting, sending |
| Google Calendar | **Yes** | Scheduling, availability, meeting prep |
| Slack | Recommended | Slack triage, channel monitoring |
| WhatsApp | Optional | WhatsApp message triage |
| iMessage | Optional | iMessage triage (macOS only) |
| Granola | Optional | Meeting notes search |
| PostHog | Optional | Product analytics |

See [docs/mcp-servers.md](docs/mcp-servers.md) for installation instructions.

---

## Customization

The power of this system is in how deeply you customize it. The `CLAUDE.md` file is your AI operating system — it defines:

- **Who you are** and what you care about
- **How you write** so drafts sound like you
- **Your goals** so Claude knows what matters
- **Your constraints** (e.g., "home by 6pm for dinner")
- **Your relationships** and how to manage them

See [docs/customization.md](docs/customization.md) for a complete guide to making it yours.

---

## Philosophy

This system is built on a few core beliefs:

1. **Your AI should push you, not just serve you.** A great chief of staff challenges priorities, says "no" to low-leverage work, and keeps you honest about where your time goes.

2. **Clarity beats comprehensiveness.** Fewer, clearer priorities. Explicit tradeoffs. Fast decisions with flagged assumptions rather than slow decisions with perfect information.

3. **Systems compound.** Every interaction improves the system. Contact notes get richer. Writing style gets more accurate. Goal tracking gets more precise. The longer you use it, the better it gets.

4. **Ship, don't polish.** Draft responses should be send-ready. Task outputs should be usable immediately. Bias toward finishing loops, not expanding scope.

---

## Examples

### Morning Briefing
```
> /gm

Good morning. Here's your day:

CALENDAR (4 meetings)
- 9:00am  Revenue forecast review (45 min)
- 11:00am  1:1 with Sarah (30 min)
- 2:00pm  Product roadmap sync (60 min)
- 4:00pm  Customer call — Acme Corp (30 min)

TASKS DUE TODAY
- Draft quarterly board update (goal: board-communication)
- Review hiring pipeline spreadsheet

URGENT (Tier 1)
- Email from CFO re: budget approval — needs response by noon

APPROACHING
- Team offsite planning due in 3 days (no progress yet)
```

### Inbox Triage
```
> /triage

Scanned: Gmail (23 new), Slack (8 DMs), WhatsApp (3 messages)

TIER 1 — Respond Now
1. Sarah Chen (VP Sales) — Deal approval needed for Acme, $450K
   Draft: "Sarah, approved. Let's close this week. Loop me in if they push on terms."

2. Board member — Requesting updated metrics before Thursday meeting
   Draft: "Will have the updated deck to you by EOD Wednesday."

TIER 2 — Handle Today
3. Recruiter — Final candidate for engineering lead role
4. Customer success — Escalation from long-time customer

TIER 3 — FYI
5-8. Newsletter, automated reports, LinkedIn notifications
   → Auto-archived
```

---

## Contributing

This is an open framework. If you build useful commands, improve the CLAUDE.md template, or add MCP server guides, contributions are welcome.

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) by Anthropic.
