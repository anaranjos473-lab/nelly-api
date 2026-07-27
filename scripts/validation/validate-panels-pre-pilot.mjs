import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || process.env.RENDER_URL || 'http://127.0.0.1:3001';
const PANEL_EMAIL = process.env.P1_PANEL_EMAIL || 'admin@nellydelivery.com';
const PANEL_PASSWORD = process.env.P1_PANEL_PASSWORD || 'NellyS4Test123!';
const OUTPUT_DIR = process.env.PANEL_VALIDATION_OUTPUT_DIR || '.codex-tmp/panel-validation';

const PAGES = [
  {
    id: 'commercial',
    label: 'Centro Comercial',
    path: '/dashboard-comercial.html',
    auth: { type: 'standard', appSelector: '#dashboard-section' },
    requiredText: [
      'Centro Comercial',
      'Que tengo que cocinar ahora?',
      'Oportunidades y acciones',
      'Promociones ligeras'
    ],
    requiredSelectors: [
      '#dashboard-status',
      '#overview-ventas-dia',
      '#overview-pedidos-activos',
      '#finance-signal',
      '#c4-oportunities-total',
      '#c4-actions-total',
      '#c5-promotions-total',
      '#c4-opportunities-list',
      '#c5-promotions-list'
    ]
  },
  {
    id: 'operational',
    label: 'Centro de Operaciones',
    path: '/dashboard-operativo.html',
    auth: { type: 'standard', appSelector: '#dashboard-section' },
    requiredText: [
      'Centro de Operaciones',
      'Pedido esperando asignacion',
      'Mapa de operaciones'
    ],
    requiredSelectors: [
      '#dashboard-status',
      '#overview-pedidos-activos',
      '#overview-ventas-brutas',
      '#ops-live-map',
      '.ops-map-canvas'
    ]
  },
  {
    id: 'kitchen',
    label: 'Nelly Cocina',
    path: '/cocina',
    auth: { type: 'standard', appSelector: 'body' },
    requiredText: [
      'Nelly Cocina',
      'Mapa operativo de cocina',
      'EN COCINA',
      'ESPERANDO REPARTIDOR',
      'EN REPARTO'
    ],
    requiredSelectors: [
      '#badge-estado',
      '#count-pendientes',
      '#count-listo',
      '#count-reparto',
      '#kitchen-map-preview',
      '#contenedor-pendientes',
      '#contenedor-listo'
    ],
    sectionChecks: [
      {
        id: 'kitchen-heatmap',
        navSelector: '#btn-heatmap',
        closeSelector: '#btn-cerrar-heatmap',
        requiredText: ['Mapa de calor local'],
        requiredSelectors: ['#seccion-heatmap', '#mapa-heatmap']
      }
    ]
  },
  {
    id: 'admin',
    label: 'Gobierno del Ecosistema',
    path: '/admin-dashboard.html',
    auth: { type: 'standard', appSelector: '#dashboard-section' },
    requiredText: [
      'Gobierno del Ecosistema',
      'Rentabilidad',
      'Centro de gobierno'
    ],
    requiredSelectors: [
      '#metric-ventas-brutas',
      '#metric-comisiones-nelly',
      '#metric-conteo-entregas'
    ],
    sectionChecks: [
      {
        id: 'admin-fleet',
        navSelector: '[data-gov-nav="fleet-governance"]',
        requiredText: ['Flota y bloqueos'],
        requiredSelectors: ['#drivers-table-body']
      },
      {
        id: 'admin-manual-order',
        navSelector: '[data-gov-nav="manual-order-section"]',
        requiredText: ['Generador de pedidos manuales', 'Buscar, confirmar y ocultar coordenadas'],
        requiredSelectors: ['#manual-order-form', '#order-map']
      }
    ]
  },
  {
    id: 'crm',
    label: 'Nelly CRM',
    path: '/crm-basico.html',
    auth: { type: 'standard', appSelector: '#crm-section' },
    requiredText: [
      'Nelly CRM',
      'Que cliente requiere seguimiento ahora?',
      'Estado CRM'
    ],
    requiredSelectors: [
      '#crm-status',
      '#overview-clientes-totales',
      '#customer-select',
      '#commerce-select'
    ],
    forbiddenSelectorText: [
      { selector: '#crm-status', text: 'ERROR' }
    ]
  },
  {
    id: 'finance',
    label: 'Centro Financiero',
    path: '/finanzas.html',
    auth: { type: 'standard', appSelector: '#app-section' },
    requiredText: [
      'Centro Financiero',
      'Liquidar deuda de conductor'
    ],
    requiredSelectors: [
      '#metric-total-debt',
      '#metric-drivers-debt',
      '#metric-drivers-blocked',
      '#drivers-table-body'
    ]
  },
  {
    id: 'analytics',
    label: 'Nelly Analytics',
    path: '/analytics',
    auth: { type: 'work-center', appSelector: '#work-center-app-section' },
    requiredText: [
      'Nelly Analytics',
      'Lectura de KPIs'
    ],
    requiredSelectors: [
      '#analytics-overview',
      '#analytics-operativo',
      '#analytics-comercial'
    ]
  },
  {
    id: 'developer',
    label: 'Nelly Developer',
    path: '/developer',
    auth: { type: 'work-center', appSelector: '#work-center-app-section' },
    requiredText: [
      'Nelly Developer',
      'Gobierno de Datos',
      'Architecture Health'
    ],
    requiredSelectors: [
      '#developer-overview',
      '#developer-data-governance',
      '#gov-health-score'
    ]
  },
  {
    id: 'logistics',
    label: 'Centro Logistico',
    path: '/driver',
    auth: { type: 'logistics', appSelector: '#logistics-app-section' },
    requiredText: [
      'Centro Logistico',
      'Nueva entrega asignada',
      'Pedidos disponibles'
    ],
    requiredSelectors: [
      '#status',
      '#count-disponibles',
      '#lista-disponibles'
    ]
  }
];

const VIEWPORTS = [
  { id: 'desktop', width: 1365, height: 768 },
  { id: 'mobile', width: 390, height: 844 }
];

function isBlockingRequest(url) {
  if (!url) return false;
  if (url.startsWith(BASE_URL)) return true;
  if (url.includes('127.0.0.1:3001') || url.includes('localhost:3001')) return true;
  return false;
}

async function loginStandard(page, appSelector = '#dashboard-section') {
  await page.locator('#login-email').waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  const loginEmail = page.locator('#login-email');
  if (await loginEmail.count() === 0) {
    return { attempted: false, authenticated: true, reason: 'login form not present' };
  }
  if (!(await loginEmail.isVisible({ timeout: 3000 }).catch(() => false))) {
    return { attempted: false, authenticated: true, reason: 'login form not visible' };
  }

  await loginEmail.fill(PANEL_EMAIL);
  await page.locator('#login-password').fill(PANEL_PASSWORD);
  await page.locator('#login-form button[type="submit"]').click();
  const authenticated = await page.locator(appSelector).waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  const loginError = await page.locator('#login-error').innerText({ timeout: 1000 }).catch(() => '');
  const dashboardClass = await page.locator(appSelector).getAttribute('class').catch(() => '');
  return {
    attempted: true,
    authenticated,
    loginError,
    dashboardClass,
    url: page.url()
  };
}

async function loginWorkCenter(page, appSelector = '#work-center-app-section') {
  await page.locator('#work-center-email').waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  const loginEmail = page.locator('#work-center-email');
  if (await loginEmail.count() === 0) {
    return { attempted: false, authenticated: true, reason: 'work-center login form not present' };
  }
  if (!(await loginEmail.isVisible({ timeout: 3000 }).catch(() => false))) {
    return { attempted: false, authenticated: true, reason: 'work-center login form not visible' };
  }

  await loginEmail.fill(PANEL_EMAIL);
  await page.locator('#work-center-password').fill(PANEL_PASSWORD);
  await page.locator('#work-center-login-form button[type="submit"]').click();
  const authenticated = await page.locator(appSelector).waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  const loginError = await page.locator('#work-center-login-error').innerText({ timeout: 1000 }).catch(() => '');
  const dashboardClass = await page.locator(appSelector).getAttribute('class').catch(() => '');
  return {
    attempted: true,
    authenticated,
    loginError,
    dashboardClass,
    url: page.url()
  };
}

async function loginLogistics(page, appSelector = '#logistics-app-section') {
  await page.evaluate(() => localStorage.removeItem('nelly_repartidor_uid')).catch(() => {});
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('#logistics-access-uid').waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  const uidInput = page.locator('#logistics-access-uid');
  if (await uidInput.count() === 0) {
    return { attempted: false, authenticated: true, reason: 'logistics login form not present' };
  }

  await uidInput.fill('driver_piloto');
  await page.locator('#logistics-login-form button[type="submit"]').click();
  const authenticated = await page.locator(appSelector).waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  const loginError = await page.locator('#logistics-login-error').innerText({ timeout: 1000 }).catch(() => '');
  const dashboardClass = await page.locator(appSelector).getAttribute('class').catch(() => '');
  return {
    attempted: true,
    authenticated,
    loginError,
    dashboardClass,
    url: page.url()
  };
}

async function loginIfNeeded(page, pageConfig) {
  const auth = pageConfig.auth || { type: 'standard', appSelector: '#dashboard-section' };
  if (auth.type === 'work-center') return loginWorkCenter(page, auth.appSelector);
  if (auth.type === 'logistics') return loginLogistics(page, auth.appSelector);
  return loginStandard(page, auth.appSelector);
}

async function validateVisibleSelectors(page, selectors) {
  const missingSelectors = [];
  const invisibleSelectors = [];
  const selectorValues = {};
  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count();
    if (count === 0) {
      missingSelectors.push(selector);
      continue;
    }
    const visible = await locator.first().isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) invisibleSelectors.push(selector);
    selectorValues[selector] = await locator.first().innerText({ timeout: 3000 }).catch(() => '');
  }
  return { missingSelectors, invisibleSelectors, selectorValues };
}

async function validateSectionChecks(page, checks = []) {
  const results = [];
  for (const check of checks) {
    if (check.navSelector) {
      await page.locator(check.navSelector).click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const missingText = [];
    for (const text of check.requiredText || []) {
      const count = await page.getByText(text, { exact: false }).count();
      if (count === 0) missingText.push(text);
    }

    const selectorCheck = await validateVisibleSelectors(page, check.requiredSelectors || []);
    results.push({
      id: check.id,
      ok: missingText.length === 0
        && selectorCheck.missingSelectors.length === 0
        && selectorCheck.invisibleSelectors.length === 0,
      missingText,
      missingSelectors: selectorCheck.missingSelectors,
      invisibleSelectors: selectorCheck.invisibleSelectors,
      selectorValues: selectorCheck.selectorValues
    });

    if (check.closeSelector) {
      await page.locator(check.closeSelector).click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(250);
    }
  }
  return results;
}

async function validateForbiddenSelectorText(page, rules = []) {
  const violations = [];
  for (const rule of rules) {
    const locator = page.locator(rule.selector);
    if (await locator.count() === 0) continue;
    const value = await locator.first().innerText({ timeout: 3000 }).catch(() => '');
    if (value.includes(rule.text)) {
      violations.push({
        selector: rule.selector,
        text: rule.text,
        value
      });
    }
  }
  return violations;
}

async function validatePage(browser, pageConfig, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });

  page.on('requestfailed', (request) => {
    if (isBlockingRequest(request.url())) {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText || 'request failed'
      });
    }
  });

  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400 && isBlockingRequest(response.url())) {
      badResponses.push({ url: response.url(), status });
    }
  });

  const url = `${BASE_URL}${pageConfig.path}`;
  await page.goto(url, { waitUntil: 'commit', timeout: 30000 });
  const authState = await loginIfNeeded(page, pageConfig);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const missingText = [];
  for (const text of pageConfig.requiredText) {
    const count = await page.getByText(text, { exact: false }).count();
    if (count === 0) missingText.push(text);
  }

  const selectorCheck = await validateVisibleSelectors(page, pageConfig.requiredSelectors);
  const sectionChecks = await validateSectionChecks(page, pageConfig.sectionChecks);
  const forbiddenSelectorText = await validateForbiddenSelectorText(page, pageConfig.forbiddenSelectorText);

  const screenshotPath = path.join(
    OUTPUT_DIR,
    `${pageConfig.id}-${viewport.id}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.close();

  const ok = missingText.length === 0
    && selectorCheck.missingSelectors.length === 0
    && selectorCheck.invisibleSelectors.length === 0
    && sectionChecks.every((item) => item.ok)
    && forbiddenSelectorText.length === 0
    && consoleErrors.length === 0
    && pageErrors.length === 0
    && failedRequests.length === 0
    && badResponses.length === 0;

  return {
    panel: pageConfig.label,
    page: pageConfig.path,
    viewport: viewport.id,
    ok,
    missingText,
    missingSelectors: selectorCheck.missingSelectors,
    invisibleSelectors: selectorCheck.invisibleSelectors,
    consoleErrors,
    pageErrors,
    failedRequests,
    badResponses,
    authState,
    selectorValues: selectorCheck.selectorValues,
    sectionChecks,
    forbiddenSelectorText,
    screenshotPath
  };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];

  try {
    for (const pageConfig of PAGES) {
      for (const viewport of VIEWPORTS) {
        results.push(await validatePage(browser, pageConfig, viewport));
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    ok: results.every((item) => item.ok),
    base_url: BASE_URL,
    generated_at: new Date().toISOString(),
    panels: results
  };

  const reportPath = path.join(OUTPUT_DIR, 'validation-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  if (!report.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    message: error.message,
    stack: error.stack
  }, null, 2));
  process.exit(1);
});
