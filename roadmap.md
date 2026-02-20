# CoS (Chief of Staff) — Roadmap for Vahid

## What This Is

The [claude-chief-of-staff](https://github.com/mimurchison/claude-chief-of-staff) repo is a **configuration framework** for Claude Code — not a traditional app. It installs a customized `CLAUDE.md`, YAML configs, and slash commands into `~/.claude/` that turn Claude into a personal productivity system: inbox triage, morning briefings, task management, and relationship tracking.

The challenge: Vahid already has a heavily customized `~/.claude/` setup (global commands, research skills, Railway skills, settings). We can't just run `install.sh` — it would clobber existing config. We need to **surgically merge** the CoS system into the existing setup.

---

## Phase 1: CLAUDE.md — Build Your Operating System

**Goal:** Create a personalized `CLAUDE.md` that combines CoS principles with your existing setup.

The CoS `CLAUDE.md` is 17KB of template with `{{PLACEHOLDERS}}`. This is the highest-leverage piece — everything else depends on it.

### Tasks

1. **Audit current `~/.claude/CLAUDE.md`** — Check if one exists already; preserve anything valuable
2. **Fill in Part 2 (Who You Are)** — Name, role (Fractional CPO), company (FractionalCPO.com), emails, timezone, hard constraints (meeting windows, focus blocks, travel)
3. **Fill in Part 3 (Company Context)** — Tricky since you serve multiple clients. Decide: one CLAUDE.md per client engagement, or a single "fractional CPO" context with client profiles
4. **Write Part 4 (Writing Style)** — Pull 3-5 real sent emails. Define tone, sign-off, scheduling habits. This is the #1 impact area for triage quality
5. **Fill in Part 5 (Relationships)** — Define your tiers. Tier 1 = current clients + key prospects. Tier 2 = active network. Tier 3 = extended
6. **Configure Part 11 (MCP Servers)** — You already have DataForSEO, Firecrawl, Fellow, Railway, Notion, Apollo. Add Gmail + Google Calendar MCP servers (required for CoS). Optionally add Slack

### Decision Point
> **Single vs. multi-client CLAUDE.md?** As a fractional CPO, you context-switch between clients. Options:
> - (A) One master CLAUDE.md with a "current client" section you swap
> - (B) Project-scoped CLAUDE.md files per client engagement (Claude Code supports this)
> - (C) Single CLAUDE.md with all clients listed, let Claude figure it out
>
> Recommendation: **(B)** — Use project-scoped configs. Keep the CoS core in global `~/.claude/CLAUDE.md`, put client-specific context in each project's `.claude/CLAUDE.md`.

---

## Phase 2: Install Commands (Without Breaking Existing Setup)

**Goal:** Add the 4 CoS slash commands alongside your existing research commands.

### Tasks

1. **Copy commands to `~/.claude/commands/cos/`** — Namespace them under `cos/` to avoid collisions with research commands
   - `gm.md` → `/cos:gm` (morning briefing)
   - `triage.md` → `/cos:triage` (inbox triage)
   - `my-tasks.md` → `/cos:my-tasks` (task management)
   - `enrich.md` → `/cos:enrich` (contact enrichment)
2. **Adapt commands for fractional CPO context** — The originals assume a single-company CEO. Adjust:
   - `/cos:gm` should brief across all active client engagements
   - `/cos:triage` should tag messages by client
   - `/cos:enrich` tiers should reflect your network (clients, prospects, partners, PE firms)
3. **Test each command** manually before enabling automation

---

## Phase 3: MCP Server Setup

**Goal:** Connect the communication channels CoS needs.

### Tasks

| Server | Priority | Status | Action |
|--------|----------|--------|--------|
| Gmail | Required | Not connected | Install Gmail MCP server, OAuth setup |
| Google Calendar | Required | Not connected | Install GCal MCP server, OAuth setup |
| Slack | Recommended | Not connected | Install if you use Slack with clients |
| Fellow | Already have | Connected | Already available for meeting notes |
| Notion | Already have | Connected | Can integrate with contact enrichment |

### Notes
- iMessage/WhatsApp are optional — skip unless you message clients there
- Fellow replaces Granola (you already have it for meeting notes)
- PostHog/Linear are product-team tools — skip unless a client uses them

---

## Phase 4: Goals & Tasks Configuration

**Goal:** Set up quarterly objectives and task tracking.

### Tasks

1. **Write `goals.yaml`** — Your Q1 2026 objectives as a fractional CPO. Examples:
   - Pipeline: X qualified leads per month
   - Client delivery: specific outcomes per engagement
   - Thought leadership: LinkedIn posts, content
   - Business development: partnerships, referral network
2. **Initialize `my-tasks.yaml`** — Start with current open items across clients
3. **Decide task system overlap** — You may already track tasks in Notion or another tool. Decide if `my-tasks.yaml` replaces that or supplements it

---

## Phase 5: Contacts / Personal CRM

**Goal:** Build your relationship database.

### Tasks

1. **Create `~/.claude/contacts/` directory** (if not exists)
2. **Seed Tier 1 contacts** — Current clients, key prospects, close advisors (5-10 people to start)
3. **Seed Tier 2 contacts** — Active network, PE contacts, referral partners (20-30)
4. **Integrate with Notion CRM** — You already have `sync-to-notion` / `sync-from-notion` in company-research. Consider whether CoS contacts should also sync to Notion, or stay local
5. **Connect Apollo enrichment** — You have Apollo MCP. Use it to auto-enrich contact profiles with company/role data

### Decision Point
> **CoS contacts vs. Notion CRM vs. Apollo?** You have three potential contact databases. Options:
> - (A) CoS markdown files as source of truth, sync key fields to Notion
> - (B) Notion as source of truth, CoS reads from it
> - (C) Keep them separate (CoS for relationship tracking, Notion for company research)
>
> Recommendation: **(A)** — CoS markdown files are richer (interaction history, communication style, talking points). Sync summary data to Notion for pipeline visibility.

---

## Phase 6: Automation (Optional, Do Last)

**Goal:** Set up scheduled runs so CoS works in the background.

### Tasks

1. **Start manual** — Use `/cos:gm` and `/cos:triage` manually for 1-2 weeks to calibrate
2. **Set up cron jobs** (once calibrated):
   - 8:00 AM: `/cos:gm` morning briefing
   - 12:00 PM: `/cos:triage` midday scan
   - 5:00 PM: `/cos:triage` evening scan
   - Weekly Monday 9 AM: `/cos:enrich stale`
3. **Log outputs** to `~/.claude/logs/` for review

---

## Phase 7: Integration with Company Research

**Goal:** Connect your two systems so they reinforce each other.

### Tasks

1. **Morning briefing includes research freshness** — `/cos:gm` checks `/research:status` and flags stale data
2. **Task alignment** — Research tasks (e.g., "run comprehensive on Competitor X") can live in `my-tasks.yaml` with goal alignment
3. **Contact enrichment feeds research** — When `/cos:enrich` identifies a new company contact, it can trigger `/research:init`
4. **Shared Notion layer** — Both systems sync to Notion; build a unified dashboard

---

## Execution Order (Summary)

| Phase | Effort | Dependency | What You Need to Provide |
|-------|--------|------------|--------------------------|
| 1. CLAUDE.md | 2-3 sessions | None | Personal info, writing samples, client list, tier definitions |
| 2. Commands | 1 session | Phase 1 | Review & approve adaptations |
| 3. MCP Servers | 1 session | None (parallel with 1) | Google OAuth credentials |
| 4. Goals & Tasks | 1 session | Phase 1 | Your Q1 2026 objectives |
| 5. Contacts | 1-2 sessions | Phase 2, 3 | Tier 1 contact list (names + context) |
| 6. Automation | 1 session | Phase 1-5 | Approval to set up cron |
| 7. Integration | 1 session | Phase 1-5 | Approval of integration points |

---

## Phase 8: Local Messaging Bridge (iMessage + WhatsApp → Donna)

**Goal:** Hit inbox zero on iMessage and WhatsApp by giving Donna read access via a local Mac daemon that syncs to Railway.

**Status:** Scoped, not started. Separate repo: `donna-bridge`.

### Architecture

```
Mac (always-on)                         Railway
┌─────────────────────┐   POST /ingest  ┌───────────────┐
│  donna-bridge       │ ──────────────→ │  Donna server │
│  ├─ imessage-reader │                 │  /ingest      │
│  │  (chat.db poll)  │                 │  ├─ triage    │──→ Telegram
│  ├─ whatsapp-bridge │                 │  ├─ store     │
│  │  (existing CoS)  │                 │  └─ reply?    │
│  └─ outbox sender   │ ←───────────── │               │
│     (approved msgs) │   GET /outbox   └───────────────┘
└─────────────────────┘
```

### Components

**1. iMessage Reader**
- Read from `~/Library/Messages/chat.db` (SQLite, read-only)
- Poll every 60s for new messages since last checkpoint
- Extract: sender, text, timestamp, chat name, attachments (filenames only)
- Requires Full Disk Access in System Settings → Privacy
- Store last-read rowid in `~/.donna-bridge/checkpoint.json`

**2. WhatsApp Reader**
- Reuse existing WhatsApp bridge from CoS setup (already running)
- Same poll-and-forward pattern
- If bridge isn't running, skip silently — don't crash

**3. Ingest Endpoint (Donna side)**
- New `POST /ingest` on donna-server
- Auth: shared secret in `BRIDGE_AUTH_TOKEN` env var
- Payload: `{ source: "imessage" | "whatsapp", messages: [{ from, text, timestamp, chat }] }`
- Donna triages by contact tier, batches notifications
- Tier 1: immediate Telegram notification
- Tier 2: batched into midday/evening triage
- Tier 3: archived silently, surfaced only on request

**4. Reply Flow (phase 2 of bridge)**
- Donna drafts reply → shows in Telegram → Vahid approves
- Approved reply queued in `/outbox` endpoint
- Bridge polls `/outbox`, sends via iMessage (AppleScript `tell application "Messages"`) or WhatsApp bridge
- Same approval guard as email — never auto-send

**5. Local Daemon**
- Node.js or Python, runs as macOS LaunchAgent
- Auto-start on login, restart on crash
- Logs to `~/.donna-bridge/logs/`
- Health check: bridge pings Donna `/health` every 5min, Donna alerts Telegram if bridge goes silent >15min

### Privacy & Security
- iMessage DB is read-only — bridge never modifies it
- All messages encrypted in transit (HTTPS to Railway)
- Shared auth token rotated monthly
- No message content stored on Railway beyond triage window (24hr TTL)
- Bridge runs only on Vahid's Mac — no cloud access to message DBs

### New Env Vars (Railway)
- `BRIDGE_AUTH_TOKEN` — shared secret for bridge↔Donna auth

### New Env Vars (Mac)
- `DONNA_SERVER_URL` — Railway URL
- `BRIDGE_AUTH_TOKEN` — matching secret
- `WHATSAPP_BRIDGE_PORT` — port for existing WhatsApp bridge (default 3001)

### Repo Structure
```
donna-bridge/
├── src/
│   ├── imessage.ts        # SQLite reader for chat.db
│   ├── whatsapp.ts        # WhatsApp bridge client
│   ├── sync.ts            # Poll loop + POST to Donna
│   ├── outbox.ts          # Poll Donna /outbox, send replies
│   └── index.ts           # LaunchAgent entry point
├── install.sh             # Creates LaunchAgent plist, sets permissions
├── package.json
└── tsconfig.json
```

### Dependencies on donna-server
- New endpoint: `POST /ingest` (receives messages)
- New endpoint: `GET /outbox` (returns approved replies)
- New endpoint: `POST /outbox/:id/sent` (mark reply as sent)
- Triage logic in scheduler or inline

### Effort Estimate
- Bridge repo (read + sync): medium
- Donna /ingest endpoint: small
- Reply flow (outbox + AppleScript send): medium
- Total: ~1 focused session to get read working, second session for replies

### Prerequisites
- Donna deployed and stable on Railway (current state)
- Full Disk Access granted to Terminal/iTerm
- WhatsApp bridge process running (existing CoS setup)

---

## Phase 9: Twitter/X DM Integration

**Goal:** Donna can read and respond to Twitter DMs — same pattern as Telegram/Slack.

### Architecture

Twitter API v2 provides DM endpoints, but has limitations:
- **Read DMs:** `GET /2/dm_conversations/with/:participant_id/dm_events` (requires OAuth 2.0 User Context)
- **Send DMs:** `POST /2/dm_conversations/with/:participant_id/messages`
- **Webhooks:** Account Activity API (Enterprise tier) for real-time push — expensive. Alternative: poll every 60s.

### Components

| Component | Description |
|-----------|-------------|
| `src/twitter.ts` | OAuth 2.0 client, DM polling loop, message handler |
| `src/tools/twitter.ts` | `twitter_read_dms`, `twitter_send_dm` tools |
| Scheduler integration | Poll DMs every 60s, triage via Donna |

### API Access Requirements

1. Twitter Developer Account (developer.twitter.com)
2. App with OAuth 2.0 User Authentication (read + write + DM scopes)
3. Tokens: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `TWITTER_ACCESS_TOKEN`, `TWITTER_REFRESH_TOKEN`
4. Scopes needed: `dm.read`, `dm.write`, `tweet.read`, `users.read`

### Implementation Plan

1. **OAuth 2.0 PKCE flow** — one-time auth to get refresh token (similar to Google OAuth setup)
2. **DM poller** — `setInterval` every 60s, fetch new DMs since last check
3. **Inbound handler** — new DMs → `chat()` with `twitter:${userId}` chatId
4. **Tools** — `twitter_read_dms` (list recent DMs), `twitter_send_dm` (requires approval)
5. **Personality routing** — add Twitter DMs to source routing in personality.ts
6. **Auth guard** — allowlist of Twitter user IDs (same pattern as Telegram/Slack)

### Limitations

- Twitter Basic API tier: 10,000 DM reads/month, 500 DM sends/month
- No real-time webhooks without Enterprise tier ($$$)
- Rate limits: 1 request per second for DM endpoints
- Twitter may restrict automated DM sending — review ToS

### Effort

- Small-medium: OAuth setup is the hardest part, DM read/write is straightforward
- Dependencies: Twitter Developer account, app approval

---

## Deferred Skills (from /extract-skills sessions)

### `/research/icp-whitespace` — ICP & Market White Space Analyzer
- **Status:** Deferred (2026-02-19)
- **What:** Dedicated skill to research a company's ideal customer profile and market white spaces. Produces structured ICP (primary, secondary, buy triggers) and numbered white space opportunities with evidence. Outputs to `data/{company}/icp-whitespace.md` + `.json`, optionally pushes to Notion.
- **Why deferred:** Not ready to formalize yet — want to run the analysis manually a few more times to stabilize the pattern.
- **Dependency:** Once built, should also be added to `/research/collect` as bucket 11.

### Add ICP/whitespace as bucket 11 in `/research/collect`
- **Status:** Deferred (2026-02-19) — blocked by `/research/icp-whitespace` skill above.

---

## What I Need From You to Start

1. **Decision on single vs. multi-client CLAUDE.md** (Phase 1 decision point)
2. **3-5 real sent emails** that represent your writing style
3. **Your Tier 1 contacts** (even just names — I can enrich the rest)
4. **Your Q1 2026 goals** (even rough — we'll refine)
5. **Which MCP servers to set up** (Gmail + GCal at minimum)
6. **Decision on contacts source of truth** (Phase 5 decision point)
