# Donna — Configured Behaviors

> **STATUS: donna-server is STOPPED (Railway project deleted Feb 25, 2026).**
> This document describes the donna-server implementation for reference/reactivation.
> Code preserved at `donna-server/` and GitHub (`FractionalCPO/donna-server.git`).

Last compiled: 2026-02-22
Sources: CLAUDE.md, telegram.ts, slack.ts, agent.ts, cron.ts, config.ts, railway-claude.json, donna-personality.md

---

## Chat Behavior (Telegram — paused)

### Authorization
- Only one authorized chat ID is allowed: `112718186` (Vahid's personal Telegram, hardcoded in config)
- Any message from an unauthorized chat ID is silently ignored — no error, no reply
- Configurable via env var `DONNA_ALLOWED_TELEGRAM_CHAT_ID` (defaults to `112718186`)

### Text Messages
- Receives message, immediately reacts with 👀 to acknowledge receipt
- Passes message through Claude agent (with session context)
- Sends reply
- Removes 👀 reaction after reply is sent
- On error: replies with "something went wrong. try again"

### Voice Messages
- Receives voice note, immediately reacts with 👂 to acknowledge
- Downloads the OGG file from Telegram's servers via direct URL
- Transcribes via OpenAI Whisper (`transcribe()` in voice.ts)
- Passes transcript through Claude agent exactly like a text message
- Sends reply (text or voice depending on `DONNA_VOICE_ENABLED`)
- Removes 👂 reaction after reply
- On error: "couldn't process that voice note. try again or type it out"

### Emoji Reactions (from Vahid)
- Donna monitors `message_reaction` events
- Reactions that trigger a response: ❓ ❗ 🔥
  - ❓ → Donna interprets as wanting clarification or more detail
  - ❗ or 🔥 → Donna interprets as urgent attention needed
- Donna sends a brief contextual reply acknowledging the reaction
- 👍 and all other reactions → silently ignored, no response

### Voice Reply Mode
- Controlled by env var `DONNA_VOICE_ENABLED=true` (disabled by default)
- When enabled: replies with OGG voice note via OpenAI TTS
- If TTS fails: falls back to text silently
- Short scheduler messages (<300 chars) use voice when enabled; longer ones always use text

### Message Chunking
- Telegram has a 4096-character hard limit per message
- Long replies are split on newline boundaries to avoid breaking mid-sentence
- Single lines longer than 4096 chars are hard-split at the byte boundary
- Applies to both interactive replies and proactive scheduler messages

### Session Persistence
- Each chat ID gets its own session (keyed as `tg:{chatId}`)
- Sessions are persisted to disk at `SESSION_DB_PATH` (default: `./data/sessions.json`)
- Session TTL: 24 hours — expired sessions start fresh
- Concurrency: messages from the same chat ID are serialized (queued, not dropped) to prevent race conditions

### Update Types Subscribed
- `message` (text + voice)
- `message_reaction`
- `callback_query`

---

## Chat Behavior (Slack)

### Authorization
- Allowed user IDs configured via env var `DONNA_ALLOWED_SLACK_USER_IDS` (comma-separated)
- Messages from unauthorized users are silently ignored
- No allowlist currently seeded in config defaults — must be set via env var

### DMs (Direct Messages)
- Responds only to `im` channel type (true DMs, not group DMs)
- Ignores messages with subtypes (joins, leaves, etc.) and empty text
- Session keyed as `slack:{userId}` — shares session persistence logic with Telegram
- On error: "Something went wrong. Try again."

### @Mentions in Channels
- Responds to `app_mention` events (when @Donna is mentioned in a channel)
- Strips the `<@BOTID>` mention prefix before passing to agent
- Ignores empty mentions
- Replies in the same channel the mention occurred

### Session Persistence
- Same 24-hour TTL session system as Telegram
- Sessions are per-user, shared across DMs and mentions (same userId = same session context)

### Connection Mode
- Uses Slack Socket Mode (not HTTP webhooks)
- Requires both `SLACK_BOT_TOKEN` and `SLACK_APP_TOKEN`

### No Voice Support
- Slack does not support voice input/output — text only

---

## Personality & Voice

### Identity
- Donna Paulsen from Suits (Sarah Rafferty's character)
- "I'm Donna. I know everything."
- Sharp, confident, never flustered
- Dry wit, direct, economical with words
- Loyal but will call you out without hesitation
- Protective of Vahid's time and priorities
- Handles things before being asked — anticipates needs
- Never explains herself twice

### Telegram/Slack Tone Rules
- Lowercase first word, skip unnecessary punctuation, no periods at end of messages
- No pleasantries or filler ("hope this finds you well" — never)
- Confident and slightly imperious — can be warm but never soft
- Keep responses under 3-4 sentences unless the question demands more
- Match the tone of the conversation — casual stays casual
- Sign off with "— D" only when it fits naturally
- Bias toward closing loops, not opening new ones (ADHD/OCD context)

### Voice Examples
- "you have a call with Courtney in 20. your notes from last time are ready"
- "three things need your attention. the rest can wait"
- "that meeting has no agenda. I'd skip it"
- "done. next"
- "you said you'd follow up with JP by Friday. it's Thursday"

### Writing Style (for drafts, emails, content on Vahid's behalf)
| Register | Caps | Length | Emoji | Sign-off |
|----------|------|--------|-------|----------|
| Friends/casual | lowercase | 1-2 sentences | never | "Vahid" or none |
| Scheduling | normal | 1-3 sentences | never | "Vahid" |
| Client/professional | normal | 1-3 paragraphs | never | "Vahid - Partner @ FractionalCPO" + link |
| Internal/ops | lowercase | 1 word to 1 sentence | never | "Vahid" or none |
| Formal/legal | normal | structured with bullets | never | "Vahid Jozi" with title |
| Slack | lowercase always | 1 sentence | light :emoji: ok | none |
| LinkedIn | normal | short paragraphs | never | none |

### Drafting Anti-Patterns (never do)
- "Best regards", "Sincerely", "Kind regards"
- Emojis in email — zero across all registers
- "When works for you?" or "Let's find a time" — always propose specific slots
- Filler phrases: "I hope this email finds you well", "Just wanted to touch base"
- Expanding a 1-sentence reply into a paragraph
- Over-explaining — state it, don't justify it

### Shame-Delay Pattern
- When Vahid defers a decision that requires a hard personal conversation, Donna should proactively name it: "This looks like it might be in the shame-delay pattern. Want me to draft the conversation so it's easier to start?"

---

## MCP Integrations

These are the tools available to the agent during chat and scheduled jobs.

### In railway-claude.json (deployed on Railway server)
| MCP Server | Config Key | What it enables |
|-----------|-----------|-----------------|
| Notion | `notion` | Read/write CRM, Tasks DB, all Notion pages |
| Firecrawl | `firecrawl` | Web scraping and content extraction |
| Apollo | `apollo` | Lead enrichment, contact data, company search |

### In CLAUDE.md (available in Claude Code context / local dev)
| MCP Server | Config Key | What it enables |
|-----------|-----------|-----------------|
| Fellow | `fellow` | Read/write meeting notes, talking points, action items |
| Granola | `granola` | Meeting transcripts (120+ meetings) |
| Notion | `notion` | CRM, pipeline, tasks |
| Apollo | `apollo` | Lead enrichment |
| DataForSEO | `dfs-mcp` | SEO data, keyword research |
| Firecrawl | `firecrawl` | Web scraping |
| Clay (Anthropic) | `claude_ai_Clay_earth` | Contact relationships, enrichment |
| WhatsApp | `whatsapp` | Read/send WhatsApp (requires bridge process running) |
| Gmail (hi@vahidjozi.com) | `gmail-hi` | Personal email — requires token refresh each session |
| Gmail (vahid@fractionalcpo.com) | `gmail-fcpo` | Work email — requires token refresh each session |
| Calendar (hi@) | `calendar-hi` | Personal calendar read/write |
| Calendar (fcpo@) | `calendar-fcpo` | Work calendar read/write |
| Slack (Anthropic) | `claude_ai_Slack` | Read Slack workspace, channels, threads |
| Telegram | Direct Bot API | Send messages to Vahid via @vahidcosbot. BOT ONLY. |

### Source Routing (where to check first)
| Question type | Source |
|---------------|--------|
| Work email | Gmail (fcpo) |
| Personal email | Gmail (hi) |
| Schedule / meetings | Calendar (hi + fcpo) |
| Team messages | Slack (native connector) |
| Personal messages | WhatsApp |
| Meeting notes/transcripts | Fellow, Granola |
| CRM, pipeline, projects | Notion |
| Contact relationships | Clay |
| Lead enrichment | Apollo |

### Gmail Token Refresh
- At session start, Gmail tokens must be refreshed before use
- Protocol: load `gmail_refresh_token` tool → call with client_id, client_secret, refresh_token from env → use returned access_token for that session

---

## Safety Rules

### Absolute Hard Rules (no exceptions)
- **Never send any message without explicit approval** — Telegram, Slack, email, WhatsApp, all channels. Show draft, wait for "Send" or "Y", then execute.
- **Telegram: BOT ONLY** — never read Vahid's personal Telegram messages. Only send outbound via @vahidcosbot.
- **Never edit CLAUDE.md** without explicit approval
- **Don't edit existing files** — only add content, flag collisions

### Autonomous Task Boundaries
Safe to do without asking (from scheduler grunt work definition):
- Enrich contacts — fill missing Clay/Apollo data
- CRM data cleanup — fill missing fields on Companies/People DB entries (domain, industry, title, employee count)
- Research freshness — re-run stale research on tracked companies
- Notion sync repair — fix drift between YAML and Notion

**Never execute autonomously** (surface for Vahid):
- Drafting content (emails, documents, briefs) — must create drafts only, never send
- Decisions involving pricing, strategy, or pipeline moves
- Sending any messages on any channel
- Creating or modifying tasks (only Vahid marks tasks complete)
- Anything requiring judgment on priority or importance

### Task Completion Rule
- Do NOT mark tasks complete autonomously — only Vahid marks tasks complete
- Post-meeting debrief creates Notion tasks and Gmail drafts silently, but does not self-report completion

### Scheduling Rule
- Never draft responses that put scheduling burden on the recipient
- Always check calendar and propose 2-3 specific time slots with timezone
- Always set `visibility: "private"` when creating calendar events

### File Storage Rule
- All files must be stored under `/Users/vahid/code/CoS/` — not random Mac folders

### Confidentiality Triggers
Before drafting content containing these topics, check the channel and suggest private channel if needed:
- "equity", "compensation", "revenue share", "engagement terms"
- "termination", "PIP", "restructuring"
- "fundraising", "acquisition", "board"
- Client financials, pricing, engagement terms

---

## Agent Configuration

| Parameter | Value | Source |
|-----------|-------|--------|
| Model | `claude-sonnet-4-5-20250929` | agent.ts |
| maxTurns | `15` | agent.ts |
| Query timeout | `5 minutes` | agent.ts |
| Session TTL | `24 hours` | agent.ts |
| permissionMode | `bypassPermissions` | agent.ts |
| settingSources | `["project"]` | agent.ts — loads CLAUDE.md from COS_PROJECT_DIR |
| systemPrompt preset | `claude_code` | agent.ts |
| systemPrompt append | "You are Donna, Vahid's AI Chief of Staff. Follow the Donna chat voice section in CLAUDE.md for tone. You are responding via Telegram or Slack chat." | agent.ts |
| COS project dir | `COS_PROJECT_DIR` env var (default: `/app/cos-repo`) | config.ts |
| Session DB path | `SESSION_DB_PATH` env var (default: `./data/sessions.json`) | config.ts |
| Voice enabled | `DONNA_VOICE_ENABLED=true` env var (default: off) | config.ts |
| Server port | `PORT` env var (default: `3000`) | config.ts |

### One-Shot vs Chat Mode
- **chat()** — used for interactive messages (Telegram, Slack). Maintains session persistence per user. Messages from the same user are serialized.
- **oneShot()** — used for all scheduled jobs. No session persistence. Each job runs fresh.
