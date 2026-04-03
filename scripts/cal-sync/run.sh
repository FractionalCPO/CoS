#!/usr/bin/env bash
set -euo pipefail

# Master runner: cal-sync → habit-defender → self-qa

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse args
DRY_RUN="false"
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="true" ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

export DRY_RUN

echo "╔══════════════════════════════════╗"
echo "║  Cal-Sync + Habit Defender       ║"
echo "║  $(date '+%Y-%m-%d %H:%M:%S')          ║"
[[ "$DRY_RUN" == "true" ]] && echo "║  ⚠  DRY RUN MODE                ║"
echo "╚══════════════════════════════════╝"
echo ""

# Step 1: Calendar Sync
echo "━━━ Step 1: Calendar Sync ━━━"
if ! bash "$SCRIPT_DIR/cal-sync.sh"; then
  echo "✗ cal-sync.sh failed"
  # Continue to QA anyway
fi
echo ""

# Step 2: Habit Defender
echo "━━━ Step 2: Habit Defender ━━━"
if ! bash "$SCRIPT_DIR/habit-defender.sh"; then
  echo "✗ habit-defender.sh failed"
fi
echo ""

# Step 3: Self QA
echo "━━━ Step 3: Self QA ━━━"
bash "$SCRIPT_DIR/self-qa.sh"
QA_EXIT=$?

echo ""
if [[ $QA_EXIT -eq 0 ]]; then
  echo "✅ All systems healthy"
else
  echo "⚠️  Issues detected — check logs"
fi

exit $QA_EXIT
