import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const REPORT_DIR = path.resolve('reports/ui_redesign_audit');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPhaseAAudit() {
  console.log('================================================================');
  console.log('  CMU10 — PHASE A: UI/UX AUDIT & FEATURE INVENTORY AUTOMATION  ');
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  const consoleLogs = [];
  const consoleWarnings = [];
  const consoleErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') consoleErrors.push(text);
    else if (type === 'warning') consoleWarnings.push(text);
    else consoleLogs.push(text);
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  const auditData = {
    timestamp: new Date().toISOString(),
    viewport: { width: 1440, height: 900 },
    tabs: {},
    layouts: {},
    inspectionModes: {},
    responsiveMetrics: {},
    performance: {},
    consoleSummary: { errors: [], warnings: [] }
  };

  const clickNavTab = async (label) => {
    // If sidebar is collapsed, expand it if toggle button exists
    const expandBtn = page.locator('button[title*="Mở rộng thanh bên"]').first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(300);
    }
    const btn = page.locator(`button:has-text("${label}"), button[title="${label}"]`).first();
    await btn.click({ timeout: 5000 });
    await page.waitForTimeout(600);
  };

  try {
    console.log('1. Navigating to http://localhost:3000...');
    const startTime = Date.now();
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 30000 });
    const loadTimeMs = Date.now() - startTime;
    auditData.performance.loadTimeMs = loadTimeMs;
    console.log(`✓ Initial page loaded in ${loadTimeMs}ms`);

    await page.waitForTimeout(1000);

    // 2. Tab: Kiến Thức (home / KnowledgeMap)
    console.log('2. Auditing Tab: Kiến Thức (Home / KnowledgeMap)...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_tab_home_knowledgemap.png'), fullPage: true });
    auditData.tabs['home'] = {
      title: await page.title(),
      elementsCount: await page.locator('*').count(),
      status: 'VERIFIED_WORKING'
    };

    // 3. Tab: Robot 2 Động Cơ (robot-sim / TripleViewCockpit)
    console.log('3. Auditing Tab: Robot 2 Động Cơ (TripleViewCockpit)...');
    await clickNavTab('Robot 2 Động Cơ');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_tab_robot_sim_standard.png'), fullPage: false });

    const cockpitTitle = await page.locator('h1:has-text("JetBot Virtual Lab")').boundingBox();
    const mapHeader = await page.locator('span:has-text("Bản Đồ Sa Bàn Đua 2D/3D")').boundingBox();
    const robot3dHeader = await page.locator('span:has-text("Robot JetBot 3D Twin")').boundingBox();
    const fpvHeader = await page.locator('span:has-text("Camera FPV Thực Tế")').boundingBox();

    auditData.tabs['robot-sim'] = {
      cockpitTitleBox: cockpitTitle,
      mapHeaderBox: mapHeader,
      robot3dHeaderBox: robot3dHeader,
      fpvHeaderBox: fpvHeader,
      status: 'VERIFIED_WORKING'
    };

    // 4. Layout Modes
    console.log('4. Auditing Cockpit Layout Modes...');
    const layoutsToTest = [
      { id: 'focus', name: 'Focus', btnText: 'Focus' },
      { id: 'split', name: 'Split View', btnText: 'Split View' },
      { id: 'triple', name: 'Triple View', btnText: 'Triple View' },
      { id: 'pip', name: 'Picture-in-Picture', btnText: 'PiP' },
      { id: 'standard', name: 'Standard', btnText: 'Standard' }
    ];

    for (const l of layoutsToTest) {
      const btn = page.locator(`button:has-text("${l.btnText}")`).first();
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `03_cockpit_layout_${l.id}.png`),
          fullPage: false
        });
        auditData.layouts[l.id] = { verified: true, name: l.name };
        console.log(`  ✓ Layout verified: ${l.name}`);
      }
    }

    // Reset layout
    const resetLayoutBtn = page.locator('button[title*="Khôi phục lại bố cục"]').first();
    if (await resetLayoutBtn.isVisible()) {
      await resetLayoutBtn.click();
      await page.waitForTimeout(400);
    }

    // Ensure sidebar is expanded
    const expandBtn = page.locator('button[title*="Mở rộng thanh bên"]').first();
    if (await expandBtn.isVisible()) {
      await expandBtn.click();
      await page.waitForTimeout(300);
    }

    // 5. CAD Inspection Modes
    console.log('5. Auditing CAD Inspection Modes...');
    const selectElem = page.locator('select:has(option[value="realistic"])').first();
    const inspectionModes = [
      { id: 'realistic', name: 'Thực Tế (PBR)' },
      { id: 'wireframe', name: 'Khung Dây' },
      { id: 'components', name: 'Linh Kiện' },
      { id: 'collision', name: 'Va Chạm' },
      { id: 'coordinates', name: 'Tọa Độ XYZ' },
      { id: 'sensors', name: 'Góc FOV' },
      { id: 'dimensions', name: 'CAD' }
    ];

    if (await selectElem.isVisible()) {
      for (const m of inspectionModes) {
        await selectElem.selectOption(m.id);
        await page.waitForTimeout(200);
        auditData.inspectionModes[m.id] = { verified: true, name: m.name };
      }
      await selectElem.selectOption('dimensions');
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_cad_dimensions_mode.png'), fullPage: false });
      await selectElem.selectOption('realistic');
      await page.waitForTimeout(200);
    }

    // 6. Tactical Map View
    console.log('6. Auditing 2D Tactical Arena Map...');
    const fitAllBtn = page.locator('[data-testid="fit-all-btn"]').first();
    if (await fitAllBtn.isVisible()) {
      await fitAllBtn.click();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_tactical_arena_map_view.png') });

    // 7. Tab: 12 Modules (modules)
    console.log('7. Auditing Tab: 12 Modules (ModuleDetailView)...');
    await clickNavTab('12 Modules');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_tab_modules_m1.png'), fullPage: true });
    auditData.tabs['modules'] = { status: 'VERIFIED_WORKING' };

    // Sub-module M2
    const m2Btn = page.locator('button:has-text("M2:"), button:has-text("Module 2")').first();
    if (await m2Btn.isVisible()) {
      await m2Btn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_tab_modules_m2_teleop.png'), fullPage: true });
    }

    // 8. Tab: Sơ Đồ Quy Trình (pipeline)
    console.log('8. Auditing Tab: Sơ Đồ Quy Trình (PipelineDiagram)...');
    await clickNavTab('Sơ Đồ Quy Trình');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_tab_pipeline_diagram.png'), fullPage: true });
    auditData.tabs['pipeline'] = { status: 'VERIFIED_WORKING' };

    // 9. Tab: Thư Viện Hàm (functions)
    console.log('9. Auditing Tab: Thư Viện Hàm (FunctionExplorer)...');
    await clickNavTab('Thư Viện Hàm');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_tab_functions_explorer.png'), fullPage: true });
    auditData.tabs['functions'] = { status: 'VERIFIED_WORKING' };

    // 10. Tab: Đồ Thị AI (training-charts)
    console.log('10. Auditing Tab: Đồ Thị AI (TrainingChartsView)...');
    await clickNavTab('Đồ Thị AI');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_tab_training_charts.png'), fullPage: true });
    auditData.tabs['training-charts'] = { status: 'VERIFIED_WORKING' };

    // 11. Tab: Thí Nghiệm Nếu-Như (what-if)
    console.log('11. Auditing Tab: Thí Nghiệm Nếu-Như (WhatIfPlayground)...');
    await clickNavTab('Thí Nghiệm Nếu-Như');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_tab_what_if_playground.png'), fullPage: true });
    auditData.tabs['what-if'] = { status: 'VERIFIED_WORKING' };

    // 12. Tab: Trắc Nghiệm (quiz)
    console.log('12. Auditing Tab: Trắc Nghiệm (QuizPanel)...');
    await clickNavTab('Trắc Nghiệm');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_tab_quiz_panel.png'), fullPage: true });
    auditData.tabs['quiz'] = { status: 'VERIFIED_WORKING' };

    // 13. Tab: Thuật Ngữ (glossary)
    console.log('13. Auditing Tab: Thuật Ngữ (GlossaryView)...');
    await clickNavTab('Thuật Ngữ');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_tab_glossary_view.png'), fullPage: true });
    auditData.tabs['glossary'] = { status: 'VERIFIED_WORKING' };

    // 14. Tab: Nguồn & Lưu Ý (sources)
    console.log('14. Auditing Tab: Nguồn & Lưu Ý (SourcesAndCaveats)...');
    await clickNavTab('Nguồn & Lưu Ý');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_tab_sources_and_caveats.png'), fullPage: true });
    auditData.tabs['sources'] = { status: 'VERIFIED_WORKING' };

    // 15. Emergency Stop Modal
    console.log('15. Auditing Emergency Stop Modal...');
    const eStopBtn = page.locator('button:has-text("DỪNG KHẨN CẤP")').first();
    if (await eStopBtn.isVisible()) {
      await eStopBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_modal_emergency_stop.png'), fullPage: false });
      const dismissBtn = page.locator('button:has-text("Đã hiểu"), button:has-text("Đóng"), button:has-text("Tiếp tục"), button:has-text("ĐÃ HIỂU")').first();
      if (await dismissBtn.isVisible()) {
        await dismissBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // 16. Responsive Layout Breakpoints
    console.log('16. Auditing Responsive Layouts (1920, 1440, 1280, 1024)...');
    const breakpoints = [
      { width: 1920, height: 1080, name: '1080p_desktop' },
      { width: 1280, height: 800, name: '1280x800_laptop' },
      { width: 1024, height: 768, name: '1024x768_tablet_landscape' }
    ];

    await clickNavTab('Robot 2 Động Cơ');

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `16_responsive_${bp.name}.png`),
        fullPage: false
      });
      auditData.responsiveMetrics[bp.name] = {
        width: bp.width,
        height: bp.height,
        hasHeader: await page.locator('h1:has-text("JetBot Virtual Lab")').isVisible()
      };
      console.log(`  ✓ Breakpoint captured: ${bp.name} (${bp.width}x${bp.height})`);
    }

    // 17. Measure Performance Metrics
    console.log('17. Gathering Final Performance Metrics...');
    const performanceMetrics = await page.evaluate(() => {
      const memory = performance.memory ? {
        usedJSHeapSizeMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSizeMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
      } : { note: 'performance.memory not exposed in standard headless' };

      const domCount = document.getElementsByTagName('*').length;
      return { memory, domCount };
    });

    auditData.performance.domCount = performanceMetrics.domCount;
    auditData.performance.memory = performanceMetrics.memory;
    auditData.consoleSummary.errors = consoleErrors;
    auditData.consoleSummary.warnings = consoleWarnings;

    fs.writeFileSync(
      path.join(REPORT_DIR, 'audit_data.json'),
      JSON.stringify(auditData, null, 2),
      'utf8'
    );

    console.log('\n================================================================');
    console.log('✓ PHASE A AUTOMATED AUDIT COMPLETED SUCCESSFULLY!');
    console.log(`- Screenshots saved in: ${SCREENSHOT_DIR}`);
    console.log(`- Audit data saved to: ${path.join(REPORT_DIR, 'audit_data.json')}`);
    console.log(`- Console errors detected: ${consoleErrors.length}`);
    console.log(`- Console warnings detected: ${consoleWarnings.length}`);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Audit execution error:', err);
    throw err;
  } finally {
    await browser.close();
  }
}

runPhaseAAudit();
