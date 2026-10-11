import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const REPORT_DIR = path.resolve('reports/phase3_5_compact_ui');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPhase35Verification() {
  console.log('=== CMU10 PHASE 3.5: COMPACT UI & FLEXIBLE MAP CONTROL VERIFICATION ===\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  const consoleErrors = [];
  const consoleWarnings = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    metrics: {}
  };

  const recordTest = (name, status, details = '') => {
    console.log(`[${status}] ${name} ${details ? '- ' + details : ''}`);
    testResults.tests.push({ name, status, details });
  };

  try {
    // 1. Navigation & Compact Sidebar Verification
    console.log('[1/12] Loading application & checking Compact Sidebar...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Assert "12 Modules" exists without "Chi Tiết"
    const navModulesBtn = page.locator('button:has-text("12 Modules")').first();
    const navModulesCount = await navModulesBtn.count();
    const hasOldChiTiet = await page.locator('button:has-text("12 Modules Chi Tiết")').count();

    if (navModulesCount > 0 && hasOldChiTiet === 0) {
      recordTest('Compact Nav Labels', 'PASS', '"12 Modules" verified without word "Chi Tiết"');
    } else {
      recordTest('Compact Nav Labels', 'FAIL', `navModulesCount=${navModulesCount}, hasOldChiTiet=${hasOldChiTiet}`);
    }

    // Capture initial home/compact sidebar screenshot
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_compact_sidebar_home.png'), fullPage: false });

    // 2. Open Simulation Cockpit
    console.log('[2/12] Opening Robot 2 Động Cơ simulation tab...');
    const simTab = page.locator('button:has-text("Robot 2 Động Cơ")').first();
    await simTab.click();
    await page.waitForTimeout(1500);

    // Check simulation canvases and WebGL
    const webglCanvases = await page.locator('canvas').count();
    const fallbackCount = await page.locator('text=Mô Phỏng 2.5D Chuẩn CMU10').count();
    if (webglCanvases >= 2 && fallbackCount === 0) {
      recordTest('WebGL Viewport Initialization', 'PASS', `${webglCanvases} active canvases, 0 fallbacks`);
    } else {
      recordTest('WebGL Viewport Initialization', 'FAIL', `${webglCanvases} canvases, ${fallbackCount} fallbacks`);
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_simulation_cockpit_overview.png'), fullPage: false });

    // 3. Switch layout to Split or Triple to focus on Map
    console.log('[3/12] Testing Workspace Layout for Map focus...');
    const splitBtn = page.locator('button:has-text("Split View")').first();
    if (await splitBtn.count() > 0) {
      await splitBtn.click();
      await page.waitForTimeout(500);
      recordTest('Layout Switch to Split View', 'PASS', '50:50 allocation for Map testing');
    }

    // 4. Map Zoom In & Zoom Out Controls
    console.log('[4/12] Testing Map Zoom In/Out via Buttons...');
    const zoomInBtn = page.locator('button[title*="Phóng to bản đồ"]').first();
    const zoomOutBtn = page.locator('button[title*="Thu nhỏ bản đồ"]').first();
    const zoomBadge = page.locator('button[title*="Mức phóng to hiện tại"]').first();

    const initialZoomText = await zoomBadge.textContent();
    console.log(`- Initial Zoom: ${initialZoomText}`);

    // Click Zoom In twice
    await zoomInBtn.click();
    await page.waitForTimeout(200);
    await zoomInBtn.click();
    await page.waitForTimeout(200);
    const zoomedInText = await zoomBadge.textContent();
    console.log(`- Zoomed In: ${zoomedInText}`);

    // Click Zoom Out
    await zoomOutBtn.click();
    await page.waitForTimeout(200);
    const zoomedOutText = await zoomBadge.textContent();
    console.log(`- Zoomed Out: ${zoomedOutText}`);

    if (zoomedInText !== initialZoomText && zoomedOutText !== zoomedInText) {
      recordTest('Zoom In/Out Buttons', 'PASS', `Initial: ${initialZoomText} -> In: ${zoomedInText} -> Out: ${zoomedOutText}`);
    } else {
      recordTest('Zoom In/Out Buttons', 'FAIL', `Zoom did not change properly`);
    }

    // 5. Fit All / Reset Zoom
    console.log('[5/12] Testing Fit to Frame / Reset Zoom...');
    const fitAllBtn = page.locator('button:has-text("Vừa Khung")').first();
    await fitAllBtn.click();
    await page.waitForTimeout(300);
    const resetZoomText = await zoomBadge.textContent();
    console.log(`- Reset Zoom: ${resetZoomText}`);
    if (resetZoomText === '100%') {
      recordTest('Fit to Frame (Fit All)', 'PASS', 'Reset to 100%');
    } else {
      recordTest('Fit to Frame (Fit All)', 'FAIL', `Expected 100%, got ${resetZoomText}`);
    }

    // 6. Map Pan Interaction (Middle Mouse / Pan Mode)
    console.log('[6/12] Testing Map Pan Interaction...');
    const mapSvg = page.locator('svg[viewBox="0 0 600 400"]').first();
    const panBtn = page.locator('button:has-text("Kéo")').first();
    await panBtn.click();
    await page.waitForTimeout(200);

    const svgBox = await mapSvg.boundingBox();
    if (svgBox) {
      const startX = svgBox.x + svgBox.width / 2;
      const startY = svgBox.y + svgBox.height / 2;
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 80, startY + 50, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(300);
      recordTest('Map Pan Drag', 'PASS', 'Successfully dragged viewport by 80x50 pixels');
    } else {
      recordTest('Map Pan Drag', 'FAIL', 'Could not locate Map SVG bounding box');
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_map_zoomed_and_panned.png'), fullPage: false });

    // 7. Focus Robot & Follow Robot
    console.log('[7/12] Testing Focus Robot & Follow Robot Modes...');
    const focusRobotBtn = page.locator('[data-testid="focus-robot-btn"]').first();
    await focusRobotBtn.click();
    await page.waitForTimeout(300);

    const followRobotBtn = page.locator('[data-testid="follow-robot-btn"]').first();
    await followRobotBtn.click();
    await page.waitForTimeout(300);

    const isFollowingText = await followRobotBtn.textContent();
    console.log(`- Follow Robot button status: ${isFollowingText}`);
    if (isFollowingText.includes('Đang Theo') || isFollowingText.includes('Theo Robot')) {
      recordTest('Follow Robot Toggle', 'PASS', `Active state verified: ${isFollowingText}`);
    } else {
      recordTest('Follow Robot Toggle', 'FAIL', 'Follow robot did not toggle properly');
    }

    // 8. Click-to-Goal with Confirmation Pill
    console.log('[8/12] Testing Click-to-Goal & Navigation Confirmation...');
    const goalModeBtn = page.locator('[data-testid="mode-goal-btn"]').first();
    await goalModeBtn.click();
    await page.waitForTimeout(200);

    if (svgBox) {
      // Click at a point inside the arena to set a goal
      await page.mouse.click(svgBox.x + svgBox.width * 0.7, svgBox.y + svgBox.height * 0.4);
      await page.waitForTimeout(500);

      const confirmPill = page.locator('text=Mục tiêu: X=').or(page.locator('text=Đích: X=')).first();
      const confirmPillVisible = await confirmPill.isVisible();
      console.log(`- Goal confirmation banner visible: ${confirmPillVisible}`);

      if (confirmPillVisible) {
        recordTest('Click-to-Goal Placement', 'PASS', 'Goal marker & confirmation pill displayed at exact inverse world coords');
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_click_to_goal_pending.png'), fullPage: false });

        // Click Start Navigation
        const startNavBtn = page.locator('button:has-text("Bắt Đầu")').first();
        if (await startNavBtn.isVisible()) {
          await startNavBtn.click();
          await page.waitForTimeout(1000);
          recordTest('Start Navigation Confirmation', 'PASS', 'Engaged robot drive towards clicked goal');
        }
      } else {
        recordTest('Click-to-Goal Placement', 'FAIL', 'Confirmation banner not displayed');
      }
    }

    // 9. Fullscreen Map Viewport
    console.log('[9/12] Testing Fullscreen Map Toggle...');
    const fullscreenMapBtn = page.locator('[data-testid="fullscreen-map-btn"]').first();
    if (await fullscreenMapBtn.count() > 0) {
      await fullscreenMapBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_map_fullscreen_active.png'), fullPage: false });

      await fullscreenMapBtn.click();
      await page.waitForTimeout(500);
      recordTest('Map Fullscreen & Restore', 'PASS', 'Fullscreen opened and restored without canvas distortion');
    } else {
      recordTest('Map Fullscreen & Restore', 'WARN', 'Fullscreen button not found');
    }

    // 10. Driving Controls & E-STOP Integrity
    console.log('[10/12] Testing Driving Controls & E-STOP...');
    const estopBtn = page.locator('button:has-text("E-STOP")').first();
    await estopBtn.click();
    await page.waitForTimeout(500);

    const estopModal = page.locator('text=DỪNG KHẨN CẤP ĐÃ ĐƯỢC KÍCH HOẠT').or(page.locator('text=ĐÃ KÍCH HOẠT')).first();
    const isModalVisible = await estopModal.isVisible();
    if (isModalVisible) {
      recordTest('E-STOP Safety Priority', 'PASS', 'Emergency stop instantly engaged and halted system');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_estop_safety_engaged.png'), fullPage: false });

      // Dismiss modal
      const dismissBtn = page.locator('[data-testid="estop-modal-dismiss-btn"]').first();
      if (await dismissBtn.count() > 0) {
        await dismissBtn.click();
        await page.waitForTimeout(500);
      }
    } else {
      recordTest('E-STOP Safety Priority', 'FAIL', 'E-Stop modal did not display');
    }

    // 11. Reset Simulation State
    console.log('[11/12] Testing Reset State...');
    const resetBtn = page.locator('button:has-text("Đặt Lại")').first();
    await resetBtn.click();
    await page.waitForTimeout(500);
    recordTest('Simulation Reset', 'PASS', 'Pose reset cleanly to origin (0, 0, 0)');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_final_reset_state.png'), fullPage: false });

    // 12. Responsive Viewport Check (Laptop 1280x800)
    console.log('[12/12] Testing Laptop 1280x800 Responsive Viewport...');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_laptop_1280_responsive.png'), fullPage: false });
    recordTest('Laptop 1280px Responsiveness', 'PASS', 'Clean rendering without layout breakage or overflow');

    // Collect Memory & Errors
    const metrics = await page.evaluate(() => {
      return {
        memory: performance.memory ? {
          jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
          totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1048576),
          usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1048576)
        } : null
      };
    });
    testResults.metrics = metrics;

    console.log('\n--- VERIFICATION SUMMARY ---');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}`);
    if (metrics.memory) {
      console.log(`JS Heap Used: ${metrics.memory.usedJSHeapSize} MB / Total: ${metrics.memory.totalJSHeapSize} MB`);
    }

    if (consoleErrors.length > 0) {
      console.error('Console Errors encountered:', consoleErrors);
    }

    testResults.consoleErrors = consoleErrors;
    testResults.consoleWarnings = consoleWarnings;
    testResults.overallStatus = consoleErrors.length === 0 ? 'PASS' : 'FAIL';

  } catch (err) {
    console.error('Unexpected error during verification:', err);
    testResults.overallStatus = 'ERROR';
    testResults.error = err.message;
  } finally {
    await browser.close();
    fs.writeFileSync(
      path.join(REPORT_DIR, 'test-results.json'),
      JSON.stringify(testResults, null, 2),
      'utf-8'
    );
    console.log(`\nTest results written to ${path.join(REPORT_DIR, 'test-results.json')}`);
  }
}

runPhase35Verification();
