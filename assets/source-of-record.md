# Source of Record (SOR) — Where Data Lives

Every data type has ONE source of truth. Donna reads from and writes to the SOR.
Local files are caches/backups only — never the primary.

| Data Type | SOR | Access Method | Local Cache |
|-----------|-----|---------------|-------------|
| **Email drafts** | Gmail (drafts folder) | Gmail MCP | None — drafts live in Gmail |
| **Email sent/received** | Gmail | Gmail MCP | None |
| **Calendar events** | Google Calendar | Calendar MCP | None |
| **Contacts / relationships** | Clay.earth | Clay MCP (`mcp__claude_ai_Clay_earth__*`) | `CoS/contacts/*.md` (interaction history cache) |
| **Meeting notes / transcripts** | Granola + Fellow | Granola MCP, Fellow MCP | `CoS/assets/meeting-prep-*.md` (prep docs) |
| **Meeting talking points** | Fellow | Fellow MCP + `fellow-write.js` | None — Fellow is live |
| **Tasks (business)** | Notion Tasks DB (`bfaf4e0f`) | Notion MCP | `CoS/my-tasks.yaml` (backup) |
| **Tasks (personal)** | Notion Vivo Tasks DB (`8b0c2c58`) | Direct Notion API | None |
| **CRM — Companies** | Notion Companies DB (`5fee82ee`) | Notion MCP | `fcpo-research/data/` (research cache) |
| **CRM — People** | Notion People DB (`11d6ce8b`) | Notion MCP | None |
| **CRM — PE Firms** | Notion PE Firms DB (`fce2fe71`) | Notion MCP | None |
| **CRM — Prospecting** | Notion Prospecting | Notion MCP | None |
| **CRM — Opportunities** | Notion Opportunities DB (`de289591`) | Notion MCP | None |
| **Goals** | `CoS/goals.yaml` | File read | — (is the SOR) |
| **Growth traits** | `CoS/growth-traits.yaml` | File read | — (is the SOR) |
| **Schedules** | `CoS/schedules.yaml` + `donna-server/src/cron.ts` | File read / Railway | — |
| **System config** | `CoS/CLAUDE.md` | File read | — |
| **Slack messages** | Slack | Slack MCP (`mcp__claude_ai_Slack__*`) | None |
| **Research data** | `fcpo-research/data/` | File read | — (is the SOR, syncs to Notion) |
| **Retro reports** | `CoS/assets/retros/` | File write | — (is the SOR) |
| **Mirror reports** | `CoS/assets/mirror/` | File write | — (is the SOR) |
| **Metrics scorecards** | TBD — pending KPI planning | TBD | TBD |
| **News/signals** | TBD — pending news aggregation planning | TBD | TBD |

## Rules

1. **Always write to the SOR first.** Local caches get updated after.
2. **If SOR and cache conflict, SOR wins.** Always.
3. **Never create a new SOR without updating this file.**
4. **Email drafts = Gmail drafts folder.** Not .md files. Not Notion. Gmail.
5. **Contact data = Clay.earth.** Local contact files store interaction history and talking points only.
