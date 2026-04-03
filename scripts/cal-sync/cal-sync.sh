#!/usr/bin/env bash
set -euo pipefail

# Calendar Sync — bidirectional sync between work and personal calendars
# Compares events by summary + start time, creates missing ones on the other side

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_FILE="$SCRIPT_DIR/state/last-sync.json"
TODAY=$(date +%Y-%m-%d)
TOMORROW=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d "+1 day" +%Y-%m-%d)
LOG_FILE="$SCRIPT_DIR/logs/sync-${TODAY}.log"
DRY_RUN="${DRY_RUN:-false}"

# Accounts
WORK_ACCOUNT="vahid@fractionalcpo.com"
PERSONAL_ACCOUNT="hi@vahidjozi.com"

# Patterns to skip (Reclaim, busy blocks, focus time)
SKIP_PATTERNS='Busy|Focus Time|^Lunch Break$|^Travel time|^\[Reclaim\]|^Personal commitment$|DEEP WORK / make before you manage'

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" | tee -a "$LOG_FILE"
}

# Initialize state file if missing
if [[ ! -f "$STATE_FILE" ]]; then
  echo '{"synced_events":[]}' > "$STATE_FILE"
fi

log "=== Calendar Sync started (dry_run=$DRY_RUN) ==="

# Fetch events from both calendars for today + tomorrow
FROM="${TODAY}T00:00:00-04:00"
TO="${TOMORROW}T23:59:59-04:00"

log "Fetching work events ($WORK_ACCOUNT) from $FROM to $TO"
WORK_EVENTS=$(source ~/.zshrc && gog calendar events primary \
  --from "$FROM" --to "$TO" \
  --account "$WORK_ACCOUNT" --json 2>/dev/null) || {
  log "ERROR: Failed to fetch work calendar events"
  exit 1
}

log "Fetching personal events ($PERSONAL_ACCOUNT) from $FROM to $TO"
PERSONAL_EVENTS=$(source ~/.zshrc && gog calendar events primary \
  --from "$FROM" --to "$TO" \
  --account "$PERSONAL_ACCOUNT" --json 2>/dev/null) || {
  log "ERROR: Failed to fetch personal calendar events"
  exit 1
}

# Extract event summaries + start times for comparison
# Key = normalized(summary)|startDateTime
normalize_summary() {
  echo "$1" | sed 's/^🛡 //' | sed 's/ *(.*)$//' | tr '[:upper:]' '[:lower:]' | xargs
}

# Build lookup tables: key -> full event json
WORK_KEYS=$(echo "$WORK_EVENTS" | jq -r '.events[]? | "\(.summary // "")|\(.start.dateTime // .start.date // "")"')
PERSONAL_KEYS=$(echo "$PERSONAL_EVENTS" | jq -r '.events[]? | "\(.summary // "")|\(.start.dateTime // .start.date // "")"')

WORK_COUNT=$(echo "$WORK_EVENTS" | jq '.events | length')
PERSONAL_COUNT=$(echo "$PERSONAL_EVENTS" | jq '.events | length')
log "Work calendar: $WORK_COUNT events"
log "Personal calendar: $PERSONAL_COUNT events"

# Load synced state
SYNCED_KEYS=$(jq -r '.synced_events[]?' "$STATE_FILE")

SYNC_COUNT=0
SKIP_COUNT=0

# --- Sync personal → work ---
log "--- Checking personal → work ---"
echo "$PERSONAL_EVENTS" | jq -c '.events[]?' | while IFS= read -r event; do
  summary=$(echo "$event" | jq -r '.summary // ""')
  start=$(echo "$event" | jq -r '.start.dateTime // .start.date // ""')
  end=$(echo "$event" | jq -r '.end.dateTime // .end.date // ""')
  color=$(echo "$event" | jq -r '.colorId // ""')
  location=$(echo "$event" | jq -r '.location // ""')
  desc=$(echo "$event" | jq -r '.description // ""')

  # Skip matching patterns
  if echo "$summary" | grep -qE "$SKIP_PATTERNS"; then
    log "  SKIP (pattern): $summary"
    continue
  fi

  # Skip cancelled
  status=$(echo "$event" | jq -r '.status // "confirmed"')
  if [[ "$status" == "cancelled" ]]; then
    log "  SKIP (cancelled): $summary"
    continue
  fi

  sync_key="p2w|${summary}|${start}"

  # Check if already synced
  if echo "$SYNCED_KEYS" | grep -qF "$sync_key"; then
    log "  SKIP (already synced): $summary @ $start"
    continue
  fi

  # Check if matching event exists on work calendar (by summary + start)
  match=$(echo "$WORK_EVENTS" | jq -r --arg s "$summary" --arg t "$start" \
    '[.events[]? | select(.summary == $s and (.start.dateTime // .start.date) == $t)] | length')

  if [[ "$match" -gt 0 ]]; then
    log "  EXISTS on work: $summary @ $start"
    continue
  fi

  # Also check for "Busy" blocks on work that cover this time (Reclaim synced it)
  busy_match=$(echo "$WORK_EVENTS" | jq -r --arg t "$start" --arg e "$end" \
    '[.events[]? | select(.summary == "Busy" and (.start.dateTime // "") <= $t and (.end.dateTime // "") >= $e)] | length')

  if [[ "$busy_match" -gt 0 ]]; then
    log "  SKIP (Busy block covers): $summary @ $start"
    continue
  fi

  log "  SYNC → work: $summary @ $start (color: ${color:-default})"

  if [[ "$DRY_RUN" == "false" ]]; then
    CREATE_CMD="gog calendar create primary --account $WORK_ACCOUNT --summary \"$summary\" --from \"$start\" --to \"$end\" --force"
    [[ -n "$color" && "$color" != "null" ]] && CREATE_CMD="$CREATE_CMD --event-color $color"
    [[ -n "$location" && "$location" != "null" ]] && CREATE_CMD="$CREATE_CMD --location \"$location\""

    if source ~/.zshrc && eval "$CREATE_CMD" >/dev/null 2>&1; then
      log "    ✓ Created on work calendar"
      # Update state
      jq --arg k "$sync_key" '.synced_events += [$k]' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    else
      log "    ✗ Failed to create on work calendar"
    fi
  fi
done

# --- Sync work → personal ---
log "--- Checking work → personal ---"
echo "$WORK_EVENTS" | jq -c '.events[]?' | while IFS= read -r event; do
  summary=$(echo "$event" | jq -r '.summary // ""')
  start=$(echo "$event" | jq -r '.start.dateTime // .start.date // ""')
  end=$(echo "$event" | jq -r '.end.dateTime // .end.date // ""')
  color=$(echo "$event" | jq -r '.colorId // ""')
  location=$(echo "$event" | jq -r '.location // ""')

  # Skip matching patterns
  if echo "$summary" | grep -qE "$SKIP_PATTERNS"; then
    log "  SKIP (pattern): $summary"
    continue
  fi

  # Skip cancelled
  status=$(echo "$event" | jq -r '.status // "confirmed"')
  if [[ "$status" == "cancelled" ]]; then
    log "  SKIP (cancelled): $summary"
    continue
  fi

  # Skip Busy blocks (Reclaim artifacts)
  if [[ "$summary" == "Busy" ]]; then
    log "  SKIP (Busy block): $summary"
    continue
  fi

  sync_key="w2p|${summary}|${start}"

  # Check if already synced
  if echo "$SYNCED_KEYS" | grep -qF "$sync_key"; then
    log "  SKIP (already synced): $summary @ $start"
    continue
  fi

  # Check if matching event exists on personal calendar
  match=$(echo "$PERSONAL_EVENTS" | jq -r --arg s "$summary" --arg t "$start" \
    '[.events[]? | select(.summary == $s and (.start.dateTime // .start.date) == $t)] | length')

  if [[ "$match" -gt 0 ]]; then
    log "  EXISTS on personal: $summary @ $start"
    continue
  fi

  log "  SYNC → personal: $summary @ $start (color: ${color:-default})"

  if [[ "$DRY_RUN" == "false" ]]; then
    CREATE_CMD="gog calendar create primary --account $PERSONAL_ACCOUNT --summary \"$summary\" --from \"$start\" --to \"$end\" --force"
    [[ -n "$color" && "$color" != "null" ]] && CREATE_CMD="$CREATE_CMD --event-color $color"
    [[ -n "$location" && "$location" != "null" ]] && CREATE_CMD="$CREATE_CMD --location \"$location\""

    if source ~/.zshrc && eval "$CREATE_CMD" >/dev/null 2>&1; then
      log "    ✓ Created on personal calendar"
      jq --arg k "$sync_key" '.synced_events += [$k]' "$STATE_FILE" > "$STATE_FILE.tmp" && mv "$STATE_FILE.tmp" "$STATE_FILE"
    else
      log "    ✗ Failed to create on personal calendar"
    fi
  fi
done

log "=== Calendar Sync completed ==="
