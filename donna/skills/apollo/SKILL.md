---
name: apollo
description: Search and enrich contacts and companies using the Apollo.io API via MCP.
metadata: { "openclaw": { "emoji": "🔍", "requires": { "env": ["APOLLO_API_KEY"] } } }
---

# Apollo

Contact and company enrichment via Apollo.io. Use for lead research, contact lookup, and company intelligence.

## Tools

All tools are accessed through mcporter:


> **Note:** The `mcporter call` syntax below is for reference. OpenClaw invokes these tools natively through its MCP protocol — you don't need to run mcporter commands directly. Just use the tool names (e.g., `apollo.apollo_search_people`) in your tool calls.

### Search People
Find individuals by filters like name, title, company, location, seniority, department.
```bash
mcporter call apollo.apollo_search_people person_titles='["CTO"]' person_locations='["San Francisco"]' per_page=5
```

### Search Companies
Search organizations by industry, employee count, location, tech stack.
```bash
mcporter call apollo.apollo_search_companies organization_industry_tag_ids='["information technology"]' organization_num_employees_ranges='["1,50"]' per_page=5
```

### Enrich Person
Get a detailed profile from email, LinkedIn URL, or name + company.
```bash
mcporter call apollo.apollo_enrich_person email="jane@example.com"
mcporter call apollo.apollo_enrich_person linkedin_url="https://linkedin.com/in/janedoe"
mcporter call apollo.apollo_enrich_person first_name="Jane" last_name="Doe" organization_name="Acme"
```

### Enrich Company
Get company details from domain or name.
```bash
mcporter call apollo.apollo_enrich_company domain="example.com"
```

### Bulk Enrich People
Enrich multiple people at once.
```bash
mcporter call apollo.apollo_bulk_enrich_people details='[{"email": "a@x.com"}, {"email": "b@x.com"}]'
```

### Bulk Enrich Organizations
Enrich multiple companies at once.
```bash
mcporter call apollo.apollo_bulk_enrich_organizations domains='["example.com", "acme.com"]'
```

### Get Organization Job Postings
Find active job listings for a company.
```bash
mcporter call apollo.apollo_get_organization_job_postings organization_id="ORG_ID_HERE"
```

### Get Complete Organization Info
Full company profile.
```bash
mcporter call apollo.apollo_get_complete_organization_info domain="example.com"
```

### Search News Articles
Find news coverage for a company.
```bash
mcporter call apollo.apollo_search_news_articles organization_id="ORG_ID_HERE"
```

## When to Use

- **Deal prep:** Enrich a prospect's company and key contacts before a call
- **Lead research:** Search for decision-makers at target companies
- **Company intel:** Get employee count, funding, tech stack, recent news
- **Pipeline building:** Bulk enrich a list of leads or companies

## Notes

- API key is configured in mcporter.json
- Base URL: https://api.apollo.io/api/v1
- Rate limits apply — avoid unnecessary bulk operations
- Config: /Users/claw/config/mcporter.json
