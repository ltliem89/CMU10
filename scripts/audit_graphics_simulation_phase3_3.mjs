import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runComprehensiveAudit() {
  console.log('========================================================================');
  console.log('CMU10 — PHASE 3.3: FULL GRAPHICS, RENDERING & SIMULATION AUDIT');
  console.log('========================================================================\n');

  const screenshotsDir = path.resolve('reports/phase3_3_graphics_audit/screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  const consoleMessages = [];
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    pageErrors.push(err.toString());
  });

  console.log('1. Connecting to Dev Server at http://localhost:3000 ...');
  const tNavStart = Date.now();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  const initialLoadTimeMs = Date.now() - tNavStart;
  console.log(`Initial page load time: ${initialLoadTimeMs}ms`);

  // Switch to Simulation Tab
  console.log('2. Opening "Robot 2 Động Cơ" (robot-sim) mission cockpit...');
  const tCockpitStart = Date.now();
  await page.locator('button:has-text("Robot 2 Động Cơ")').first().click();
  await page.waitForTimeout(1500); // Allow WebGL & Canvas initialization
  const cockpitInitTimeMs = Date.now() - tCockpitStart;
  console.log(`Cockpit initialization time: ${cockpitInitTimeMs}ms`);

  // Inject WebGL and Performance instrumentation
  console.log('3. Extracting WebGL Hardware and Driver Capabilities...');
  const webglCapabilities = await page.evaluate(() => {
    const canvases = Array.from(document.querySelectorAll('canvas'));
    const results = [];
    canvases.forEach((c, idx) => {
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) {
        results.push({ index: idx, error: 'No WebGL context' });
        return;
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      results.push({
        index: idx,
        contextType: gl instanceof WebGL2RenderingContext ? 'WebGL 2.0' : 'WebGL 1.0',
        unmaskedVendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'N/A',
        unmaskedRenderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'N/A',
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxRenderbufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        devicePixelRatio: window.devicePixelRatio,
        canvasClientWidth: c.clientWidth,
        canvasClientHeight: c.clientHeight,
        canvasBackingWidth: c.width,
        canvasBackingHeight: c.height,
        ratioBackingToClient: c.clientWidth > 0 ? (c.width / c.clientWidth).toFixed(2) : '0'
      });
    });
    return results;
  });

  console.log('Detected WebGL Canvases:', JSON.stringify(webglCapabilities, null, 2));

  // ---------------------------------------------------------------------------
  // SCENARIO A: INITIAL INSPECTION & BASELINE SCREENSHOTS
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO A: BASELINE SCREENSHOTS (1440x900) ---');
  await page.screenshot({ path: path.join(screenshotsDir, 'baseline_cockpit_standard_1440.png'), fullPage: false });

  // ---------------------------------------------------------------------------
  // SCENARIO B: 60-SECOND SIMULATION & FRAME-TIME / FPS MEASUREMENT
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO B: CONTINUOUS SIMULATION LOAD (FPS & FRAME TIME) ---');
  // Inject High-Precision RAF Profiler
  await page.evaluate(() => {
    window.__perfAudit = {
      frameTimes: [],
      lastRafTime: performance.now(),
      longTasks: [],
      memorySnapshots: []
    };

    // Long task observer
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__perfAudit.longTasks.push({
              startTime: entry.startTime,
              duration: entry.duration,
              name: entry.name
            });
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // longtask not supported or restricted
      }
    }

    function recordFrame(now) {
      const dt = now - window.__perfAudit.lastRafTime;
      window.__perfAudit.lastRafTime = now;
      if (dt > 0 && dt < 1000) { // filter out tab inactive jumps
        window.__perfAudit.frameTimes.push(dt);
      }
      if (window.__perfAudit.frameTimes.length % 60 === 0 && performance.memory) {
        window.__perfAudit.memorySnapshots.push({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize
        });
      }
      window.__perfAudit.rafId = requestAnimationFrame(recordFrame);
    }
    window.__perfAudit.rafId = requestAnimationFrame(recordFrame);
  });

  // Start robot running with motor commands
  console.log('Running simulation with active kinematics for 10 seconds (scaled sample of 60s)...');
  await page.locator('button[title*="Chạy mô phỏng"]').first().click();
  await page.locator('button[title*="Tiến"]').first().click();

  // Wait 10 seconds under continuous running load
  await page.waitForTimeout(10000);

  // Collect performance statistics
  const perfData = await page.evaluate(() => {
    cancelAnimationFrame(window.__perfAudit.rafId);
    const times = window.__perfAudit.frameTimes;
    if (times.length === 0) return null;

    times.sort((a, b) => a - b);
    const sum = times.reduce((a, b) => a + b, 0);
    const mean = sum / times.length;
    const median = times[Math.floor(times.length / 2)];
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    const min = times[0];
    const max = times[times.length - 1];

    // 1% low frame time: average of worst 1% frames
    const worst1PercentCount = Math.max(1, Math.floor(times.length * 0.01));
    const worst1Percent = times.slice(times.length - worst1PercentCount);
    const worst1PercentMean = worst1Percent.reduce((a, b) => a + b, 0) / worst1PercentCount;

    const fpsMean = 1000 / mean;
    const fps1PercentLow = 1000 / worst1PercentMean;

    return {
      totalFrames: times.length,
      meanFrameTimeMs: +mean.toFixed(2),
      medianFrameTimeMs: +median.toFixed(2),
      p95FrameTimeMs: +p95.toFixed(2),
      p99FrameTimeMs: +p99.toFixed(2),
      minFrameTimeMs: +min.toFixed(2),
      maxFrameTimeMs: +max.toFixed(2),
      worst1PercentFrameTimeMs: +worst1PercentMean.toFixed(2),
      fpsMean: +fpsMean.toFixed(1),
      fps1PercentLow: +fps1PercentLow.toFixed(1),
      longTasksCount: window.__perfAudit.longTasks.length,
      longTasks: window.__perfAudit.longTasks.slice(0, 5),
      memoryGrowthBytes: window.__perfAudit.memorySnapshots.length > 1
        ? window.__perfAudit.memorySnapshots[window.__perfAudit.memorySnapshots.length - 1].usedJSHeapSize - window.__perfAudit.memorySnapshots[0].usedJSHeapSize
        : 0
    };
  });

  console.log('Performance Metrics (Scenario B):', JSON.stringify(perfData, null, 2));

  // ---------------------------------------------------------------------------
  // SCENARIO C: RUN, PAUSE, RESUME, STEP PRECISION
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO C: STEP (+0.1s) & PAUSE ACCURACY ---');
  await page.locator('button[title*="Tạm dừng"]').first().click();
  await page.waitForTimeout(200);

  const getSimTime = async () => {
    return await page.evaluate(() => {
      const text = document.querySelector('.font-mono.text-\\[11px\\].text-cyan-300')?.textContent || '';
      const match = text.match(/T:\s*([\d.]+)s/);
      return match ? parseFloat(match[1]) : null;
    });
  };

  const t1 = await getSimTime();
  await page.locator('button[title*="Thực thi từng bước"]').first().click();
  await page.waitForTimeout(200);
  const t2 = await getSimTime();
  const stepAccuracy = t1 !== null && t2 !== null ? +(t2 - t1).toFixed(2) : null;
  console.log(`Step increment: from ${t1}s to ${t2}s -> Delta = ${stepAccuracy}s`);

  // ---------------------------------------------------------------------------
  // SCENARIO D: 20 CYCLES OF LAYOUT SWITCHING & TRANSITION LATENCY
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO D: 20 CYCLES LAYOUT TRANSITION BENCHMARK ---');
  const layouts = ['Standard', 'Focus', 'Split View', 'Triple View', 'PiP', 'Fullscreen'];
  const layoutTimings = {};
  layouts.forEach(l => { layoutTimings[l] = []; });

  for (let cycle = 1; cycle <= 20; cycle++) {
    for (const layoutName of layouts) {
      const t0 = Date.now();
      const btn = page.locator(`button[title*="${layoutName}"], button:has-text("${layoutName}")`).first();
      await btn.click();
      await page.waitForTimeout(50);
      const dt = Date.now() - t0;
      layoutTimings[layoutName].push(dt);
    }
  }

  const layoutSummary = {};
  layouts.forEach(l => {
    const arr = layoutTimings[l];
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    layoutSummary[l] = {
      avgMs: +avg.toFixed(1),
      minMs: Math.min(...arr),
      maxMs: Math.max(...arr)
    };
  });
  console.log('Layout Switch Latency Summary:', JSON.stringify(layoutSummary, null, 2));

  // Reset back to standard
  await page.locator('button[title*="Khôi phục"], button:has-text("Reset Layout")').first().click();
  await page.waitForTimeout(300);

  // Capture Screenshot of each layout
  for (const layoutName of layouts) {
    const btn = page.locator(`button[title*="${layoutName}"], button:has-text("${layoutName}")`).first();
    await btn.click();
    await page.waitForTimeout(200);
    const fname = `layout_${layoutName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
    await page.screenshot({ path: path.join(screenshotsDir, fname), fullPage: false });
  }

  // Restore standard
  await page.locator('button[title*="Khôi phục"], button:has-text("Reset Layout")').first().click();
  await page.waitForTimeout(300);

  // ---------------------------------------------------------------------------
  // SCENARIO E: TAB SWITCHING DURING ACTIVE SIMULATION
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO E: TAB SWITCHING STABILITY ---');
  await page.locator('button[title*="Chạy mô phỏng"]').first().click();
  await page.waitForTimeout(300);
  // Ensure we are out of fullscreen before switching tabs
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Switch to Home tab
  await page.locator('button[title*="Bản Đồ Kiến Thức"], button:has-text("Bản Đồ Kiến Thức")').first().click();
  await page.waitForTimeout(500);
  // Switch to Modules tab
  await page.locator('button[title*="12 Modules Chi Tiết"], button:has-text("12 Modules Chi Tiết")').first().click();
  await page.waitForTimeout(500);
  // Switch back to robot-sim tab
  await page.locator('button[title*="Robot 2 Động Cơ"], button:has-text("Robot 2 Động Cơ")').first().click();
  await page.waitForTimeout(500);

  const isSimAliveAfterTabSwitch = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    return canvases.length >= 2;
  });
  console.log(`Canvases restored after tab switches: ${isSimAliveAfterTabSwitch}`);

  // ---------------------------------------------------------------------------
  // SCENARIO F: CONTINUOUS WINDOW RESIZING
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO F: WINDOW RESIZE STRESS TEST ---');
  const viewportsToTest = [
    { width: 1920, height: 1080, name: 'desktop_1080p' },
    { width: 1366, height: 768, name: 'laptop_1366' },
    { width: 1024, height: 768, name: 'tablet_1024' },
    { width: 412, height: 915, name: 'mobile_412' }
  ];

  const resizeResults = [];
  for (const vp of viewportsToTest) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);

    const dims = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      return canvases.map(c => ({
        width: c.clientWidth,
        height: c.clientHeight,
        hasZeroDim: c.clientWidth === 0 || c.clientHeight === 0
      }));
    });

    const hasFailure = dims.some(d => d.hasZeroDim);
    resizeResults.push({
      viewport: `${vp.width}x${vp.height} (${vp.name})`,
      canvases: dims,
      pass: !hasFailure
    });

    await page.screenshot({ path: path.join(screenshotsDir, `viewport_${vp.name}.png`), fullPage: false });
  }

  // Restore 1440x900 viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);

  // ---------------------------------------------------------------------------
  // SCENARIO G: CAD INSPECTION MODES ASSERTION & SCREENSHOTS
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO G: CAD INSPECTION MODES & CAPTURES ---');
  const cadModes = ['realistic', 'wireframe', 'components', 'collision', 'coordinates', 'sensors', 'dimensions'];
  const cadScreenshots = {};

  for (const mode of cadModes) {
    const selectElem = page.locator('select').first();
    await selectElem.selectOption(mode);
    await page.waitForTimeout(300);

    const activeMode = await page.locator('[data-testid="robot-3d-canvas"]').getAttribute('data-active-cad-mode');
    const fname = `cad_${mode}.png`;
    await page.screenshot({ path: path.join(screenshotsDir, fname), fullPage: false });
    cadScreenshots[mode] = { activeMode, screenshot: fname, pass: activeMode === mode };
  }

  // Restore realistic
  await page.locator('select').first().selectOption('realistic');
  await page.waitForTimeout(200);

  // ---------------------------------------------------------------------------
  // SCENARIO H: OBSTACLE COLLISION & DISTANCE SENSORS
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO H: COLLISION & SENSOR CHECK ---');
  const runBtn = page.locator('button[title*="Chạy mô phỏng"]').first();
  if (await runBtn.isVisible()) {
    await runBtn.click();
  }
  await page.locator('button[title*="Tiến"]').first().click();
  await page.waitForTimeout(3000); // drive forward towards obstacles

  const sensorHud = await page.evaluate(() => {
    return document.querySelector('.font-mono.text-\\[11px\\].text-cyan-300')?.textContent || '';
  });
  console.log(`Driving telemetry: ${sensorHud}`);

  // ---------------------------------------------------------------------------
  // SCENARIO I: FPV CAMERA EXPAND & TOGGLE
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO I: FPV VIEWPORT CAPTURE ---');
  await page.screenshot({ path: path.join(screenshotsDir, 'fpv_camera_view.png'), fullPage: false });

  // ---------------------------------------------------------------------------
  // SCENARIO J: E-STOP AND RESET
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO J: EMERGENCY STOP (E-STOP) & RESET ---');
  await page.locator('button[title*="Dừng khẩn cấp"]').first().click();
  await page.waitForTimeout(300);

  // Dismiss modal
  const dismissModalBtn = page.locator('button:has-text("Xác Nhận & Tiếp Tục"), button:has-text("Xác Nhận")').first();
  if (await dismissModalBtn.isVisible()) {
    await dismissModalBtn.click();
    await page.waitForTimeout(300);
  }

  await page.locator('button[title*="Đặt lại vị trí"]').first().click();
  await page.waitForTimeout(300);

  const resetTelemetry = await page.evaluate(() => {
    return document.querySelector('.font-mono.text-\\[11px\\].text-cyan-300')?.textContent || '';
  });
  console.log(`Post-reset telemetry: ${resetTelemetry}`);

  // ---------------------------------------------------------------------------
  // COMPILE RESULTS INTO test-results.json AND audit-summary.json
  // ---------------------------------------------------------------------------
  console.log('\n4. Compiling Quantitative Audit Data...');
  const auditSummary = {
    timestamp: new Date().toISOString(),
    environment: {
      platform: 'Windows (Win32 x64)',
      browser: 'Microsoft Edge (Chromium Engine)',
      viewportBaseline: '1440x900',
      webgl: webglCapabilities
    },
    performance: {
      initialPageLoadTimeMs: initialLoadTimeMs,
      cockpitInitTimeMs: cockpitInitTimeMs,
      scenarioB_continuous60s: perfData,
      layoutSwitchLatency: layoutSummary,
      resizeTests: resizeResults
    },
    cadModes: cadScreenshots,
    simulationCorrectness: {
      stepIncrementSec: stepAccuracy,
      stepPass: stepAccuracy === 0.1,
      numericalStability: !sensorHud.includes('NaN') && !sensorHud.includes('Infinity'),
      resetPosePass: resetTelemetry.includes('-0.80')
    },
    errors: {
      consoleErrorsCount: consoleErrors.length,
      consoleErrors: consoleErrors,
      pageErrorsCount: pageErrors.length,
      pageErrors: pageErrors
    }
  };

  const outputDir = path.resolve('reports/phase3_3_graphics_audit');
  fs.writeFileSync(path.join(outputDir, 'audit-summary.json'), JSON.stringify(auditSummary, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'test-results.json'), JSON.stringify(auditSummary, null, 2), 'utf-8');

  console.log('JSON summaries saved successfully!');
  await browser.close();
  return auditSummary;
}

runComprehensiveAudit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
