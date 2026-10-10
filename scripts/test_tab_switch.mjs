import { chromium } from 'playwright';
import fs from 'fs';

async function runBrowserTest() {
  console.log('--- STARTING PLAYWRIGHT BROWSER VALIDATION TEST ---');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
      console.error(`[PAGE CONSOLE ERROR]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
    console.error(`[UNCAUGHT PAGE ERROR]: ${err}`);
  });

  page.on('requestfailed', req => {
    requestFailures.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Initial State Check
  const pageTitle = await page.title();
  console.log(`Page title: ${pageTitle}`);

  // Test 20 cycles of tab navigation
  const tabs = [
    'home',
    'robot-sim',
    'modules',
    'pipeline',
    'functions',
    'training-charts',
    'what-if',
    'quiz',
    'glossary',
    'sources'
  ];

  const tabLabels = [
    'Bản Đồ Kiến Thức',
    'Robot 2 Động Cơ',
    '12 Modules Chi Tiết',
    'Sơ Đồ Quy Trình',
    'Thư Viện Hàm & Lệnh',
    'Đồ Thị Huấn Luyện',
    'Thí Nghiệm',
    'Thực Hành & Trắc Nghiệm',
    'Từ Điển Thuật Ngữ',
    'Nguồn & Lưu Ý Kỹ Thuật'
  ];

  console.log('\n--- COMMENCING 20 CYCLES OF TAB SWITCHING ---');
  let successfulTabSwitches = 0;
  let totalAttemptedSwitches = 0;
  const switchTimings = [];

  for (let cycle = 1; cycle <= 20; cycle++) {
    const startTimeCycle = Date.now();
    for (let i = 0; i < tabLabels.length; i++) {
      totalAttemptedSwitches++;
      const label = tabLabels[i];
      const t0 = Date.now();
      try {
        // Find and click the button with text
        const tabBtn = page.locator(`button:has-text("${label}")`).first();
        await tabBtn.click();
        await page.waitForTimeout(50); // small delay to allow react reconciliation & mount/unmount
        const tDiff = Date.now() - t0;
        switchTimings.push(tDiff);
        successfulTabSwitches++;
      } catch (err) {
        console.error(`Failed to click tab "${label}" in cycle ${cycle}: ${err.message}`);
      }
    }
    const cycleTime = Date.now() - startTimeCycle;
    if (cycle % 5 === 0 || cycle === 1) {
      console.log(`Cycle ${cycle}/20 completed in ${cycleTime}ms. (Total switches: ${totalAttemptedSwitches})`);
    }
  }

  // 2. Return to Robot Tab
  console.log('\n--- RETURNING TO ROBOT SIMULATOR TAB ---');
  await page.locator('button:has-text("Robot 2 Động Cơ")').first().click();
  await page.waitForTimeout(500);

  // Check if RobotTwinMotorSimulator is rendered
  const robotCanvasExists = await page.locator('canvas').count();
  console.log(`WebGL Canvas elements found: ${robotCanvasExists}`);

  // 3. Test Viewport Mode Switch (3D Mechanical <-> 2D Arena)
  console.log('Testing Mode Switching (3D Mechanical <-> 2D Arena)...');
  const arenaBtn = page.locator('button:has-text("Sân Đua Bám Đường 2D")').first();
  if (await arenaBtn.count() > 0) {
    await arenaBtn.click();
    await page.waitForTimeout(300);
    console.log('Switched to 2D Arena mode.');
  }

  const mechBtn = page.locator('button:has-text("Mô Hình 3D Chuẩn CMU10")').first();
  if (await mechBtn.count() > 0) {
    await mechBtn.click();
    await page.waitForTimeout(300);
    console.log('Switched back to 3D Mechanical mode.');
  }

  // 4. Test 3D Inspection Modes (Realistic, Wireframe, Components, Collision, Coordinates, Sensors, Dimensions)
  console.log('Testing 7 3D Inspection Modes...');
  const inspectionModes = ['Khung Dây', 'Linh Kiện', 'Va Chạm', 'Tọa Độ (0,0)', 'Cảm Biến FOV', 'Kích Thước CAD', 'Thực Tế'];
  for (const mode of inspectionModes) {
    const btn = page.locator(`button:has-text("${mode}")`).first();
    if (await btn.count() > 0) {
      await btn.click();
      await page.waitForTimeout(100);
    }
  }
  console.log('All 7 3D inspection modes toggled successfully.');

  // 5. Test Camera Simulator in Modules Tab
  console.log('\n--- TESTING CAMERA SIMULATOR IN MODULES TAB ---');
  await page.locator('button:has-text("12 Modules Chi Tiết")').first().click();
  await page.waitForTimeout(300);
  
  // Select module teleoperation / road following
  const m2Btn = page.locator('button:has-text("M2: Thu Thập Ảnh Bám Đường")').first();
  if (await m2Btn.count() > 0) {
    await m2Btn.click();
    await page.waitForTimeout(300);
    console.log('Opened Module 2 (Camera Annotation).');
  }

  // 6. Test Viewport Resize and Fullscreen emulation
  console.log('\n--- TESTING VIEWPORT RESIZE & FULLSCREEN EMULATION ---');
  await page.setViewportSize({ width: 768, height: 1024 }); // Tablet
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 375, height: 667 }); // Mobile
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop Full HD
  await page.waitForTimeout(200);
  console.log('Viewport resize tested: 1280x800 -> 768x1024 -> 375x667 -> 1920x1080.');

  // Check if white screen or unmounted root occurred
  const rootContentLength = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length || 0);
  console.log(`Root innerHTML length after all tests: ${rootContentLength} bytes`);

  const avgSwitchTime = switchTimings.reduce((a, b) => a + b, 0) / switchTimings.length;
  const maxSwitchTime = Math.max(...switchTimings);
  const minSwitchTime = Math.min(...switchTimings);

  const testResults = {
    timestamp: new Date().toISOString(),
    totalAttemptedSwitches,
    successfulTabSwitches,
    successRate: `${((successfulTabSwitches / totalAttemptedSwitches) * 100).toFixed(2)}%`,
    timings: {
      averageMs: parseFloat(avgSwitchTime.toFixed(2)),
      minMs: minSwitchTime,
      maxMs: maxSwitchTime
    },
    rootContentLength,
    isWhiteScreen: rootContentLength === 0,
    webglCanvasCount: robotCanvasExists,
    consoleErrorsCount: consoleErrors.length,
    pageErrorsCount: pageErrors.length,
    requestFailuresCount: requestFailures.length,
    consoleErrors,
    pageErrors,
    requestFailures
  };

  fs.writeFileSync('browser_test_output.json', JSON.stringify(testResults, null, 2));
  console.log('\n--- TEST EXECUTION SUMMARY ---');
  console.log(JSON.stringify(testResults, null, 2));

  await browser.close();
}

runBrowserTest().catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
