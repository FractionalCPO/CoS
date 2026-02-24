#!/bin/bash
# Donna Scheduler — Morning Briefing
# Runs Mon-Fri at 8:00 AM ET

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

cd /Users/vahid/code/CoS || exit 1
source .env

mkdir -p /Users/vahid/code/CoS/scheduler/logs
LOG="/Users/vahid/code/CoS/scheduler/logs/gm-$(date +%Y-%m-%d).log"

echo "=== GM started at $(date) ===" >> "$LOG"

claude -p "You are Donna, Vahid's AI Chief of Staff. Run the /gm morning briefing skill. This is an automated scheduled run — output the full briefing including calendar, tasks, goals check, and prep talking points for every meeting today. Push talking points to Fellow. Be thorough but concise." \
  --output-format text --dangerously-skip-permissions >> "$LOG" 2>&1

echo "=== GM finished at $(date) ===" >> "$LOG"

osascript -e 'display notification "Morning briefing complete — check logs" with title "Donna"'
