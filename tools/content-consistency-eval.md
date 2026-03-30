# Content Consistency Eval

## Purpose
Check that facts, figures, numbers, pricing, and entity names are consistent across all pages/slides in a document before presenting to Vahid.

## When to Run
- Before presenting any deck
- Before publishing any Notion page with data
- Before sending any proposal or external document
- After any bulk find-and-replace operation

## Checks

### 1. Number Consistency
- Extract all numbers/stats mentioned (e.g., "50+ DDs", "$120-150K", "10 business days")
- Verify each number appears the same way everywhere it's referenced
- Flag any discrepancies

### 2. Entity Name Consistency
- Extract all company/product/offering names
- Verify names in overview/table slides match names on detail slides
- Check that accent spans don't truncate visible names
- Flag: "Exploratory Product Assessment" in table but "Product Assessment" on detail slide

### 3. Pricing Consistency
- Extract all price references
- Verify they match approved ranges from Notion/memory
- Current approved: Exploratory $30-60K, Confirmatory $120-150K, Add-on $40-60K, Pre-Exit Narrative $40-80K, Value Creation $2,500-4,500/day

### 4. Date/Time Consistency
- Run `date` before any time-relative claims
- Verify dates mentioned in content are accurate

### 5. Brand Spelling
- "FractionalCPO" (no space)
- "Beringer" (not "Behringer")
- "diligence" (not "assessment" for PE audience, except "Exploratory Product Assessment" which is the offering name)
- Courtney = he/him
