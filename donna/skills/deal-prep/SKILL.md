---
name: deal-prep
description: Full deal preparation — aggregate context from all sources, synthesize, update CRM, create proposal draft. Use for active sales opportunities.
metadata: { "openclaw": { "emoji": "🤝" } }
---

# Deal Prep

Full deal preparation workflow for active sales opportunities.

## When to Use

- When Vahid says "prep the [company] deal"
- Before proposal-stage meetings
- When a deal moves from Discovery to Proposal

## Process

### Step 1: Identify the Deal

If company name given, use it. Otherwise:
1. Query Notion Opportunities DB (`de289591-f32a-483d-a51e-6bc158f4173e`) for active deals
2. Present list and ask which one

### Step 2: Gather Context (all sources)

Search across everything for the company/deal:

1. **Fellow** — search recordings mentioning the company, get summaries + transcripts
2. **Email** — `gog gmail search "[company]" --max 20` on both accounts
3. **Slack** — search for company name in all channels
4. **Research repo** — check `/Users/claw/code/fcpo-research/data/{company}/` for existing research
5. **Notion** — fetch opportunity page, linked company, linked people, notes
6. **Apollo** — enrich company and key contacts

### Step 3: Synthesize

```markdown
# Deal Synthesis: [Company]

## Timeline
- [Date]: [Key event — discovery call, NDA signed, proposal sent, etc.]

## Key People
- [Name] — [Title] — [Role in deal] — [Key signals]

## Pain Points & Needs
- [From their own words in transcripts]

## Competitive Landscape
- [Who else they're talking to, internal alternatives]

## Pricing Signals
- [Budget mentions, comparable deals]

## Strategic Play
- [Winning angle — assessment vs engagement, transformation vs optimization]

## Risks & Blockers
- [What could kill this deal]

## Open Questions
- [What we still don't know]
```

### Step 4: Update CRM

Update Notion opportunity with synthesis highlights:
- Recommend stage changes — wait for Vahid's approval before writing
- Update notes, set next action date
- Verify all writes

### Step 5: Create Proposal Draft

Create proposal draft as child page of the opportunity in Notion:
- Executive summary, scope (assessment + execution phases), deliverables
- Pricing: state position if known, TBD if not (flag as blocker)
- Verify after creating

### Step 6: Create Task

1. Add to `/Users/claw/.openclaw/workspace/vault/⚙️ ops/✅ tasks.md` — priority 1 (deals are urgent)
2. Sync to Notion Tasks DB with full synthesis in body
3. Verify both

### Step 7: Save Local Copy

Write synthesis to `/Users/claw/.openclaw/workspace/vault/💼 work/🏢 fcpo/🤝 deals/[company]-synthesis.md`

### Step 8: Report

Message Vahid on Telegram:
- Synthesis highlights (key people, pain points, strategic play)
- CRM update confirmation
- Links to proposal draft + task
- Outstanding items needing decisions

## Rules

- NEVER post or share anything externally without approval
- Pricing decisions are Vahid's — flag, don't decide
- For early-stage leads, use the research skill instead (this is for proposal-stage+)
- Always use absolute paths
