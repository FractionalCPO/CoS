# Notion Vivo Personal Workspace Map

**Access**: Direct API key (NOT through Anthropic MCP connector)
**API Key**: `NOTION_PERSONAL_API_KEY` = `${NOTION_PERSONAL_API_KEY}`

## Databases

### Personal Tasks (`All Tasks`)
- **DB ID**: `8b0c2c58-fa4f-478b-a876-56cb19a51db5`
- **Fields**:
  | Property | Type | Options |
  |----------|------|---------|
  | Task name | title | — |
  | Status | status | To-do: Not started / In progress: WIP, In progress / Complete: Done, Archived |
  | Priority | select | Low, Medium, High |
  | Due | date | — |
  | Completed on | date | — |
  | Assignee | people | — |
  | Duration | select | 5, 15, 30, 60, 90, 3hrs, ? |
  | Time block | multi_select | AM, AFT, PM, ? |
  | Tags | multi_select | Mobile, Website, Improvement, Marketing, Research, Branding, Video production, Metrics, LinkedIn Inbox, Email Inbox, Personal Info, Tax Organiser, Tax |
  | Project | relation | → Projects |
  | Parent-task | relation (self) | — |
  | Sub-tasks | relation (self) | — |
  | Is Blocking | relation (self) | — |
  | Blocked By | relation (self) | — |
  | Delay | formula | — |

### Personal Goals
- **DB ID**: `17af54e0-32d9-802c-9196-c58d0e633f44`
- **Fields**:
  | Property | Type |
  |----------|------|
  | Goal name | title |
  | Status | status |
  | Category | select |
  | Quarter | multi_select |
  | Owner | people |
  | Due date | date |
  | Start value | number |
  | End value | number |
  | Progress | formula |
  | Days until due | formula |
  | Projects | relation → Projects |

### Personal Projects
- **DB ID**: `3f33565a-1edf-4f38-806d-3829c3de5d80`
- **Fields**:
  | Property | Type |
  |----------|------|
  | Project name | title |
  | Status | status |
  | Priority | select |
  | Important | select |
  | Urgent | select |
  | Size | select |
  | Owner | people |
  | ETA | date |
  | Summary | rich_text |
  | tag | multi_select |
  | Tasks | relation → Tasks |
  | Goals | relation → Goals |
  | Is Blocking | relation (self) |
  | Blocked By | relation (self) |
  | Completion | rollup |
  | Delay | rollup |

## API Access Pattern

```bash
# Read
curl -s https://api.notion.com/v1/databases/{DB_ID}/query \
  -H "Authorization: Bearer ${NOTION_PERSONAL_API_KEY}" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{}'

# Create page
curl -s https://api.notion.com/v1/pages \
  -H "Authorization: Bearer ${NOTION_PERSONAL_API_KEY}" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"parent":{"database_id":"8b0c2c58-fa4f-478b-a876-56cb19a51db5"},"properties":{...}}'
```

## Routing Rule

| Task Type | Target DB | API Key |
|-----------|-----------|---------|
| Business/fCPO | fCPO Tasks (`bfaf4e0f`) | `NOTION_API_KEY` (via MCP) |
| Personal | Vivo Tasks (`8b0c2c58`) | `NOTION_PERSONAL_API_KEY` (direct API) |
