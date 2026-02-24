#!/bin/bash
# Donna Scheduler — Install launchd plists
# Creates plist files in ~/Library/LaunchAgents/ and loads them

set -e

PLIST_DIR="$HOME/Library/LaunchAgents"
JOBS_DIR="/Users/vahid/code/CoS/scheduler/jobs"
LOGS_DIR="/Users/vahid/code/CoS/scheduler/logs"

mkdir -p "$PLIST_DIR" "$LOGS_DIR"

echo "Installing Donna scheduler plists..."

# ─── gm.plist (Mon-Fri 8:00 AM) ───

cat > "$PLIST_DIR/com.donna.gm.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.donna.gm</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/vahid/code/CoS/scheduler/jobs/gm.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/vahid/code/CoS</string>
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>2</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>3</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Weekday</key><integer>5</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/gm-launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/gm-launchd-err.log</string>
</dict>
</plist>
PLIST

echo "  [+] com.donna.gm.plist — Mon-Fri 8:00 AM"

# ─── midday.plist (Mon-Fri 12:30 PM) ───

cat > "$PLIST_DIR/com.donna.midday.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.donna.midday</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/vahid/code/CoS/scheduler/jobs/midday.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/vahid/code/CoS</string>
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>12</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>2</integer><key>Hour</key><integer>12</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>3</integer><key>Hour</key><integer>12</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>12</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>5</integer><key>Hour</key><integer>12</integer><key>Minute</key><integer>30</integer></dict>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/midday-launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/midday-launchd-err.log</string>
</dict>
</plist>
PLIST

echo "  [+] com.donna.midday.plist — Mon-Fri 12:30 PM"

# ─── eod.plist (Mon-Fri 5:30 PM) ───

cat > "$PLIST_DIR/com.donna.eod.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.donna.eod</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/vahid/code/CoS/scheduler/jobs/eod.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/vahid/code/CoS</string>
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>2</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>3</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>4</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>30</integer></dict>
        <dict><key>Weekday</key><integer>5</integer><key>Hour</key><integer>17</integer><key>Minute</key><integer>30</integer></dict>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/eod-launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/eod-launchd-err.log</string>
</dict>
</plist>
PLIST

echo "  [+] com.donna.eod.plist — Mon-Fri 5:30 PM"

# ─── git-sync.plist (Every hour, every day) ───

cat > "$PLIST_DIR/com.donna.git-sync.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.donna.git-sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/vahid/code/CoS/scheduler/jobs/git-sync.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/vahid/code/CoS</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/git-sync-launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/git-sync-launchd-err.log</string>
</dict>
</plist>
PLIST

echo "  [+] com.donna.git-sync.plist — Every hour"

# ─── health-check.plist (6:00 AM + 6:00 PM, every day) ───

cat > "$PLIST_DIR/com.donna.health-check.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.donna.health-check</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/vahid/code/CoS/scheduler/jobs/health-check.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/vahid/code/CoS</string>
    <key>StartCalendarInterval</key>
    <array>
        <dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>0</integer></dict>
        <dict><key>Hour</key><integer>18</integer><key>Minute</key><integer>0</integer></dict>
    </array>
    <key>StandardOutPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/health-check-launchd.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/vahid/code/CoS/scheduler/logs/health-check-launchd-err.log</string>
</dict>
</plist>
PLIST

echo "  [+] com.donna.health-check.plist — 6:00 AM + 6:00 PM"

# ─── Load all plists ───

echo ""
echo "Loading plists into launchd..."

for plist in com.donna.gm com.donna.midday com.donna.eod com.donna.git-sync com.donna.health-check; do
  launchctl load "$PLIST_DIR/$plist.plist" 2>/dev/null && echo "  [+] Loaded $plist" || echo "  [!] $plist already loaded or failed"
done

echo ""
echo "Done. Donna scheduler is installed."
echo "  Jobs dir:  /Users/vahid/code/CoS/scheduler/jobs/"
echo "  Logs dir:  /Users/vahid/code/CoS/scheduler/logs/"
echo "  Plists:    ~/Library/LaunchAgents/com.donna.*.plist"
echo ""
echo "To verify: launchctl list | grep donna"
