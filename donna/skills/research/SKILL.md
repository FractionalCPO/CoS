---
name: research
description: Competitive and company research using the fcpo-research toolkit. Use for prospect enrichment, competitor analysis, and market intelligence.
metadata: { "openclaw": { "emoji": "🔬" } }
---

# Research

Wraps the fcpo-research toolkit at `/Users/claw/code/fcpo-research/`.

## When to Use

- When Vahid asks to research a company or competitor
- During deal prep (early-stage leads)
- For competitive analysis projects
- When enriching the CRM pipeline

## Toolkit Location

All research data and scripts live in `/Users/claw/code/fcpo-research/`.

Before starting, sync the repo:
```bash
git -C /Users/claw/code/fcpo-research pull --ff-only
```

## Key Operations

### Initialize a Company
Set up tracking for a new company:
1. Search web for company info (domain, category, description)
2. Create `data/{company-slug}/profile.md`
3. Create data subdirectories: `seo/`, `community/`, `video/`, `product/`, `reviews/`, `company/`, `technology/`, `hiring/`, `team/`, `website/`
4. Add to `companies.md`

### Collect Research (Light)
Run 7 core buckets for quick intelligence:
1. **SEO** — domain overview, top keywords (use DataForSEO tools)
2. **Product** — pricing page, features (use Firecrawl to scrape)
3. **Company** — founding, HQ, funding, headcount (Apollo + web)
4. **Technology** — tech stack detection (DataForSEO + Firecrawl)
5. **Hiring** — open roles, departments (Apollo job postings)
6. **Team** — C-suite, VP+ mapping (Apollo people search)
7. **Website** — sitemap, top pages messaging (Firecrawl)

Write results to `data/{company}/` subdirectories.

### Collect Research (Comprehensive)
Adds 3 more buckets on top of light:
8. **Reviews** — Trustpilot, G2, Capterra (web search + scrape)
9. **Community** — Reddit social listening (web search)
10. **Video** — YouTube content analysis (web search)

### Check Status
List all tracked companies and their collection state:
```bash
ls /Users/claw/code/fcpo-research/data/
```
For each company, check which buckets have data files.

### Sync to Notion
After collecting, push key data to Notion CRM:
- Company info → Companies DB (`5fee82ee-a0e1-41f5-aaca-308e03580182`)
- VP+ people → People DB (`11d6ce8b-a1af-455a-b9c5-d50d1aec5796`)
- Verify all writes

## Tools Available

- **Apollo** — company/people enrichment (via apollo skill)
- **Firecrawl** — website scraping (via firecrawl skill)
- **DataForSEO** — SEO data, keyword analysis, backlinks, technology detection
- **Web search** — general research
- **Notion** — CRM sync (via notion skill)

## Output

All research files go to `/Users/claw/code/fcpo-research/data/{company}/`.
After collection, create `collection-summary-YYYY-MM-DD.md` in the company directory.

## Rules

- Light collection first, then comprehensive (never skip light)
- Always sync to Notion after collection
- Commit research data: `git -C /Users/claw/code/fcpo-research add -A && git commit -m "research: {company} {depth}"`
- Company slugs: lowercase, hyphenated (e.g., `constant-contact`)
