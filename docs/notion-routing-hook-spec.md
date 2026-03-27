# Notion Routing Hook Specification

Enforcement mechanism to prevent FCPO business content from being saved to Obsidian. Implements Layer 1 of the plan documented in `project_notion_routing_enforcement.md`.

---

## Problem

FCPO business content (research, proposals, meeting prep, competitive intel, deal prep) repeatedly gets saved to Obsidian instead of Notion. Memory-based reminders don't work because subagents don't always internalize them. A runtime enforcement hook is needed.

## Hook Configuration

### Type
`PostToolUse` hook on the `Write` tool (and `Edit` tool as secondary).

### Trigger Condition
The hook fires on every `Write` or `Edit` tool call. It evaluates two conditions:

**Condition 1 — Path check:**
```
file_path contains "Obsidian"
```

**Condition 2 — Content check (any of these keywords in content or file_path):**
```
- "fractionalcpo" or "fcpo" or "fCPO"
- "meeting-prep" or "meeting prep"
- "deal-prep" or "deal prep"
- "competitive" or "competitor"
- "pipeline" or "opportunity" or "proposal"
- "campaign" or "outreach" or "sequence"
- "research" (when combined with company names or business context)
- "positioning" or "objection" or "discovery"
```

**Logic:** IF Condition 1 AND Condition 2 THEN block.

### Action on Match
1. **Block the write** — do not execute the tool call
2. **Return warning message:**
   ```
   BLOCKED: FCPO business content detected targeting Obsidian path.

   Rule: All FCPO business content must go to Notion (system of record).
   Obsidian is for personal/ops content only.

   Action: Save this content to Notion instead. Use Notion MCP tools to create
   or update the appropriate page. If Notion MCP is unavailable, stage locally
   in /Users/vahid/code/fcpo-research/ or /Users/vahid/code/CoS/assets/ and
   flag for Notion sync.
   ```
3. **Log the violation** for pattern tracking

### Allowlist (do NOT block)
These Obsidian paths are legitimate even with FCPO keywords:
- `/Users/vahid/Obsidian/vivo/ops/donna/inbox.md` — Donna task intake
- `/Users/vahid/Obsidian/vivo/ops/donna/drafts/` — Draft staging for approval
- `/Users/vahid/Obsidian/vivo/ops/tasks.md` — Personal task list (may reference FCPO work)
- Any path under `/Users/vahid/Obsidian/vivo/ops/` — ops is legitimate Obsidian territory

## Example settings.json Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "tools": ["Write", "Edit"],
        "condition": {
          "type": "custom",
          "description": "Block FCPO business content targeting Obsidian",
          "check": "path_contains_obsidian_and_content_is_fcpo_business"
        },
        "action": {
          "type": "block",
          "message": "BLOCKED: FCPO business content must go to Notion, not Obsidian. Use Notion MCP tools or stage locally in /Users/vahid/code/."
        },
        "allowlist": [
          "/Users/vahid/Obsidian/vivo/ops/"
        ]
      }
    ]
  }
}
```

> **Note:** The exact hook syntax depends on the Claude Code settings.json schema at implementation time. The above is a conceptual specification. The actual implementation may need to use a shell script hook or a different configuration format based on what Claude Code supports for PostToolUse hooks.

## Implementation Approach

### Option A: Shell Script Hook (recommended)
If Claude Code supports shell script hooks for PostToolUse:

```bash
#!/bin/bash
# notion-routing-guard.sh
# PostToolUse hook for Write/Edit tools

TOOL_NAME="$1"
FILE_PATH="$2"

# Skip if not Write or Edit
[[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "Edit" ]] && exit 0

# Skip if not Obsidian path
[[ "$FILE_PATH" != *"Obsidian"* ]] && exit 0

# Skip allowlisted paths
[[ "$FILE_PATH" == *"Obsidian/vivo/ops/"* ]] && exit 0

# Check for FCPO business keywords in path
FCPO_KEYWORDS="fractionalcpo|fcpo|meeting-prep|deal-prep|competitive|competitor|pipeline|opportunity|proposal|campaign|outreach|sequence|positioning|objection|discovery"

if echo "$FILE_PATH" | grep -iE "$FCPO_KEYWORDS" > /dev/null 2>&1; then
  echo "BLOCKED: FCPO business content detected targeting Obsidian. Save to Notion instead."
  exit 1
fi

exit 0
```

### Option B: settings.json Rule
If Claude Code supports declarative hook rules in settings.json, use the JSON configuration above.

## Testing

Before deploying, verify with these test cases:

| Test | Path | Content | Expected |
|------|------|---------|----------|
| FCPO research to Obsidian | `~/Obsidian/vivo/work/research.md` | Contains "fractionalcpo" | BLOCKED |
| Meeting prep to Obsidian | `~/Obsidian/vivo/work/fcpo/meeting-prep/acme.md` | Meeting prep content | BLOCKED |
| Personal note to Obsidian | `~/Obsidian/vivo/personal/journal.md` | Personal content | ALLOWED |
| Donna inbox (ops) | `~/Obsidian/vivo/ops/donna/inbox.md` | References FCPO task | ALLOWED |
| FCPO research to local | `~/code/fcpo-research/acme.md` | Contains "fractionalcpo" | ALLOWED |
| FCPO content to Notion | (Notion MCP call) | Any FCPO content | ALLOWED |

## Relationship to Other Layers

This hook is Layer 1 of the enforcement plan:

- **Layer 1 (this spec):** Runtime hook blocks writes at tool-call time
- **Layer 2 (evals):** Test cases that verify correct routing in CI/eval runs
- **Layer 3 (skill augmentation):** Already done — meeting-prep, deal-prep, and research agent template all specify Notion as destination

## Status

- [x] Layer 3 — Skill augmentation (meeting-prep, deal-prep, research template updated)
- [ ] Layer 1 — Hook implementation (this spec, pending implementation)
- [ ] Layer 2 — Evals (pending, depends on eval framework setup)
