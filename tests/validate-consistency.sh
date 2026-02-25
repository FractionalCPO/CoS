#!/usr/bin/env bash
# validate-consistency.sh — Cross-system consistency checks for CoS
# Run: bash /Users/vahid/code/CoS/tests/validate-consistency.sh

set -euo pipefail

exec python3 << 'PYEOF'
import yaml
import re
import json
import sys
from pathlib import Path

COS = Path("/Users/vahid/code/CoS")
CRON = COS / "donna-server/src/cron.ts"
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

# --- 2. Schedule cross-check (schedules.yaml vs cron.ts SCHEDULE array) ---
print("[2] Schedule Cross-Check")
if not CRON.exists():
    w("donna-server/src/cron.ts not found (gitignored or Railway deleted) — skipping schedule cross-check")
else:
    sched_text = SCHEDULES.read_text()
    cron_text = CRON.read_text()

    yaml_data = yaml.safe_load(sched_text)

    # Normalize: "Morning Briefing" -> "morningbriefing", "morningBriefing" -> "morningbriefing"
    def normalize(name):
        return re.sub(r'[\s_-]+', '', name).lower()

    yaml_jobs = {normalize(e["name"]): e["name"] for e in yaml_data.get("schedules", [])}

    # Extract job names from cron.ts SCHEDULE array
    cron_raw = re.findall(r'name:\s*"([^"]+)"', cron_text)
    cron_jobs = {normalize(n): n for n in cron_raw}

    # Git Auto-Sync is handled by git-sync.ts, not in SCHEDULE array
    yaml_jobs.pop(normalize("Git Auto-Sync"), None)

    matched = set()
    for norm, display in sorted(yaml_jobs.items()):
        if norm in cron_jobs:
            p(f"{display}: present in both (cron.ts: {cron_jobs[norm]})")
            matched.add(norm)
        else:
            w(f"{display}: in schedules.yaml but not in cron.ts SCHEDULE")

    for norm, name in sorted(cron_jobs.items()):
        if norm not in matched:
            f(f"{name}: in cron.ts but not in schedules.yaml")
print()

# --- 3. SOR compliance ---
print("[3] SOR Compliance")
if not CRON.exists():
    w("donna-server/src/cron.ts not found — skipping SOR compliance check")
else:
    cron_text_sor = CRON.read_text()
    sor_violations = [line for line in cron_text_sor.splitlines()
                      if "CoS/assets/" in line and "draft" in line.lower()
                      and "source-of-record" not in line and "SOR compliance" not in line]
    if sor_violations:
        f("cron.ts references local drafts in CoS/assets/ — SOR for email drafts is Gmail")
    else:
        p("No SOR violation for email drafts (should be Gmail)")
print()

# --- 4. Stale references ---
print("[4] Stale Reference Check")
stale_files = ["scheduler.ts", "donna-relay", "self-improvement"]
# Files allowed to reference stale names (historical context)
HISTORY_FILES = {"ARCHITECTURE-HISTORY.md", "setup-backlog.md"}
REPORT_PREFIXES = ("qa-report",)
all_docs = list((COS / "docs").glob("*.md")) + list((COS / "assets").glob("*.md"))
found_stale = False
for doc in all_docs:
    if doc.name in HISTORY_FILES or any(doc.name.startswith(p) for p in REPORT_PREFIXES):
        continue
    text = doc.read_text()
    for stale in stale_files:
        if stale in text:
            f(f"{doc.name} references '{stale}' (deleted)")
            found_stale = True
if not found_stale:
    p("No stale references to deleted files")
print()

# --- 5. Overdue tasks ---
from datetime import date
TODAY = str(date.today())
print(f"[5] Overdue Tasks (due < {TODAY})")
tasks_data = yaml.safe_load(TASKS.read_text())
overdue_count = 0
for t in tasks_data.get("tasks", []):
    d = t.get("due_date", "")
    s = t.get("status", "")
    if d and str(d) < TODAY and s not in ("complete",):
        w(f"{t['id']}: '{t['title']}' due {d}, status={s}")
        overdue_count += 1
if overdue_count == 0:
    p("No overdue tasks")
print()

# --- 6. Goals progress ---
print("[6] Goals Progress Validation")
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

# --- 7. Goals required fields ---
print("[7] Goals Required Fields")
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
