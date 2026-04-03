# TOOLS.md

> **CRITICAL:** Always use absolute paths. Vault is at `/Users/claw/.openclaw/workspace/vault/`. Never use `~` or relative paths — they will fail.

## Tools & Access

### Email Monitoring

Email is scanned every 10 minutes (`email-check` cron, Sonnet + light context). Tier 1 emails (urgent, blocking, key contacts) trigger immediate Telegram alerts. Full email processing happens in morning/evening runs.

### Obsidian Vault — `/Users/claw/.openclaw/workspace/vault/`
Read + write. Your shared workspace with Vahid. Changes sync bidirectionally via Obsidian Sync.

> **VAULT WRITE PATHS:** The vault is at `/Users/claw/.openclaw/workspace/vault/`. Always use this exact path for all read/write/edit operations. Never use `~`, relative paths, or any shorthand.
- **Your folder:** `⚙️ ops/🤖 donna/` — inbox.md, heartbeat.md, output/, architecture docs
- **Tasks SOR:** `⚙️ ops/✅ tasks.md` — primary task tracker
- **Visible:** ops, work, planning (goals + papash), people, ideas, writing, vivo hub notes
- **Not synced (local only):** journal, reading, play, mental health, mirror, private, playbooks

### Business Repos — `/Users/claw/code/`
Read + write for research repos. 7 repos sync from GitHub on each cron run.

**CoS** (`/Users/claw/code/CoS/`) — core business operations, your primary context source:
- `goals.yaml` — Q1 objectives, key results, priorities. **Read this first every morning.**
- `assets/company-context.md` — company overview, pipeline, team, ICP, CTCT story, relationships
- `assets/beringer-capital-research.md` — PE research for VeraData deal
- `assets/slack-context.md` — Slack channel context and history
- `docs/donna-behaviors.md` — behavior guidelines
- `scripts/` — Fellow login, journal extraction

**fcpo-research** (`/Users/claw/code/fcpo-research/`) — competitive intelligence toolkit:
- `companies.md` — tracked companies list
- `data/` — per-company research (11 companies: ActiveCampaign, VeraData, Benzinga, etc.)
- `CLAUDE.md` — 10 research buckets, 25 commands, collection workflows

**fcpo-gtm** (`/Users/claw/code/fcpo-gtm/`) — go-to-market monorepo:
- `ALO/` — Automated LinkedIn Outreach (HeyReach + 3 rented LinkedIn profiles)
- `AEO/` — Automated Email Outreach (Instantly + fractionalcpos.com domain)
- `lead-list-creator/` — CRM lead management, ICP definition, Notion pipeline, outreach exports

**fcpo-clients** (`/Users/claw/code/fcpo-clients/`) — client work artifacts:
- `CtCt/` — Constant Contact: Jira inventory scripts, Snowflake data analysis, UX teardown

**fcpo-websites** (`/Users/claw/code/fcpo-websites/`) — live website (fractionalcpo.com):
- `src/` — React/TypeScript/Tailwind/Vite app (built with Lovable)
- `docs/` — landing page requirements, ICP language guides, old site archive
- `supabase/` — backend functions
- Note: renamed from `fractionalcpo-website`. May need re-cloning on Mini.

**ux-tear-down** (`/Users/claw/code/ux-tear-down/`) — UX analysis crawler (may be removed):
- Python/Playwright tool that maps site IA, user journeys, forms, modals
- `crawl_results_shard*/` — crawled site data
- `analysis/heuristics/` — analysis rules and patterns

**whatsapp-mcp** (`/Users/claw/code/whatsapp-mcp/`) — WhatsApp MCP bridge:
- MCP server for WhatsApp integration (separate from wacli history CLI)

### WhatsApp — Native Channel (OpenClaw)
Send and receive WhatsApp messages directly. Linked to +14169953808. Groups via allowlist.
- **Live messages only** — no history search via this channel. Use wacli for old messages.
- **Cannot read** via message tool — the WhatsApp channel is send/receive for live chat only, not a searchable inbox.

### Voice Notes — All Channels
Voice notes on Telegram, WhatsApp, and Slack are auto-transcribed via OpenAI (gpt-4o-mini-transcribe). Just listen and respond to the text.

### wacli — WhatsApp History CLI
Search old WhatsApp history, contacts, and groups. Use `wacli messages`, `wacli chats`, `wacli contacts`. Separate from the WhatsApp channel (which handles live chat).

### Notion — FractionalCPO workspace
Read + write. The business paper trail. CRM, pipeline, deals, collaborative projects. Create Notion projects for major initiatives. Update with meaningful progress. Personal tasks stay in Obsidian.

### Gmail — `gog` CLI
Read + draft. Two accounts:
- `vahid@fractionalcpo.com` — work (client comms, deals, ops)
- `hi@vahidjozi.com` — personal
- `donna@fractionalcpo.com` — Donna's forwarding inbox (used by donna-inbox-sync cron for forward detection)
Never send without explicit approval.

### Calendar — `gog` CLI
Read-only. Both accounts. List events, check freebusy, prep for meetings.

### Fellow — REST API (read) + Playwright (write)
Meeting recordings, transcripts, notes, action items. See `donna/skills/fellow/SKILL.md` for API endpoints.

**Write access** via Playwright (saved browser session):
- List today's meetings: `node /Users/claw/code/CoS/scripts/fellow-write.js --list-today`
- Read meeting structure: `node /Users/claw/code/CoS/scripts/fellow-write.js --read-structure <meeting-id>`
- Write talking points + private notes: `node /Users/claw/code/CoS/scripts/fellow-write.js <meeting-id> --inline '{"talkingPoints": ["point 1", "point 2"], "privateNotes": "context notes"}'`
- Session profile: `/Users/claw/.fellow-playwright-profile` (re-login with `node /Users/claw/code/CoS/scripts/fellow-login.js` if expired)

### Slack — FractionalCPO workspace (Socket Mode)
Read + draft. DMs and group chats. Never send without approval.

**Channel ID Reference** (always use IDs, never names):
| Channel | ID |
|---------|-----|
| Vahid DM | user:U08JA9CUCLA |
| #general | channel:C088XRWL0LQ |
| #all-slack | channel:C07PXRLVCHF |
| #fcpo-dev | channel:C09S484LGTF |
| #partners | channel:C099PGM2RC4 |
| #fcpo-bench-building | channel:C0A7BR4Q5CP |
| #fcpo-ai-tools | channel:C0AEPAYMQ07 |
| #client-constant-contact | channel:C08L1V8CPD1 |
| DM: Mauricio | channel:D09DY0V3C79 |
| DM: Courtney | channel:D09CWKRR0PJ |
| **Note:** Use user token (xoxp) for DM history reads via direct API. Bot token for sending.

> **Format:** Always use `channel:C...` or `user:U...` format for Slack targets. Never use channel names like "general" — they will fail.

### GitHub — `$GITHUB_TOKEN`
Clone, branch, commit, create PRs. Never push to main. Vahid merges.

### Telegram — @vahidcosbot
Primary communication channel with Vahid.

### Firecrawl — MCP
Web scraping, crawling, search, extraction. See `donna/skills/firecrawl/SKILL.md`.

### Apollo — MCP
Contact and company enrichment. See `donna/skills/apollo/SKILL.md`.

### Playwright — MCP
Browser automation for dynamic sites. See `donna/skills/playwright/SKILL.md`.

### Knowledge Graph Memory — MCP
Persistent cross-session memory. See `donna/skills/memory/SKILL.md`.

### Sequential Thinking — MCP
Structured reasoning for complex problems. See `donna/skills/sequential-thinking/SKILL.md`.

### Context7 — MCP
Library documentation lookup. Up-to-date docs for any framework.
### DataForSEO — MCP (via Claude Code only)
SEO data, SERP analysis, keyword research, backlink analysis. Used in research skill for company/competitor analysis. **Note:** Available when Vahid runs research commands from Claude Code. Not directly available in Donna cron sessions.

## Channel Capabilities

> Channel capabilities reference — what each channel can and cannot do:

| Channel | Send | Receive | Read History | Search | Notes |
|---------|------|---------|-------------|--------|-------|
| Telegram | yes | yes | no | no | Primary comms with Vahid |
| Slack | yes (with approval) | yes | yes (by channel ID) | yes | Use channel:C... or user:U... format |
| WhatsApp | yes (with approval) | yes | no (use wacli) | no (use wacli) | Live only, no read action |
| Gmail | yes (with approval) | n/a | yes (gog cli) | yes (gog cli) | Two accounts |

## When to Use What

| Need | Source |
|------|--------|
| Company goals, strategy, ICP | CoS repo → `goals.yaml`, `company-context.md` |
| Competitive research data | fcpo-research repo → `data/` per company |
| GTM tools, lead lists, outreach | fcpo-gtm repo → ALO, AEO, lead-list-creator |
| Client history (CTCT) | fcpo-clients repo → `CtCt/` |
| Website code, requirements | fcpo-websites repo |
| UX analysis tooling | ux-tear-down repo |
| Meeting transcripts, notes | Fellow |
| Team messages, Slack context | Slack |
| Client/work emails | Gmail (fcpo account) |
| Personal emails | Gmail (hi account) |
| Schedule, availability | Calendar (both accounts) |
| CRM, pipeline, deals | Notion |
| Tasks, personal priorities | Obsidian `✅ tasks.md` |
| People context | Obsidian (people files are stubs/wikilink targets, not synced from Clay. Clay is SOR for contact data.) Obsidian `👥 relationships/` or Apollo |
| Company/contact enrichment | Apollo |
| Web scraping, competitor sites | Firecrawl |
| Dynamic JS-heavy sites | Playwright |
| Code repos, PRs | GitHub |
| Cross-session memory | Knowledge Graph Memory |

## Task Flow

1. **Primary SOR:** `⚙️ ops/✅ tasks.md` in vault
2. **Inbox pattern:** extract tasks → `⚙️ ops/🤖 donna/inbox.md` → Vahid triages to tasks.md or Notion
3. **Research output:** goes to Notion (primary), vault backup if needed
4. Cross-reference Slack, email, GitHub, Fellow for completion evidence

## CLI Quick Reference

```bash
# Vault
cat "/Users/claw/.openclaw/workspace/vault/⚙️ ops/✅ tasks.md"
cat "/Users/claw/.openclaw/workspace/vault/⚙️ ops/🤖 donna/inbox.md"

# Business repos (auto-pulled on morning cron, manual pull if needed)
for repo in CoS fcpo-research fcpo-gtm fcpo-clients fcpo-websites ux-tear-down whatsapp-mcp; do git -C /Users/claw/code/$repo pull --ff-only 2>/dev/null; done

# Key files
cat /Users/claw/code/CoS/goals.yaml
cat /Users/claw/code/CoS/assets/company-context.md

# Gmail
gog gmail search 'newer_than:1d' --max 10 --account vahid@fractionalcpo.com
gog gmail search 'newer_than:1d' --max 10 --account hi@vahidjozi.com

# Calendar
gog calendar events primary --from <today>T00:00:00Z --to <tomorrow>T00:00:00Z --account vahid@fractionalcpo.com
gog calendar events primary --from <today>T00:00:00Z --to <tomorrow>T00:00:00Z --account hi@vahidjozi.com
```

For Fellow, Firecrawl, Apollo, Playwright, Memory, Context7 — see `donna/skills/*/SKILL.md`.


### Lobster — Resumable Workflows

Lobster is enabled for typed, resumable workflows with approval gates. Use it when a task has multiple steps that should pause for human approval before continuing.

**Tool actions:**
- `run` — Execute a pipeline string or `.lobster` workflow file
- `resume` — Continue a paused workflow after approval

**When to use:** Multi-step tasks where intermediate results need Vahid's sign-off before proceeding (e.g., research → draft outreach → [approve?] → send).
