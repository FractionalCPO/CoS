#!/bin/bash
# Donna Scheduler — Uninstall launchd plists
# Unloads and removes all com.donna.* plists

set -e

PLIST_DIR="$HOME/Library/LaunchAgents"

echo "Uninstalling Donna scheduler plists..."

for plist in com.donna.gm com.donna.midday com.donna.eod com.donna.git-sync com.donna.health-check; do
  PLIST_FILE="$PLIST_DIR/$plist.plist"
  if [[ -f "$PLIST_FILE" ]]; then
    launchctl unload "$PLIST_FILE" 2>/dev/null && echo "  [-] Unloaded $plist" || echo "  [!] $plist was not loaded"
    rm -f "$PLIST_FILE"
    echo "  [-] Removed $PLIST_FILE"
  else
    echo "  [~] $plist not found, skipping"
  fi
done

echo ""
echo "Done. Donna scheduler is uninstalled."
echo "Log files preserved at /Users/vahid/code/CoS/scheduler/logs/"
echo "To clean logs: rm -rf /Users/vahid/code/CoS/scheduler/logs/*.log"
