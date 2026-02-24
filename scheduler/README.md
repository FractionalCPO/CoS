# Donna Local Scheduler

Local macOS automation that spawns Claude Code sessions on a schedule. Replaces the stopped Railway donna-server with launchd-based scheduling.

## Architecture

```
scheduler/
├── jobs/               # Executable job scripts
│   ├── gm.sh           # Morning briefing (Claude)
│   ├── midday.sh       # Mid-day inbox + meeting prep (Claude)
│   ├── eod.sh          # End-of-day sweep (Claude) — the big one
│   ├── git-sync.sh     # Hourly git auto-sync (bash only)
│   └── health-check.sh # MCP server health check (bash only)
├── logs/               # Job output logs (date-stamped)
├── install.sh          # Installs launchd plists + loads them
├── uninstall.sh        # Unloads + removes plists
└── README.md           # This file
```

## Schedule

All times are **America/Toronto (ET)**. Claude sessions run Mon-Fri only. Bash jobs run every day.

| Time | Job | Type | Days |
|------|-----|------|------|
| 6:00 AM | `health-check.sh` | Bash | Daily |
| 8:00 AM | `gm.sh` | Claude | Mon-Fri |
| :00 (hourly) | `git-sync.sh` | Bash | Daily |
| 12:30 PM | `midday.sh` | Claude | Mon-Fri |
| 5:30 PM | `eod.sh` | Claude | Mon-Fri |
| 6:00 PM | `health-check.sh` | Bash | Daily |

## Install

```bash
cd /Users/vahid/code/CoS/scheduler
./install.sh
```

This writes 5 plist files to `~/Library/LaunchAgents/` and loads them into launchd.

## Uninstall

```bash
cd /Users/vahid/code/CoS/scheduler
./uninstall.sh
```

Unloads plists and removes them. Log files are preserved.

## Verify

```bash
# Check loaded jobs
launchctl list | grep donna

# Check logs
ls -la /Users/vahid/code/CoS/scheduler/logs/

# Tail a specific log
tail -50 /Users/vahid/code/CoS/scheduler/logs/gm-$(date +%Y-%m-%d).log
```

## Manual trigger

Run any job manually:

```bash
/Users/vahid/code/CoS/scheduler/jobs/gm.sh
/Users/vahid/code/CoS/scheduler/jobs/eod.sh
# etc.
```

## How it works

1. **launchd** triggers the shell script at the scheduled time
2. The script sets PATH, sources `.env`, and creates the log directory
3. For Claude jobs: spawns `claude -p "PROMPT" --output-format text` and captures output to a date-stamped log
4. Sends a macOS notification on completion
5. For bash jobs (git-sync, health-check): runs directly without Claude

## Requirements

- macOS with launchd (standard on all Macs)
- `claude` CLI installed (`~/.local/bin/claude`)
- `/Users/vahid/code/CoS/.env` with all MCP server credentials
- Mac must be awake/logged in for jobs to fire (launchd runs missed jobs on wake)

## Logs

Each job writes to `scheduler/logs/JOBNAME-YYYY-MM-DD.log`. The launchd plists also have separate stdout/stderr logs for debugging launch issues (`*-launchd.log` and `*-launchd-err.log`).

Log cleanup is manual. To purge logs older than 30 days:

```bash
find /Users/vahid/code/CoS/scheduler/logs -name "*.log" -mtime +30 -delete
```

## Troubleshooting

**Job didn't run:**
1. Check if Mac was asleep: launchd will run missed jobs when the Mac wakes
2. Verify plist is loaded: `launchctl list | grep donna`
3. Check launchd error logs: `cat scheduler/logs/*-launchd-err.log`

**Claude session fails:**
1. Check the job log for errors: `cat scheduler/logs/gm-$(date +%Y-%m-%d).log`
2. Verify `.env` is valid: `source .env && echo $NOTION_API_KEY`
3. Run health check: `./scheduler/jobs/health-check.sh`

**Git sync not pushing:**
1. Check SSH keys: `ssh -T git@github.com`
2. Check remote: `git remote -v`
3. Check for conflicts: `git status`
