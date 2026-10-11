import { chromium } from 'playwright';
import fs from 'fs';

async function runRigorousAudit() {
  console.log('=== STARTING INDEPENDENT ACCEPTANCE AUDIT BROWSER SUITE ===');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text, timestamp: new Date().toISOString() });
    if (msg.type() === 'error') {
      consoleErrors.push({ text, timestamp: new Date().toISOString() });
      console.error(`[CONSOLE ERROR]: ${text}`);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push({ message: err.message, stack: err.stack, timestamp: new Date().toISOString() });
    console.error(`[PAGE UNCAUGHT ERROR]: ${err}`);
  });

  page.on('requestfailed', req => {
    requestFailures.push({ url: req.url(), failure: req.failure()?.errorText, timestamp: new Date().toISOString() });
  });

  console.log('1. Loading http://localhost:3000 ...');
  const tStartLoad = Date.now();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const initialLoadMs = Date.now() - tStartLoad;
  console.log(`Initial page load completed in ${initialLoadMs}ms`);

  // Define the exact tabs to test
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

  console.log('\n2. Commencing EXACT 200 Tab-Switch Stress Test (20 cycles x 10 tabs)...');
  let attemptedSwitches = 0;
  let successfulSwitches = 0;
  let failedSwitches = [];
  const switchLatencies = [];
  let whiteScreenOccurrences = 0;

  for (let cycle = 1; cycle <= 20; cycle++) {
    const cycleStart = Date.now();
    for (let i = 0; i < tabLabels.length; i++) {
      attemptedSwitches++;
      const label = tabLabels[i];
      const t0 = Date.now();
      try {
        const btn = page.locator(`button:has-text("${label}")`).first();
        await btn.waitFor({ state: 'visible', timeout: 3000 });
        await btn.click();

        // Allow microtask queue & React reconciliation to process
        await page.waitForTimeout(60);

        // Check if root has content or went blank
        const rootLength = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length || 0);
        if (rootLength < 100) {
          whiteScreenOccurrences++;
          console.error(`[WHITE SCREEN DETECTED] at cycle ${cycle}, tab "${label}", root length: ${rootLength}`);
        }

        const tDiff = Date.now() - t0;
        switchLatencies.push(tDiff);
        successfulSwitches++;
      } catch (err) {
        failedSwitches.push({ cycle, label, error: err.message, timestamp: new Date().toISOString() });
        console.warn(`[TAB SWITCH FAILED] cycle ${cycle}, tab "${label}": ${err.message}`);
      }
    }
    const cycleDuration = Date.now() - cycleStart;
    if (cycle === 1 || cycle % 5 === 0 || cycle === 20) {
      console.log(`Cycle ${cycle}/20 done in ${cycleDuration}ms (Success: ${successfulSwitches}/${attemptedSwitches})`);
    }
  }

  // 3. Return to Robot Tab to audit Cockpit & Synchronization
  console.log('\n3. Returning to Robot 2 Động Cơ tab for detailed Cockpit Audit...');
  await page.locator('button:has-text("Robot 2 Động Cơ")').first().click();
  await page.waitForTimeout(800);

  // Check WebGL Canvas count in Cockpit
  const canvasCount = await page.locator('canvas').count();
  console.log(`Active Canvas count on Robot tab: ${canvasCount}`);

  // 4. Audit Pose & Synchronization in Triple-View Cockpit
  console.log('\n4. Auditing State & View Synchronization...');
  const stateAudit = await page.evaluate(async () => {
    // Check if store is accessible or evaluate DOM data
    // Let's inspect the telemetry readings and SVG elements
    const telemetryText = document.body.innerText;
    const hasMissionHeader = telemetryText.includes('TRIPLE-VIEW COCKPIT');
    const hasTacticalMap = telemetryText.includes('Khung A: Bản Đồ Sa Bàn');
    const hasRobot3D = telemetryText.includes('Khung B: Robot JetBot 3D');
    const hasFpvCamera = telemetryText.includes('Khung C: Camera FPV Thực');
    
    // Check SVG robot element presence
    const svgMap = document.querySelector('svg[viewBox="0 0 600 400"]');
    const hasSvgMap = svgMap !== null;

    // Check canvas elements
    const canvases = Array.from(document.querySelectorAll('canvas')).map(c => ({
      width: c.width,
      height: c.height,
      hasContext: c.getContext('webgl') !== null || c.getContext('webgl2') !== null
    }));

    return {
      hasMissionHeader,
      hasTacticalMap,
      hasRobot3D,
      hasFpvCamera,
      hasSvgMap,
      canvases
    };
  });
  console.log('State Audit DOM inspection:', JSON.stringify(stateAudit, null, 2));

  // 5. Test Interactive Controls: Run, Step, D-Pad, E-Stop
  console.log('\n5. Testing Cockpit Interactive Controls...');
  
  // Test D-Pad Up
  const upBtn = page.locator('button[title*="Tiến thẳng"]').first();
  if (await upBtn.count() > 0) {
    await upBtn.click();
    await page.waitForTimeout(200);
    console.log('Clicked D-Pad Forward');
  }

  // Test Run
  const runBtn = page.locator('button:has-text("Chạy (Run)")').first();
  if (await runBtn.count() > 0) {
    await runBtn.click();
    await page.waitForTimeout(600);
    console.log('Clicked RUN button. Simulated robot movement for 600ms.');
  }

  // Test Pause
  const pauseBtn = page.locator('button:has-text("Tạm Dừng")').first();
  if (await pauseBtn.count() > 0) {
    await pauseBtn.click();
    await page.waitForTimeout(200);
    console.log('Clicked PAUSE button.');
  }

  // Test Step
  const stepBtn = page.locator('button:has-text("Bước (Step)")').first();
  if (await stepBtn.count() > 0) {
    await stepBtn.click();
    await page.waitForTimeout(200);
    console.log('Clicked STEP button.');
  }

  // Test Emergency Stop
  const estopBtn = page.locator('button:has-text("E-STOP")').first();
  if (await estopBtn.count() > 0) {
    await estopBtn.click();
    await page.waitForTimeout(200);
    console.log('Clicked E-STOP button.');
  }

  // 6. Test Layout Switcher (Triple -> Split -> PiP)
  console.log('\n6. Testing Cockpit Layout Switches (Triple -> Split -> PiP)...');
  const splitBtn = page.locator('button:has-text("Bản Đồ + Robot 3D")').first();
  if (await splitBtn.count() > 0) {
    await splitBtn.click();
    await page.waitForTimeout(300);
    console.log('Switched to Split Layout');
  }

  const pipBtn = page.locator('button:has-text("PiP (Hình Trong Hình)")').first();
  if (await pipBtn.count() > 0) {
    await pipBtn.click();
    await page.waitForTimeout(300);
    console.log('Switched to PiP Layout');
  }

  const tripleBtn = page.locator('button:has-text("3 Khung Nhìn (Triple)")').first();
  if (await tripleBtn.count() > 0) {
    await tripleBtn.click();
    await page.waitForTimeout(300);
    console.log('Switched back to Triple View Layout');
  }

  // 7. Measure Render Loop & FPS estimation
  console.log('\n7. Measuring Browser Animation Frame Rate (FPS)...');
  const fpsMeasurement = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const t0 = performance.now();
      function count() {
        frames++;
        if (performance.now() - t0 >= 1000) {
          const fps = Math.round((frames * 1000) / (performance.now() - t0));
          resolve(fps);
        } else {
          requestAnimationFrame(count);
        }
      }
      requestAnimationFrame(count);
    });
  });
  console.log(`Measured requestAnimationFrame FPS: ${fpsMeasurement}`);

  // 8. Memory Footprint Audit
  console.log('\n8. Measuring Browser JS Heap Memory...');
  const memoryInfo = await page.evaluate(() => {
    if (window.performance && window.performance.memory) {
      const m = window.performance.memory;
      return {
        totalJSHeapSizeMB: (m.totalJSHeapSize / (1024 * 1024)).toFixed(2),
        usedJSHeapSizeMB: (m.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        jsHeapSizeLimitMB: (m.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)
      };
    }
    return { note: 'performance.memory not exposed in standard headless non-flagged mode' };
  });
  console.log('Memory measurement:', memoryInfo);

  // Compile final results
  const avgLatency = switchLatencies.length > 0
    ? parseFloat((switchLatencies.reduce((a, b) => a + b, 0) / switchLatencies.length).toFixed(2))
    : 0;
  const minLatency = switchLatencies.length > 0 ? Math.min(...switchLatencies) : 0;
  const maxLatency = switchLatencies.length > 0 ? Math.max(...switchLatencies) : 0;
  const successRate = ((successfulSwitches / attemptedSwitches) * 100).toFixed(2);

  const finalDomLength = await page.evaluate(() => document.getElementById('root')?.innerHTML?.length || 0);

  const auditReportData = {
    timestamp: new Date().toISOString(),
    auditSuite: "Phase 3.1 Independent Acceptance Audit",
    initialLoadMs,
    tabSwitchTest: {
      totalAttempted: attemptedSwitches,
      successful: successfulSwitches,
      failed: failedSwitches.length,
      successRate: `${successRate}%`,
      latencies: {
        averageMs: avgLatency,
        minMs: minLatency,
        maxMs: maxLatency
      },
      whiteScreenOccurrences,
      failures: failedSwitches
    },
    canvasAudit: {
      activeCanvases: canvasCount,
      stateAudit
    },
    fpsMeasured: fpsMeasurement,
    memoryMeasured: memoryInfo,
    finalDomBytes: finalDomLength,
    consoleErrorsCount: consoleErrors.length,
    pageErrorsCount: pageErrors.length,
    requestFailuresCount: requestFailures.length,
    consoleErrors,
    pageErrors,
    requestFailures
  };

  fs.writeFileSync('reports/phase3_1_raw_test_output.json', JSON.stringify(auditReportData, null, 2));
  console.log('\n=== AUDIT SUITE COMPLETED SUCCESSFULLY ===');
  console.log(`Summary: ${successfulSwitches}/${attemptedSwitches} passed (${successRate}%). White screens: ${whiteScreenOccurrences}. Errors: ${pageErrors.length}. FPS: ${fpsMeasurement}.`);

  await browser.close();
}

runRigorousAudit().catch(err => {
  console.error('Audit runner encountered fatal error:', err);
  process.exit(1);
});
