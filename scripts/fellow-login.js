#!/usr/bin/env node
/**
 * fellow-login.js — Open Fellow in a browser for manual Google SSO login
 *
 * Run this once to authenticate. The session is saved to a persistent
 * Playwright profile at /tmp/fellow-playwright-profile.
 *
 * After login, fellow-write.js can run headless using the saved session.
 *
 * Usage:
 *   node fellow-login.js
 */

const { chromium } = require('playwright');
const path = require('path');

const PROFILE_DIR = path.join(process.env.HOME, '.fellow-playwright-profile');

(async () => {
  console.log('Opening Fellow for login...');
  console.log('Profile will be saved to:', PROFILE_DIR);

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 900 }
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto('https://app.fellow.app', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());

  if (page.url().includes('fellow.app') && !page.url().includes('login')) {
    console.log('Already logged in!');
    await context.close();
    return;
  }

  console.log('Please log in via Google SSO in the browser window.');
  console.log('The browser will stay open for 3 minutes...');

  await page.waitForTimeout(180000);

  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);
  console.log(finalUrl.includes('login') ? 'WARNING: Still on login page.' : 'Login session saved.');

  await context.close();
})();
