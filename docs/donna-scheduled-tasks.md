# Donna Scheduled Tasks — Full Reference

**Source:** `donna-server/src/cron.ts`
**Timezone:** All schedules run in `America/Toronto` (ET)
**Last updated:** 2026-02-23 (v3.0 — Minimal Stable CoS)

---

## Overview

Donna runs **8 scheduled jobs** producing ~12 `oneShot()` calls/day. All jobs use a serial queue to prevent OOM from parallel Claude processes (each ~200MB). Output is delivered via Telegram unless marked silent.

---

## Job Details

### `morningBriefing`
- **Cron:** `0 8 * * 1-5`
- **Schedule:** 8:00 AM Mon-Fri
- **What it does:** Runs the /gm routine — checks calendar, tasks, goals, unread emails. Synthesizes into a concise morning briefing in Donna's voice.
- **Dependencies:** Calendar (both), Gmail (both), Notion
- **Output:** Telegram message, under 15 lines

### `inboxPreProcess`
- **Cron:** `0 9,13,17 * * 1-5`
- **Schedule:** 9am, 1pm, 5pm Mon-Fri (3 calls/day)
- **What it does:** Checks both Gmail accounts for unread emails from the last 30 minutes. Triages by tier (1=family/clients, 2=team/warm leads, 3=everything else). Creates Gmail draft replies for Tier 1 and 2. Never sends.
- **Dependencies:** Gmail (both accounts)
- **Output:** Telegram message listing drafts created. Silent if no new emails (SKIP).

### `meetingPrep`
- **Cron:** `15 8 * * 1-5`
- **Schedule:** 8:15 AM Mon-Fri
- **What it does:** Researches each participant for today's meetings (Clay, Granola, Fellow, emails). Writes strategic context brief. Pushes talking points to Fellow. Saves prep files locally.
- **Dependencies:** Calendar, Clay, Granola, Fellow, Gmail
- **Output:** Telegram summary, under 8 lines. Silent if no meetings (SKIP).

### `meetingCheck`
- **Cron:** `0 11,15 * * 1-5`
- **Schedule:** 11am, 3pm Mon-Fri (2 calls/day)
- **What it does:** Two functions in one:
  - **Pre-meeting:** For meetings in next 2 hours, surfaces new context since morning prep
  - **Post-meeting:** For meetings ended in last 3 hours, finds transcript (Granola/Fellow), extracts action items, creates Notion tasks, drafts follow-up emails in Gmail
- **Dependencies:** Calendar, Granola, Fellow, Notion, Gmail
- **Output:** Telegram, under 10 lines. Silent if nothing to process (SKIP).

### `dailyWork`
- **Cron:** `0 10,14 * * 1-5`
- **Schedule:** 10am, 2pm Mon-Fri (2 calls/day)
- **What it does:** Pulls pending tasks from Notion assigned to Donna. Executes safe ones (enrichment, CRM cleanup, research, drafting, file org). Marks tasks needing Vahid as needs_review.
- **Dependencies:** Notion, Clay, Apollo, Gmail, Firecrawl
- **Output:** Telegram report: completed, needs review, blocked. Silent if no tasks (SKIP).

### `eveningTriage`
- **Cron:** `30 17 * * 1-5`
- **Schedule:** 5:30 PM Mon-Fri
- **What it does:** End-of-day wrap: checks for urgent unread emails (Tier 1 only), summarizes tasks completed today, flags tasks due tomorrow.
- **Dependencies:** Gmail (both), Notion
- **Output:** Telegram, 5-8 lines. Silent if nothing to report (SKIP).

### `systemHealthCheck`
- **Cron:** `0 6,18 * * *`
- **Schedule:** 6am, 6pm daily (including weekends)
- **What it does:** Tests each MCP server with a real operation. Returns structured JSON with pass/fail per service. Reports failures via Telegram. Strips markdown fences from output, validates JSON structure.
- **Dependencies:** All MCP servers
- **Output:** Telegram only if failures. Logs pass/fail count always.

### `gitAutoSync`
- **Cron:** `0 * * * *`
- **Schedule:** Hourly
- **What it does:** Pure git operations (no Claude process). Checks for uncommitted changes in CoS repo, pulls with rebase, stages all, commits, pushes. Uses `execFileSync` for token-based remote URL (no shell injection).
- **Dependencies:** Git, GITHUB_TOKEN
- **Output:** Silent. Logs to console only.

---

## Infrastructure

### Serial Job Queue
All `oneShot()` jobs run through `enqueueJob()` — a serial promise chain. This prevents OOM from parallel Claude processes. Max queue depth: 5 (jobs dropped if queue full). `queueDepth` decrements in `finally` block after job completes.

### Delivery
`sendDonna()` sends via Telegram. Short messages (<300 chars) can be sent as voice notes if `DONNA_VOICE_ENABLED=true`. Falls back to text on any failure.

### SKIP Convention
Jobs that find nothing to process return the string "SKIP" — the scheduler logs this and does not send a Telegram message.
