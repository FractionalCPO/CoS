#!/bin/bash
# Donna Scheduler — Git Auto-Sync
# Runs every hour, every day (including weekends)
# No Claude session — pure bash

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.local/bin:$PATH"

cd /Users/vahid/code/CoS || exit 1

if [[ -n $(git status --porcelain) ]]; then
  git add -A
  git commit -m "auto-sync: $(date +%Y-%m-%d\ %H:%M)"
  git push origin main
fi
