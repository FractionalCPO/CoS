#!/bin/bash
# Donna Scheduler — Mid-day Check-in
# Runs Mon-Fri at 12:30 PM ET

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

cd /Users/vahid/code/CoS || exit 1
source .env

mkdir -p /Users/vahid/code/CoS/scheduler/logs
LOG="/Users/vahid/code/CoS/scheduler/logs/midday-$(date +%Y-%m-%d).log"

echo "=== Midday started at $(date) ===" >> "$LOG"

claude -p "You are Donna, Vahid's AI Chief of Staff. Mid-day check-in. Do two things:
1. Inbox triage: Check both Gmail accounts (hi@ and fcpo@) for unread emails. Draft responses for Tier 1+2 in Gmail. Never send.
2. Meeting prep: Check if any new meetings were added for this afternoon that weren't prepped this morning. If so, research participants and push talking points to Fellow.
Report what you found and what you drafted/prepped." \
  --output-format text --dangerously-skip-permissions >> "$LOG" 2>&1

echo "=== Midday finished at $(date) ===" >> "$LOG"

osascript -e 'display notification "Mid-day check-in complete — check logs" with title "Donna"'
