---
name: sequential-thinking
description: Structured step-by-step reasoning for complex problems. Break down, branch, revise, and verify solutions.
metadata: { "openclaw": { "emoji": "chain", "requires": { "bins": ["mcporter", "mcp-server-sequential-thinking"] } } }
---

# Sequential Thinking

Structured reasoning tool for complex, multi-step problems. Breaks down thinking into numbered steps with support for revision, branching, and verification.

## When to use

- Complex problems that need step-by-step decomposition
- Planning tasks where the full scope is unclear upfront
- Analysis that might need course correction mid-stream
- Multi-step solutions where context must be maintained
- Situations where you need to filter out irrelevant information
- Hypothesis generation and verification


> **Note:** The `mcporter call` syntax below is for reference. OpenClaw invokes these tools natively through its MCP protocol — you don't need to run mcporter commands directly. Just use the tool names (e.g., `apollo.apollo_search_people`) in your tool calls.

## Tool

### sequentialthinking
```bash
mcporter call sequential-thinking.sequentialthinking \
  thought="First, let me identify the key constraints..." \
  nextThoughtNeeded=true \
  thoughtNumber=1 \
  totalThoughts=5
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| thought | yes | Current thinking step (analysis, revision, question, hypothesis) |
| nextThoughtNeeded | yes | true if more thinking needed, false when done |
| thoughtNumber | yes | Current step number (1-based) |
| totalThoughts | yes | Estimated total steps (can adjust up/down as you go) |
| isRevision | no | true if this step revises earlier thinking |
| revisesThought | no | Which thought number is being reconsidered |
| branchFromThought | no | Branching point thought number |
| branchId | no | Branch identifier string |
| needsMoreThoughts | no | true if hitting the end but need more steps |

## Workflow

1. Start with an initial estimate of needed thoughts
2. Work through the problem step by step
3. Revise previous thoughts when new information emerges
4. Branch into alternative approaches if needed
5. Generate a hypothesis when ready
6. Verify the hypothesis against the chain of reasoning
7. Repeat until confident in the answer
8. Set nextThoughtNeeded=false only when truly done

## Example: evaluating a deal

```bash
# Step 1: identify the opportunity
mcporter call sequential-thinking.sequentialthinking \
  thought="The prospect is a Series B SaaS company with 50 employees and no CPO..." \
  nextThoughtNeeded=true thoughtNumber=1 totalThoughts=4

# Step 2: assess fit
mcporter call sequential-thinking.sequentialthinking \
  thought="Their product has PMF but the roadmap is chaos. Classic FCPO fit..." \
  nextThoughtNeeded=true thoughtNumber=2 totalThoughts=4

# Step 3: revise after new info
mcporter call sequential-thinking.sequentialthinking \
  thought="Wait -- they mentioned a full-time CPO hire in 6 months. This limits engagement to bridge work..." \
  nextThoughtNeeded=true thoughtNumber=3 totalThoughts=5 \
  isRevision=true revisesThought=2 needsMoreThoughts=true

# Step 4: recommendation
mcporter call sequential-thinking.sequentialthinking \
  thought="Recommend a 3-month diagnostic engagement, not a 6-month retainer..." \
  nextThoughtNeeded=false thoughtNumber=4 totalThoughts=4
```

## Notes

- Adjust totalThoughts freely -- it is an estimate, not a constraint
- You can go beyond the initial estimate if needed
- Not every thought needs to build linearly -- branching and backtracking are fine
- Config: /Users/claw/config/mcporter.json
