#!/bin/bash
# Donna Scheduler — End-of-Day Sweep
# Runs Mon-Fri at 5:30 PM ET
# This is the most important automated job of the day.

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

cd /Users/vahid/code/CoS || exit 1
source .env

mkdir -p /Users/vahid/code/CoS/scheduler/logs
LOG="/Users/vahid/code/CoS/scheduler/logs/eod-$(date +%Y-%m-%d).log"

echo "=== EOD started at $(date) ===" >> "$LOG"

claude -p "You are Donna, Vahid's AI Chief of Staff. End-of-day sweep. This is the most important automated job of the day. Do ALL of the following:

1. DEBRIEF ALL TODAY'S MEETINGS: Search Fellow and Granola for every meeting that happened today. For each one:
   - Extract action items and decisions
   - Create Notion tasks for any follow-ups
   - Draft follow-up emails where appropriate (save as Gmail drafts, never send)

2. EXECUTE SAFE TASKS: Check my-tasks.yaml and Notion for pending tasks assigned to Donna. Execute anything safe:
   - Research and enrichment (Apollo, Clay, Firecrawl)
   - CRM updates (Notion)
   - Draft writing
   - Do NOT send any messages, do NOT delete anything, do NOT make financial decisions
   - Mark anything needing Vahid as needs_review

3. FINAL INBOX SCAN: Quick check both Gmail accounts. Draft responses for anything urgent that came in this afternoon.

4. SAVE SESSION STATE: Update cos-session-state.md with everything done today and what's pending for tomorrow.

5. PREP TOMORROW: Glance at tomorrow's calendar. Flag any meetings that need significant prep.

Output a summary of everything done." \
  --output-format text --dangerously-skip-permissions >> "$LOG" 2>&1

echo "=== EOD finished at $(date) ===" >> "$LOG"

osascript -e 'display notification "End-of-day sweep complete — check logs" with title "Donna"'
