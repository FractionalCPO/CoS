# HEARTBEAT.md

## Checks (rotate through these)
- [ ] Obsidian — verify running (`ps aux | grep Obsidian`), if not: `open -a Obsidian`. vault sync depends on it
- [ ] Email — SKIP (handled by email-check cron every 10 min)
- [ ] Calendar — what's coming up in next 24-48h (`gog calendar events`)
- [ ] Tasks — any deadlines approaching or overdue in ✅ tasks.md
- [ ] Fellow — open action items or upcoming meeting prep
- [ ] WhatsApp — check for messages from key contacts via native channel
- [ ] Slack — check for unread DMs and mentions

## Rules
- quiet hours: 23:00-08:00 ET unless urgent
- update /Users/claw/.openclaw/workspace/memory/heartbeat-state.json after each check
- update /Users/claw/.openclaw/workspace/vault/⚙️ ops/🤖 donna/heartbeat.md with timestamp + summary
- only message Vahid if something actually needs attention
