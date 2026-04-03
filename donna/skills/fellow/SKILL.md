---
name: fellow
description: Access Fellow meeting notes, transcripts, summaries, and action items via REST API.
metadata: { "openclaw": { "emoji": "📋", "requires": { "env": ["FELLOW_API_KEY", "FELLOW_SUBDOMAIN"] } } }
---

# Fellow

Use Fellow's REST API for meeting prep and debrief.

## Auth

All requests use X-API-KEY header:
```
X-API-KEY: $FELLOW_API_KEY
Content-Type: application/json
```

Base URL: `https://fractionalcpo.fellow.app/api/v1`

## Endpoints

The API uses `/recordings` (meetings with audio) and `/notes` (meeting notes). Both are POST for search, GET for individual items.

### Search recordings (meetings)
```bash
curl -s -X POST -H "X-API-KEY: $FELLOW_API_KEY" -H "Content-Type: application/json" \
  -d '{"limit": 10}' \
  "https://fractionalcpo.fellow.app/api/v1/recordings"

> **Note:** The `limit` parameter is accepted but non-functional — the API always returns up to 20 results regardless of the value set. 
```

### Get a single recording
```bash
curl -s -H "X-API-KEY: $FELLOW_API_KEY" -H "Content-Type: application/json" \
  "https://fractionalcpo.fellow.app/api/v1/recording/{recording_id}" 
```

### Search notes
```bash
curl -s -X POST -H "X-API-KEY: $FELLOW_API_KEY" -H "Content-Type: application/json" \
  -d '{"limit": 10}' \
  "https://fractionalcpo.fellow.app/api/v1/notes" 
```

### Get a single note (with content)
```bash
curl -s -H "X-API-KEY: $FELLOW_API_KEY" -H "Content-Type: application/json" \
  "https://fractionalcpo.fellow.app/api/v1/note/{note_id}" 
```

## Data Model

- **Recording** = a meeting with audio capture. Has: id, title, started_at, ended_at, event_guid, note_id
- **Note** = meeting notes (may or may not have a recording). Has: id, title, event_guid, event_start, event_end, recording_ids, content_markdown
- Recordings link to notes via `note_id`. Notes link to recordings via `recording_ids`.
- Web links: `https://fractionalcpo.fellow.app/meetings/{event_guid}`

## Write Access (Playwright)

The REST API provides read-only access. Write access is available via Playwright (see below).

For writes (talking points, private notes), use the Playwright script:

```bash
# List today meetings
node /Users/claw/code/CoS/scripts/fellow-write.js --list-today

# Read meeting structure
node /Users/claw/code/CoS/scripts/fellow-write.js --read-structure <meeting-id>

# Write talking points + private notes
node /Users/claw/code/CoS/scripts/fellow-write.js <meeting-id> --inline '{"talkingPoints": ["point 1"], "privateNotes": "brief context"}'

# Find meeting by title and write
node /Users/claw/code/CoS/scripts/fellow-write.js --find "<title>" --inline '{"talkingPoints": [...]}'
```

Session profile at `/Users/claw/.fellow-playwright-profile`. If expired, re-login: `node /Users/claw/code/CoS/scripts/fellow-login.js`

## Notes

- Fellow subdomain: $FELLOW_SUBDOMAIN (fractionalcpo)
- Always include Fellow web links when referencing meetings
- Confirm before modifying action items
