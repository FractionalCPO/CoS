# FractionalCPO Deck Design Spec

Reference implementation: `/Users/vahid/code/fcpo-research/docs/beringer-deck/index-v4.html`

## Layout Types (8 variants)

### 1. Title Slide
- White/off-white bg
- Massive left-aligned heading (88-100px)
- Navy accent on key words
- Subtitle below (24px, muted)
- No agenda bar, no extra elements

### 2. Stats/Results
- White/off-white bg
- Section label (14px, navy, uppercase)
- 3-column cards with large navy stat numbers (56px)
- Description text + bold bottom line per card

### 3. Section Table (navy bg)
- Full navy background — used for overview/navigation slides
- Lifecycle bar at top
- Table with clickable rows
- Offering names LEFT-ALIGNED, full names (never truncated)
- Use sparingly (max 1-2 per deck)

### 4. Detail with Sidebar (navy sidebar + white body)
- Navy left sidebar: 25% width
- Contains: section label + large ghost number (120px, 8% opacity)
- White right body: 75% width
- Contains: heading, subtitle, 2-column (numbered list + info boxes)
- **USE FOR: any slide that's part of a "thread" of related sub-slides** (e.g., offerings 01-07)
- The sidebar number matches the item number in the parent table

### 5. Framework/List
- White bg
- Vertical list with numbered items and dividers
- Can be 2-column (list left, related content right)
- Numbers: navy color with 35% opacity

### 6. 3-Column Color Zones
- 3 vertical columns with different bg tones (off-white / light tint / white)
- For comparing 3 parallel concepts
- Like Kanata slides 4, 8, 16
- Use sparingly (max 1 per deck)

### 7. Case Study Cards
- White bg
- 3-column cards
- Each: type label (navy, uppercase), company name (h3), problem, metric (40px navy), description, how

### 8. Closing
- Navy bg
- Single centered word/phrase (100px)
- Logo text below
- Minimal — breathing room slide

## Typography (Deck-Specific)

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| h1 (title slide) | 88-100px | 800 | black + navy accent |
| h2 (content slides) | 52-68px | 800 | black + navy accent |
| h3 | 20-24px | 700 | black |
| Body / description | 20-21px | 400 | muted (rgba 0,0,0,0.5) |
| Subtitle | 20-24px | 400 | muted |
| Section label | 14px | 800 | navy, uppercase, 0.14em tracking |
| Numbered items h3 | 18-22px | 600 | black |
| Info box label | 12px | 800 | muted, uppercase |
| Info box value | 17-20px | 500 | dark |
| Stat numbers | 56px | 800 | navy |
| Sidebar ghost number | 120px | 800 | white at 8% opacity |
| Slide counter | 12px | 500 | muted (dynamic: dark on light, light on dark) |

## Visual Rhythm Rules

1. **Never same layout 3x in a row**
2. **Navy bg slides: max every 5-8 slides** as section breaks
3. **Navy sidebar: use for all slides in a "thread"** (related sub-items of a parent)
4. **Alternate content density** — dense slide followed by sparse slide
5. **Primary bg is off-white (#F8F8F6)**, not pure white
6. **White (#FFFFFF) for cards and info boxes** on off-white bg (subtle contrast)

## Pre-Flight Checks (before presenting any deck)

1. All text visible on its background (no white-on-white, no navy-on-navy)
2. All content fits in viewport (no overflow/scrolling)
3. Entity names not truncated by styling spans
4. Font sizes meet minimums (h1 >=60px, h2 >=48px, body >=20px)
5. Slide counter visible on all slide backgrounds
6. Offering names in tables match names on detail slides
7. Stats/numbers consistent across all slides
8. Logo renders on both light and dark slides
9. Keyboard navigation works (ArrowRight, ArrowLeft, Space, Escape)
10. Drawer opens and lists all slides correctly

## What NOT To Do

- No rounded corners
- No cream/beige backgrounds (use off-white #F8F8F6)
- No logo strips with company name text
- No prominent navigation buttons
- No center-aligned body text
- No full-bleed images unless explicitly requested
- No navy header band + white body as primary layout (use sparingly)
- No repeating same layout more than 2 slides consecutively
- No pure white (#FFFFFF) as slide background (use off-white)
- No topic-label headings ("What We Assess") — use action titles ("We assess 7 risk categories")
