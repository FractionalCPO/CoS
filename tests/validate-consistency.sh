#!/usr/bin/env bash
# validate-consistency.sh — Cross-system consistency checks for CoS
# Run: bash /Users/vahid/code/CoS/tests/validate-consistency.sh

set -euo pipefail

exec python3 << 'PYEOF'
import yaml
import re
import sys
from pathlib import Path

COS = Path("/Users/vahid/code/CoS")
SCHEDULER = COS / "donna-server/src/scheduler.ts"
SCHEDULES = COS / "schedules.yaml"
SOR = COS / "assets/source-of-record.md"
TASKS = COS / "my-tasks.yaml"
GOALS = COS / "goals.yaml"

PASS = FAIL = WARN = 0

def p(msg):
    global PASS; PASS += 1; print(f"  ✓ {msg}")
def f(msg):
    global FAIL; FAIL += 1; print(f"  ✗ {msg}")
def w(msg):
    global WARN; WARN += 1; print(f"  ⚠ {msg}")

print("=== CoS Consistency Validation ===\n")

# --- 1. YAML syntax ---
print("[1] YAML Syntax")
for fpath in [SCHEDULES, TASKS, GOALS]:
    try:
        yaml.safe_load(fpath.read_text())
        p(f"{fpath.name} — valid YAML")
    except Exception as e:
        f(f"{fpath.name} — invalid YAML: {e}")
print()

# --- 2. Cron expressions cross-check ---
print("[2] Cron Expression Cross-Check")
sched_text = SCHEDULES.read_text()
ts_text = SCHEDULER.read_text()

# Extract full cron expressions from schedules.yaml
yaml_crons = {}
yaml_data = yaml.safe_load(sched_text)
for entry in yaml_data.get("schedules", []):
    cron = entry.get("cron")
    if cron:
        yaml_crons[entry["name"]] = cron

# Extract full cron expressions from scheduler.ts
ts_crons = re.findall(r'cron\.schedule\("([^"]+)"', ts_text)
ts_cron_set = set(ts_crons)

# Identify local-only entries
local_only_names = {e["name"] for e in yaml_data.get("schedules", []) if e.get("location") == "local only (crontab)"}
for name, cron in yaml_crons.items():
    if cron in ts_cron_set:
        p(f"{name}: '{cron}' matches")
    elif name in local_only_names:
        p(f"{name}: '{cron}' local-only (not expected in scheduler.ts)")
    else:
        f(f"{name}: '{cron}' in YAML but not in scheduler.ts")

for cron in ts_cron_set:
    if cron not in yaml_crons.values():
        f(f"Cron '{cron}' in scheduler.ts but not in schedules.yaml")
print()

# --- 3. Calendar-poll entries ---
print("[3] Calendar-Aware Entries")
has_interval = "setInterval" in ts_text
yaml_has_premeet = any(e.get("name") == "Pre-Meeting Refresh" for e in yaml_data.get("schedules", []))
yaml_has_debrief = any(e.get("name") == "Post-Meeting Debrief" for e in yaml_data.get("schedules", []))
if has_interval and yaml_has_premeet and yaml_has_debrief:
    p("Pre-Meeting Refresh + Post-Meeting Debrief: setInterval in TS, trigger entries in YAML")
else:
    f("Calendar-poll mismatch")
print()

# --- 4. Session Cleanup (YAML-only) ---
print("[4] YAML-Only Entries")
yaml_only = [e for e in yaml_data.get("schedules", []) if e.get("location") == "local only (crontab)"]
for e in yaml_only:
    if e["name"] not in ts_text:
        p(f"'{e['name']}' correctly local-only (not in scheduler.ts)")
    else:
        f(f"'{e['name']}' marked local-only but found in scheduler.ts")
print()

# --- 5. SOR compliance ---
print("[5] SOR Compliance")
# Check for prompts that tell the agent to look for email drafts in local files (SOR violation)
# Exclude the self-improvement prompt which references source-of-record.md itself
sor_violations = [line for i, line in enumerate(ts_text.splitlines())
                  if "CoS/assets/" in line and "draft" in line.lower()
                  and "source-of-record" not in line and "SOR compliance" not in line]
if sor_violations:
    f("scheduler.ts references local drafts in CoS/assets/ — SOR for email drafts is Gmail")
else:
    p("No SOR violation for email drafts (should be Gmail)")

if "bfaf4e0f" in ts_text:
    p("Notion Tasks DB ID (bfaf4e0f) referenced in scheduler.ts")
else:
    w("Notion Tasks DB ID not found in scheduler.ts prompts")
print()

# --- 6. Overdue tasks ---
print("[6] Overdue Tasks (due < 2026-02-20)")
TODAY = "2026-02-20"
tasks_data = yaml.safe_load(TASKS.read_text())
overdue_count = 0
for t in tasks_data.get("tasks", []):
    d = t.get("due_date", "")
    s = t.get("status", "")
    if d and str(d) < TODAY and s not in ("complete",):
        f(f"{t['id']}: '{t['title']}' due {d}, status={s}")
        overdue_count += 1
if overdue_count == 0:
    p("No overdue tasks")
print()

# --- 7. Goals progress ---
print("[7] Goals Progress Validation")
goals_data = yaml.safe_load(GOALS.read_text())
all_ok = True
for obj in goals_data.get("objectives", []) + goals_data.get("personal", []):
    prog = obj.get("progress", -1)
    if not (0 <= prog <= 1):
        f(f"{obj['name']}: progress={prog} (must be 0-1)")
        all_ok = False
if all_ok:
    p("All progress values in range [0, 1]")
print()

# --- 8. Goals required fields ---
print("[8] Goals Required Fields")
for obj in goals_data.get("objectives", []):
    missing = [k for k in ("name", "target", "priority", "progress") if k not in obj]
    if missing:
        f(f"Objective '{obj.get('name', '?')}' missing fields: {missing}")
    else:
        p(f"Objective '{obj['name']}' has all required fields")
print()

# --- Summary ---
print("=== Results ===")
print(f"  Passed: {PASS}")
print(f"  Failed: {FAIL}")
print(f"  Warnings: {WARN}")
sys.exit(1 if FAIL > 0 else 0)
PYEOF
