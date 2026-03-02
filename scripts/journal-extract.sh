#!/bin/bash
# journal-extract.sh — Extract actionable items from recent journal entries
# Runs twice daily via launchd (10am + 6pm). Uses Claude CLI for AI extraction.
# Writes to donna/inbox.md which syncs to Mac Mini via Obsidian Sync.
#
# Usage:
#   ./journal-extract.sh              # process today + yesterday
#   ./journal-extract.sh 2026-02-27   # process specific date + day before (for testing)

set -euo pipefail

VAULT="/Users/vahid/Obsidian/vivo"
JOURNAL_DIR="$VAULT/📓 journal"
INBOX="$VAULT/⚙️ ops/🤖 donna/inbox.md"
LOG="/tmp/journal-extract.log"
CLAUDE="/Users/vahid/.local/bin/claude"

# Accept optional date override for testing
TODAY=${1:-$(date +%Y-%m-%d)}
YESTERDAY=$(date -j -f "%Y-%m-%d" "$TODAY" -v-1d +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d)
ACTUAL_DATE=$(date +%Y-%m-%d)
RUN_KEY="${YESTERDAY}..${TODAY}"

log() { echo "[$(date '+%Y-%m-%d %H:%M')] $1" >> "$LOG"; }

log "Starting journal extraction ($RUN_KEY)"

# Collect recent journal entries (today + yesterday)
ENTRIES=""
for DATE in "$YESTERDAY" "$TODAY"; do
  FILE="$JOURNAL_DIR/$DATE.md"
  if [ -f "$FILE" ]; then
    CONTENT=$(cat "$FILE")
    if [ -n "$CONTENT" ]; then
      ENTRIES="${ENTRIES}

--- ${DATE} ---
${CONTENT}"
    fi
  fi
done

if [ -z "$ENTRIES" ]; then
  log "No recent journal entries found. Exiting."
  exit 0
fi

# Check if we already extracted for this date range
if grep -qF "Journal Extraction.*${RUN_KEY}" "$INBOX" 2>/dev/null; then
  log "Already extracted for $RUN_KEY. Skipping."
  exit 0
fi

# Write prompt to temp file to avoid shell escaping issues
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT

cat > "$TMPFILE" << 'PROMPT_END'
Extract actionable items from these journal entries. Rules:
- Only extract genuine tasks, todos, decisions, or action items
- Skip reflections, observations, gratitudes, affirmations
- Skip items that are clearly already done (checked boxes)
- For each item output a markdown bullet with:
  - What needs to be done (imperative form, 1 sentence)
  - Source date in parentheses
- If no actionable items found, output exactly: NO_NEW_ITEMS
- Keep it concise — max 10 items
- Do NOT include any preamble or explanation, just the bullet list

Journal entries:
PROMPT_END

echo "$ENTRIES" >> "$TMPFILE"

# Call Claude CLI (Haiku for speed + cost)
EXTRACTED=$("$CLAUDE" -p --model haiku < "$TMPFILE" 2>/dev/null) || {
  log "ERROR: Claude CLI failed (exit $?)"
  exit 1
}

if [ -z "$EXTRACTED" ] || echo "$EXTRACTED" | grep -q "NO_NEW_ITEMS"; then
  log "No actionable items extracted."
  exit 0
fi

# Append to inbox
{
  echo ""
  echo "## ${ACTUAL_DATE} — Journal Extraction (auto, ${RUN_KEY})"
  echo ""
  echo "$EXTRACTED"
  echo ""
} >> "$INBOX"

log "Extracted items appended to inbox.md"
log "Done"
