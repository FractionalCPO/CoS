#!/usr/bin/env node
/**
 * fellow-write.js — Read and write structured content in Fellow meeting notes
 *
 * Usage:
 *   node fellow-write.js --list-today
 *   node fellow-write.js --read <meeting-id>
 *   node fellow-write.js --read-structure <meeting-id>
 *   node fellow-write.js <meeting-id> <content.json>
 *   node fellow-write.js <meeting-id> --inline '{"talkingPoints": [...]}'
 *   node fellow-write.js --find "<meeting-title>" --inline '...'
 *
 * Content JSON format:
 * {
 *   "talkingPoints": ["point 1", "point 2"],
 *   "subItems": { "point 1": ["sub-a", "sub-b"] },
 *   "privateNotes": "Brief / context for private notes sidebar"
 * }
 *
 * Behavior:
 * - Reads existing note structure FIRST
 * - Appends talking points into existing Talking Points section
 * - Writes brief into Fellow's Private Notes sidebar (only you see it)
 * - Never clears or replaces existing content
 * - Returns existing content as JSON for review
 *
 * Fellow shortcuts: () = talking point, [] = action item
 */

const { chromium } = require('playwright');
const fs = require('fs');

const path = require('path');

const FELLOW_BASE = 'https://fractionalcpo.fellow.app';
const PROFILE_DIR = path.join(process.env.HOME, '.fellow-playwright-profile');
const DELAY = { fast: 8, normal: 15 };

async function launchFellow() {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true,
    viewport: { width: 1280, height: 900 }
  });
  const page = context.pages()[0] || await context.newPage();
  return { context, page };
}

async function navigateToMeeting(page, meetingId) {
  await page.goto(`${FELLOW_BASE}/meetings/${meetingId}/`, { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(4000);
  const url = page.url();
  if (url.includes('google.com') || url.includes('/login') || url.includes('accounts.')) {
    throw new Error('Fellow session expired or missing. Run: node /Users/vahid/code/CoS/scripts/fellow-login.js');
  }
  if (!url.includes('/meetings/')) {
    throw new Error(`Failed to navigate to meeting. URL: ${url}`);
  }
  await page.locator('.ProseMirror').first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}

async function findMeetingByTitle(page, title) {
  await page.goto(`${FELLOW_BASE}/calendar/`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const links = await page.locator('a[href*="/meetings/"]').evaluateAll(els =>
    els.map(e => ({
      href: e.href,
      text: e.innerText.trim(),
      id: e.href.match(/\/meetings\/([^/]+)/)?.[1]
    }))
  );

  const match = links.find(l => l.text.toLowerCase().includes(title.toLowerCase()));
  if (!match) {
    console.error(`No meeting found matching "${title}"`);
    console.error('Available:', links.map(l => l.text).join(' | '));
    return null;
  }
  console.error(`Found: "${match.text}" → ${match.id}`);
  return match.id;
}

async function listTodaysMeetings(page) {
  await page.goto(`${FELLOW_BASE}/calendar/`, { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  return page.locator('a[href*="/meetings/"]').evaluateAll(els =>
    els.map(e => ({
      id: e.href.match(/\/meetings\/([^/]+)/)?.[1],
      text: e.innerText.trim().replace(/\n/g, ' | ')
    }))
  );
}

/**
 * Parse the existing note into structured sections
 */
async function readStructure(page) {
  const editor = page.locator('.ProseMirror').first();
  const html = await editor.innerHTML().catch(() => '');
  const text = await editor.innerText().catch(() => '');

  // Parse sections by H1 headers
  const sections = {};
  let currentSection = null;
  const items = [];

  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect section headers (Fellow uses H1 for Talking Points, Action Items, Notepad)
    if (/^Talking Points$/i.test(trimmed)) {
      currentSection = 'talkingPoints';
      sections[currentSection] = { items: [], subtext: '' };
    } else if (/^Action Items$/i.test(trimmed)) {
      currentSection = 'actionItems';
      sections[currentSection] = { items: [], subtext: '' };
    } else if (/^Notepad$/i.test(trimmed)) {
      currentSection = 'notepad';
      sections[currentSection] = { items: [], subtext: '' };
    } else if (/^Brief$/i.test(trimmed)) {
      currentSection = 'brief';
      sections[currentSection] = { items: [], subtext: '' };
    } else if (currentSection) {
      // Skip placeholder text
      if (/^The things to talk about$/i.test(trimmed)) continue;
      if (/^What came out of this meeting/i.test(trimmed)) continue;
      if (/^Anything else to write down/i.test(trimmed)) continue;
      if (/^Add a discussion item/i.test(trimmed)) continue;
      sections[currentSection].items.push(trimmed);
    }
  }

  // Count agenda blocks (talking points with circle checkboxes)
  const agendaCount = (html.match(/data-block-type="agenda"/g) || []).length;
  const actionCount = (html.match(/data-block-type="todo"/g) || []).length;

  // Read private notes
  const privateEditor = page.locator('[class*="PrivateNote"] .ProseMirror').first();
  let privateNotes = '';
  let _privateNotesTabOpen = false;

  // Open private notes sidebar first
  const tabs = page.locator('.SeriesSidePanel-module__tab__ipPlo');
  const tabCount = await tabs.count();
  if (tabCount > 0) {
    await tabs.nth(0).click({ force: true });
    await page.waitForTimeout(1500);
    const pvtVisible = await privateEditor.isVisible().catch(() => false);
    if (pvtVisible) {
      privateNotes = await privateEditor.innerText().catch(() => '');
      _privateNotesTabOpen = true;
    }
  }

  return {
    raw: text,
    sections,
    agendaCount,
    actionCount,
    privateNotes: privateNotes.trim(),
    hasTalkingPoints: !!sections.talkingPoints,
    hasActionItems: !!sections.actionItems,
    hasNotepad: !!sections.notepad,
    isEmpty: !text.trim() || agendaCount === 0,
    _privateNotesTabOpen
  };
}

/**
 * Fallback: position after last agenda block when strict selector fails
 */
async function positionAfterLastTalkingPointFallback(page, agendaBlocks, count) {
  const lastBlock = agendaBlocks.nth(count - 1);
  await lastBlock.click();
  await page.waitForTimeout(200);
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  return true;
}

/**
 * Find the end of the Talking Points section and position cursor there.
 * Strategy: click after the last agenda item, before the next H1.
 */
async function positionAfterLastTalkingPoint(page) {
  const editor = page.locator('.ProseMirror').first();

  // Find top-level agenda blocks only (exclude indented sub-items)
  const agendaBlocks = page.locator('.ProseMirror > .react-node-view-agenda, .ProseMirror [data-block-type="agenda"]:not([data-indent])');
  let count = await agendaBlocks.count();
  // Fallback to all agenda blocks if the strict selector finds nothing
  if (count === 0) {
    const allAgenda = page.locator('.ProseMirror .react-node-view-agenda');
    count = await allAgenda.count();
    if (count > 0) {
      return positionAfterLastTalkingPointFallback(page, allAgenda, count);
    }
  }

  if (count > 0) {
    // Click on the last agenda item
    const lastBlock = agendaBlocks.nth(count - 1);
    await lastBlock.click();
    await page.waitForTimeout(200);
    // Move to end of line, then Enter to add new point after it
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    return true;
  }

  return false;
}

/**
 * Write talking points into the existing Talking Points section.
 * If no section exists, creates one.
 */
async function appendTalkingPoints(page, points, subItems) {
  if (!points || points.length === 0) return;

  const hasExisting = await positionAfterLastTalkingPoint(page);

  if (!hasExisting) {
    // No existing talking points — check if there's a Talking Points header
    const editor = page.locator('.ProseMirror').first();
    const text = await editor.innerText();

    if (/Talking Points/i.test(text)) {
      // Header exists but no items — click after it
      const header = page.locator('h1:has-text("Talking Points")').first();
      await header.click();
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    } else {
      // No section at all — create at top
      await editor.click();
      await page.keyboard.press('Home');
      await page.keyboard.press('Meta+Home');
      await page.waitForTimeout(200);

      await page.keyboard.press('Meta+Alt+1');
      await page.waitForTimeout(200);
      await page.keyboard.type('Talking Points', { delay: DELAY.fast });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    }

    // Start first talking point with ()
    await page.keyboard.type('()', { delay: 100 });
    await page.waitForTimeout(500);
  }

  // Type each point
  for (let i = 0; i < points.length; i++) {
    await page.keyboard.type(points[i], { delay: DELAY.fast });

    // Sub-items
    if (subItems && subItems[points[i]]) {
      for (const sub of subItems[points[i]]) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
        await page.keyboard.type(sub, { delay: DELAY.fast });
      }
      if (i < points.length - 1) {
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
        await page.keyboard.press('Shift+Tab');
        await page.waitForTimeout(200);
      }
    } else if (i < points.length - 1) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(200);
    }
  }

  await page.waitForTimeout(500);
}

/**
 * Write the brief into Fellow's Private Notes sidebar
 */
async function writePrivateNotes(page, text, tabAlreadyOpen) {
  if (!text) return;

  // Open private notes tab
  const tabs = page.locator('.SeriesSidePanel-module__tab__ipPlo');
  const tabCount = await tabs.count();
  if (tabCount === 0) {
    console.error('No sidebar tabs found — cannot write private notes');
    return;
  }

  let privateEditor = page.locator('[class*="PrivateNote"] .ProseMirror').first();
  let visible = await privateEditor.isVisible().catch(() => false);

  // If tab is already open (from readStructure), don't click — it would toggle off
  if (!visible) {
    await tabs.nth(0).click({ force: true });
    await page.waitForTimeout(1500);
    visible = await privateEditor.isVisible().catch(() => false);
  }

  if (!visible) {
    // Retry once more
    await tabs.nth(0).click({ force: true });
    await page.waitForTimeout(2000);
    visible = await privateEditor.isVisible().catch(() => false);
  }

  // Fallback: find by parent class traversal
  if (!visible) {
    const allEditors = page.locator('.ProseMirror');
    const count = await allEditors.count();
    for (let i = 1; i < count; i++) {
      const isPrivate = await allEditors.nth(i).evaluate(el => {
        let p = el.parentElement;
        while (p) {
          if (p.className && p.className.includes('Private')) return true;
          p = p.parentElement;
        }
        return false;
      });
      if (isPrivate) {
        privateEditor = allEditors.nth(i);
        visible = true;
        break;
      }
    }
  }

  if (!visible) {
    console.error('Private notes editor not visible after retries');
    return;
  }

  // Dismiss blur overlay if present (Fellow hides private notes behind a click-to-reveal)
  const blurOverlay = page.locator('[class*="blurOverlay"], [class*="hideNote"]').first();
  if (await blurOverlay.isVisible().catch(() => false)) {
    await blurOverlay.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // Read existing content
  const existing = (await privateEditor.innerText().catch(() => '')).trim();

  // Click into editor with force to bypass any remaining overlay
  await privateEditor.click({ force: true });
  await page.waitForTimeout(200);

  if (existing) {
    // Append after existing content
    await page.keyboard.press('Meta+End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
  }

  // Write the brief
  await page.keyboard.type(text, { delay: DELAY.fast });
  await page.waitForTimeout(1000);
}

// === CLI ===
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`fellow-write — Read/write Fellow meeting notes

Commands:
  --list-today                    List today's meetings
  --read <id>                     Read meeting note (plain text)
  --read-structure <id>           Read meeting note as structured JSON
  <id> --inline '{json}'          Write content into meeting
  --find "<title>" --inline '...' Find meeting by title and write

Content JSON:
  {
    "talkingPoints": ["point 1", "point 2"],
    "subItems": {"point 1": ["sub-a"]},
    "privateNotes": "Brief for private notes sidebar"
  }

Behavior:
  - Reads existing structure first, never replaces
  - Appends talking points after existing ones
  - Writes brief to Fellow's Private Notes sidebar
  - Returns existing content for review`);
    process.exit(0);
  }

  const { context, page } = await launchFellow();

  try {
    if (args[0] === '--list-today') {
      const meetings = await listTodaysMeetings(page);
      console.log(JSON.stringify(meetings, null, 2));
      return;
    }

    if (args[0] === '--read') {
      await navigateToMeeting(page, args[1]);
      const editor = page.locator('.ProseMirror').first();
      console.log(await editor.innerText());
      return;
    }

    if (args[0] === '--read-structure') {
      await navigateToMeeting(page, args[1]);
      const structure = await readStructure(page);
      console.log(JSON.stringify(structure, null, 2));
      return;
    }

    // Parse meeting target
    let meetingId;
    let contentArgs;

    if (args[0] === '--find') {
      meetingId = await findMeetingByTitle(page, args[1]);
      if (!meetingId) process.exit(1);
      contentArgs = args.slice(2);
    } else {
      meetingId = args[0];
      contentArgs = args.slice(1);
    }

    // Parse content
    let content;
    if (contentArgs[0] === '--inline') {
      content = JSON.parse(contentArgs[1]);
    } else if (contentArgs[0]) {
      content = JSON.parse(fs.readFileSync(contentArgs[0], 'utf-8'));
    } else {
      content = JSON.parse(fs.readFileSync(0, 'utf-8'));
    }

    // Navigate and read existing structure first
    await navigateToMeeting(page, meetingId);
    const existing = await readStructure(page);

    // Output existing content for review
    console.error('=== EXISTING CONTENT ===');
    console.error(JSON.stringify(existing, null, 2));
    console.error('========================');

    // Write talking points (appends, doesn't replace)
    await appendTalkingPoints(page, content.talkingPoints, content.subItems);

    // Write brief into private notes sidebar
    await writePrivateNotes(page, content.privateNotes, existing._privateNotesTabOpen);

    // Wait for auto-save
    await page.waitForTimeout(2000);

    // Read back final state
    const final = await readStructure(page);
    console.log(JSON.stringify({
      status: 'success',
      existingTalkingPoints: existing.sections?.talkingPoints?.items || [],
      addedTalkingPoints: content.talkingPoints || [],
      privateNotesWritten: !!content.privateNotes,
      finalTalkingPointCount: final.agendaCount,
      finalContent: final.raw.substring(0, 500)
    }, null, 2));

  } finally {
    await context.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
