# /deal-prep — Deal & Proposal Preparation

## Description
Full deal preparation workflow: aggregate context from all sources, synthesize findings, update CRM, create proposal draft, create tracked task, and draft team announcement.

## Usage
- `/deal-prep "VeraData"` — prep a specific deal by company name
- `/deal-prep` — asks which active opportunity to prep

## Instructions

### Step 0: Identify the Deal

If a company name is provided as argument, use it. Otherwise:
1. Query Notion Opportunities DB (`de289591-f32a-483d-a51e-6bc158f4173e`) for active deals (stages: Discovery, Proposal, Negotiation)
2. Present the list and ask which one to prep

Find the opportunity page in Notion. If none exists, ask if we should create one first.

### Step 1: Gather Context (Parallel)

Launch parallel searches across all sources for the company/deal name:

1. **Fellow** — search meetings mentioning the company. Get summaries + transcripts for all matches.
2. **Granola** — search meetings mentioning the company. Get summaries + transcripts.
3. **Slack** — search all channels for the company name. Capture key threads, decisions, action items.
4. **Gmail** — search both accounts (hi@, fcpo@) for threads with the company or key contacts.
5. **Research toolkit** — check if company exists in `/Users/vahid/code/fcpo-research/companies/`. If so, load existing research.
6. **Notion** — fetch the opportunity page, linked company page, linked people, and any existing notes/docs.
7. **Clay** — search for key contacts at the company.

### Step 2: Synthesize

Combine all gathered context into a structured synthesis:

```
DEAL SYNTHESIS: [Company Name]

TIMELINE
- [Date]: [Key event — discovery call, NDA signed, proposal sent, etc.]

KEY PEOPLE
- [Name] — [Title] — [Role in deal] — [Key signals from conversations]

PAIN POINTS & NEEDS
- [What the company actually needs, from their own words]

COMPETITIVE LANDSCAPE
- [Who else they're talking to, internal alternatives]

PRICING SIGNALS
- [Any pricing discussions, budget mentions, comparable deals]

STRATEGIC PLAY
- [What's the winning angle — assessment vs engagement, transformation vs optimization]

RISKS & BLOCKERS
- [What could kill this deal]

OPEN QUESTIONS
- [What we still don't know]
```

### Step 3: Update CRM Opportunity

Using `mcp__claude_ai_Notion__notion-update-page`:
1. Update opportunity stage if it should advance (e.g., Discovery → Proposal)
2. Update notes with synthesis highlights
3. Set next action date
4. **Verify** — fetch the page back to confirm updates applied

### Step 4: Create Proposal Draft

Create a proposal draft page in Notion as a **child of the opportunity** using `mcp__claude_ai_Notion__notion-create-pages`:

Structure:
```
# [Company] — Engagement Proposal

## Executive Summary
[2-3 paragraphs: who they are, what they need, why fCPO]

## Why Now
[Urgency drivers from conversations]

## Proposed Scope
### Phase 1: Assessment ([duration])
[Assessment scope, deliverables]

### Phase 2: Execution ([duration])
[Execution scope, deliverables]

## Deliverables
[Numbered list of concrete outputs]

## Team
[Who from fCPO would be involved]

## Engagement Model
[Fractional structure, time commitment, reporting]

## Investment
[Pricing — state position if known, mark TBD if not]

## Post-Engagement
[Ongoing relationship, upsell path]

## References
[Relevant past engagements]

## Open Questions
[Items needing resolution before finalizing]
```

**Verify** — fetch the page back to confirm it was created.

### Step 5: Create Task

1. **YAML** — add to `/Users/vahid/code/CoS/my-tasks.yaml`:
   - Title: `[Company] proposal prep`
   - Priority: 1 (deals are always high priority)
   - Status: in_progress
   - Goal alignment: revenue
   - Subtasks: list all outstanding items from synthesis
   - Include full synthesis in notes

2. **Notion** — create in Tasks DB (`bfaf4e0f-1352-40cb-b39e-e441b75c1d96`):
   - **Name**: task title
   - **Client**: fCPO
   - **Assignee**: `622468d8-a961-4066-b9fe-65c0970a7852` (Vahid)
   - **Priority**: Urgent or High
   - **Status**: WIP
   - **Body**: full synthesis + links to proposal + opportunity
   - Store `notion_id` in YAML
   - **Verify** — fetch back to confirm

### Step 6: Draft Slack Announcement

Draft a message for #partners channel following Vahid's Slack writing style.

**MANDATORY**: Read `/Users/vahid/.claude/projects/-Users-vahid-code/memory/slack-writing-style.md` before drafting. Follow it exactly.

Key rules:
- Lead with `:megaphone:` + headline
- Context emoji matching topic (`:moneybag:` for sales/deals)
- Hyperlink all URLs with `<URL|label>` — never raw links
- Tag people on their action items (`@person`)
- End with YOUR next step, not "lmk"
- Maximize density — fewest words possible

Include:
- Link to Notion task and proposal draft
- Brief context (2-3 lines)
- Outstanding todos assigned to specific people
- Vahid's next step

### Step 7: Present for Review

Show Vahid:
1. The synthesis (Step 2 output)
2. Confirmation of CRM updates
3. Links to proposal draft + task in Notion
4. Slack draft for approval

**NEVER post the Slack message without explicit approval.**

## Guidelines

- This skill is for deals reaching proposal stage or beyond. For early-stage lead research, use `/research:collect` instead.
- Always check if a proposal draft already exists before creating a new one — search Notion first.
- Pricing: state Vahid's position if known from conversations. If not discussed, mark as TBD and flag it as a blocker.
- Team assignments: use ownership routing from slack-writing-style.md (pricing→Mauricio, GPL/MSA→Courtney, scheduling→Ryan).
- The proposal is a living doc — it will be iterated. Don't aim for perfection on first pass.
- Save a local copy of the synthesis at `/Users/vahid/code/CoS/assets/deal-prep/[company]-synthesis.md`.
