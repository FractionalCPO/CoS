#!/usr/bin/env bash
set -euo pipefail

# Habit Defender — ensures habit blocks exist on today's calendar
# Reads config.yaml, checks for existing blocks, creates/reschedules as needed

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="$SCRIPT_DIR/config.yaml"
TODAY=$(date +%Y-%m-%d)
DOW=$(date +%u)  # 1=Mon, 7=Sun
LOG_FILE="$SCRIPT_DIR/logs/habit-${TODAY}.log"
DRY_RUN="${DRY_RUN:-false}"

WORK_ACCOUNT="vahid@fractionalcpo.com"
NOW_HOUR=$(date +%-H)
NOW_MIN=$(date +%-M)
NOW_MINUTES=$(( NOW_HOUR * 60 + NOW_MIN ))

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" | tee -a "$LOG_FILE"
}

is_weekday() {
  [[ "$DOW" -le 5 ]]
}

# Parse time string "HH:MM" to minutes since midnight
time_to_min() {
  local h="${1%%:*}"
  local m="${1##*:}"
  echo $(( 10#$h * 60 + 10#$m ))
}

# Minutes to HH:MM
min_to_time() {
  printf "%02d:%02d" $(( $1 / 60 )) $(( $1 % 60 ))
}

log "=== Habit Defender started (dry_run=$DRY_RUN, day=$DOW) ==="

# Fetch today's events from work calendar
FROM="${TODAY}T00:00:00-04:00"
TO="${TODAY}T23:59:59-04:00"

PERSONAL_ACCOUNT="hi@vahidjozi.com"

log "Fetching today's events from $WORK_ACCOUNT"
EVENTS=$(source ~/.zshrc && gog calendar events primary \
  --from "$FROM" --to "$TO" \
  --account "$WORK_ACCOUNT" --json 2>/dev/null) || {
  log "ERROR: Failed to fetch work calendar events"
  exit 1
}

log "Fetching today's events from $PERSONAL_ACCOUNT"
PERSONAL_EVENTS=$(source ~/.zshrc && gog calendar events primary \
  --from "$FROM" --to "$TO" \
  --account "$PERSONAL_ACCOUNT" --json 2>/dev/null) || {
  log "WARNING: Failed to fetch personal calendar events, continuing with work only"
  PERSONAL_EVENTS='{"events":[]}'
}

# Merge both calendars for habit detection
ALL_EVENTS=$(echo "$EVENTS $PERSONAL_EVENTS" | jq -s '{"events": ([.[0].events[]?] + [.[1].events[]?])}')

EVENT_COUNT=$(echo "$EVENTS" | jq '.events | length')
PERSONAL_COUNT=$(echo "$PERSONAL_EVENTS" | jq '.events | length')
log "Found $EVENT_COUNT work events + $PERSONAL_COUNT personal events today"

# Build busy slots array: [{start_min, end_min, summary}]
BUSY_SLOTS=$(echo "$EVENTS" | jq -r '[.events[]? | {
  summary: (.summary // ""),
  start_min: ((.start.dateTime // "") | if . != "" then (split("T")[1] | split("-")[0] | split("+")[0] | split(":") | (.[0] | tonumber) * 60 + (.[1] | tonumber)) else 0 end),
  end_min: ((.end.dateTime // "") | if . != "" then (split("T")[1] | split("-")[0] | split("+")[0] | split(":") | (.[0] | tonumber) * 60 + (.[1] | tonumber)) else 0 end)
}]')

# Check if a time slot is free (checks both existing calendar events AND newly created slots)
# Args: start_minutes, duration_minutes
# Returns 0 if free, 1 if busy
is_slot_free() {
  local slot_start=$1
  local slot_duration=$2
  local slot_end=$(( slot_start + slot_duration ))

  # Check against existing calendar events
  local cal_conflicts=$(echo "$BUSY_SLOTS" | jq --argjson s "$slot_start" --argjson e "$slot_end" \
    '[.[] | select(.start_min < $e and .end_min > $s)] | length')

  # Check against slots we've created in this run
  local created_conflicts=$(echo "$CREATED_SLOTS" | jq --argjson s "$slot_start" --argjson e "$slot_end" \
    '[.[] | select(.start_min < $e and .end_min > $s)] | length')

  [[ "$cal_conflicts" -eq 0 && "$created_conflicts" -eq 0 ]]
}

# Find next available slot after a given time
# Args: after_minutes, duration_minutes, before_minutes (end of day limit)
find_next_slot() {
  local after=$1
  local duration=$2
  local before=${3:-1080}  # default: 18:00

  local candidate=$after
  while [[ $candidate -lt $before ]]; do
    if is_slot_free "$candidate" "$duration"; then
      echo "$candidate"
      return 0
    fi
    candidate=$(( candidate + 15 ))  # try every 15 min
  done
  return 1
}

# Check if a habit event already exists (by name pattern or Reclaim equivalent)
habit_exists() {
  local name="$1"
  # Strip emoji prefix for broader matching (use perl for unicode support)
  local stripped=$(echo "$name" | perl -CSD -pe 's/^\X //; s/^\s+//')
  
  # Check by summary match (exact, with 🛡 prefix, with ✅ prefix, or substring)
  # Search BOTH work and personal calendars
  local by_name=$(echo "$ALL_EVENTS" | jq -r --arg n "$name" --arg s "$stripped" \
    '[.events[]? | select(
      .summary == $n or 
      (.summary | contains($n)) or 
      (.summary | contains($s)) or 
      (.summary | contains("🛡 " + $n)) or
      (.summary | contains("🛡 " + $s)) or
      (.summary | contains("✅ " + $n)) or
      (.summary | contains("✅ " + $s))
    )] | length')
  
  # Also check for Reclaim habit events (they have reclaim.assist=true in extended props)
  # and map their subType to our habit names
  local reclaim_match=0
  case "$stripped" in
    *[Ll]unch*)
      reclaim_match=$(echo "$ALL_EVENTS" | jq '[.events[]? | select(
        .extendedProperties?.private?["reclaim.event.subType"] == "LUNCH"
      )] | length')
      ;;
    *[Ii]nbox*)
      reclaim_match=$(echo "$ALL_EVENTS" | jq '[.events[]? | select(
        (.summary | test("inbox"; "i"))
      )] | length')
      ;;
    *[Dd]eep*[Ww]ork*)
      reclaim_match=$(echo "$ALL_EVENTS" | jq '[.events[]? | select(
        (.summary | test("DEEP WORK"; "i")) or
        (.summary | test("deep work"; "i"))
      )] | length')
      ;;
  esac
  
  echo $(( by_name + reclaim_match ))
}

# Define habits inline (parsing YAML with bash is fragile, so we hardcode from config)
# Format: key|name|preferred_time|duration|priority|color|weekdays_only
HABITS=(
  "morning_walk|🚶 Morning Walk|07:30|30|1||false"
  "deep_work|🧠 Deep Work|09:00|180|2|9|true"
  "lunch|🌮 Lunch|12:00|30|3|6|true"
  "inbox_zero|📨 Inbox Zero|12:30|30|4|2|true"
)

# Track newly created slots to prevent overlaps within same run
CREATED_SLOTS="[]"

for habit_def in "${HABITS[@]}"; do
  IFS='|' read -r key name pref_time duration priority color weekdays_only <<< "$habit_def"

  # Skip weekday-only habits on weekends
  if [[ "$weekdays_only" == "true" ]] && ! is_weekday; then
    log "  SKIP (weekend): $name"
    continue
  fi

  pref_min=$(time_to_min "$pref_time")
  end_time_min=$(( pref_min + duration ))

  # Check if habit already exists
  existing=$(habit_exists "$name")
  if [[ "$existing" -gt 0 ]]; then
    log "  EXISTS: $name (found $existing matching events)"
    continue
  fi

  log "  MISSING: $name (preferred: $pref_time, ${duration}min)"

  # Try preferred slot first
  if is_slot_free "$pref_min" "$duration"; then
    slot_start=$pref_min
    log "    Preferred slot available: $(min_to_time $slot_start)"
  else
    # Find next available slot (search from preferred time or now, whichever is later)
    search_from=$pref_min
    [[ $NOW_MINUTES -gt $pref_min ]] && search_from=$NOW_MINUTES

    slot_start=$(find_next_slot "$search_from" "$duration") || {
      log "    ✗ No available slot found for $name today"
      continue
    }
    log "    Rescheduled to: $(min_to_time $slot_start)"
  fi

  # Build RFC3339 times
  slot_start_time=$(min_to_time "$slot_start")
  slot_end_min=$(( slot_start + duration ))
  slot_end_time=$(min_to_time "$slot_end_min")

  START_RFC="${TODAY}T${slot_start_time}:00-04:00"
  END_RFC="${TODAY}T${slot_end_time}:00-04:00"

  if [[ "$DRY_RUN" == "true" ]]; then
    log "    DRY RUN: Would create '$name' from $START_RFC to $END_RFC (color: ${color:-default})"
    # Track the slot in dry run too to prevent overlaps
    CREATED_SLOTS=$(echo "$CREATED_SLOTS" | jq --argjson s "$slot_start" --argjson e "$slot_end_min" --arg n "$name" \
      '. += [{"start_min": $s, "end_min": $e, "summary": $n}]')
  else
    CREATE_CMD="gog calendar create primary --account $WORK_ACCOUNT --summary \"$name\" --from \"$START_RFC\" --to \"$END_RFC\" --force"
    [[ -n "$color" ]] && CREATE_CMD="$CREATE_CMD --event-color $color"

    if source ~/.zshrc && eval "$CREATE_CMD" >/dev/null 2>&1; then
      log "    ✓ Created: $name @ $slot_start_time"
      # Track the slot we just created to prevent overlaps
      CREATED_SLOTS=$(echo "$CREATED_SLOTS" | jq --argjson s "$slot_start" --argjson e "$slot_end_min" --arg n "$name" \
        '. += [{"start_min": $s, "end_min": $e, "summary": $n}]')
    else
      log "    ✗ Failed to create: $name"
    fi
  fi
done

log "=== Habit Defender completed ==="
