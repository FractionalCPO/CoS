#!/bin/bash
# Donna Scheduler — Self-Healing Health Check
# Runs daily at 6:00 AM and 6:00 PM (every day including weekends)
# No Claude session — pure bash. Fixes what it can, reports what it can't.

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

cd /Users/vahid/code/CoS || exit 1
source .env 2>/dev/null

mkdir -p /Users/vahid/code/CoS/scheduler/logs
LOG="/Users/vahid/code/CoS/scheduler/logs/health-$(date +%Y-%m-%d).log"
ERRORS=""
FIXED=""

echo "=== Health check at $(date) ===" >> "$LOG"

# ─── 1. MCP server binaries (npx cache) ───
NPX_BINS=$(ls ~/.npm/_npx/*/node_modules/.bin/ 2>/dev/null | sort -u)
for cmd in notion-mcp-server firecrawl-mcp apollo-io-mcp gmail-mcp google-calendar-mcp fellow-mcp clay-mcp; do
  if ! echo "$NPX_BINS" | grep -qx "$cmd"; then
    ERRORS+="  MISSING BINARY: $cmd (not in npx cache)\n"
  fi
done

# ─── 2. Environment variables ───
for var in NOTION_API_KEY FIRECRAWL_API_KEY APOLLO_API_KEY GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN_FCPO GOOGLE_REFRESH_TOKEN_HI FELLOW_API_KEY FELLOW_SUBDOMAIN CLAY_API_KEY; do
  if [[ -z "${!var}" ]]; then
    ERRORS+="  MISSING ENV VAR: $var\n"
  fi
done

# ─── 3. .env file exists ───
if [[ ! -f /Users/vahid/code/CoS/.env ]]; then
  ERRORS+="  MISSING: .env file\n"
fi

# ─── 4. Symlinks intact ───
for link in "$HOME/.claude/goals.yaml" "$HOME/.claude/my-tasks.yaml" "$HOME/.claude/schedules.yaml"; do
  if [[ -L "$link" ]]; then
    if [[ ! -e "$link" ]]; then
      ERRORS+="  BROKEN SYMLINK: $link\n"
    fi
  fi
done

# ─── 5. Stale session state (>3 days) ───
STATE_FILE="$HOME/.claude/projects/-Users-vahid-code-CoS/memory/cos-session-state.md"
if [[ -f "$STATE_FILE" ]]; then
  STATE_AGE=$(( ($(date +%s) - $(stat -f %m "$STATE_FILE")) / 86400 ))
  if [[ $STATE_AGE -gt 3 ]]; then
    ERRORS+="  STALE: session state is ${STATE_AGE} days old\n"
  fi
fi

# ─── 6. Stale log cleanup (>7 days) — AUTO-FIX ───
OLD_LOGS=$(find /Users/vahid/code/CoS/scheduler/logs -name "*.log" -mtime +7 2>/dev/null)
if [[ -n "$OLD_LOGS" ]]; then
  COUNT=$(echo "$OLD_LOGS" | wc -l | tr -d ' ')
  rm -f $OLD_LOGS
  FIXED+="  CLEANED: $COUNT log files older than 7 days\n"
fi

# ─── 7. Git state ───
if [[ -d .git ]]; then
  BRANCH=$(git branch --show-current 2>/dev/null)
  if [[ "$BRANCH" != "main" ]]; then
    ERRORS+="  GIT: on branch '$BRANCH' instead of main\n"
  fi
  # Check for merge conflicts
  if git diff --name-only --diff-filter=U 2>/dev/null | grep -q .; then
    ERRORS+="  GIT: unresolved merge conflicts\n"
  fi
fi

# ─── 8. Lock files — AUTO-FIX stale ones ───
for lockfile in /Users/vahid/code/CoS/.git/index.lock /Users/vahid/code/CoS/.git/refs/heads/main.lock; do
  if [[ -f "$lockfile" ]]; then
    LOCK_AGE=$(( ($(date +%s) - $(stat -f %m "$lockfile")) / 60 ))
    if [[ $LOCK_AGE -gt 10 ]]; then
      rm -f "$lockfile"
      FIXED+="  REMOVED: stale lock $lockfile (${LOCK_AGE}min old)\n"
    else
      ERRORS+="  LOCK: $lockfile exists (${LOCK_AGE}min old, too fresh to auto-remove)\n"
    fi
  fi
done

# ─── 9. launchd plists loaded ───
for job in com.donna.gm com.donna.midday com.donna.eod com.donna.git-sync com.donna.health-check; do
  if ! launchctl list "$job" &>/dev/null; then
    # Try to reload
    PLIST="$HOME/Library/LaunchAgents/$job.plist"
    if [[ -f "$PLIST" ]]; then
      launchctl load "$PLIST" 2>/dev/null
      if launchctl list "$job" &>/dev/null; then
        FIXED+="  RELOADED: $job (was unloaded)\n"
      else
        ERRORS+="  LAUNCHD: $job failed to load\n"
      fi
    else
      ERRORS+="  LAUNCHD: $job plist missing\n"
    fi
  fi
done

# ─── 10. Disk space ───
DISK_PCT=$(df -h /Users/vahid | tail -1 | awk '{print $5}' | tr -d '%')
if [[ "$DISK_PCT" -gt 90 ]]; then
  ERRORS+="  DISK: ${DISK_PCT}% full\n"
fi

# ─── Report ───
if [[ -n "$FIXED" ]]; then
  echo "AUTO-FIXED:" >> "$LOG"
  echo -e "$FIXED" >> "$LOG"
fi

if [[ -n "$ERRORS" ]]; then
  echo "ISSUES:" >> "$LOG"
  echo -e "$ERRORS" >> "$LOG"
  osascript -e 'display notification "Health check found issues — check logs" with title "Donna"'
else
  echo "ALL CHECKS PASSED" >> "$LOG"
  if [[ -n "$FIXED" ]]; then
    osascript -e 'display notification "Health check: auto-fixed some issues" with title "Donna"'
  fi
fi

echo "" >> "$LOG"
