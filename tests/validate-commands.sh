#!/bin/bash
# Validation tests for the CoS command system
# Run: bash /Users/vahid/code/CoS/tests/validate-commands.sh
#
# Architecture: Commands live globally at ~/.claude/commands/ (not in CoS).
# CoS repo contains: agents, scripts, goals, cron, hooks, tests.
set -uo pipefail

PASS=0
FAIL=0
WARN=0

pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }
warn() { echo "  WARN: $1"; WARN=$((WARN+1)); }

COS_DIR="/Users/vahid/code/CoS"
CMD_DIR="$HOME/.claude/commands"
AGENT_DIR="$COS_DIR/.claude/agents"
CRON_DIR="$HOME/.claude/cron"
HOOK_DIR="$HOME/.claude/hooks"

# === Canonical DB IDs ===
COMPANIES_ID="5fee82ee-a0e1-41f5-aaca-308e03580182"
PEOPLE_ID="11d6ce8b-a1af-455a-b9c5-d50d1aec5796"
PE_FIRMS_ID="fce2fe71-0d9d-46e1-a23a-d9dc99c056df"
OPPORTUNITIES_ID="de289591-f32a-483d-a51e-6bc158f4173e"
TASKS_ID="bfaf4e0f-1352-40cb-b39e-e441b75c1d96"

echo "=== Command File Structure ==="
for cmd in debrief enrich gm meeting-prep my-tasks retro the-mirror triage health deal-prep warmup obsidian-cleanup; do
  f="$CMD_DIR/$cmd.md"
  if [ ! -f "$f" ]; then
    fail "$cmd.md does not exist at $CMD_DIR/"
    continue
  fi
  # Check required sections
  if grep -q "^## Description\|^## Instructions\|^## Usage\|^## Arguments" "$f"; then
    pass "$cmd.md has description/usage section"
  else
    fail "$cmd.md missing Description or Usage section"
  fi
  if grep -q "^### Step\|^### /" "$f"; then
    pass "$cmd.md has numbered steps"
  else
    warn "$cmd.md has no numbered steps (may be intentional)"
  fi
  # Check for unreplaced placeholders
  if grep -q '{{' "$f"; then
    fail "$cmd.md has unreplaced {{placeholders}}"
  else
    pass "$cmd.md has no unreplaced placeholders"
  fi
  # Check for wrong file paths (~/.claude/my-tasks.yaml or ~/.claude/goals.yaml)
  if grep -q '~/.claude/my-tasks.yaml\|~/.claude/goals.yaml' "$f"; then
    fail "$cmd.md references ~/.claude/ for YAML files (should be $COS_DIR/)"
  else
    pass "$cmd.md YAML paths are correct"
  fi
done

echo ""
echo "=== No Stale CoS Command Copies ==="
if [ -d "$COS_DIR/.claude/commands" ]; then
  count=$(ls "$COS_DIR/.claude/commands/"*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    fail "CoS has $count command files in .claude/commands/ — these shadow global commands. Delete them."
  else
    pass "CoS .claude/commands/ is empty"
  fi
else
  pass "No stale CoS command copies (directory doesn't exist)"
fi

echo ""
echo "=== Agent DB IDs ==="
crm_agent="$AGENT_DIR/crm-updater.md"
if [ -f "$crm_agent" ]; then
  for db_name_id in "Companies:$COMPANIES_ID" "People:$PEOPLE_ID" "PE Firms:$PE_FIRMS_ID" "Opportunities:$OPPORTUNITIES_ID" "Tasks:$TASKS_ID"; do
    db_name="${db_name_id%%:*}"
    db_id="${db_name_id##*:}"
    if grep -q "$db_id" "$crm_agent"; then
      pass "crm-updater.md has $db_name ID ($db_id)"
    else
      fail "crm-updater.md missing $db_name ID ($db_id)"
    fi
  done
else
  fail "crm-updater.md does not exist"
fi

echo ""
echo "=== YAML Validation ==="
for yf in goals.yaml schedules.yaml; do
  full="$COS_DIR/$yf"
  if [ ! -f "$full" ]; then
    fail "$yf does not exist"
    continue
  fi
  # Basic YAML check: no tabs, valid structure
  if grep -P '\t' "$full" > /dev/null 2>&1; then
    fail "$yf contains tabs (YAML uses spaces)"
  else
    pass "$yf has no tabs"
  fi
  # Check it starts with valid YAML (comment or key)
  first_nonblank=$(grep -m1 -v '^$' "$full")
  if echo "$first_nonblank" | grep -qE '^#|^[a-zA-Z_]'; then
    pass "$yf starts with valid YAML"
  else
    fail "$yf may have invalid start: $first_nonblank"
  fi
done

echo ""
echo "=== Cron Scripts ==="
EXPECTED_CRONS="morning-briefing triage task-check enrich-stale research-freshness session-cleanup retro the-mirror"
for cron in $EXPECTED_CRONS; do
  f="$CRON_DIR/$cron.sh"
  if [ ! -f "$f" ]; then
    fail "cron $cron.sh does not exist"
    continue
  fi
  if [ -x "$f" ]; then
    pass "cron $cron.sh is executable"
  else
    fail "cron $cron.sh is NOT executable"
  fi
  # Check for correct --dangerously-skip-permissions (double dash)
  if grep -q 'dangerously-skip-permissions' "$f"; then
    if grep -q '\-\-dangerously-skip-permissions' "$f"; then
      pass "cron $cron.sh uses correct --double-dash flag"
    else
      fail "cron $cron.sh uses SINGLE dash -dangerously-skip-permissions"
    fi
  fi
  # Check for shebang
  if head -1 "$f" | grep -q '^#!/bin/bash'; then
    pass "cron $cron.sh has shebang"
  else
    fail "cron $cron.sh missing shebang"
  fi
done

echo ""
echo "=== Hook Scripts ==="
for hook in context-inject notify-done notion-verify-reminder pre-compact-save session-end-save; do
  f="$HOOK_DIR/$hook.sh"
  if [ ! -f "$f" ]; then
    fail "hook $hook.sh does not exist"
    continue
  fi
  if [ -x "$f" ]; then
    pass "hook $hook.sh is executable"
  else
    fail "hook $hook.sh is NOT executable"
  fi
done

echo ""
echo "=== MCP Tool Name Format ==="
# Check that MCP tool references use the correct prefix format
for f in "$CMD_DIR"/*.md "$AGENT_DIR"/*.md; do
  [ -f "$f" ] || continue
  fname=$(basename "$f")
  # Look for mcp__ references and validate format
  bad_mcp=$(grep -oE 'mcp_[a-zA-Z_]+__[a-zA-Z_]+' "$f" 2>/dev/null | grep -v '^mcp__' || true)
  if [ -n "$bad_mcp" ]; then
    fail "$fname has malformed MCP tool name: $bad_mcp"
  fi
done
# Check known correct tool name patterns appear
for tool_pattern in "mcp__claude_ai_Granola__" "mcp__claude_ai_Fellow_ai__" "mcp__claude_ai_Notion__" "mcp__claude_ai_Clay_earth__"; do
  count=$(grep -rl "$tool_pattern" "$CMD_DIR"/*.md "$AGENT_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    pass "MCP pattern $tool_pattern found in $count files"
  fi
done

echo ""
echo "=== Safety: No Auto-Send ==="
# Only check commands that involve outbound communication
for cmd in deal-prep debrief enrich retro the-mirror triage; do
  f="$CMD_DIR/$cmd.md"
  [ -f "$f" ] || continue
  if grep -qi 'never.*auto.*send\|never send.*without.*approval\|wait for.*approval\|draft.*wait\|NEVER auto-send' "$f"; then
    pass "$cmd.md has message-sending guardrail"
  else
    fail "$cmd.md MISSING message-sending guardrail"
  fi
done

echo ""
echo "=== Notion DB ID Completeness ==="
# Check that all DB ID references use full UUIDs, not truncated
for f in "$CMD_DIR"/*.md; do
  fname=$(basename "$f")
  if grep -oP '`[0-9a-f]{8}`' "$f" > /dev/null 2>&1; then
    fail "$fname has truncated Notion DB IDs (use full UUID)"
  else
    pass "$fname uses full Notion DB IDs"
  fi
done

echo ""
echo "=== Notion DB ID Correctness ==="
# Verify all full UUIDs in commands match canonical IDs
CANONICAL_IDS="$COMPANIES_ID $PEOPLE_ID $PE_FIRMS_ID $OPPORTUNITIES_ID $TASKS_ID 622468d8-a961-4066-b9fe-65c0970a7852"
for f in "$CMD_DIR"/*.md; do
  fname=$(basename "$f")
  for found_id in $(grep -oP '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' "$f" 2>/dev/null | sort -u); do
    matched=false
    for canon in $CANONICAL_IDS; do
      if [ "$found_id" = "$canon" ]; then matched=true; break; fi
    done
    if $matched; then
      pass "$fname ID $found_id matches canonical"
    else
      fail "$fname has UNKNOWN Notion ID: $found_id"
    fi
  done
done

echo ""
echo "=== SOR Compliance ==="
# enrich.md should reference Clay as SOR
if grep -qi 'clay.*SOR\|SOR.*clay\|source of record.*clay\|clay.*source of record' "$CMD_DIR/enrich.md"; then
  pass "enrich.md references Clay as SOR"
else
  fail "enrich.md does not reference Clay as SOR for contacts"
fi
# debrief.md should reference Clay for contact updates
if grep -qi 'clay' "$CMD_DIR/debrief.md"; then
  pass "debrief.md references Clay for contact updates"
else
  fail "debrief.md does not reference Clay for contact updates"
fi
# retro.md should specify local save path in Obsidian
if grep -q 'ops/retros/' "$CMD_DIR/retro.md"; then
  pass "retro.md specifies local save path (ops/retros/)"
else
  fail "retro.md does not specify local save path per SOR"
fi

echo ""
echo "=== No Emojis ==="
for f in "$CMD_DIR"/*.md; do
  fname=$(basename "$f")
  if grep -P '[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]' "$f" > /dev/null 2>&1; then
    fail "$fname contains emoji characters (violates style rules)"
  else
    pass "$fname has no emojis"
  fi
done

echo ""
echo "=== Schedule-Cron Alignment ==="
schedules_file="$COS_DIR/schedules.yaml"
if [ -f "$schedules_file" ]; then
  grep 'script:' "$schedules_file" | sed 's/.*script: *//' | tr -d '"' | while read -r script_path; do
    resolved=$(echo "$script_path" | sed "s|~/|$HOME/|")
    if [ -f "$resolved" ]; then
      pass "schedule script exists: $script_path"
    else
      fail "schedule script MISSING: $script_path"
    fi
  done
fi

echo ""
echo "==============================="
echo "Results: $PASS passed, $FAIL failed, $WARN warnings"
if [ "$FAIL" -gt 0 ]; then
  echo "STATUS: SOME TESTS FAILED"
  exit 1
else
  echo "STATUS: ALL TESTS PASSED"
  exit 0
fi
