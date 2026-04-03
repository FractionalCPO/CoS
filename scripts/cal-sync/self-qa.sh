#!/usr/bin/env bash
set -euo pipefail

# Self QA — checks health of cal-sync and habit-defender runs

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TODAY=$(date +%Y-%m-%d)
SYNC_LOG="$SCRIPT_DIR/logs/sync-${TODAY}.log"
HABIT_LOG="$SCRIPT_DIR/logs/habit-${TODAY}.log"
STATE_FILE="$SCRIPT_DIR/state/last-sync.json"
ISSUES=0

status() {
  echo "[QA] $1"
}

check_log_recent() {
  local logfile="$1"
  local label="$2"

  if [[ ! -f "$logfile" ]]; then
    status "✗ $label: log file missing ($logfile)"
    ISSUES=$((ISSUES + 1))
    return
  fi

  # Check if log was modified in last hour (3600 seconds)
  local now=$(date +%s)
  local mod
  if [[ "$(uname)" == "Darwin" ]]; then
    mod=$(stat -f %m "$logfile")
  else
    mod=$(stat -c %Y "$logfile")
  fi
  local age=$(( now - mod ))

  if [[ $age -gt 3600 ]]; then
    status "⚠ $label: last run was $(( age / 60 )) minutes ago"
    ISSUES=$((ISSUES + 1))
  else
    status "✓ $label: ran $(( age / 60 )) minutes ago"
  fi
}

check_log_errors() {
  local logfile="$1"
  local label="$2"

  if [[ ! -f "$logfile" ]]; then
    return
  fi

  local errors=$(grep -c "ERROR\|FAIL\|Failed" "$logfile" 2>/dev/null || echo "0")
  errors=$(echo "$errors" | tr -d '[:space:]')
  if [[ "$errors" -gt 0 ]]; then
    status "⚠ $label: $errors error(s) in log"
    grep -i "ERROR\|FAIL\|Failed" "$logfile" | tail -5 | while read -r line; do
      status "    $line"
    done
    ISSUES=$((ISSUES + 1))
  else
    status "✓ $label: no errors in log"
  fi
}

check_state_file() {
  if [[ ! -f "$STATE_FILE" ]]; then
    status "⚠ State file missing"
    ISSUES=$((ISSUES + 1))
    return
  fi

  if ! jq empty "$STATE_FILE" 2>/dev/null; then
    status "✗ State file is invalid JSON"
    ISSUES=$((ISSUES + 1))
    return
  fi

  local synced=$(jq '.synced_events | length' "$STATE_FILE")
  status "✓ State file OK ($synced events tracked)"
}

echo "==============================="
echo " Cal-Sync Self QA — $TODAY"
echo "==============================="
echo ""

# Check cal-sync
check_log_recent "$SYNC_LOG" "cal-sync"
check_log_errors "$SYNC_LOG" "cal-sync"

echo ""

# Check habit-defender
check_log_recent "$HABIT_LOG" "habit-defender"
check_log_errors "$HABIT_LOG" "habit-defender"

echo ""

# Check state
check_state_file

echo ""
if [[ $ISSUES -gt 0 ]]; then
  echo "Result: $ISSUES issue(s) found"
  exit 1
else
  echo "Result: All healthy ✓"
  exit 0
fi
