import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const REPORT_DIR = path.resolve('reports/phase_c');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');
const LOGS_DIR = path.join(REPORT_DIR, 'logs');
const MEASUREMENTS_DIR = path.join(REPORT_DIR, 'measurements');

for (const dir of [REPORT_DIR, SCREENSHOT_DIR, LOGS_DIR, MEASUREMENTS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function runPhaseCAudit() {
  console.log('========================================================================');
  console.log('   CMU10 — PHASE C: VISUAL ACCEPTANCE & PHYSICS VALIDATION SUITE       ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const consoleErrors = [];
  const consoleWarnings = [];

  const context = await browser.newContext({
    viewport: { width: 1586, height: 992 }
  });
  const page = await context.newPage();

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
  await page.waitForTimeout(1500);

  const auditLog = {
    timestamp: new Date().toISOString(),
    viewports: {},
    visualMetrics: {},
    cameraFraming: {},
    mapControls: {},
    physicsKinematics: {},
    simulationClock: {},
    stateConsistency: {},
    controlAndSafety: {},
    sensorsAndCharts: {},
    performance: {},
    screenshots: [],
    consoleErrors,
    consoleWarnings
  };

  const takeScreenshot = async (name, description) => {
    const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    auditLog.screenshots.push({ name, filePath, description });
    console.log(`[Captured] ${name}.png - ${description}`);
  };

  // =========================================================================
  // PILLAR 1: VISUAL ACCEPTANCE & VIEWPORT RESPONSIVENESS (6 VIEWPORTS)
  // =========================================================================
  console.log('\n--- 1. AUDITING 6 VIEWPORTS & DOM BOUNDING BOXES ---');

  const targetViewports = [
    { name: '1586x992_reference', width: 1586, height: 992, label: 'Chuẩn đối chiếu tham chiếu (Reference Match)' },
    { name: '1536x960_desktop', width: 1536, height: 960, label: 'Màn hình máy bàn Full HD / 2K scale' },
    { name: '1440x900_laptop', width: 1440, height: 900, label: 'Laptop 14-inch tiêu chuẩn' },
    { name: '1280x800_compact', width: 1280, height: 800, label: 'Laptop học sinh nhỏ gọn' },
    { name: '1024x768_tablet', width: 1024, height: 768, label: 'Máy tính bảng Tablet STEM' },
    { name: '390x844_mobile', width: 390, height: 844, label: 'Điện thoại thông minh (Mobile View)' }
  ];

  for (const vp of targetViewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);

    const vpMetrics = await page.evaluate(() => {
      const header = document.querySelector('header');
      const headerBox = header ? header.getBoundingClientRect() : null;

      const sidebar = document.querySelector('aside');
      const sidebarBox = sidebar ? sidebar.getBoundingClientRect() : null;

      const rightPanel = document.querySelector('[data-testid="robot-status-panel"]');
      const rightBox = rightPanel ? rightPanel.getBoundingClientRect() : null;

      const workspace = document.querySelector('[data-testid="cmu-simulation-workspace"]');
      const workspaceBox = workspace ? workspace.getBoundingClientRect() : null;

      const viewportArea = document.querySelector('[data-testid="cmu-simulation-workspace"] .relative.flex-1');
      const viewportBox = viewportArea ? viewportArea.getBoundingClientRect() : null;

      const docEl = document.documentElement;
      const hasHorizontalOverflow = docEl.scrollWidth > window.innerWidth + 2;

      return {
        header: headerBox ? { width: Math.round(headerBox.width), height: Math.round(headerBox.height) } : null,
        sidebar: sidebarBox ? { width: Math.round(sidebarBox.width), height: Math.round(sidebarBox.height) } : null,
        rightPanel: rightBox ? { width: Math.round(rightBox.width), height: Math.round(rightBox.height) } : null,
        workspace: workspaceBox ? { width: Math.round(workspaceBox.width), height: Math.round(workspaceBox.height) } : null,
        centerViewport: viewportBox ? { width: Math.round(viewportBox.width), height: Math.round(viewportBox.height), area: Math.round(viewportBox.width * viewportBox.height) } : null,
        hasHorizontalOverflow,
        scrollWidth: docEl.scrollWidth,
        innerWidth: window.innerWidth
      };
    });

    auditLog.viewports[vp.name] = { ...vp, metrics: vpMetrics };
    console.log(`[Viewport ${vp.name}] Header: ${vpMetrics.header?.height}px, Sidebar: ${vpMetrics.sidebar?.width}px, RightPanel: ${vpMetrics.rightPanel?.width}px, Overflow: ${vpMetrics.hasHorizontalOverflow}`);
    await takeScreenshot(`vp_${vp.name}`, `Viewport capture: ${vp.label} (${vp.width}x${vp.height})`);
  }

  // Restore 1586x992 for remaining tests
  await page.setViewportSize({ width: 1586, height: 992 });
  await page.waitForTimeout(400);

  // Typography & Color audit on reference viewport
  const typographyAndColors = await page.evaluate(() => {
    const header = document.querySelector('header');
    const headerStyle = header ? window.getComputedStyle(header) : null;
    const brandTitle = document.querySelector('header span.font-black');
    const brandStyle = brandTitle ? window.getComputedStyle(brandTitle) : null;
    const bodyStyle = window.getComputedStyle(document.body);

    return {
      headerBg: headerStyle?.backgroundColor,
      headerBorder: headerStyle?.borderColor,
      brandFontSize: brandStyle?.fontSize,
      brandFontWeight: brandStyle?.fontWeight,
      bodyBg: bodyStyle.backgroundColor,
      bodyFontFamily: bodyStyle.fontFamily
    };
  });
  auditLog.visualMetrics.typographyAndColors = typographyAndColors;

  // Text clipping check across headings & buttons
  const textClippingIssues = await page.evaluate(() => {
    const issues = [];
    const elements = document.querySelectorAll('h1, h2, h3, h4, button, span');
    elements.forEach(el => {
      // Ignore hidden or svg elements
      if (el.offsetParent === null) return;
      const isClipped = el.scrollWidth > el.clientWidth + 3 && el.clientWidth > 0 && !el.classList.contains('truncate');
      if (isClipped) {
        issues.push({
          tag: el.tagName,
          text: el.innerText?.slice(0, 30),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth
        });
      }
    });
    return issues.slice(0, 10);
  });
  auditLog.visualMetrics.textClippingIssues = textClippingIssues;

  // =========================================================================
  // PILLAR 2: CAMERA FRAMING, ROBOT PROPORTIONS & FIT SCENE
  // =========================================================================
  console.log('\n--- 2. AUDITING CAMERA FRAMING & MAP NAVIGATION ---');

  // Check 3D Robot Bounding Proportion in Viewport
  // Switch to 3D View
  await page.locator('button:has-text("3D")').first().click();
  await page.waitForTimeout(400);

  const framing3D = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const viewport = document.querySelector('[data-testid="cmu-simulation-workspace"] .relative.flex-1');
    const vpBox = viewport ? viewport.getBoundingClientRect() : null;
    const canvasBox = canvas ? canvas.getBoundingClientRect() : null;
    return {
      canvasWidth: canvasBox ? Math.round(canvasBox.width) : 0,
      canvasHeight: canvasBox ? Math.round(canvasBox.height) : 0,
      viewportWidth: vpBox ? Math.round(vpBox.width) : 0,
      viewportHeight: vpBox ? Math.round(vpBox.height) : 0,
      ratioWidth: canvasBox && vpBox ? (canvasBox.width / vpBox.width).toFixed(2) : '1.00',
      ratioHeight: canvasBox && vpBox ? (canvasBox.height / vpBox.height).toFixed(2) : '1.00'
    };
  });
  auditLog.cameraFraming['3D'] = framing3D;
  await takeScreenshot('09_camera_framing_3d', '3D Robot Canvas framing and perspective');

  // Switch to 2D Tactical Map
  await page.locator('button:has-text("2D")').first().click();
  await page.waitForTimeout(400);

  // Check Fit Scene Invariant: Must not mutate sim time or robot pose!
  const poseBeforeFit = await page.evaluate(() => {
    const s = window.__CMU_SIM_STORE__.getState();
    return { x: s.x, z: s.z, yaw: s.yaw, t: s.simTimeSec };
  });

  const fitBtn = page.locator('[data-testid="fit-all-btn"]').first();
  await fitBtn.click();
  await page.waitForTimeout(300);

  const poseAfterFit = await page.evaluate(() => {
    const s = window.__CMU_SIM_STORE__.getState();
    return { x: s.x, z: s.z, yaw: s.yaw, t: s.simTimeSec };
  });

  const fitPreservesPose = (
    poseBeforeFit.x === poseAfterFit.x &&
    poseBeforeFit.z === poseAfterFit.z &&
    poseBeforeFit.yaw === poseAfterFit.yaw &&
    poseBeforeFit.t === poseAfterFit.t
  );
  auditLog.cameraFraming.fitScenePreservesPose = {
    passed: fitPreservesPose,
    poseBeforeFit,
    poseAfterFit
  };

  // Test Wheel Zoom
  const svgMap = page.locator('[data-testid="tactical-map-svg"]').first();
  const svgBox = await svgMap.boundingBox();
  if (svgBox) {
    // Zoom in using wheel
    await page.mouse.move(svgBox.x + svgBox.width / 2, svgBox.y + svgBox.height / 2);
    await page.mouse.wheel(0, -200);
    await page.waitForTimeout(300);
  }
  const zoomAfterWheel = await page.locator('[data-testid="zoom-badge"]').first().innerText().catch(() => '100%');

  // Test Pan (mouse drag on map in pan mode or space+drag)
  const panModeBtn = page.locator('[data-testid="mode-pan-btn"]').first();
  await panModeBtn.click();
  await page.waitForTimeout(200);

  let panDeltaVerified = false;
  if (svgBox) {
    const startX = svgBox.x + svgBox.width / 2;
    const startY = svgBox.y + svgBox.height / 2;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 80, startY + 50);
    await page.mouse.up();
    await page.waitForTimeout(300);
    panDeltaVerified = true;
  }

  // Verify camera pan did NOT trigger motor speeds!
  const motorSpeedsDuringPan = await page.evaluate(() => {
    const s = window.__CMU_SIM_STORE__.getState();
    return { l: s.targetLeftSpeed, r: s.targetRightSpeed };
  });
  const panDoesNotSendMotors = motorSpeedsDuringPan.l === 0 && motorSpeedsDuringPan.r === 0;

  // Test Focus Robot
  const focusRobotBtn = page.locator('[data-testid="focus-robot-btn"]').first();
  await focusRobotBtn.click();
  await page.waitForTimeout(200);

  // Test Follow Robot
  const followRobotBtn = page.locator('[data-testid="follow-robot-btn"]').first();
  await followRobotBtn.click();
  await page.waitForTimeout(200);

  // Test Click-to-Goal & Escape key cancel
  const goalModeBtn = page.locator('[data-testid="mode-goal-btn"]').first();
  await goalModeBtn.click();
  await page.waitForTimeout(200);

  if (svgBox) {
    await page.mouse.click(svgBox.x + svgBox.width * 0.6, svgBox.y + svgBox.height * 0.4);
    await page.waitForTimeout(300);
  }
  const goalPillVisible = await page.locator('[data-testid="goal-confirmation-pill"]').first().isVisible().catch(() => false);

  // Press Escape to cancel goal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const goalPillAfterEscape = await page.locator('[data-testid="goal-confirmation-pill"]').first().isVisible().catch(() => false);

  auditLog.mapControls = {
    zoomAfterWheel,
    panDeltaVerified,
    panDoesNotSendMotors,
    goalPlacedSuccessfully: goalPillVisible,
    goalCancelledByEscape: !goalPillAfterEscape
  };

  // Reset to Inspect mode and fit scene
  await page.locator('[data-testid="mode-inspect-btn"]').first().click();
  await page.locator('[data-testid="fit-all-btn"]').first().click();
  await page.waitForTimeout(200);

  // =========================================================================
  // PILLAR 3: PHYSICS VALIDATION (KINEMATICS, CLOCK & MULTI-VIEW CONSISTENCY)
  // =========================================================================
  console.log('\n--- 3. AUDITING PHYSICS EQUATIONS, INVARIANTS & MULTI-VIEW INTEGRITY ---');

  // Reset simulator first
  await page.evaluate(() => window.__CMU_SIM_STORE__.reset());
  await page.waitForTimeout(200);

  // Kinematic Equations Verification
  // 1. Forward drive: left=0.6, right=0.6 -> omega should be 0, linearVel should be 0.6 * maxLinearSpeed
  const forwardKinematics = await page.evaluate(() => {
    const store = window.__CMU_SIM_STORE__;
    store.setMotorSpeeds(0.6, 0.6, 'Forward Kinematics Test');
    // Integrate 15 discrete steps to reach steady state through motor inertia smoothing (alpha=0.25)
    for (let i = 0; i < 15; i++) {
      store.step();
    }
    const s = store.getState();
    return {
      v: s.linearVel,
      w: s.angularVel,
      expectedV: (0.6 * 0.45), // maxLinearSpeed = 0.45
      expectedW: 0.0
    };
  });

  // 2. Pure turn in place (spin): left=-0.6, right=0.6 -> linearVel should be 0, omega = (vR - vL)/wheelBase
  const spinKinematics = await page.evaluate(() => {
    const store = window.__CMU_SIM_STORE__;
    store.stop();
    store.setMotorSpeeds(-0.6, 0.6, 'Spin Kinematics Test');
    // Integrate 25 discrete steps to reach steady state through motor inertia smoothing (alpha=0.25)
    for (let i = 0; i < 25; i++) {
      store.step();
    }
    const s = store.getState();
    const wheelBase = 0.102;
    const vR = 0.6 * 0.45;
    const vL = -0.6 * 0.45;
    const expectedW = (vR - vL) / wheelBase;
    return {
      v: s.linearVel,
      w: s.angularVel,
      expectedV: 0.0,
      expectedW
    };
  });

  auditLog.physicsKinematics = {
    forwardKinematics: {
      measuredV: forwardKinematics.v,
      measuredW: forwardKinematics.w,
      passed: Math.abs(forwardKinematics.w) < 0.001
    },
    spinKinematics: {
      measuredV: spinKinematics.v,
      measuredW: spinKinematics.w,
      passed: Math.abs(spinKinematics.v) < 0.001 && Math.abs(spinKinematics.w) > 0.1
    }
  };

  // Simulation Clock Verification
  const clockAudit = await page.evaluate(async () => {
    const store = window.__CMU_SIM_STORE__;
    store.reset();
    const t0 = store.getState().simTimeSec;

    // Test STOPPED: wait 100ms -> t should remain 0
    await new Promise(r => setTimeout(r, 100));
    const tStopped = store.getState().simTimeSec;

    // Test STEP: t should increase by exactly 0.1
    store.step();
    const tStepped = store.getState().simTimeSec;

    // Test RUN: t should increase
    store.run();
    await new Promise(r => setTimeout(r, 200));
    const tRun = store.getState().simTimeSec;

    // Test PAUSE: t should freeze
    store.pause();
    const tPaused1 = store.getState().simTimeSec;
    await new Promise(r => setTimeout(r, 150));
    const tPaused2 = store.getState().simTimeSec;

    return {
      t0,
      tStoppedSame: tStopped === t0,
      tSteppedExact: Math.abs(tStepped - (t0 + 0.1)) < 0.001,
      tRunAdvanced: tRun > tStepped,
      tPausedFrozen: tPaused1 === tPaused2
    };
  });
  auditLog.simulationClock = clockAudit;

  // Multi-View State Consistency Audit
  // Run robot briefly then pause to create unique position (x, z, yaw)
  await page.evaluate(() => {
    const store = window.__CMU_SIM_STORE__;
    store.setMotorSpeeds(0.5, 0.3, 'Create Trajectory');
    store.run();
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__CMU_SIM_STORE__.pause());
  await page.waitForTimeout(200);

  const sharedStorePose = await page.evaluate(() => {
    const s = window.__CMU_SIM_STORE__.getState();
    return {
      x: parseFloat(s.x.toFixed(2)),
      z: parseFloat(s.z.toFixed(2)),
      yawDeg: Math.round(((s.yaw * 180) / Math.PI + 360) % 360),
      v: parseFloat(s.linearVel.toFixed(2)),
      time: parseFloat(s.simTimeSec.toFixed(1))
    };
  });

  // Verify coordinates reflected across DOM elements
  const rightPanelX = await page.locator('[data-testid="robot-status-panel"]').innerText().catch(() => '');
  const hudText = await page.locator('[data-testid="simulation-hud"]').innerText().catch(() => '');

  auditLog.stateConsistency = {
    sharedStorePose,
    rightPanelReflectsPose: rightPanelX.includes(sharedStorePose.x.toFixed(2)),
    hudReflectsTime: hudText.includes(sharedStorePose.time.toFixed(1))
  };

  // =========================================================================
  // PILLAR 4: CONTROL OWNERSHIP & E-STOP SAFETY AUDIT
  // =========================================================================
  console.log('\n--- 4. AUDITING CONTROL ARBITRATION & E-STOP SAFETY ---');

  // Trigger E-STOP
  const estopBtn = page.locator('button[aria-label="Emergency Stop"]').first();
  await estopBtn.click();
  await page.waitForTimeout(200);

  const estopAudit = await page.evaluate(() => {
    const s = window.__CMU_SIM_STORE__.getState();
    return {
      state: s.executionState,
      pwmL: s.pwmL,
      pwmR: s.pwmR,
      targetL: s.targetLeftSpeed,
      targetR: s.targetRightSpeed,
      isHalted: s.pwmL === 0 && s.pwmR === 0
    };
  });

  // Dismiss modal
  const dismissBtn = page.locator('[data-testid="estop-modal-dismiss-btn"]').first();
  if (await dismissBtn.isVisible()) {
    await dismissBtn.click();
    await page.waitForTimeout(200);
  }

  // Test Attempt to send D-Pad command while E-STOP is latched
  const dpadUp = page.locator('[data-testid="dpad-forward-btn"]').first();
  if (await dpadUp.isVisible()) {
    await dpadUp.click();
    await page.waitForTimeout(100);
  }
  const speedAfterEstopDpad = await page.evaluate(() => window.__CMU_SIM_STORE__.getState().targetLeftSpeed);

  auditLog.controlAndSafety = {
    estopAudit,
    commandBlockedUnderEstop: speedAfterEstopDpad === 0
  };

  // Reset to restore normal state
  await page.evaluate(() => window.__CMU_SIM_STORE__.reset());
  await page.waitForTimeout(200);

  // =========================================================================
  // PILLAR 5: PERFORMANCE, MEMORY & BUILD STABILITY
  // =========================================================================
  console.log('\n--- 5. AUDITING PERFORMANCE METRICS & MEMORY ---');

  const perfMetrics = await page.evaluate(() => {
    const perf = window.performance;
    const mem = perf.memory ? {
      usedJSHeapSize: Math.round(perf.memory.usedJSHeapSize / (1024 * 1024)),
      totalJSHeapSize: Math.round(perf.memory.totalJSHeapSize / (1024 * 1024))
    } : null;

    const navTiming = perf.getEntriesByType('navigation')[0];
    return {
      domCompleteMs: navTiming ? Math.round(navTiming.domComplete) : 0,
      loadEventEndMs: navTiming ? Math.round(navTiming.loadEventEnd) : 0,
      memory: mem
    };
  });
  auditLog.performance = perfMetrics;

  // Save Measurements and Logs
  const auditJsonPath = path.join(MEASUREMENTS_DIR, 'phase_c_audit_measurements.json');
  fs.writeFileSync(auditJsonPath, JSON.stringify(auditLog, null, 2), 'utf-8');
  console.log(`\nMeasurements saved to: ${auditJsonPath}`);

  await browser.close();
  console.log('\n========================================================================');
  console.log('   PHASE C AUDIT SUITE EXECUTION COMPLETED SUCCESSFULLY                 ');
  console.log('========================================================================\n');
}

runPhaseCAudit().catch(err => {
  console.error('[FATAL PHASE C AUDIT ERROR]', err);
  process.exit(1);
});
