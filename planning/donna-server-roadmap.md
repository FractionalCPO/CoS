# Donna Roadmap

## Phase 1: Chat (Current)
- [x] Telegram bot (webhook + polling modes)
- [x] Slack bot (Socket Mode)
- [x] Claude API integration with Donna personality
- [x] Per-chat conversation memory (last 10 messages)
- [x] Telegram security (allowed chat ID only)
- [x] Dockerfile for Railway deployment
- [ ] Deploy to Railway
- [ ] Set Telegram webhook to Railway domain
- [ ] Generate Slack App Token (Socket Mode)
- [ ] End-to-end test both channels

## Phase 1.5: Slack AI Agent Experience
- [ ] Upgrade Slack app to Agents & Assistants API (requires paid Slack plan)
- [ ] Replace Messages tab with Chat/History tab UX
- [ ] Add streaming responses (`chat.startStream` / `appendStream` / `stopStream`)
- [ ] Blocked: needs Business+ or Enterprise Grid plan

## Phase 2: Scheduled Jobs
- [ ] Cron-based scheduler
- [ ] `/gm` morning briefing — auto-send daily at 8am ET
- [ ] Inbox triage — scan Gmail, surface priority items
- [ ] Stale contact alerts — flag contacts needing follow-up
- [ ] Weekly pipeline summary

## Phase 3: Proactive Notifications
- [ ] Meeting prep reminders (15 min before calls)
- [ ] Calendar conflict detection
- [ ] Integration health checks (MCP server monitoring)
- [ ] Deadline tracking and nudges

## Phase 4: Rich Integrations
- [ ] MCP tool access from chat (calendar, contacts, email)
- [ ] Grok integration (image gen + Twitter/X strategy)
- [ ] Notion sync for task management
- [ ] Voice notes via Telegram (whisper transcription)

## Future
- [ ] Multi-user support (team members can DM Donna)
- [ ] Slash commands in Slack (`/donna summarize`)
- [ ] Web dashboard for Donna activity log
