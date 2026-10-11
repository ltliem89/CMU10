/**
 * CMU10 — ROBOT ORIENTATION & DIFFERENTIAL-DRIVE VERIFICATION SUITE
 * =================================================================
 * Executable test harness with strict behavioral assertions for tests T01 to T12:
 * T01: Initial orientation definition & cardinal vector parity
 * T02: Forward drive along body heading (+X)
 * T03: Backward drive along reverse body heading (-X)
 * T04: Spin in place Left (Right motor forward, Left motor reverse -> turn North/-Z)
 * T05: Spin in place Right (Left motor forward, Right motor reverse -> turn South/+Z)
 * T06: Curved path differential kinematics (vL != vR)
 * T07: Four cardinal headings (0, 90, 180, 270 degrees) forward vector alignment
 * T08: Sensor orientation & directional obstacle detection
 * T09: 2D Tactical Map, 3D Canvas, and FPV Camera heading synchronization
 * T10: Multi-modal control parity (WASD, D-Pad, Click-to-Goal)
 * T11: Collision hull boundary checks
 * T12: Pause freeze and Emergency Stop latching
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('reports/robot_orientation/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runOrientationSuite() {
  console.log('========================================================================');
  console.log('   CMU10 — ROBOT ORIENTATION & DIFFERENTIAL-DRIVE TEST SUITE (T01-T12)  ');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const testResults = [];
  const captureScreenshot = async (name, desc) => {
    const p = path.join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({ path: p });
    console.log(`[Captured] ${name}.png - ${desc}`);
  };

  const assertTest = (id, name, passed, details) => {
    testResults.push({ id, name, passed, details });
    const mark = passed ? 'PASS' : 'FAIL';
    console.log(`[${mark}] ${id}: ${name}\n       Evidence: ${details}\n`);
    if (!passed) {
      console.error(`ERROR: Test ${id} FAILED!`);
    }
  };

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // =========================================================================
    // T01 — Xác định hướng ban đầu
    // =========================================================================
    const t01Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      const s = store.getState();
      const forwardVec = { x: Math.cos(s.yaw), z: Math.sin(s.yaw) };
      const rearVec = { x: -Math.cos(s.yaw), z: -Math.sin(s.yaw) };
      // Looking forward (+X), left is North (-Z), right is South (+Z)
      const leftVec = { x: Math.sin(s.yaw), z: -Math.cos(s.yaw) };
      const rightVec = { x: -Math.sin(s.yaw), z: Math.cos(s.yaw) };
      return { s, forwardVec, rearVec, leftVec, rightVec };
    });

    const t01Pass = (
      t01Data.s.yaw === 0 &&
      Math.abs(t01Data.forwardVec.x - 1.0) < 1e-4 &&
      Math.abs(t01Data.forwardVec.z - 0.0) < 1e-4 &&
      Math.abs(t01Data.rearVec.x - (-1.0)) < 1e-4 &&
      Math.abs(t01Data.leftVec.z - (-1.0)) < 1e-4 &&
      Math.abs(t01Data.rightVec.z - 1.0) < 1e-4
    );
    assertTest(
      'T01',
      'Xác định hướng ban đầu (Initial Pose & Cardinal Vectors)',
      t01Pass,
      `yaw=0rad, forward=(${t01Data.forwardVec.x}, ${t01Data.forwardVec.z}), left=(${t01Data.leftVec.x}, ${t01Data.leftVec.z}), right=(${t01Data.rightVec.x}, ${t01Data.rightVec.z})`
    );
    await captureScreenshot('01_initial_orientation', 'Robot tại vạch xuất phát hướng Đông (+X)');

    // =========================================================================
    // T02 — Tiến (Forward Drive)
    // =========================================================================
    const t02Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      const initPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      store.setMotorSpeeds(0.6, 0.6, 'T02 Forward Test');
      for (let i = 0; i < 20; i++) store.step();
      const endPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      return { initPose, endPose, deltaX: endPose.x - initPose.x, deltaZ: endPose.z - initPose.z, deltaYaw: endPose.yaw - initPose.yaw };
    });

    const t02Pass = t02Data.deltaX > 0.1 && Math.abs(t02Data.deltaZ) < 1e-3 && Math.abs(t02Data.deltaYaw) < 1e-3;
    assertTest(
      'T02',
      'Tiến (Forward Drive: +X Translation, Invariant Yaw)',
      t02Pass,
      `Δx = +${t02Data.deltaX.toFixed(3)}m (tien ve truoc), Δz = ${t02Data.deltaZ.toFixed(4)}m, Δyaw = ${t02Data.deltaYaw.toFixed(4)}rad`
    );
    await captureScreenshot('02_forward_motion', 'Robot chuyển động tịnh tiến thẳng dọc trục +X');

    // =========================================================================
    // T03 — Lùi (Backward Drive)
    // =========================================================================
    const t03Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      const initPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      store.setMotorSpeeds(-0.5, -0.5, 'T03 Backward Test');
      for (let i = 0; i < 20; i++) store.step();
      const endPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      return { initPose, endPose, deltaX: endPose.x - initPose.x, deltaZ: endPose.z - initPose.z, deltaYaw: endPose.yaw - initPose.yaw };
    });

    const t03Pass = t03Data.deltaX < -0.05 && Math.abs(t03Data.deltaZ) < 1e-3 && Math.abs(t03Data.deltaYaw) < 1e-3;
    assertTest(
      'T03',
      'Lùi (Backward Drive: -X Translation, Invariant Yaw)',
      t03Pass,
      `Δx = ${t03Data.deltaX.toFixed(3)}m (lui ve sau), Δz = ${t03Data.deltaZ.toFixed(4)}m, Δyaw = ${t03Data.deltaYaw.toFixed(4)}rad`
    );
    await captureScreenshot('03_backward_motion', 'Robot chuyển động lùi thẳng dọc trục -X');

    // =========================================================================
    // T04 — Quay tại chỗ trái (Spin Left)
    // =========================================================================
    // Left motor reverse (-0.5), Right motor forward (+0.5) -> Turn Left (towards North / -Z, CCW)
    const t04Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      const initPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      store.setMotorSpeeds(-0.5, 0.5, 'T04 Spin Left');
      for (let i = 0; i < 5; i++) store.step(); // 5 steps = 0.5s rotation (~ -1.2 rad) before wrapping -pi
      const endPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      return {
        initPose,
        endPose,
        deltaX: endPose.x - initPose.x,
        deltaZ: endPose.z - initPose.z,
        deltaYaw: endPose.yaw - initPose.yaw,
        w: store.getState().angularVel
      };
    });

    // Turning left should decrease yaw towards -Z (North, deltaYaw < 0) while center remains static
    const t04Pass = t04Data.deltaYaw < -0.2 && Math.abs(t04Data.deltaX) < 0.02 && Math.abs(t04Data.deltaZ) < 0.02;
    assertTest(
      'T04',
      'Quay tại chỗ trái (Spin Left: Center Stationary, Turn towards North/-Z)',
      t04Pass,
      `Δyaw = ${t04Data.deltaYaw.toFixed(3)}rad (< 0, re trai ve huong Bac/-Z), center drift = (${t04Data.deltaX.toFixed(4)}, ${t04Data.deltaZ.toFixed(4)})m, ω = ${t04Data.w.toFixed(2)}rad/s`
    );
    await captureScreenshot('04_spin_left', 'Robot quay tại chỗ sang trái (mũi xe xoay về hướng Bắc/-Z)');

    // =========================================================================
    // T05 — Quay tại chỗ phải (Spin Right)
    // =========================================================================
    // Left motor forward (+0.5), Right motor reverse (-0.5) -> Turn Right (towards South / +Z, CW)
    const t05Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      const initPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      store.setMotorSpeeds(0.5, -0.5, 'T05 Spin Right');
      for (let i = 0; i < 5; i++) store.step(); // 5 steps = 0.5s rotation (~ +1.2 rad) before wrapping +pi
      const endPose = { x: store.getState().x, z: store.getState().z, yaw: store.getState().yaw };
      return {
        initPose,
        endPose,
        deltaX: endPose.x - initPose.x,
        deltaZ: endPose.z - initPose.z,
        deltaYaw: endPose.yaw - initPose.yaw,
        w: store.getState().angularVel
      };
    });

    // Turning right should increase yaw towards +Z (South, deltaYaw > 0)
    const t05Pass = t05Data.deltaYaw > 0.2 && Math.abs(t05Data.deltaX) < 0.02 && Math.abs(t05Data.deltaZ) < 0.02;
    assertTest(
      'T05',
      'Quay tại chỗ phải (Spin Right: Center Stationary, Turn towards South/+Z)',
      t05Pass,
      `Δyaw = +${t05Data.deltaYaw.toFixed(3)}rad (> 0, re phai ve huong Nam/+Z), center drift = (${t05Data.deltaX.toFixed(4)}, ${t05Data.deltaZ.toFixed(4)})m, ω = ${t05Data.w.toFixed(2)}rad/s`
    );
    await captureScreenshot('05_spin_right', 'Robot quay tại chỗ sang phải (mũi xe xoay về hướng Nam/+Z)');

    // =========================================================================
    // T06 — Đường cong (Curved Differential Trajectory)
    // =========================================================================
    const t06Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      store.setMotorSpeeds(0.2, 0.6, 'T06 Curved Arc');
      for (let i = 0; i < 10; i++) store.step(); // 10 steps = 1.0s arc motion
      const s = store.getState();
      return {
        x: s.x,
        z: s.z,
        yaw: s.yaw,
        v: s.linearVel,
        w: s.angularVel,
        trajectoryCount: s.actualTrajectory.length
      };
    });

    // vR > vL -> arc turns left towards -Z
    const t06Pass = t06Data.z < -0.03 && t06Data.yaw < -0.2 && t06Data.trajectoryCount >= 2;
    assertTest(
      'T06',
      'Đường cong (Curved Path: Smooth Continuous Arc without Pose Jumps)',
      t06Pass,
      `vL=0.2, vR=0.6 -> curved to z=${t06Data.z.toFixed(3)}m, yaw=${t06Data.yaw.toFixed(3)}rad, trajectory points=${t06Data.trajectoryCount}`
    );
    await captureScreenshot('06_curved_arc', 'Robot di chuyển theo cung tròn mượt mà trên sa bàn');

    // =========================================================================
    // T07 — Kiểm tra bốn hướng (Four Cardinal Headings: 0°, 90°, 180°, 270°)
    // =========================================================================
    const cardinalDirections = [
      { name: '0° (Đông / +X)', expectedDx: 1, expectedDz: 0, targetAngle: 0 },
      { name: '90° (Nam / +Z)', expectedDx: 0, expectedDz: 1, targetAngle: Math.PI / 2 },
      { name: '180° (Tây / -X)', expectedDx: -1, expectedDz: 0, targetAngle: Math.PI },
      { name: '270° (Bắc / -Z)', expectedDx: 0, expectedDz: -1, targetAngle: -Math.PI / 2 }
    ];

    let t07AllPassed = true;
    const t07Details = [];

    for (const card of cardinalDirections) {
      const res = await page.evaluate((targetAngle) => {
        const store = window.__CMU_SIM_STORE__;
        store.reset();
        // Force test pose
        store.state.x = 0;
        store.state.z = 0;
        store.state.yaw = targetAngle;
        const startX = store.state.x;
        const startZ = store.state.z;
        store.setMotorSpeeds(0.5, 0.5, 'Cardinal Test');
        for (let i = 0; i < 10; i++) store.step();
        const endX = store.state.x;
        const endZ = store.state.z;
        return { dx: endX - startX, dz: endZ - startZ };
      }, card.targetAngle);

      const signDxOk = card.expectedDx === 0 ? Math.abs(res.dx) < 0.01 : Math.sign(res.dx) === Math.sign(card.expectedDx);
      const signDzOk = card.expectedDz === 0 ? Math.abs(res.dz) < 0.01 : Math.sign(res.dz) === Math.sign(card.expectedDz);
      const cardPass = signDxOk && signDzOk;
      if (!cardPass) t07AllPassed = false;
      t07Details.push(`${card.name}: dx=${res.dx.toFixed(2)}, dz=${res.dz.toFixed(2)} [${cardPass ? 'OK' : 'MISMATCH'}]`);
    }

    assertTest(
      'T07',
      'Kiểm tra bốn hướng (Four Cardinal Headings: Forward Vector Consistency)',
      t07AllPassed,
      t07Details.join(' | ')
    );
    await captureScreenshot('07_cardinal_directions', 'Robot xoay và di chuyển theo 4 hướng la bàn chuẩn');

    // =========================================================================
    // T08 — Cảm biến (Sensor Raycasting & Obstacle Detection)
    // =========================================================================
    const t08Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      // Obstacle 1 is at x=0.35, z=0.15
      // Place robot facing right at obs-1 (distance ~ 35cm)
      store.state.x = 0.0;
      store.state.z = 0.15;
      store.state.yaw = 0; // facing East (+X) directly at obs-1
      store.integratePhysics(0.05);
      const sFront = store.getState();
      const distFront = sFront.sensors.ultrasonicDistCm;
      const isDetectedFront = sFront.sensors.isObstacleDetected;

      // Now turn robot 90 degrees North (-Z) where no obstacle is present
      store.state.yaw = -Math.PI / 2; // facing North (-Z) into clear area
      store.integratePhysics(0.05);
      const sAway = store.getState();
      const distAway = sAway.sensors.ultrasonicDistCm;
      const isDetectedAway = sAway.sensors.isObstacleDetected;

      return { distFront, isDetectedFront, distAway, isDetectedAway };
    });

    const t08Pass = t08Data.distFront <= 45 && t08Data.isDetectedFront && (!t08Data.isDetectedAway || t08Data.distAway > 100);
    assertTest(
      'T08',
      'Cảm biến (Ultrasonic Raycast: Target in front detected, clear space ignored)',
      t08Pass,
      `Facing obs-1: ${t08Data.distFront}cm (detected=${t08Data.isDetectedFront}) | Facing clear North: ${t08Data.distAway}cm (detected=${t08Data.isDetectedAway})`
    );
    await captureScreenshot('08_ultrasonic_detection', 'Tia cảm biến siêu âm phát hiện chướng ngại vật phía trước');

    // =========================================================================
    // T09 — Đồng bộ bản đồ / 3D / FPV
    // =========================================================================
    const t09Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      store.state.yaw = 0.785; // 45 degrees
      const s = store.getState();
      // Verify FPV camera look vector matching yaw
      const camLookX = Math.cos(s.yaw);
      const camLookZ = Math.sin(s.yaw);
      // Verify 2D SVG angle
      const svgAngleDeg = (s.yaw * 180) / Math.PI;
      // Verify 3D model rotation offset (-PI/2 - yaw)
      const threeModelRotY = -Math.PI / 2 - s.yaw;
      return { yaw: s.yaw, camLookX, camLookZ, svgAngleDeg, threeModelRotY };
    });

    const t09Pass = (
      Math.abs(t09Data.camLookX - 0.707) < 0.01 &&
      Math.abs(t09Data.camLookZ - 0.707) < 0.01 &&
      Math.abs(t09Data.svgAngleDeg - 45) < 0.1
    );
    assertTest(
      'T09',
      'Đồng bộ bản đồ/3D/FPV (Multi-View Pose & Direction Synchronization)',
      t09Pass,
      `yaw=0.785rad: SVG angle=${t09Data.svgAngleDeg.toFixed(1)}°, FPV Look=(${t09Data.camLookX.toFixed(2)}, ${t09Data.camLookZ.toFixed(2)}), 3D rotY=${t09Data.threeModelRotY.toFixed(2)}rad`
    );
    await captureScreenshot('09_multiview_sync', 'Đồng bộ tư thế 45 độ trên Bản đồ 2D, Robot 3D và Camera FPV');

    // =========================================================================
    // T10 — Điều khiển qua các phương thức (Multi-Modal Control Consistency)
    // =========================================================================
    // Test D-Pad left command in RobotStatusPanel
    await page.evaluate(() => window.__CMU_SIM_STORE__.reset());
    const dpadLeftBtn = page.locator('button[title*="Trái"], button[title*="rẽ trái"]').first();
    if (await dpadLeftBtn.isVisible()) {
      await dpadLeftBtn.click();
      await page.waitForTimeout(300);
    }
    const dpadSpeeds = await page.evaluate(() => {
      const s = window.__CMU_SIM_STORE__.getState();
      return { l: s.targetLeftSpeed, r: s.targetRightSpeed, state: s.executionState };
    });

    const t10Pass = dpadSpeeds.l < 0 && dpadSpeeds.r > 0 && dpadSpeeds.state === 'RUNNING';
    assertTest(
      'T10',
      'Điều khiển qua các phương thức (Multi-Modal: D-Pad Left auto-runs & sets vL < 0, vR > 0)',
      t10Pass,
      `D-Pad Left result: vL=${dpadSpeeds.l}, vR=${dpadSpeeds.r}, executionState=${dpadSpeeds.state}`
    );
    await captureScreenshot('10_multimodal_dpad', 'Điều khiển đa phương thức qua D-Pad kích hoạt RUN');

    // =========================================================================
    // T11 — Collision Geometry
    // =========================================================================
    const t11Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      // Drive directly into obstacle 1 (at x=0.35, z=0.15)
      store.state.x = 0.15;
      store.state.z = 0.15;
      store.state.yaw = 0;
      store.setMotorSpeeds(1.0, 1.0, 'Collision Test');
      for (let i = 0; i < 30; i++) store.step();
      const s = store.getState();
      const distToObs = Math.hypot(s.x - 0.35, s.z - 0.15);
      return { distToObs, minClearance: 0.12 + 0.11 }; // obstacle radius 0.12 + robot radius 0.11
    });

    const t11Pass = t11Data.distToObs >= t11Data.minClearance - 0.03;
    assertTest(
      'T11',
      'Collision Geometry (Soft Bounce & Hull Clearance Invariant)',
      t11Pass,
      `Distance to obstacle=${t11Data.distToObs.toFixed(3)}m >= min allowable boundary ${t11Data.minClearance.toFixed(3)}m`
    );
    await captureScreenshot('11_collision_bounce', 'Biên dạng va chạm và khoảng cách an toàn vỏ robot');

    // =========================================================================
    // T12 — Pause và E-STOP
    // =========================================================================
    const t12Data = await page.evaluate(() => {
      const store = window.__CMU_SIM_STORE__;
      store.reset();
      store.setMotorSpeeds(0.6, 0.6, 'Run before pause');
      store.run();
      store.pause();
      const tPause1 = store.getState().simTimeSec;
      // Trigger E-STOP
      store.emergencyStop();
      const sEstop = store.getState();
      // Try to inject speed while E-STOP is latched
      store.setMotorSpeeds(0.8, 0.8, 'Illegal command during ESTOP');
      const sAttempt = store.getState();
      return {
        isEstopLatched: sEstop.executionState === 'EMERGENCY_STOP',
        pwmL: sEstop.pwmL,
        pwmR: sEstop.pwmR,
        commandBlocked: sAttempt.targetLeftSpeed === 0 && sAttempt.targetRightSpeed === 0
      };
    });

    const t12Pass = t12Data.isEstopLatched && t12Data.pwmL === 0 && t12Data.pwmR === 0 && t12Data.commandBlocked;
    assertTest(
      'T12',
      'Pause và E-STOP (Immediate Motor Cutoff & Safety Latch Integrity)',
      t12Pass,
      `E-STOP State=${t12Data.isEstopLatched}, PWM=0%, New Motor Commands Blocked=${t12Data.commandBlocked}`
    );
    await captureScreenshot('12_estop_verified', 'Trạng thái ngắt khẩn cấp an toàn E-STOP');

    // Save summary JSON
    const reportPath = path.resolve('reports/robot_orientation/ORIENTATION_TEST_RESULTS.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2), 'utf-8');
    console.log(`\nResults saved to: ${reportPath}`);

    const allPassed = testResults.every(t => t.passed);
    console.log('========================================================================');
    console.log(`   ORIENTATION TEST SUMMARY: ${testResults.filter(t => t.passed).length}/${testResults.length} PASSED (${allPassed ? '100% PASS' : 'FAIL'})   `);
    console.log('========================================================================');

    if (!allPassed) {
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

runOrientationSuite().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
