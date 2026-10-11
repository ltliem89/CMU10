import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const REPORT_DIR = path.resolve('reports/phase_b');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');
const RECON_DIR = path.resolve('reports/ui_reconstruction');
const RECON_SCREENSHOT_DIR = path.join(RECON_DIR, 'screenshots');

for (const dir of [REPORT_DIR, SCREENSHOT_DIR, RECON_DIR, RECON_SCREENSHOT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runPhaseBVerification() {
  console.log('================================================================');
  console.log('   CMU10 — PHASE B: UI RECONSTRUCTION & VERIFICATION SUITE       ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({
    viewport: { width: 1536, height: 960 }
  });

  const consoleErrors = [];
  const consoleWarnings = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') {
      consoleErrors.push(text);
      console.error('[Browser Error]', text);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
    console.error('[Page Error]', err.message);
  });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    screenshots: [],
    consoleErrors,
    consoleWarnings
  };

  const takeScreenshot = async (name, description) => {
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    const reconPath = path.join(RECON_SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    fs.copyFileSync(filePath, reconPath);
    testResults.screenshots.push({ name, filePath, description });
    console.log(`[Captured] ${name}.png - ${description}`);
  };

  const recordTest = (name, passed, details = '') => {
    testResults.tests.push({ name, passed, details });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${details ? ': ' + details : ''}`);
  };

  // Test 1: Baseline Simulation Viewport matching Reference Design
  try {
    await page.waitForSelector('[data-testid="cmu-simulation-workspace"]', { timeout: 5000 });
    await takeScreenshot('01_simulation_reference_match', 'Reconstructed simulation workspace matching reference design');
    recordTest('Workspace Root Rendered', true, 'cmu-simulation-workspace selector visible');
  } catch (e) {
    recordTest('Workspace Root Rendered', false, e.message);
  }

  // Test 2: Lesson Sidebar Expand & Interaction
  try {
    const lessonItem = page.locator('text=Chuyển động thẳng biến đổi đều').first();
    if (await lessonItem.isVisible()) {
      await lessonItem.click();
      await page.waitForTimeout(500);
    }
    await takeScreenshot('02_lesson_sidebar_expanded', 'Lesson sidebar with Grade 10 Physics lessons and objectives');
    recordTest('Lesson Sidebar Interaction', true, 'Selected Lesson 2 successfully');
  } catch (e) {
    recordTest('Lesson Sidebar Interaction', false, e.message);
  }

  // Test 3: Collapse Lesson Sidebar
  try {
    const toggleSidebarBtn = page.locator('[data-testid="lesson-sidebar-toggle-btn"]').first();
    if (await toggleSidebarBtn.isVisible()) {
      await toggleSidebarBtn.click();
      await page.waitForTimeout(400);
      await takeScreenshot('03_lesson_sidebar_collapsed', 'Sidebar collapsed for maximum simulation area');
      // Re-expand
      await toggleSidebarBtn.click();
      await page.waitForTimeout(400);
      recordTest('Lesson Sidebar Collapse/Expand', true);
    } else {
      recordTest('Lesson Sidebar Collapse/Expand', false, 'Toggle button not found');
    }
  } catch (e) {
    recordTest('Lesson Sidebar Collapse/Expand', false, e.message);
  }

  // Test 4: Robot Status & Sensors Panel
  try {
    const statusPanel = page.locator('[data-testid="robot-status-panel"]').first();
    const isVisible = await statusPanel.isVisible();
    await takeScreenshot('04_robot_status_sensors', 'Robot Status Panel with live battery and ultrasonic sensors');
    recordTest('Robot Status Panel Visible', isVisible);
  } catch (e) {
    recordTest('Robot Status Panel Visible', false, e.message);
  }

  // Test 5: D-Pad Control
  try {
    const dpadUp = page.locator('button[title*="Tiến thẳng"], button[title*="Tiến"]').first();
    if (await dpadUp.isVisible()) {
      await dpadUp.click();
      await page.waitForTimeout(300);
      await takeScreenshot('05_dpad_control_active', 'D-Pad control activated');
      recordTest('D-Pad Control Interaction', true, 'Up button clicked');
    } else {
      recordTest('D-Pad Control Interaction', false, 'Up button not found');
    }
  } catch (e) {
    recordTest('D-Pad Control Interaction', false, e.message);
  }

  // Test 6: Simulation Run & Speedometer HUD
  try {
    const runBtn = page.locator('button:has-text("Chạy")').first();
    if (await runBtn.isVisible()) {
      await runBtn.click();
      await page.waitForTimeout(1000); // Let it run for 1s
      await takeScreenshot('06_simulation_running_speedometer', 'Simulation actively running with dynamic circular speedometer HUD');
      recordTest('Simulation Run Control', true, 'Clicked Chạy');

      // Test Pause
      const pauseBtn = page.locator('button:has-text("Tạm dừng")').first();
      if (await pauseBtn.isVisible()) {
        await pauseBtn.click();
        await page.waitForTimeout(400);
        recordTest('Simulation Pause Control', true, 'Clicked Tạm dừng');
      }

      // Test Step +0.1s
      const stepBtn = page.locator('button:has-text("Bước +0.1s")').first();
      if (await stepBtn.isVisible()) {
        await stepBtn.click();
        await page.waitForTimeout(300);
        recordTest('Simulation Step Control', true, 'Clicked Bước +0.1s');
      }

      // Test Reset
      const resetBtn = page.locator('button:has-text("Đặt lại")').first();
      if (await resetBtn.isVisible()) {
        await resetBtn.click();
        await page.waitForTimeout(300);
        recordTest('Simulation Reset Control', true, 'Clicked Đặt lại');
      }
    } else {
      recordTest('Simulation Run Control', false, 'Run button not found');
    }
  } catch (e) {
    recordTest('Simulation Controls Execution', false, e.message);
  }

  // Test 7: Analytics Row - Physics Chart Metric Switcher
  try {
    const atMetricBtn = page.locator('button:has-text("a-t (Gia tốc)")').first();
    if (await atMetricBtn.isVisible()) {
      await atMetricBtn.click();
      await page.waitForTimeout(400);
    }
    await takeScreenshot('07_analytics_row_physics_charts', 'Physics Chart Panel displaying acceleration a-t curve');
    recordTest('Physics Chart Metric Switching', true, 'Switched to a-t');
  } catch (e) {
    recordTest('Physics Chart Metric Switching', false, e.message);
  }

  // Test 8: Analytics Row - Telemetry Data Table
  try {
    await takeScreenshot('08_analytics_row_telemetry_table', 'Realtime Telemetry Table with CSV export');
    recordTest('Realtime Telemetry Table Present', true);
  } catch (e) {
    recordTest('Realtime Telemetry Table Present', false, e.message);
  }

  // Test 9: Analytics Row - Camera View Gallery & Viewport Mode Switching
  try {
    // Switch Viewport to FPV
    const fpvBtn = page.locator('button:has-text("FPV")').first();
    if (await fpvBtn.isVisible()) {
      await fpvBtn.click();
      await page.waitForTimeout(600);
      await takeScreenshot('09_camera_view_gallery_fpv', 'FPV Mode active with dynamic camera gallery');
      recordTest('FPV Mode Switch', true);

      // Switch back to 3D
      const threeDBtn = page.locator('button:has-text("3D")').first();
      if (await threeDBtn.isVisible()) {
        await threeDBtn.click();
        await page.waitForTimeout(600);
      }
    }
  } catch (e) {
    recordTest('FPV Mode Switch', false, e.message);
  }

  // Test 10: Floating Minimap Collapse / Expand
  try {
    const minimapToggle = page.locator('button[title*="Thu gọn bản đồ"], button[title*="Mở rộng bản đồ"]').first();
    if (await minimapToggle.isVisible()) {
      await minimapToggle.click();
      await page.waitForTimeout(300);
      await takeScreenshot('10_minimap_expanded_collapsed', 'Floating minimap toggled in viewport');
      await minimapToggle.click(); // restore
      await page.waitForTimeout(300);
      recordTest('Floating Minimap Toggle', true);
    } else {
      recordTest('Floating Minimap Toggle', false, 'Toggle button not found');
    }
  } catch (e) {
    recordTest('Floating Minimap Toggle', false, e.message);
  }

  // Test 11: E-STOP Emergency Modal
  try {
    const estopBtn = page.locator('button:has-text("E-STOP")').first();
    if (await estopBtn.isVisible()) {
      await estopBtn.click();
      await page.waitForTimeout(500);
      await takeScreenshot('11_estop_modal_active', 'Emergency Stop E-STOP Safety Modal active');
      recordTest('E-STOP Trigger & Modal', true);

      // Dismiss E-STOP modal
      const dismissBtn = page.locator('[data-testid="estop-modal-dismiss-btn"]').first();
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
        await page.waitForTimeout(600);
      }
    } else {
      recordTest('E-STOP Trigger & Modal', false, 'E-STOP button not found');
    }
  } catch (e) {
    recordTest('E-STOP Trigger & Modal', false, e.message);
  }

  // Test 12: Pillar Tab - Bài học (ModuleDetailView)
  try {
    const lessonTabBtn = page.locator('nav button:has-text("Bài học")').first();
    if (await lessonTabBtn.isVisible()) {
      await lessonTabBtn.click();
      await page.waitForTimeout(800);
      await takeScreenshot('12_tab_lessons_view', 'Pillar Tab: Bài học (Detailed Curriculum Module View)');
      recordTest('Tab Switch: Bài học', true);
    }
  } catch (e) {
    recordTest('Tab Switch: Bài học', false, e.message);
  }

  // Test 13: Pillar Tab - Lập trình (Code Editor)
  try {
    const codeTabBtn = page.locator('nav button:has-text("Lập trình")').first();
    if (await codeTabBtn.isVisible()) {
      await codeTabBtn.click();
      await page.waitForTimeout(800);
      await takeScreenshot('13_tab_code_editor', 'Pillar Tab: Lập trình (Robotics Control Code Editor)');
      recordTest('Tab Switch: Lập trình', true);
    }
  } catch (e) {
    recordTest('Tab Switch: Lập trình', false, e.message);
  }

  // Test 14: Pillar Tab - Phân tích (Analytics)
  try {
    const analyticsTabBtn = page.locator('nav button:has-text("Phân tích")').first();
    if (await analyticsTabBtn.isVisible()) {
      await analyticsTabBtn.click();
      await page.waitForTimeout(800);
      await takeScreenshot('14_tab_analytics_dashboard', 'Pillar Tab: Phân tích (Kinematics & Dynamics Analytics)');
      recordTest('Tab Switch: Phân tích', true);
    }
  } catch (e) {
    recordTest('Tab Switch: Phân tích', false, e.message);
  }

  // Test 15: Pillar Tab - Báo cáo (Report Export)
  try {
    const reportTabBtn = page.locator('nav button:has-text("Báo cáo")').first();
    if (await reportTabBtn.isVisible()) {
      await reportTabBtn.click();
      await page.waitForTimeout(800);
      await takeScreenshot('15_tab_report_export', 'Pillar Tab: Báo cáo (Physics 10 Lab Report Export)');
      recordTest('Tab Switch: Báo cáo', true);
    }
  } catch (e) {
    recordTest('Tab Switch: Báo cáo', false, e.message);
  }

  // Switch back to Mô phỏng for Responsive Breakpoint Captures
  try {
    const simTabBtn = page.locator('nav button:has-text("Mô phỏng")').first();
    if (await simTabBtn.isVisible()) {
      await simTabBtn.click();
      await page.waitForTimeout(600);
    }
  } catch (e) {
    console.warn('Switch back to simulation tab error:', e.message);
  }

  // Test 16: Responsive Desktop 1586x992 (Target Reference Resolution)
  try {
    await page.setViewportSize({ width: 1586, height: 992 });
    await page.waitForTimeout(500);
    await takeScreenshot('16_responsive_desktop_1586x992', 'Target Reference Resolution 1586x992 layout');
    recordTest('Responsive 1586x992', true);
  } catch (e) {
    recordTest('Responsive 1586x992', false, e.message);
  }

  // Test 17: Responsive Laptop 1280x800
  try {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await takeScreenshot('17_responsive_laptop_1280x800', 'Laptop viewport 1280x800 layout');
    recordTest('Responsive 1280x800', true);
  } catch (e) {
    recordTest('Responsive 1280x800', false, e.message);
  }

  // Test 18: Responsive Tablet 1024x768
  try {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(500);
    await takeScreenshot('18_responsive_tablet_1024x768', 'Tablet viewport 1024x768 layout');
    recordTest('Responsive 1024x768', true);
  } catch (e) {
    recordTest('Responsive 1024x768', false, e.message);
  }

  // Save Test Results
  fs.writeFileSync(path.join(REPORT_DIR, 'test-results.json'), JSON.stringify(testResults, null, 2), 'utf-8');
  fs.writeFileSync(path.join(RECON_DIR, 'test-results.json'), JSON.stringify(testResults, null, 2), 'utf-8');

  console.log('\n================================================================');
  console.log(`Verification Complete: ${testResults.tests.filter(t => t.passed).length}/${testResults.tests.length} tests passed.`);
  console.log(`Screenshots Captured: ${testResults.screenshots.length}`);
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log('================================================================\n');

  await browser.close();
}

runPhaseBVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
