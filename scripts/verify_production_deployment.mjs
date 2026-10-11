import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const PROD_URL = 'https://cmu-10-five.vercel.app';
const SCREENSHOT_DIR = path.resolve('reports/release');

async function runSmokeTest() {
  console.log(`Connecting to Production: ${PROD_URL} ...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1586, height: 992 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  const response = await page.goto(PROD_URL, { waitUntil: 'networkidle', timeout: 30000 });
  const status = response ? response.status() : 0;
  console.log(`HTTP Status: ${status}`);

  await page.waitForTimeout(1500);

  // Check Header height
  const header = page.locator('header').first();
  const headerBox = await header.boundingBox();
  const headerH = headerBox ? Math.round(headerBox.height) : 0;
  console.log(`Header DOM Height: ${headerH}px`);

  // Check 5 pillars
  const pillars = ['Bài học', 'Mô phỏng', 'Lập trình', 'Phân tích', 'Báo cáo'];
  let count = 0;
  for (const p of pillars) {
    if (await page.locator(`header nav button:has-text("${p}")`).first().isVisible()) count++;
  }
  console.log(`Pillars Visible: ${count}/5`);

  // Check E-STOP
  const estop = await page.locator('button[aria-label="Emergency Stop"]').first().isVisible();
  console.log(`E-STOP Button Visible: ${estop}`);

  // Check Simulation HUD
  const hud = await page.locator('[data-testid="simulation-hud"]').first().isVisible();
  console.log(`Simulation HUD Visible: ${hud}`);

  // Take production screenshot
  const shotPath = path.join(SCREENSHOT_DIR, 'production_cmu10_live.png');
  await page.screenshot({ path: shotPath, fullPage: false });
  console.log(`Production screenshot saved: ${shotPath}`);

  await browser.close();

  const results = {
    prodUrl: PROD_URL,
    httpStatus: status,
    headerHeight: headerH,
    pillarsCount: count,
    hasEstop: estop,
    hasHud: hud,
    consoleErrors,
    passed: status === 200 && headerH >= 76 && count === 5 && estop && consoleErrors.length === 0
  };

  fs.writeFileSync(path.join(SCREENSHOT_DIR, 'production_smoke_test.json'), JSON.stringify(results, null, 2));
  console.log('Smoke Test Results:', results);

  if (!results.passed) {
    process.exit(1);
  }
}

runSmokeTest().catch(err => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
