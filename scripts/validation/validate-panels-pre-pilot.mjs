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
    label: 'Panel Comercial',
    path: '/dashboard-comercial.html',
    requiredText: [
      'Nelly Delivery - Dashboard Comercial',
      'KPIs clave',
      'Inteligencia Comercial',
      'Promociones Ligeras'
    ],
    requiredSelectors: [
      '#dashboard-status',
      '#c4-oportunities-total',
      '#c4-actions-total',
      '#c5-promotions-total',
      '#c4-opportunities-list',
      '#c5-promotions-list'
    ]
  },
  {
    id: 'operational',
    label: 'Panel Operativo',
    path: '/dashboard-operativo.html',
    requiredText: [
      'Nelly Delivery - Dashboard Operativo',
      'ESTADO GENERAL',
      'Proyecciones S3'
    ],
    requiredSelectors: [
      '#dashboard-status',
      '#overview-pedidos-activos',
      '#overview-ventas-brutas',
      '#finance-signal',
      '#health-signal',
      '#marketplace-signal'
    ]
  },
  {
    id: 'admin',
    label: 'Panel Administrativo',
    path: '/admin-dashboard.html',
    requiredText: [
      'Panel de Administracion',
      'Rentabilidad',
      'Gestor de Repartidores',
      'Generador de Pedidos Manuales'
    ],
    requiredSelectors: [
      '#metric-ventas-brutas',
      '#metric-comisiones-nelly',
      '#metric-conteo-entregas',
      '#drivers-table-body',
      '#manual-order-form'
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

async function loginIfNeeded(page) {
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
  const authenticated = await page.locator('#dashboard-section').waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);
  const loginError = await page.locator('#login-error').innerText({ timeout: 1000 }).catch(() => '');
  const dashboardClass = await page.locator('#dashboard-section').getAttribute('class').catch(() => '');
  return {
    attempted: true,
    authenticated,
    loginError,
    dashboardClass,
    url: page.url()
  };
}

async function validatePage(browser, pageConfig, viewport) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
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
  const authState = await loginIfNeeded(page);
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const missingText = [];
  for (const text of pageConfig.requiredText) {
    const count = await page.getByText(text, { exact: false }).count();
    if (count === 0) missingText.push(text);
  }

  const missingSelectors = [];
  const invisibleSelectors = [];
  const selectorValues = {};
  for (const selector of pageConfig.requiredSelectors) {
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

  const screenshotPath = path.join(
    OUTPUT_DIR,
    `${pageConfig.id}-${viewport.id}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await page.close();

  const ok = missingText.length === 0
    && missingSelectors.length === 0
    && invisibleSelectors.length === 0
    && consoleErrors.length === 0
    && failedRequests.length === 0
    && badResponses.length === 0;

  return {
    panel: pageConfig.label,
    page: pageConfig.path,
    viewport: viewport.id,
    ok,
    missingText,
    missingSelectors,
    invisibleSelectors,
    consoleErrors,
    failedRequests,
    badResponses,
    authState,
    selectorValues,
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
