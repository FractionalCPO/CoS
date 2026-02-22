# Donna Relay Server

Local relay that bridges services that can't run on Railway to Donna's cloud deployment.

## What It Does

| Endpoint | Service | Why Local? |
|----------|---------|-----------|
| `POST /dataforseo` | DataForSEO API | MCP server hangs in Docker |
| `GET /whatsapp/status` | WhatsApp bridge | Needs local bridge binary |
| `POST /exec` | Shell commands | Run anything locally |
| `GET /health` | Health check | Public, no auth |

## Setup

```bash
npm install
npm run dev    # development with hot reload
npm start      # production
```

## Environment Variables

| Var | Default | Description |
|-----|---------|-------------|
| `RELAY_PORT` | 3100 | Server port |
| `RELAY_SECRET` | donna-relay-dev | Shared secret for auth |
| `DATAFORSEO_AUTH` | (built-in) | Base64 DataForSEO credentials |
| `DONNA_URL` | Railway URL | Donna's Railway endpoint |

## Exposing to Railway

The relay runs locally. For Donna on Railway to reach it:

```bash
# Option 1: Cloudflare Tunnel (recommended — free, stable)
cloudflared tunnel --url http://localhost:3100

# Option 2: ngrok
ngrok http 3100
```

Set the tunnel URL as `RELAY_URL` env var on Railway.

## Auth

All routes except `/health` require:
```
Authorization: Bearer <RELAY_SECRET>
```

## Portable

Runs on any machine with Node.js 22+. Designed to move to a Mac Mini later.
Just clone, `npm install`, set env vars, and `npm start`.
