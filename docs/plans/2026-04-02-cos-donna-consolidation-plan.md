# CoS/Donna Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate all CoS/Donna config duplication. Single source of truth on Mac Mini. MBP becomes thin client.

**Architecture:** CoS repo on Mac Mini is the canonical config. OpenClaw workspace files merge into CoS/donna/. OpenClaw workspace keeps only runtime state. MBP loses its CoS clone entirely; MCP servers move to global config. All cron jobs move to Mini.

**Tech Stack:** Git, SSH (MBP → Mini via `ssh claw`), OpenClaw cron API, macOS launchd, Claude Code MCP config

**Machines:**
- MBP = `/Users/vahid/` (Vahid's laptop)
- Mini = `/Users/claw/` (Mac Mini, accessed via `ssh claw`)

---

### Task 1: Create rollback checkpoints on both machines

**Step 1: Tag CoS repo on MBP**
```bash
cd /Users/vahid/code/CoS
git add -A && git status
# If any uncommitted changes, commit them first:
git commit -m "pre-consolidation snapshot"
git tag pre-consolidation-2026-04-02
git push origin main --tags
```

**Step 2: Ensure Mini has latest**
```bash
ssh claw "cd ~/code/CoS && git pull --ff-only"
```

**Step 3: Backup OpenClaw workspace on Mini**
```bash
ssh claw "tar czf ~/.openclaw/workspace-backup-2026-04-02.tar.gz -C ~/.openclaw workspace/"
```

**Step 4: Export OpenClaw cron jobs**
```bash
ssh claw "cp ~/.openclaw/cron/jobs.json ~/.openclaw/cron/jobs-backup-2026-04-02.json"
```

**Step 5: Backup MBP crontab**
```bash
crontab -l > ~/.claude/cron/crontab-backup-2026-04-02.txt
```

**Step 6: Verify all backups exist**
```bash
# MBP
ls -la ~/.claude/cron/crontab-backup-2026-04-02.txt
git -C /Users/vahid/code/CoS tag -l | grep pre-consolidation

# Mini
ssh claw "ls -la ~/.openclaw/workspace-backup-2026-04-02.tar.gz ~/.openclaw/cron/jobs-backup-2026-04-02.json"
```
Expected: all 4 backup files exist, git tag exists.

**Step 7: Commit checkpoint**
No commit needed — this is pre-work.

---

### Task 2: Remove dead code from CoS repo

All work on MBP in `/Users/vahid/code/CoS/`.

**Step 1: Remove donna-server (separate git repo, preserved on GitHub)**
```bash
cd /Users/vahid/code/CoS
rm -rf donna-server/
```

**Step 2: Remove dead files**
```bash
rm -f schedules.yaml
rm -rf planning/
```

**Step 3: Remove scheduler directory (only git-sync was active, no longer needed)**
```bash
# First disable the launchd job
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.donna.git-sync.plist 2>/dev/null || true
rm -f ~/Library/LaunchAgents/com.donna.git-sync.plist
rm -rf scheduler/
```

**Step 4: Remove whatsapp-mcp (separate git repo, preserved on GitHub)**
```bash
rm -rf whatsapp-mcp/
```

**Step 5: Remove CoS-specific .claude directory (agents move to global)**
```bash
# Check what's in there first
ls -la .claude/agents/
# These are: crm-updater.md, deal-prep.md, deck-builder.md, meeting-prep.md
# Move useful ones to global agents dir, then remove
cp .claude/agents/*.md ~/.claude/agents/ 2>/dev/null || true
rm -rf .claude/
```

**Step 6: Verify**
```bash
ls /Users/vahid/code/CoS/
```
Expected remaining: assets/, docs/, goals.yaml, node_modules/, package.json, package-lock.json, scripts/, tests/, tools/, .git/, .gitignore, .mcp.json, CLAUDE.md, LICENSE, README.md

**Step 7: Commit**
```bash
cd /Users/vahid/code/CoS
git add -A
git commit -m "Remove dead code: donna-server, scheduler, schedules.yaml, planning, whatsapp-mcp

Consolidation Phase 2: these are all preserved on GitHub as separate repos
or are superseded by OpenClaw. See docs/plans/2026-04-02-cos-donna-consolidation-design.md"
```

---

### Task 3: Create donna/ directory and merge OpenClaw config into CoS

**Step 1: Create donna/ structure in CoS**
```bash
cd /Users/vahid/code/CoS
mkdir -p donna/skills
```

**Step 2: Copy config files from Mini OpenClaw workspace → CoS/donna/**
```bash
# Copy the 5 config files (not MEMORY.md — that's runtime)
scp claw:~/.openclaw/workspace/SOUL.md donna/soul.md
scp claw:~/.openclaw/workspace/AGENTS.md donna/agents.md
scp claw:~/.openclaw/workspace/TOOLS.md donna/tools.md
scp claw:~/.openclaw/workspace/ROUTINES.md donna/routines.md
scp claw:~/.openclaw/workspace/HEARTBEAT.md donna/heartbeat.md
```

**Step 3: Absorb IDENTITY.md into soul.md**

IDENTITY.md is 7 lines. Append its unique content (creature, vibe, emoji) to the top of donna/soul.md under the Identity section. Then verify the identity info is fully captured.

**Step 4: Copy skills from Mini**
```bash
scp -r claw:~/.openclaw/workspace/skills/* donna/skills/
```

**Step 5: Merge scripts**

Mini has: `cal-sync`, `fellow-login.js`, `fellow-write.js`, `session-summarizer.py`
CoS already has: `scripts/fellow-write.js`, `scripts/fellow-login.js`

Check if Mini versions are newer/different:
```bash
diff <(ssh claw "cat ~/.openclaw/workspace/scripts/fellow-write.js") scripts/fellow-write.js
diff <(ssh claw "cat ~/.openclaw/workspace/scripts/fellow-login.js") scripts/fellow-login.js
```

If Mini versions are newer, overwrite CoS versions. Copy cal-sync and session-summarizer.py to scripts/:
```bash
scp claw:~/.openclaw/workspace/scripts/cal-sync scripts/
scp claw:~/.openclaw/workspace/scripts/session-summarizer.py scripts/
```

**Step 6: Update internal path references within donna/ files**

In all donna/*.md files, replace:
- `/Users/claw/.openclaw/workspace/SOUL.md` → `/Users/claw/code/CoS/donna/soul.md`
- `/Users/claw/.openclaw/workspace/AGENTS.md` → `/Users/claw/code/CoS/donna/agents.md`
- `/Users/claw/.openclaw/workspace/TOOLS.md` → `/Users/claw/code/CoS/donna/tools.md`
- `/Users/claw/.openclaw/workspace/ROUTINES.md` → `/Users/claw/code/CoS/donna/routines.md`
- `/Users/claw/.openclaw/workspace/HEARTBEAT.md` → `/Users/claw/code/CoS/donna/heartbeat.md`
- `/Users/claw/.openclaw/workspace/scripts/` → `/Users/claw/code/CoS/scripts/`
- `/Users/claw/.openclaw/workspace/skills/` → `/Users/claw/code/CoS/donna/skills/`

Paths that should NOT change (runtime state stays in workspace):
- `/Users/claw/.openclaw/workspace/vault/` — keep as-is
- `/Users/claw/.openclaw/workspace/memory/` — keep as-is
- `/Users/claw/.openclaw/workspace/MEMORY.md` — keep as-is

Also remove references to USER.md (content absorbed into global CLAUDE.md and donna/soul.md).

**Step 7: Remove donna/agents.md boot instructions that reference deleted files**

The current AGENTS.md says "read SOUL.md, USER.md, memory/YYYY-MM-DD.md". Update to:
1. Read `/Users/claw/code/CoS/donna/soul.md`
2. Read `/Users/claw/code/CoS/donna/tools.md`
3. Read runtime memory from `/Users/claw/.openclaw/workspace/memory/YYYY-MM-DD.md`
4. If in main session: also read `/Users/claw/.openclaw/workspace/MEMORY.md`

Remove reference to USER.md entirely.

**Step 8: Update donna/tools.md repo references**

The TOOLS.md references stale repo names on Mini. Update:
- `fractionalcpo-website` → `fcpo-websites` (or note it needs re-cloning)
- `iran-war-tracker` → `warmap`
- Remove `ux-tear-down` reference if no longer active
- Ensure all `~/code/` paths are correct for Mini

**Step 9: Verify donna/ structure**
```bash
find donna/ -type f | sort
```
Expected: soul.md, agents.md, tools.md, routines.md, heartbeat.md, skills/*/SKILL.md (14 skills)

**Step 10: Commit**
```bash
cd /Users/vahid/code/CoS
git add -A
git commit -m "Add donna/ directory: merge OpenClaw workspace config into CoS

Single source of truth for Donna's behavior. Config files (soul, agents,
tools, routines, skills) now live in git. Runtime state (memory, vault)
stays in OpenClaw workspace."
```

---

### Task 4: Update CoS CLAUDE.md for new structure

**Step 1: Rewrite CoS/CLAUDE.md**

The current CLAUDE.md is MBP-centric (references local MCP wrappers, local paths). Rewrite to serve as the shared config for BOTH machines:

Key changes:
- Remove MBP-specific MCP server section (moving to global ~/.claude.json)
- Add donna/ section pointing to the new config files
- Update file path references throughout
- Keep: Always-On Responsibilities, Hard Rules, Source Routing, Context & Memory Files sections
- Remove: references to deleted directories (scheduler, donna-server, whatsapp-mcp)
- Update assets paths to be relative (work on both machines)

**Step 2: Verify no stale paths remain**
```bash
grep -n "donna-server\|scheduler\|schedules.yaml\|whatsapp-mcp\|planning/" CLAUDE.md
```
Expected: no matches

**Step 3: Commit**
```bash
git add CLAUDE.md
git commit -m "Update CLAUDE.md for consolidated structure

Remove MBP-specific config, add donna/ references, remove dead paths"
```

---

### Task 5: Push to GitHub and update Mini

**Step 1: Push all changes**
```bash
cd /Users/vahid/code/CoS
git push origin main
```

**Step 2: Pull on Mini**
```bash
ssh claw "cd ~/code/CoS && git pull --ff-only"
```

**Step 3: Verify donna/ exists on Mini**
```bash
ssh claw "ls ~/code/CoS/donna/"
```
Expected: soul.md, agents.md, tools.md, routines.md, heartbeat.md, skills/

**Step 4: Create thin BOOT.md in OpenClaw workspace**

SSH to Mini and create the file:
```bash
ssh claw "cat > ~/.openclaw/workspace/BOOT.md << 'BOOTEOF'
# Donna Boot Instructions

Config lives in the CoS repo. Runtime state lives here.

## On Every Session Start
1. Read /Users/claw/code/CoS/donna/soul.md (identity + voice)
2. Read /Users/claw/code/CoS/donna/agents.md (responsibilities + protocols)
3. Read /Users/claw/code/CoS/donna/tools.md (available tools + channels)
4. Read today's memory: /Users/claw/.openclaw/workspace/memory/YYYY-MM-DD.md
5. If MAIN SESSION: also read /Users/claw/.openclaw/workspace/MEMORY.md

## For Cron Sessions
- Read /Users/claw/code/CoS/donna/routines.md for playbook
- Write runtime output to /Users/claw/.openclaw/workspace/ (memory/, vault/)

## Config Updates
Config is git-managed. To update Donna's behavior:
1. Edit files in /Users/claw/code/CoS/donna/
2. git commit + push
3. Changes take effect next session
BOOTEOF"
```

**Step 5: Remove old config files from OpenClaw workspace**
```bash
ssh claw "cd ~/.openclaw/workspace && rm -f SOUL.md AGENTS.md TOOLS.md ROUTINES.md USER.md IDENTITY.md HEARTBEAT.md"
```

Keep: BOOT.md (new), MEMORY.md (runtime), memory/ (runtime), vault/ (runtime), docs/, reference-books/, scripts/ (will be removed after verifying CoS/scripts/ has everything), tests/, skills/ (will be removed after verifying CoS/donna/skills/ has everything)

**Step 6: Verify workspace is now thin**
```bash
ssh claw "ls ~/.openclaw/workspace/"
```
Expected: BOOT.md, MEMORY.md, memory/, vault/, docs/, reference-books/, scripts/, tests/, skills/ (last 4 to be cleaned in a later pass)

**Step 7: Tag checkpoint**
```bash
cd /Users/vahid/code/CoS
git tag post-merge-2026-04-02
git push origin --tags
```

---

### Task 6: Update OpenClaw cron job prompts on Mini

All 9 cron jobs reference workspace config files. Update them to read from CoS.

**Step 1: Export current jobs for reference**
```bash
ssh claw "cat ~/.openclaw/cron/jobs.json" > /tmp/openclaw-jobs-current.json
```

**Step 2: Update morning-briefing prompt**

Change: `read ROUTINES.md for your full playbook`
To: `read /Users/claw/code/CoS/donna/routines.md for your full playbook`

Use OpenClaw API or direct JSON edit:
```bash
ssh claw "cd ~/.openclaw && python3 -c \"
import json
with open('cron/jobs.json') as f:
    data = json.load(f)
for job in data['jobs']:
    if job['name'] == 'morning-briefing':
        job['payload']['message'] = job['payload']['message'].replace(
            'read ROUTINES.md',
            'read /Users/claw/code/CoS/donna/routines.md'
        )
with open('cron/jobs.json', 'w') as f:
    json.dump(data, f, indent=2)
\""
```

**Step 3: Update evening-debrief prompt**

Same pattern: replace `ROUTINES.md` reference with full CoS path.

**Step 4: Update midday-triage prompt**

References `/Users/claw/.openclaw/workspace/vault/` paths for tasks and inbox — these stay the same (runtime state). But if it references any workspace config, update to CoS path.

**Step 5: Remove dead one-shot cron jobs**

```bash
ssh claw "cd ~/.openclaw && python3 -c \"
import json
with open('cron/jobs.json') as f:
    data = json.load(f)
data['jobs'] = [j for j in data['jobs'] if j['name'] not in ('ali-debt-email-march', 'cancel-middleastracker')]
with open('cron/jobs.json', 'w') as f:
    json.dump(data, f, indent=2)
\""
```

**Step 6: Fix donna-inbox-sync timeout (4 consecutive failures)**

The 180s timeout is too short. Increase to 300s:
```bash
ssh claw "cd ~/.openclaw && python3 -c \"
import json
with open('cron/jobs.json') as f:
    data = json.load(f)
for job in data['jobs']:
    if job['name'] == 'donna-inbox-sync':
        job['payload']['timeoutSeconds'] = 300
        job['state']['consecutiveErrors'] = 0
with open('cron/jobs.json', 'w') as f:
    json.dump(data, f, indent=2)
\""
```

**Step 7: Fix hourly-time-check timeout**

Increase from 60s to 120s:
```bash
# Same pattern as above, target hourly-time-check, set timeoutSeconds=120
```

**Step 8: Verify cron config is valid**
```bash
ssh claw "python3 -c \"import json; json.load(open('.openclaw/cron/jobs.json'))\""
```
Expected: no error (valid JSON)

**Step 9: Reload OpenClaw cron** (if OpenClaw supports hot-reload, otherwise restart)
```bash
ssh claw "# Check if OpenClaw needs restart to pick up cron changes
# OpenClaw reads jobs.json on each cron tick, so no restart needed"
```

---

### Task 7: Move all MBP cron jobs to Mini as OpenClaw cron jobs

**Step 1: Create review-queue OpenClaw cron job**

```bash
ssh claw "cd ~/.openclaw && python3 -c \"
import json
with open('cron/jobs.json') as f:
    data = json.load(f)
data['jobs'].append({
    'id': '$(uuidgen | tr A-Z a-z)',
    'name': 'review-queue',
    'description': 'Daily review queue - scan for items needing Vahid review',
    'enabled': True,
    'createdAtMs': $(date +%s)000,
    'updatedAtMs': $(date +%s)000,
    'schedule': {'kind': 'cron', 'expr': '30 11 * * 1-5', 'tz': 'America/Toronto'},
    'sessionTarget': 'isolated',
    'wakeMode': 'now',
    'payload': {
        'kind': 'agentTurn',
        'message': 'Run review queue. Read /Users/claw/code/CoS/donna/routines.md if needed for context. Scan Notion Tasks DB (bfaf4e0f) for items needing review, check for recent debrief drafts in /Users/claw/code/CoS/assets/, check Gmail drafts on both accounts, check pipeline items needing decisions. Prioritize as P0/P1/P2. Format as markdown report. If nothing needs review, produce zero output.',
        'model': 'anthropic/claude-sonnet-4-6',
        'thinking': 'off',
        'timeoutSeconds': 300,
        'lightContext': True
    },
    'delivery': {'mode': 'announce', 'channel': 'slack', 'to': 'user:U08JA9CUCLA', 'bestEffort': True},
    'state': {}
})
with open('cron/jobs.json', 'w') as f:
    json.dump(data, f, indent=2)
\""
```

**Step 2: Create task-check OpenClaw cron job**

Same pattern. Schedule: `0 9,15 * * 1-5`. Prompt reads Notion Tasks DB (not local my-tasks.yaml which doesn't exist). Delivery to Slack.

**Step 3: Create research-freshness OpenClaw cron job**

Schedule: `0 20 * * 0`. Prompt scans `/Users/claw/code/fcpo-research/data/`. Delivery to Telegram.

**Step 4: Create retro OpenClaw cron job**

Schedule: `0 16 * * 5`. Prompt reads `/Users/claw/code/CoS/goals.yaml`, checks Notion Tasks DB, calendar. Delivery to Telegram.

**Step 5: Create the-mirror OpenClaw cron job**

Schedule: `0 12 * * 0`. Prompt reads growth traits from CoS (note: growth-traits.yaml doesn't exist — check if it's in Obsidian vault or needs creating). Fetches Granola + Fellow transcripts. Delivery to Telegram.

**Step 6: Create enrich-stale OpenClaw cron job**

Schedule: `0 9 * * 1`. Prompt checks Clay for relationship freshness (contacts/ dir doesn't exist on MBP either — use Clay MCP as primary source). Delivery to Telegram.

**Step 7: Verify all new jobs in JSON**
```bash
ssh claw "python3 -c \"
import json
data = json.load(open('.openclaw/cron/jobs.json'))
for j in data['jobs']:
    print(f\"{j['name']:30s} enabled={j.get('enabled', '?')} schedule={j.get('schedule', {}).get('expr', j.get('schedule', {}).get('kind', '?'))}\")
\""
```
Expected: all 9 original + 6 new = 15 jobs (minus 2 deleted one-shots = 13 active jobs)

**Step 8: Commit updated cron config to note the change**
No git commit needed — OpenClaw cron config is not in git.

---

### Task 8: Move MBP MCP servers to global config

**Step 1: Read current global config**
```bash
cat ~/.claude.json | python3 -m json.tool | head -20
```
Note: ~/.claude.json has non-MCP config too (numStartups, tips, etc.). Only modify the mcpServers key.

**Step 2: Check if mcpServers exists in global config**
```bash
python3 -c "import json; d=json.load(open('$HOME/.claude.json')); print('mcpServers' in d)"
```

**Step 3: Add business MCP servers to global config**

Merge the 9 servers from CoS/.mcp.json into ~/.claude.json under mcpServers. Use python3 to safely merge without clobbering existing keys (Playwright, Firecrawl, Context7, DataForSEO are already there if global MCP is in a separate file).

Note: Check if global MCP is in `~/.claude.json` or `~/.claude/settings.json` or `~/.claude/settings.local.json`. Find where Playwright etc. are defined and add the business servers there.

```bash
# Find where existing global MCP servers are defined
grep -r "playwright" ~/.claude.json ~/.claude/settings.json ~/.claude/settings.local.json 2>/dev/null
```

Add these servers (copy exact config from CoS/.mcp.json):
- notion, apollo, gmail-fcpo, gmail-hi, gmail-donna, calendar-fcpo, calendar-hi, fellow, clay

**Step 4: Test MCP connectivity**

Launch Claude Code from `/Users/vahid/code/` and verify business MCP servers load:
```bash
cd /Users/vahid/code && claude --print-mcp-servers 2>/dev/null || echo "check manually in session"
```

**Step 5: Remove CoS/.mcp.json** (no longer needed)
```bash
rm /Users/vahid/code/CoS/.mcp.json
git -C /Users/vahid/code/CoS add -A && git -C /Users/vahid/code/CoS commit -m "Remove project-level .mcp.json, servers moved to global config"
```

---

### Task 9: Update MBP slash commands and references

**Step 1: Identify commands that reference CoS paths**

These 12 commands have hardcoded `/Users/vahid/code/CoS/` paths:
- `~/.claude/commands/gm.md` (goals.yaml)
- `~/.claude/commands/flow.md` (goals.yaml)
- `~/.claude/commands/debrief.md` (fellow-login.js, goals.yaml)
- `~/.claude/commands/meeting-prep.md` (fellow-write.js, fellow-login.js)
- `~/.claude/commands/retro.md` (goals.yaml)
- `~/.claude/commands/triage.md` (assets/company-context.md)
- `~/.claude/commands/my-tasks.md` (goals.yaml)
- `~/.claude/commands/harvest.md` (goals.yaml)
- `~/.claude/commands/the-mirror.md` (fellow-login.js)
- `~/.claude/commands/dev/update-evals.md` (tools/copy-eval.js)
- `~/.claude/commands/campaign/eval-copy.md` (tools/copy-eval.js)
- `~/.claude/commands/campaign/pre-launch-check.md` (tools/copy-eval.js)
- `~/.claude/commands/campaign/write-sequence.md` (tools/copy-eval.js)

**Step 2: Update each command**

For each command, replace hardcoded CoS paths with generic references that work without a local CoS clone:

| Old reference | New reference |
|---|---|
| `/Users/vahid/code/CoS/goals.yaml` | Read goals from Notion or `ssh claw cat ~/code/CoS/goals.yaml` |
| `/Users/vahid/code/CoS/assets/company-context.md` | `ssh claw cat ~/code/CoS/assets/company-context.md` |
| `/Users/vahid/code/CoS/scripts/fellow-write.js` | `ssh claw node ~/code/CoS/scripts/fellow-write.js` |
| `/Users/vahid/code/CoS/scripts/fellow-login.js` | `ssh claw node ~/code/CoS/scripts/fellow-login.js` |
| `/Users/vahid/code/CoS/tools/copy-eval.js` | `ssh claw node ~/code/CoS/tools/copy-eval.js` |

Note: Fellow scripts use Playwright which needs a browser on Mini. Verify `fellow-write.js` works via SSH before updating all references.

**Step 3: Verify no stale CoS references remain in commands**
```bash
grep -r "code/CoS" ~/.claude/commands/
```
Expected: no matches

**Step 4: Delete the validate-commands test (references deleted structure)**
```bash
rm ~/.claude/tests/validate-commands.sh
```

---

### Task 10: Update MBP memory files, CLAUDE.md files, and crontab

**Step 1: Update memory files**

Edit these 3 files to update CoS path references:
- `~/.claude/projects/-Users-vahid-code/memory/MEMORY.md`
- `~/.claude/projects/-Users-vahid-code/memory/cross-project-patterns.md`
- `~/.claude/projects/-Users-vahid-code/memory/patterns.md`

Change:
- `CoS` entry: note it now lives on Mini only, no local clone
- Update project map to reflect CoS is Mac Mini-only
- Remove "donna-server" references to dead Railway project

**Step 2: Update workspace CLAUDE.md**

Edit `/Users/vahid/code/CLAUDE.md`:
- Update Project Map: CoS path → note it's on Mini (`ssh claw`, `~/code/CoS/`)
- Remove CoS from Folder Structure (it's not in `/Users/vahid/code/` anymore)
- Update Routing Rules: CoS-related routing → SSH to Mini or note it's Donna's domain

**Step 3: Remove MBP cron jobs that moved to Mini**

Edit `~/.claude/cron/crontab.txt`:
- Remove: review-queue (11:30am)
- Remove: task-check (9am + 3pm)
- Remove: retro (Fri 4pm)
- Remove: enrich-stale (Mon 9am)
- Remove: the-mirror (Sun noon)
- Remove: research-freshness (Sun 8pm)
- Keep: session-cleanup (Sun midnight) — local filesystem only
- Keep: obsidian-backup (daily 11pm) — local filesystem only

```bash
# Install updated crontab
crontab ~/.claude/cron/crontab.txt
# Verify
crontab -l
```
Expected: only 2 jobs remain (session-cleanup, obsidian-backup)

**Step 4: Remove old cron scripts that are no longer used**
```bash
rm ~/.claude/cron/review-queue.sh
rm ~/.claude/cron/task-check.sh
rm ~/.claude/cron/retro.sh
rm ~/.claude/cron/enrich-stale.sh
rm ~/.claude/cron/the-mirror.sh
rm ~/.claude/cron/research-freshness.sh
rm ~/.claude/cron/triage.sh
rm ~/.claude/cron/morning-briefing.sh
```

Keep: `session-cleanup.sh`, `crontab.txt`
Note: `triage.sh` and `morning-briefing.sh` were already not in the crontab (superseded by Mini) but the script files still exist.

**Step 5: Push final CoS changes and pull on Mini**
```bash
cd /Users/vahid/code/CoS
git add -A
git commit -m "Final consolidation: remove .mcp.json, update CLAUDE.md for Mini-only structure"
git push origin main

ssh claw "cd ~/code/CoS && git pull --ff-only"
```

---

### Task 11: Clean stale repos on Mini

**Step 1: Remove stale fractionalcpo-website**
```bash
ssh claw "rm -rf ~/code/fractionalcpo-website"
```

**Step 2: Rename iran-war-tracker to warmap**
```bash
ssh claw "mv ~/code/iran-war-tracker ~/code/warmap 2>/dev/null; ls ~/code/warmap/"
```
Note: there's already a `~/code/warmap/` directory. Check if it's a newer clone. If so, just delete iran-war-tracker.

**Step 3: Evaluate ux-tear-down**
```bash
ssh claw "cd ~/code/ux-tear-down && git log --oneline -3"
```
If last commit is months old and not referenced by any active system, remove it.

**Step 4: Remove now-redundant workspace files on Mini**

After verifying CoS/donna/skills/ and CoS/scripts/ have everything:
```bash
ssh claw "diff <(ls ~/.openclaw/workspace/skills/) <(ls ~/code/CoS/donna/skills/)"
ssh claw "diff <(ls ~/.openclaw/workspace/scripts/) <(ls ~/code/CoS/scripts/)"
```

If CoS has everything, remove workspace copies:
```bash
ssh claw "rm -rf ~/.openclaw/workspace/skills ~/.openclaw/workspace/scripts"
```

Keep: `~/.openclaw/workspace/docs/`, `~/.openclaw/workspace/reference-books/`, `~/.openclaw/workspace/tests/` (evaluate later)

---

### Task 12: Remove CoS clone from MBP

**Step 1: Final verification before deletion**
```bash
# Verify Mini has latest
ssh claw "cd ~/code/CoS && git log --oneline -1"
# Should match MBP
git -C /Users/vahid/code/CoS log --oneline -1
```

**Step 2: Verify no MBP systems still reference local CoS**
```bash
# Check crontab
crontab -l | grep -i cos
# Check commands
grep -r "code/CoS" ~/.claude/commands/ 2>/dev/null
# Check memory
grep -r "/Users/vahid/code/CoS" ~/.claude/projects/-Users-vahid-code/memory/ 2>/dev/null
```
Expected: no matches (all updated in previous tasks)

**Step 3: Remove CoS from MBP**
```bash
rm -rf /Users/vahid/code/CoS
```

**Step 4: Verify workspace CLAUDE.md doesn't break**
```bash
# Start a quick Claude session to verify context loads
cd /Users/vahid/code && claude -p "Read CLAUDE.md and confirm you can see the project map. List all projects." --output-format text --dangerously-skip-permissions 2>/dev/null | head -20
```

---

### Task 13: Full QA sweep

**Step 1: Stale path scan on MBP**
```bash
# Scan all Claude config for any remaining CoS references
grep -r "/Users/vahid/code/CoS" ~/.claude/ --include="*.md" --include="*.sh" --include="*.json" --include="*.yaml" 2>/dev/null | grep -v "debug/" | grep -v ".jsonl" | grep -v "file-history/"
```
Expected: no matches (debug logs and session files don't count)

**Step 2: Stale path scan on Mini**
```bash
ssh claw "grep -r '/Users/claw/.openclaw/workspace/SOUL.md\|/Users/claw/.openclaw/workspace/AGENTS.md\|/Users/claw/.openclaw/workspace/TOOLS.md\|/Users/claw/.openclaw/workspace/ROUTINES.md\|/Users/claw/.openclaw/workspace/USER.md' ~/.openclaw/cron/jobs.json ~/.openclaw/workspace/BOOT.md ~/code/CoS/donna/ 2>/dev/null"
```
Expected: no matches (all updated to CoS paths)

**Step 3: Verify CoS repo integrity on Mini**
```bash
ssh claw "cd ~/code/CoS && git status && echo '---' && ls donna/ && echo '---' && ls assets/ | head -10"
```
Expected: clean git status, donna/ has all config files, assets/ intact

**Step 4: Test MCP servers from MBP**
```bash
# Verify global MCP servers load (start Claude and check)
cd /Users/vahid/code && timeout 30 claude -p "List all available MCP tools that start with 'gmail' or 'notion' or 'calendar'" --output-format text --dangerously-skip-permissions 2>/dev/null | head -20
```
Expected: gmail, notion, calendar tools appear

**Step 5: Test an OpenClaw cron job on Mini (dry run)**

Trigger one of the moved jobs manually:
```bash
# Trigger research-freshness (harmless read-only scan)
ssh claw "# Use OpenClaw API to trigger a manual run, or just verify the job exists and config is valid"
```

**Step 6: Test MBP crontab**
```bash
crontab -l
```
Expected: exactly 2 jobs (session-cleanup, obsidian-backup)

**Step 7: Verify Mini cron job count**
```bash
ssh claw "python3 -c \"
import json
data = json.load(open('.openclaw/cron/jobs.json'))
active = [j for j in data['jobs'] if j.get('enabled', True)]
print(f'Total jobs: {len(data[\"jobs\"])}')
print(f'Active jobs: {len(active)}')
for j in active:
    print(f'  {j[\"name\"]}: {j.get(\"schedule\", {}).get(\"expr\", \"one-shot\")}')
\""
```
Expected: ~13 active jobs (7 original active + 6 moved from MBP)

**Step 8: Final tag**
```bash
ssh claw "cd ~/code/CoS && git tag post-consolidation-2026-04-02 && git push origin --tags"
```

---

## Rollback Procedures

**Full rollback:**
```bash
# Restore MBP
cd /Users/vahid/code
git clone https://github.com/FractionalCPO/CoS.git
cd CoS && git checkout pre-consolidation-2026-04-02
crontab ~/.claude/cron/crontab-backup-2026-04-02.txt

# Restore Mini
ssh claw "cd ~/.openclaw && rm -rf workspace && tar xzf workspace-backup-2026-04-02.tar.gz"
ssh claw "cp ~/.openclaw/cron/jobs-backup-2026-04-02.json ~/.openclaw/cron/jobs.json"
```

**Partial rollback (Mini only):**
```bash
ssh claw "cp ~/.openclaw/cron/jobs-backup-2026-04-02.json ~/.openclaw/cron/jobs.json"
ssh claw "cd ~/.openclaw && tar xzf workspace-backup-2026-04-02.tar.gz"
```

**Partial rollback (MBP only):**
```bash
crontab ~/.claude/cron/crontab-backup-2026-04-02.txt
cd /Users/vahid/code && git clone https://github.com/FractionalCPO/CoS.git
cd CoS && git checkout pre-consolidation-2026-04-02
```
