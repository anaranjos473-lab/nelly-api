import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { launchBrowser } from '../lib/playwright-browser.mjs';
import { startPanelLocalServer, stopPanelLocalServer } from '../lib/panel-local-server.mjs';

const pedidoId = String(process.argv[2] || '').trim();
if (!pedidoId) {
  console.error('Uso: node scripts/validation/diagnose-panel-bootstrap.mjs <pedidoId>');
  process.exit(1);
}

const BACKEND_BASE_URL = (process.env.BACKEND_BASE_URL || process.env.RENDER_URL || 'https://nelly-api-8lh1.onrender.com').replace(/\/+$/, '');
const PANEL_UID = process.env.PANEL_UID || 'admin@nellydelivery.com';
const TOKEN_URL = `${BACKEND_BASE_URL}/api/auth/panel-token?uid=${encodeURIComponent(PANEL_UID)}`;
const DATA_ACCESS_URL = `${BACKEND_BASE_URL}/api/data-architecture/data-access`;
const HEALTH_URL = `${BACKEND_BASE_URL}/api/health`;
const PANEL_WAIT_MS = Number(process.env.PANEL_WAIT_MS || 12000);
const OUTPUT_DIR = process.env.PILOT_GUARD_OUTPUT_DIR || `.codex-tmp/pilot-guard/${new Date().toISOString().replace(/[:.]/g, '-')}-${pedidoId}`;
const FORENSIC_ROOT = process.env.PILOT_FORENSIC_ROOT || '.codex-tmp/pilot-forensics';
const FORENSIC_RETENTION_DAYS = 7;

function normalizeText(value) {
  return String(value ?? '').trim();
}

function parseMaybeJson(value) {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function safeJson(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

const SENSITIVE_KEY = /(authorization|token|password|secret|cookie|api[_-]?key|credential|private[_-]?key|session)/i;

function sanitizeForensic(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeForensic(item, seen));
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) continue;
    output[key] = sanitizeForensic(item, seen);
  }
  return output;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function criticalOrderFields(order = {}) {
  return {
    cliente: firstDefined(order.cliente_nombre, order.cliente, null),
    comercio: firstDefined(order.comercio_nombre, order.comercio, order.tienda_nombre, null),
    direccion: firstDefined(order.direccion, order.ubicacion, null),
    items: firstDefined(order.items, order.lineas, order.productos, null),
    total: firstDefined(order.total, order.monto_total, order.monto, null),
    pago: firstDefined(order.pago, order.metodo_pago, null),
    shortId: firstDefined(order.shortId, order.short_id, order.folio, null)
  };
}

function hasMeaningfulItems(value) {
  return Array.isArray(value) ? value.length > 0 : Boolean(value && String(value).trim());
}

function numericAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function buildForensicCapture({ result, activeOrder, pageState }) {
  const detail = pageState?.detailCapture || {};
  const normalized = pageState?.canonical || pageState?.operation || null;
  const renderInput = pageState?.renderizados?.pedidosEnCamino || pageState?.renderizados?.pedidosReparto || pageState?.renderizados?.pedidosPendientes || pageState?.renderizados?.pedidosEntregados || null;
  const sourceStatus = normalizeText(result?.panel?.archiveMeta?.source_status || result?.panel?.contractSnapshot?.source_status) || null;
  const sourceFields = criticalOrderFields(result?.rtdb?.order || {});
  const contractFields = criticalOrderFields(activeOrder || {});
  const normalizedFields = criticalOrderFields(normalized || {});
  const renderFields = criticalOrderFields(renderInput || detail.focusData || {});
  const detailText = normalizeText(detail.detailText);
  const symptoms = [];
  if (/Dirección no disponible/i.test(detailText)) symptoms.push('ADDRESS_DEFAULT');
  if (/Comercio no disponible/i.test(detailText)) symptoms.push('COMMERCE_DEFAULT');
  if (/Sin productos/i.test(detailText)) symptoms.push('PRODUCTS_DEFAULT');
  if (/Total a cobrar:\s*\$0\.00/i.test(detailText)) symptoms.push('ZERO_AMOUNT');
  if (/Cliente(?:\s|$)/i.test(detailText) && !sourceFields.cliente) symptoms.push('CLIENT_DEFAULT');

  const valueMismatches = [];
  if (numericAmount(sourceFields.total) !== null && numericAmount(renderFields.total) !== null && numericAmount(sourceFields.total) !== numericAmount(renderFields.total)) valueMismatches.push('total');
  if (hasMeaningfulItems(sourceFields.items) && !hasMeaningfulItems(renderFields.items)) valueMismatches.push('items');
  if (sourceFields.cliente && !renderFields.cliente) valueMismatches.push('cliente');
  if (sourceFields.direccion && !renderFields.direccion) valueMismatches.push('direccion');
  if (sourceFields.comercio && !renderFields.comercio) valueMismatches.push('comercio');

  const triggers = [];
  if (sourceStatus && sourceStatus !== 'FRESH') triggers.push('STALE');
  if (symptoms.length > 0) triggers.push('DEFAULT_APPEARED');
  if (valueMismatches.length > 0) triggers.push('VALUE_MISMATCH');
  if ((numericAmount(sourceFields.total) || 0) > 0 && numericAmount(renderFields.total) === 0) triggers.push('RENDER_ANOMALY');
  if (process.env.PILOT_FORENSIC_CAPTURE === 'true') triggers.push('MANUAL_FORENSIC_CAPTURE');

  if (triggers.length === 0) return null;
  return sanitizeForensic({
    schema_version: '1.0',
    captured_at: new Date().toISOString(),
    trigger: [...new Set(triggers)],
    correlation: {
      pedido_id: result.pedidoId,
      short_id: firstDefined(result?.rtdb?.order?.shortId, result?.rtdb?.order?.short_id, result?.rtdb?.order?.folio, detail.focusData?.shortId, null)
    },
    source: {
      source_status: sourceStatus,
      snapshot_signature: result?.panel?.archiveMeta?.snapshot_signature || result?.panel?.contractSnapshot?.snapshot_signature || null,
      pedido: result?.rtdb?.order || null
    },
    contract: { active_order: activeOrder || null },
    kitchen: {
      normalized_order: normalized,
      observed_fields: { source: sourceFields, contract: contractFields, normalized: normalizedFields }
    },
    render: {
      render_input: renderInput,
      observed_fields: renderFields,
      effective_values: {
        amount: firstDefined(detail.focusData?.total, detail.focusData?.monto_total, detail.focusData?.monto, renderFields.total, null),
        products: firstDefined(detail.focusData?.items, detail.focusData?.lineas, renderFields.items, null)
      }
    },
    ui: {
      symptoms,
      detail_title: detail.detailTitle || null,
      detail_subtitle: detail.detailSubtitle || null,
      detail_text: detail.detailText || '',
      detail_html: detail.detailHtml || ''
    },
    diagnostic: {
      first_divergence: null,
      classification: 'INSUFFICIENT_EVIDENCE',
      value_mismatches: valueMismatches
    }
  });
}

async function pruneForensicArtifacts() {
  const cutoff = Date.now() - FORENSIC_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const entries = await fs.readdir(FORENSIC_ROOT, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(FORENSIC_ROOT, entry.name);
    const stats = await fs.stat(directory).catch(() => null);
    if (stats && stats.mtimeMs < cutoff) await fs.rm(directory, { recursive: true, force: true });
  }
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function normalizeHtml(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n');
}

function firstLineDifference(left, right) {
  const leftLines = normalizeHtml(left).split('\n');
  const rightLines = normalizeHtml(right).split('\n');
  const max = Math.max(leftLines.length, rightLines.length);
  for (let index = 0; index < max; index += 1) {
    if ((leftLines[index] ?? '') !== (rightLines[index] ?? '')) {
      return {
        line: index + 1,
        local: leftLines[index] ?? null,
        served: rightLines[index] ?? null,
        localLines: leftLines.length,
        servedLines: rightLines.length
      };
    }
  }
  return {
    line: null,
    local: null,
    served: null,
    localLines: leftLines.length,
    servedLines: rightLines.length
  };
}

function extractScriptsFromHtml(html) {
  const source = normalizeHtml(html);
  const scripts = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRe.exec(source))) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    const srcMatch = attrs.match(/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const src = srcMatch ? (srcMatch[1] || srcMatch[2] || srcMatch[3] || '') : '';
    scripts.push({
      index: scripts.length,
      src: src || null,
      inlineLength: src ? 0 : body.trim().length,
      attrs: attrs.trim()
    });
  }
  return scripts;
}

function normalizeScriptRef(ref) {
  const value = String(ref || '').trim();
  if (!value) return value;
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search || ''}`;
  } catch {
    if (value.startsWith('/')) return value;
    if (value.startsWith('./')) return `/${value.slice(2)}`;
    return `/${value}`;
  }
}

function isModuleResource(url) {
  try {
    const pathname = new URL(url).pathname;
    return /\.(?:js|mjs)$/i.test(pathname) || /\/panel\.html$/i.test(pathname);
  } catch {
    return false;
  }
}

function compareScriptLists(localScripts = [], servedScripts = []) {
  const localSrcs = localScripts.map((item) => normalizeScriptRef(item.src || `inline#${item.index}:${item.inlineLength}`));
  const servedSrcs = servedScripts.map((item) => normalizeScriptRef(item.src || `inline#${item.index}:${item.inlineLength}`));
  const localSet = new Set(localSrcs);
  const servedSet = new Set(servedSrcs);
  return {
    localCount: localScripts.length,
    servedCount: servedScripts.length,
    onlyLocal: localSrcs.filter((src) => !servedSet.has(src)),
    onlyServed: servedSrcs.filter((src) => !localSet.has(src)),
    orderDiffers: localSrcs.length === servedSrcs.length && localSrcs.some((src, index) => src !== servedSrcs[index]),
    localSrcs,
    servedSrcs
  };
}

function extractModuleBlocks(html) {
  const blocks = [];
  const moduleRe = /<script\b([^>]*)\btype\s*=\s*["']module["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = moduleRe.exec(html))) {
    const before = html.slice(0, match.index);
    blocks.push({
      index: blocks.length,
      line: before.split('\n').length,
      src: (match[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i) || [])[1] || null,
      source: match[2] || ''
    });
  }
  return blocks;
}

function extractStaticImports(source) {
  const imports = [];
  const importRe = /\bimport\s+(?:[\s\S]*?\sfrom\s+)?["']([^"']+)["']/g;
  let match;
  while ((match = importRe.exec(source))) {
    imports.push({ specifier: match[1], line: source.slice(0, match.index).split('\n').length });
  }
  return imports;
}

function extractExportNames(source) {
  const names = new Set();
  for (const match of source.matchAll(/\bexport\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(match[1]);
  }
  for (const match of source.matchAll(/\bexport\s*\{([^}]+)\}/g)) {
    match[1].split(',').forEach((item) => {
      const name = item.trim().split(/\s+as\s+/i).pop();
      if (name) names.add(name);
    });
  }
  return [...names].sort();
}

async function buildModuleEvaluationTrace(html) {
  const blocks = extractModuleBlocks(html);
  const main = blocks.find((block) => /onAuthStateChanged/.test(block.source)) || null;
  const imports = main ? extractStaticImports(main.source) : [];
  const dependencies = [];

  for (const item of imports) {
    const isRemote = /^https?:\/\//i.test(item.specifier);
    const relativePath = isRemote ? null : path.resolve('public', item.specifier.replace(/^\.\//, ''));
    let source = '';
    let exists = false;
    if (relativePath) {
      source = await fs.readFile(relativePath, 'utf8').catch(() => '');
      exists = Boolean(source);
    }
    dependencies.push({
      specifier: item.specifier,
      line: main ? main.line + item.line - 1 : null,
      remote: isRemote,
      path: relativePath,
      exists: isRemote ? null : exists,
      exports: source ? extractExportNames(source) : [],
      topLevelAwait: /(^|\n)await\b/.test(source)
    });
  }

  return {
    moduleCount: blocks.length,
    modules: blocks.map((block) => ({
      index: block.index,
      line: block.line,
      src: block.src,
      inline: !block.src,
      containsMainAuthFlow: /onAuthStateChanged/.test(block.source),
      staticImports: extractStaticImports(block.source),
      topLevelAwait: /(^|\n)await\b/.test(block.source)
    })),
    mainModule: main ? { index: main.index, line: main.line } : null,
    mainImports: dependencies,
    notes: {
      testEvidencePresent: /test_evidencia/i.test(html),
      initializeAppInPanel: /initializeApp\s*\(/.test(html),
      getAuthInPanel: /\bgetAuth\s*\(/.test(html),
      firebaseReadyDispatchInPanel: /dispatchEvent\s*\(\s*new Event\(['"]firebase-ready['"]/.test(html)
    }
  };
}

function getOrderKey(pedido = {}) {
  return normalizeText(
    pedido?.id ||
    pedido?.id_pedido ||
    pedido?.pedido_id ||
    pedido?._rtdbKey ||
    pedido?.shortId ||
    pedido?.short_id ||
    pedido?.folio ||
    pedido?.folio_operativo
  );
}

function findOrderInList(list, targetId) {
  if (!Array.isArray(list)) return null;
  const target = normalizeText(targetId);
  return list.find((item) => {
    const key = getOrderKey(item);
    return key === target || normalizeText(item?.pedido_id) === target || normalizeText(item?.id_pedido) === target;
  }) || null;
}

function getOrderState(order = {}) {
  return normalizeText(
    order?.estado ||
    order?.estado_pedido ||
    order?.state ||
    order?.status ||
    order?.logistica?.estado
  ).toUpperCase();
}

function classifyOrderPresence({ activeOrder, todayOrder, historicalOrder }) {
  if (activeOrder) {
    return {
      status: 'ACTIVE',
      source: 'active_orders',
      order: activeOrder
    };
  }

  if (historicalOrder) {
    const state = getOrderState(historicalOrder);
    return {
      status: state === 'ENTREGADO' || state === 'DELIVERED' ? 'HISTORICAL_DELIVERED' : 'HISTORICAL',
      source: 'historical_orders',
      state: state || null,
      order: historicalOrder
    };
  }

  if (todayOrder) {
    return {
      status: 'HISTORICAL',
      source: 'today_orders',
      state: getOrderState(todayOrder) || null,
      order: todayOrder
    };
  }

  return {
    status: 'NOT_FOUND',
    source: null,
    state: null,
    order: null
  };
}

function inspectCompleteness(order = {}) {
  const required = [
    'cliente_nombre',
    'telefono',
    'direccion',
    'descripcion',
    'items',
    'subtotal',
    'costo_envio',
    'propina',
    'monto',
    'total',
    'comercio_nombre',
    'comercio_id',
    'shortId',
    'folio',
    'estado'
  ];

  const missing = required.filter((key) => {
    const value = order?.[key];
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'number') return Number.isNaN(value);
    return value === undefined || value === null || normalizeText(value) === '';
  });

  return {
    complete: missing.length === 0,
    missing
  };
}

function countRenderizados(renderizados = {}) {
  if (!renderizados || typeof renderizados !== 'object') return 0;
  const keys = ['pedidosPendientes', 'pedidosReparto', 'pedidosEnCamino', 'pedidosEntregados'];
  return keys.reduce((total, key) => total + (Array.isArray(renderizados[key]) ? renderizados[key].length : 0), 0);
}

function countMapish(value) {
  if (value instanceof Map) return value.size;
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === 'object') {
    return Object.keys(value).length;
  }
  return 0;
}

async function requestJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`http_${response.status}_${text.slice(0, 120)}`);
  }
  return parseMaybeJson(text);
}

async function getFirebaseIdToken() {
  const existingToken = normalizeText(process.env.PANEL_FIREBASE_ID_TOKEN || process.env.FIREBASE_ID_TOKEN);
  if (existingToken) return existingToken;

  const apiKey = normalizeText(process.env.PANEL_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY);
  const email = normalizeText(process.env.PANEL_FIREBASE_EMAIL || process.env.FIREBASE_EMAIL);
  const password = String(process.env.PANEL_FIREBASE_PASSWORD || process.env.FIREBASE_PASSWORD || '');
  if (!apiKey || !email || !password) return null;

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.idToken) {
    throw new Error(`firebase_auth_http_${response.status}`);
  }
  return body.idToken;
}

async function getPanelToken() {
  const headers = {};
  const bootstrapToken = normalizeText(process.env.AUTH_BOOTSTRAP_TOKEN);
  if (bootstrapToken) {
    headers['x-auth-bootstrap-token'] = bootstrapToken;
  } else {
    const firebaseIdToken = await getFirebaseIdToken();
    if (firebaseIdToken) {
      headers.Authorization = `Bearer ${firebaseIdToken}`;
    }
  }
  const response = await fetch(TOKEN_URL, { headers });
  if (!response.ok) {
    throw new Error(`panel_token_http_${response.status}`);
  }
  const data = await response.json();
  if (!data?.token) {
    throw new Error('panel_token_missing');
  }
  return {
    token: data.token,
    authMode: data.authMode || 'bootstrap-local'
  };
}

function gitSnapshot() {
  const run = (args) => spawnSync('git', args, {
    cwd: process.cwd(),
    encoding: 'utf8'
  });

  const head = run(['rev-parse', 'HEAD']);
  const originMain = run(['rev-parse', 'origin/main']);
  const branch = run(['branch', '--show-current']);
  const status = run(['status', '--short']);

  return {
    head: head.status === 0 ? head.stdout.trim() : null,
    originMain: originMain.status === 0 ? originMain.stdout.trim() : null,
    branch: branch.status === 0 ? branch.stdout.trim() : null,
    statusShort: status.status === 0 ? status.stdout.trim().split('\n').filter(Boolean) : []
  };
}

async function main() {
  const tokenInfo = await getPanelToken();
  const health = await requestJson(HEALTH_URL).catch((error) => ({
    ok: false,
    error: String(error?.message || error || 'health_error')
  }));
  const dataAccessRaw = await requestJson(DATA_ACCESS_URL, {
    Authorization: `Bearer ${tokenInfo.token}`
  });
  const dataAccess = parseMaybeJson(dataAccessRaw);
  const localPanelHtmlPath = path.join(process.cwd(), 'public', 'panel.html');
  const localPanelHtml = await fs.readFile(localPanelHtmlPath, 'utf8');
  const localPanelHtmlHash = sha256(localPanelHtml);
  const localPanelHtmlNormalizedHash = sha256(normalizeHtml(localPanelHtml));
  const localPanelHtmlScripts = extractScriptsFromHtml(localPanelHtml);
  const moduleEvaluation = await buildModuleEvaluationTrace(localPanelHtml);

  const activeOrders = Array.isArray(dataAccess?.active_orders) ? dataAccess.active_orders : [];
  const todayOrders = Array.isArray(dataAccess?.today_orders) ? dataAccess.today_orders : [];
  const historicalOrders = Array.isArray(dataAccess?.historical_orders) ? dataAccess.historical_orders : [];
  const activeOrder = findOrderInList(activeOrders, pedidoId);
  const todayOrder = findOrderInList(todayOrders, pedidoId);
  const historicalOrder = findOrderInList(historicalOrders, pedidoId);
  const orderPresence = classifyOrderPresence({ activeOrder, todayOrder, historicalOrder });
  const rtdbOrder = orderPresence.order;

  const localServer = await startPanelLocalServer();
  const browser = await launchBrowser();
  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 1200
    }
  });

  const consoleLogs = [];
  const requestFailures = [];
  const moduleHttpTrace = [];
  const authRequests = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    const interesting = /bootstrap|auth|cocina|render|active_orders|panel|PED_|archive/i.test(text) || text.includes('[COCINA]');
    if (!interesting) return;
    const entry = {
      at: new Date().toISOString(),
      type: msg.type(),
      text
    };
    consoleLogs.push(entry);
    console.log('[console]', msg.type(), text);
  });

  page.on('pageerror', (err) => {
    const entry = { at: new Date().toISOString(), message: err.message };
    pageErrors.push(entry);
    console.log('[pageerror]', err.message);
  });

  await page.addInitScript(() => {
    const events = [];
    const record = (event, payload = {}) => {
      events.push({ sequence: events.length + 1, at: new Date().toISOString(), event, ...payload });
    };
    window.__nellyModuleEvaluationEvents = events;
    window.addEventListener('error', (event) => {
      record('window:error', {
        message: event.message || null,
        filename: event.filename || null,
        lineno: event.lineno || null,
        colno: event.colno || null
      });
    });
    window.addEventListener('unhandledrejection', (event) => {
      record('window:unhandledrejection', {
        reason: String(event.reason?.stack || event.reason?.message || event.reason || '')
      });
    });
  });

  page.on('response', (response) => {
    const url = response.url();
    if (isModuleResource(url)) {
      const request = response.request();
      const redirectFrom = request.redirectedFrom();
      moduleHttpTrace.push({
        at: new Date().toISOString(),
        type: 'response',
        method: request.method(),
        requestUrl: request.url(),
        responseUrl: url,
        status: response.status(),
        contentType: response.headers()['content-type'] || null,
        contentLength: response.headers()['content-length'] || null,
        cacheControl: response.headers()['cache-control'] || null,
        redirectedFrom: redirectFrom ? redirectFrom.url() : null,
        failed: false
      });
    }
    if (/identitytoolkit|securetoken|firebaseio|premium-kitchen\/firebase/i.test(url)) {
      authRequests.push({
        at: new Date().toISOString(),
        type: 'response',
        status: response.status(),
        url
      });
    }
    if (/\/api\/(health|auth\/panel-token|data-architecture\/data-access|public\/firebase-config)/i.test(url)) {
      console.log('[response]', response.status(), url);
    }
  });

  page.on('requestfailed', (req) => {
    const entry = {
      at: new Date().toISOString(),
      url: req.url(),
      errorText: req.failure()?.errorText || 'unknown'
    };
    requestFailures.push(entry);
    if (isModuleResource(req.url())) {
      moduleHttpTrace.push({
        at: entry.at,
        type: 'requestfailed',
        method: req.method(),
        requestUrl: req.url(),
        responseUrl: null,
        status: null,
        contentType: null,
        contentLength: null,
        cacheControl: null,
        redirectedFrom: req.redirectedFrom()?.url() || null,
        failed: true,
        errorText: entry.errorText
      });
    }
    console.log('[requestfailed]', req.url(), req.failure()?.errorText);
  });

  await page.addInitScript(({ firebaseConfigUrl, bootstrapToken }) => {
    const originalFetch = window.fetch.bind(window);
    const trace = [];
    const timeline = [];
    let lastTimelineKey = '';

    const now = () => new Date().toISOString();
    const clone = (value) => {
      try {
        return JSON.parse(JSON.stringify(value));
      } catch {
        return String(value);
      }
    };
    const summarizeToken = (value) => {
      const normalized = String(value || '').trim();
      return {
        present: Boolean(normalized),
        length: normalized.length
      };
    };
    const summarizeValue = (name, value) => {
      if (name === '__nellyPanelBootstrapToken') {
        return summarizeToken(value);
      }
      if (Array.isArray(value)) {
        return { type: 'array', length: value.length };
      }
      if (value && typeof value === 'object') {
        const keys = Object.keys(value);
        return {
          type: 'object',
          keys: keys.slice(0, 12),
          size: keys.length
        };
      }
      return value === undefined ? null : value;
    };
    const countRenderizados = (value) => {
      if (!value || typeof value !== 'object') return 0;
      const keys = ['pedidosPendientes', 'pedidosReparto', 'pedidosEnCamino', 'pedidosEntregados'];
      return keys.reduce((total, key) => total + (Array.isArray(value[key]) ? value[key].length : 0), 0);
    };
    const countMapish = (value) => {
      if (value instanceof Map) return value.size;
      if (Array.isArray(value)) return value.length;
      if (value && typeof value === 'object') return Object.keys(value).length;
      return 0;
    };
    const record = (event, payload = {}) => {
      trace.push({
        at: now(),
        event,
        ...clone(payload)
      });
    };
    const snapshot = (reason = 'poll') => ({
      at: now(),
      reason,
      authMode: String(window.__nellyPanelAuthMode || '').trim() || null,
      bootstrapTokenPresent: Boolean(String(window.__nellyPanelBootstrapToken || '').trim()),
      canonicalCount: countMapish(window.__nellyPedidosCocinaCanonical),
      operationOrdersCount: countMapish(window.__nellyOperationOrders),
      renderizadosCount: countRenderizados(window.__nellyPedidosCocinaRenderizados),
      archiveMeta: window.__nellyArchiveEngineMeta ? clone(window.__nellyArchiveEngineMeta) : null,
      contractSnapshot: window.__nellyArchiveEngineContractSnapshot ? clone(window.__nellyArchiveEngineContractSnapshot) : null
    });
    const pushTimeline = (reason = 'poll') => {
      const state = snapshot(reason);
      const key = JSON.stringify({
        authMode: state.authMode,
        bootstrapTokenPresent: state.bootstrapTokenPresent,
        canonicalCount: state.canonicalCount,
        operationOrdersCount: state.operationOrdersCount,
        renderizadosCount: state.renderizadosCount
      });
      if (key !== lastTimelineKey) {
        lastTimelineKey = key;
        timeline.push(state);
      }
      return state;
    };
    const watchProperty = (name, initialValue, options = {}) => {
      let current = initialValue;
      Object.defineProperty(window, name, {
        configurable: true,
        enumerable: true,
        get() {
          return current;
        },
        set(value) {
          current = value;
          record(`set:${name}`, {
            value: summarizeValue(name, value)
          });
          pushTimeline(`set:${name}`);
        }
      });
      if (options.recordInitial !== false) {
        record(`init:${name}`, {
          value: summarizeValue(name, current)
        });
      }
    };
    const wrapAssignedFunction = (name) => {
      let current = null;
      Object.defineProperty(window, name, {
        configurable: true,
        enumerable: true,
        get() {
          return current;
        },
        set(fn) {
          if (typeof fn !== 'function') {
            current = fn;
            record(`set:${name}`, { type: typeof fn });
            return;
          }
          const wrapped = async function (...args) {
            record(`call:${name}:enter`, {
              argsCount: args.length,
              authMode: String(window.__nellyPanelAuthMode || '').trim() || null,
              bootstrapTokenPresent: Boolean(String(window.__nellyPanelBootstrapToken || '').trim())
            });
            pushTimeline(`call:${name}:enter`);
            try {
              const result = fn.apply(this, args);
              if (result && typeof result.then === 'function') {
                const awaited = await result;
                record(`call:${name}:resolve`, snapshot(`call:${name}:resolve`));
                pushTimeline(`call:${name}:resolve`);
                return awaited;
              }
              record(`call:${name}:return`, snapshot(`call:${name}:return`));
              pushTimeline(`call:${name}:return`);
              return result;
            } catch (error) {
              record(`call:${name}:error`, { message: error?.message || String(error) });
              pushTimeline(`call:${name}:error`);
              throw error;
            }
          };
          current = wrapped;
          record(`set:${name}`, { type: 'function' });
        }
      });
    };

    window.__nellyPilotGuardTrace = trace;
    window.__nellyPilotGuardTimeline = timeline;
    window.__nellyPilotGuardSnapshot = () => snapshot('manual');
    window.AUTH_BOOTSTRAP_TOKEN = bootstrapToken;

    watchProperty('__nellyPanelBootstrapToken', bootstrapToken || '');
    watchProperty('__nellyPanelAuthMode', null);
    watchProperty('__nellyArchiveEngineMeta', null);
    watchProperty('__nellyArchiveEngineContractSnapshot', null);
    watchProperty('__nellyPedidosCocinaCanonical', []);
    watchProperty('__nellyOperationOrders', []);
    watchProperty('__nellyPedidosCocinaRenderizados', {
      pedidosPendientes: [],
      pedidosReparto: [],
      pedidosEnCamino: [],
      pedidosEntregados: [],
      at: null
    });

    wrapAssignedFunction('cargarPedidosActivosDesdeContrato');

    window.fetch = async (input, init) => {
      const target = typeof input === 'string' ? input : input?.url || '';
      if (target === '/api/public/firebase-config') {
        return originalFetch(firebaseConfigUrl, init);
      }
      return originalFetch(input, init);
    };

    const timer = setInterval(() => {
      pushTimeline('poll');
    }, 250);

    window.addEventListener('beforeunload', () => {
      clearInterval(timer);
    }, { once: true });
  }, {
    firebaseConfigUrl: `${BACKEND_BASE_URL}/api/public/firebase-config`,
    bootstrapToken: tokenInfo.token
  });

  const panelResponse = await page.goto(`${localServer.baseUrl}/panel.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  const servedPanelHtml = panelResponse ? await panelResponse.text().catch(() => '') : '';
  const servedPanelHtmlHash = servedPanelHtml ? sha256(servedPanelHtml) : null;
  const servedPanelHtmlNormalizedHash = servedPanelHtml ? sha256(normalizeHtml(servedPanelHtml)) : null;
  const servedPanelUrl = panelResponse ? panelResponse.url() : page.url();
  const servedPanelHtmlScripts = servedPanelHtml ? extractScriptsFromHtml(servedPanelHtml) : [];
  const htmlDiff = servedPanelHtml ? firstLineDifference(localPanelHtml, servedPanelHtml) : {
    line: null,
    local: null,
    served: null,
    localLines: 0,
    servedLines: 0
  };

  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(PANEL_WAIT_MS);

  const pageState = await page.evaluate((targetPedidoId) => {
    const detailCapture = {
      requestedPedidoId: targetPedidoId,
      selectionAttempted: false,
      selectionError: null,
      focusData: null,
      detailTitle: null,
      detailSubtitle: null,
      detailText: '',
      detailHtml: '',
      cardHtml: ''
    };
    try {
      if (typeof window.mostrarPedidoEnPanel === 'function') {
        detailCapture.selectionAttempted = true;
        window.mostrarPedidoEnPanel(targetPedidoId);
      }
      detailCapture.focusData = window.__nellyPedidoEnfoqueData
        ? JSON.parse(JSON.stringify(window.__nellyPedidoEnfoqueData))
        : null;
      detailCapture.detailTitle = document.getElementById('operation-focus-title')?.textContent || null;
      detailCapture.detailSubtitle = document.getElementById('operation-focus-subtitle')?.textContent || null;
      const detailBody = document.getElementById('operation-focus-body');
      detailCapture.detailText = detailBody?.innerText || '';
      detailCapture.detailHtml = detailBody?.innerHTML || '';
      const card = document.querySelector(`[data-pedido-id="${CSS.escape(targetPedidoId)}"]`);
      detailCapture.cardHtml = card?.outerHTML || '';
    } catch (error) {
      detailCapture.selectionError = error?.message || String(error);
    }
    const canonical = Array.isArray(window.__nellyPedidosCocinaCanonical) ? window.__nellyPedidosCocinaCanonical : [];
    const operation = Array.isArray(window.__nellyOperationOrders) ? window.__nellyOperationOrders : [];
    const renderizados = window.__nellyPedidosCocinaRenderizados || {};
    const panelTrace = Array.isArray(window.__nellyPilotGuardTrace) ? window.__nellyPilotGuardTrace : [];
    const panelTimeline = Array.isArray(window.__nellyPilotGuardTimeline) ? window.__nellyPilotGuardTimeline : [];
    const scripts = Array.from(document.scripts || []).map((script, index) => ({
      index,
      src: script.src || null,
      type: script.type || null,
      async: Boolean(script.async),
      defer: Boolean(script.defer),
      inlineLength: script.src ? 0 : (script.textContent || '').trim().length
    }));
    const findById = (list) => list.find((item) => {
      const key = String(item?.pedido_id || item?.id_pedido || item?.id || item?.shortId || item?.short_id || item?.folio || '').trim();
      return key === targetPedidoId;
    }) || null;

    const renderizadosCount = ['pedidosPendientes', 'pedidosReparto', 'pedidosEnCamino', 'pedidosEntregados']
      .reduce((total, key) => total + (Array.isArray(renderizados[key]) ? renderizados[key].length : 0), 0);

    return {
      authMode: window.__nellyPanelAuthMode || null,
      bootstrapTokenPresent: Boolean(window.__nellyPanelBootstrapToken),
      archiveMeta: window.__nellyArchiveEngineMeta || null,
      contractSnapshot: window.__nellyArchiveEngineContractSnapshot || null,
      canonicalCount: canonical.length,
      operationOrdersCount: operation.length,
      trace: panelTrace,
      timeline: panelTimeline,
      canonical: findById(canonical),
      operation: findById(operation),
      renderizados: {
        pedidosPendientes: findById(Array.isArray(renderizados.pedidosPendientes) ? renderizados.pedidosPendientes : []),
        pedidosReparto: findById(Array.isArray(renderizados.pedidosReparto) ? renderizados.pedidosReparto : []),
        pedidosEnCamino: findById(Array.isArray(renderizados.pedidosEnCamino) ? renderizados.pedidosEnCamino : []),
        pedidosEntregados: findById(Array.isArray(renderizados.pedidosEntregados) ? renderizados.pedidosEntregados : [])
      },
      detailCapture,
      renderizadosCount,
      bodyText: document.body.innerText,
      pageUrl: window.location.href,
      scripts,
      performanceResources: performance.getEntriesByType('resource')
        .map((entry) => entry.name)
        .filter((name) => /firebase|premium-kitchen/i.test(name)),
      firebaseTrace: Array.isArray(window.__nellyFirebaseTrace) ? window.__nellyFirebaseTrace : [],
      panelTrace: Array.isArray(window.__nellyPanelTrace) ? window.__nellyPanelTrace : [],
      moduleEvaluationEvents: Array.isArray(window.__nellyModuleEvaluationEvents) ? window.__nellyModuleEvaluationEvents : []
    };
  }, pedidoId);
  const runtimeScripts = Array.isArray(pageState?.scripts) ? pageState.scripts : [];
  const scriptDiff = compareScriptLists(localPanelHtmlScripts, servedPanelHtmlScripts);
  const runtimeScriptDiff = compareScriptLists(servedPanelHtmlScripts, runtimeScripts);

  const panelFound =
    Boolean(pageState?.canonical) ||
    Boolean(pageState?.operation) ||
    Boolean(pageState?.renderizados?.pedidosPendientes) ||
    Boolean(pageState?.renderizados?.pedidosReparto) ||
    Boolean(pageState?.renderizados?.pedidosEnCamino) ||
    Boolean(pageState?.renderizados?.pedidosEntregados);

  const panelOrder = pageState?.canonical || pageState?.operation || pageState?.renderizados?.pedidosPendientes || pageState?.renderizados?.pedidosReparto || pageState?.renderizados?.pedidosEnCamino || pageState?.renderizados?.pedidosEntregados || null;
  const rtdbCompleteness = inspectCompleteness(rtdbOrder || {});
  const panelCompleteness = inspectCompleteness(panelOrder || {});

  const trace = Array.isArray(pageState?.trace) ? pageState.trace : [];
  const timeline = Array.isArray(pageState?.timeline) ? pageState.timeline : [];
  const authChange = trace.find((item) => item?.event === 'set:__nellyPanelAuthMode' && normalizeText(item?.value) === 'bootstrap-local');
  const authFirebase = trace.find((item) => item?.event === 'set:__nellyPanelAuthMode' && normalizeText(item?.value) === 'firebase');
  const loadEnter = trace.find((item) => item?.event === 'call:cargarPedidosActivosDesdeContrato:enter');
  const loadResolve = trace.find((item) => item?.event === 'call:cargarPedidosActivosDesdeContrato:resolve');

  const firstTimeline = timeline[0] || null;
  const lastTimeline = timeline[timeline.length - 1] || null;
  const everCanonical = timeline.some((item) => Number(item?.canonicalCount || 0) > 0);
  const everOperation = timeline.some((item) => Number(item?.operationOrdersCount || 0) > 0);
  const everRender = timeline.some((item) => Number(item?.renderizadosCount || 0) > 0);
  const laterZeroAfterPositive = (items, key) => {
    let seenPositive = false;
    for (const item of items) {
      const value = Number(item?.[key] || 0);
      if (value > 0) {
        seenPositive = true;
      }
      if (seenPositive && value === 0) {
        return true;
      }
    }
    return false;
  };

  let firstBreak = null;
  if (!pageState?.bootstrapTokenPresent) {
    firstBreak = {
      stage: 'BOOTSTRAP',
      reason: 'bootstrapToken missing in panel runtime'
    };
  } else if (!(authChange || authFirebase || normalizeText(pageState?.authMode))) {
    firstBreak = {
      stage: 'AUTH -> BOOTSTRAP',
      reason: 'bootstrapToken present but authMode never moved to bootstrap-local or firebase'
    };
  } else if (!loadEnter) {
    firstBreak = {
      stage: 'BOOTSTRAP -> HYDRATION',
      reason: 'auth/bootstrap happened but cargarPedidosActivosDesdeContrato was never entered'
    };
  } else if (!(everCanonical || everOperation)) {
    firstBreak = {
      stage: 'HYDRATION',
      reason: 'cargarPedidosActivosDesdeContrato executed but canonical/operationOrders never became positive'
    };
  } else if (orderPresence.status === 'ACTIVE' && (everCanonical || everOperation || everRender) && laterZeroAfterPositive(timeline, 'canonicalCount') && !panelFound) {
    firstBreak = {
      stage: 'HYDRATION -> RENDER',
      reason: 'state reached positive values and then was reduced back to zero'
    };
  } else if (orderPresence.status === 'ACTIVE' && ((panelFound && !panelCompleteness.complete) || (panelFound && !pageState?.renderizadosCount))) {
    firstBreak = {
      stage: 'RENDER',
      reason: 'panel found a record but final render snapshot is incomplete'
    };
  }

  const result = {
    pedidoId,
    backend: {
      health
    },
    git: gitSnapshot(),
    token: {
      authMode: tokenInfo.authMode,
      bootstrapTokenPresent: Boolean(tokenInfo.token)
    },
    rtdb: {
      found: Boolean(rtdbOrder),
      presence: orderPresence,
      active_orders_recibidos: activeOrders.length,
      today_orders_recibidos: todayOrders.length,
      historical_orders_recibidos: historicalOrders.length,
      completeness: rtdbCompleteness,
      order: rtdbOrder
    },
    panel: {
      authMode: normalizeText(pageState?.authMode) || null,
      currentUser: normalizeText(pageState?.authMode) === 'firebase',
      bootstrapTokenPresent: Boolean(pageState?.bootstrapTokenPresent),
      pageUrl: normalizeText(pageState?.pageUrl) || null,
      scripts: Array.isArray(pageState?.scripts) ? pageState.scripts : [],
      performanceResources: Array.isArray(pageState?.performanceResources) ? pageState.performanceResources : [],
      firebaseTrace: Array.isArray(pageState?.firebaseTrace) ? pageState.firebaseTrace : [],
      panelTrace: Array.isArray(pageState?.panelTrace) ? pageState.panelTrace : [],
      moduleEvaluationEvents: Array.isArray(pageState?.moduleEvaluationEvents) ? pageState.moduleEvaluationEvents : [],
      archiveMeta: pageState?.archiveMeta || null,
      contractSnapshot: pageState?.contractSnapshot || null,
      found: panelFound,
      __nellyPedidosCocinaCanonical_count: Number(pageState?.canonicalCount || 0),
      __nellyOperationOrders_count: Number(pageState?.operationOrdersCount || 0),
      __nellyPedidosCocinaRenderizados_count: Number(pageState?.renderizadosCount || 0),
      completeness: panelCompleteness,
      renderizados: pageState?.renderizados || null,
      detailCapture: pageState?.detailCapture || null,
      order: panelOrder,
      bodyIncludesPedidoId: Boolean(pageState?.bodyText?.includes(pedidoId))
    },
    html: {
      localHash: localPanelHtmlHash,
      localNormalizedHash: localPanelHtmlNormalizedHash,
      servedHash: servedPanelHtmlHash,
      servedNormalizedHash: servedPanelHtmlNormalizedHash,
      matchesLocal: Boolean(servedPanelHtmlHash && servedPanelHtmlHash === localPanelHtmlHash),
      normalizedMatchesLocal: Boolean(servedPanelHtmlNormalizedHash && servedPanelHtmlNormalizedHash === localPanelHtmlNormalizedHash),
      servedUrl: servedPanelUrl,
      localPath: localPanelHtmlPath,
      diff: htmlDiff,
      localScripts: localPanelHtmlScripts,
      servedScripts: servedPanelHtmlScripts,
      scriptDiff,
      runtimeScriptDiff
    },
    moduleEvaluation,
    runtime: {
      pid: localServer.pid,
      cwd: localServer.cwd,
      documentRoot: localServer.documentRoot,
      entrypoint: localServer.entrypoint,
      baseUrl: localServer.baseUrl,
      port: localServer.port
    },
    trace: {
      events: trace,
      timeline
    },
    route: {
      rtdbToDataAccess: Boolean(rtdbOrder),
      dataAccessToPanel: panelFound,
      panelToRender: panelCompleteness.complete,
      orderPresence: orderPresence.status,
      orderSource: orderPresence.source
    },
    diagnostic: {
      authObserved: Boolean(authChange || authFirebase),
      authCallbackMode: authChange ? 'bootstrap-local' : (authFirebase ? 'firebase' : null),
      authCallbackDirectlyObservable: false,
      authCallbackNote: 'El callback ES module no puede interceptarse desde fuera; se infiere por el cambio observable de authMode.',
      firebaseModuleLoaded: Array.isArray(pageState?.performanceResources) && pageState.performanceResources.some((name) => /premium-kitchen\/firebase|firebase/i.test(name)),
      authRequests,
      firebaseTrace: Array.isArray(pageState?.firebaseTrace) ? pageState.firebaseTrace : [],
      panelTrace: Array.isArray(pageState?.panelTrace) ? pageState.panelTrace : [],
      moduleEvaluationEvents: Array.isArray(pageState?.moduleEvaluationEvents) ? pageState.moduleEvaluationEvents : [],
      moduleHttpTrace,
      loadEnter: Boolean(loadEnter),
      loadResolve: Boolean(loadResolve),
      everCanonical,
      everOperation,
      everRender,
      firstBreak
    },
    files: {
      manifest: path.join(OUTPUT_DIR, 'manifest.json'),
      git: path.join(OUTPUT_DIR, 'git.json'),
      backend: path.join(OUTPUT_DIR, 'backend.json'),
      auth: path.join(OUTPUT_DIR, 'auth.json'),
      dataAccess: path.join(OUTPUT_DIR, 'data-access.json'),
      panelTrace: path.join(OUTPUT_DIR, 'panel-trace.json'),
      diagnosis: path.join(OUTPUT_DIR, 'diagnosis.json'),
      runtime: path.join(OUTPUT_DIR, 'runtime.json'),
      authDiagnosis: path.join(OUTPUT_DIR, 'auth-diagnosis.json'),
      authTrace: path.join(OUTPUT_DIR, 'auth-trace.json'),
      moduleEvaluationTrace: path.join(OUTPUT_DIR, 'module-evaluation-trace.json'),
      moduleHttpTrace: path.join(OUTPUT_DIR, 'module-http-trace.json'),
      forensicTrace: path.join(FORENSIC_ROOT, `${new Date().toISOString().replace(/[:.]/g, '-')}-${pedidoId}`, 'forensic-order-trace.json')
    }
  };

  const forensicCapture = buildForensicCapture({ result, activeOrder, pageState });
  result.forensic = {
    captured: Boolean(forensicCapture),
    trigger: forensicCapture?.trigger || [],
    artifact: forensicCapture ? result.files.forensicTrace : null,
    retention_days: FORENSIC_RETENTION_DAYS
  };

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify({
    tool: 'pilot:guard:diagnose-panel',
    pedidoId: result.pedidoId,
    generatedAt: new Date().toISOString(),
    outputDir: OUTPUT_DIR,
    files: result.files,
    forensic: result.forensic
  }, null, 2), 'utf8');

  await pruneForensicArtifacts();
  if (forensicCapture) {
    const forensicDirectory = path.dirname(result.files.forensicTrace);
    await fs.mkdir(forensicDirectory, { recursive: true });
    await fs.writeFile(result.files.forensicTrace, JSON.stringify(forensicCapture, null, 2), 'utf8');
  }

  await fs.writeFile(path.join(OUTPUT_DIR, 'git.json'), JSON.stringify(result.git, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'backend.json'), JSON.stringify({
    health: result.backend.health,
    token: result.token,
    rtdb: {
      found: result.rtdb.found,
      active_orders_recibidos: result.rtdb.active_orders_recibidos,
      today_orders_recibidos: result.rtdb.today_orders_recibidos,
      historical_orders_recibidos: result.rtdb.historical_orders_recibidos
    }
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'auth.json'), JSON.stringify({
    is_local_panel: true,
    bootstrapTokenPresent: result.panel.bootstrapTokenPresent,
    authMode: result.panel.authMode,
    currentUser: result.panel.currentUser,
    authObserved: result.diagnostic.authObserved,
    authCallbackMode: result.diagnostic.authCallbackMode,
    authCallbackDirectlyObservable: result.diagnostic.authCallbackDirectlyObservable,
    authCallbackNote: result.diagnostic.authCallbackNote,
    firebaseModuleLoaded: result.diagnostic.firebaseModuleLoaded,
    authRequests: result.diagnostic.authRequests,
    loadEnter: result.diagnostic.loadEnter,
    loadResolve: result.diagnostic.loadResolve,
    firstBreak: result.diagnostic.firstBreak
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'data-access.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    found: result.rtdb.found,
    completeness: result.rtdb.completeness,
    active_orders_recibidos: result.rtdb.active_orders_recibidos,
    today_orders_recibidos: result.rtdb.today_orders_recibidos,
    historical_orders_recibidos: result.rtdb.historical_orders_recibidos,
    order: result.rtdb.order
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'panel-trace.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    authMode: result.panel.authMode,
    bootstrapTokenPresent: result.panel.bootstrapTokenPresent,
    html: result.html,
    runtime: result.runtime,
    canonical_count: result.panel.__nellyPedidosCocinaCanonical_count,
    operationOrders_count: result.panel.__nellyOperationOrders_count,
    renderizados_count: result.panel.__nellyPedidosCocinaRenderizados_count,
    trace: result.trace.events,
    timeline: result.trace.timeline,
    panel: {
      found: result.panel.found,
      completeness: result.panel.completeness,
      detailCapture: result.panel.detailCapture,
      renderizados: result.panel.renderizados,
      order: result.panel.order
    },
    consoleLogs,
    pageErrors,
    requestFailures
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'diagnosis.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    verdict: result.panel.found && result.panel.completeness.complete
      ? 'PANEL CONTRACT COMPLETE'
      : (result.rtdb.presence.status === 'ACTIVE'
        ? 'PANEL BOOTSTRAP FAILURE'
        : `TARGET ${result.rtdb.presence.status}`),
    orderPresence: result.rtdb.presence,
    firstBreak: result.diagnostic.firstBreak,
    route: result.route,
    diagnostic: result.diagnostic,
    html: result.html,
    runtime: result.runtime
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'runtime.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    html: result.html,
    runtime: result.runtime,
    page: {
      authMode: result.panel.authMode,
      currentUser: result.panel.currentUser,
      bootstrapTokenPresent: result.panel.bootstrapTokenPresent,
      pageUrl: result.panel.pageUrl,
      scripts: result.panel.scripts,
      bodyIncludesPedidoId: result.panel.bodyIncludesPedidoId,
      detailCapture: result.panel.detailCapture
    }
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'auth-diagnosis.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    firebaseModuleLoaded: result.diagnostic.firebaseModuleLoaded,
    callback: {
      registeredDirectlyObservable: result.diagnostic.authCallbackDirectlyObservable,
      observed: result.diagnostic.authObserved,
      mode: result.diagnostic.authCallbackMode,
      note: result.diagnostic.authCallbackNote
    },
    bootstrapTokenPresent: result.panel.bootstrapTokenPresent,
    authMode: result.panel.authMode,
    currentUser: result.panel.currentUser,
    authRequests: result.diagnostic.authRequests,
    pageErrors,
    requestFailures,
    firstBreak: result.diagnostic.firstBreak
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'auth-trace.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    firebase: result.diagnostic.firebaseTrace,
    panel: result.diagnostic.panelTrace,
    authRequests: result.diagnostic.authRequests,
    pageErrors,
    requestFailures,
    firstBreak: result.diagnostic.firstBreak
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'module-evaluation-trace.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    staticGraph: result.moduleEvaluation,
    runtime: {
      firebase: result.diagnostic.firebaseTrace,
      panel: result.diagnostic.panelTrace,
      browserEvents: result.diagnostic.moduleEvaluationEvents,
      pageErrors,
      requestFailures
    },
    firstBreak: result.diagnostic.firstBreak
  }, null, 2), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'module-http-trace.json'), JSON.stringify({
    pedidoId: result.pedidoId,
    requests: result.diagnostic.moduleHttpTrace,
    browserEvents: result.diagnostic.moduleEvaluationEvents,
    pageErrors,
    requestFailures,
    distinction: {
      fetchObserved: result.diagnostic.moduleHttpTrace.length > 0,
      evaluationObserved: result.diagnostic.firebaseTrace.length > 0 || result.diagnostic.panelTrace.length > 0,
      note: 'La evaluacion de modulos ES solo se marca como observable cuando existe una señal explicita del modulo.'
    },
    firstBreak: result.diagnostic.firstBreak
  }, null, 2), 'utf8');

  const panelSummary = {
    authMode: result.panel.authMode,
    currentUser: result.panel.currentUser,
    bootstrapTokenPresent: result.panel.bootstrapTokenPresent,
    canonical_count: result.panel.__nellyPedidosCocinaCanonical_count,
    operationOrders_count: result.panel.__nellyOperationOrders_count,
    renderizados_count: result.panel.__nellyPedidosCocinaRenderizados_count,
    found: result.panel.found,
    completeness: result.panel.completeness,
    bodyIncludesPedidoId: result.panel.bodyIncludesPedidoId
  };

  const renderLabel = result.diagnostic.firstBreak
    ? `${result.diagnostic.firstBreak.stage} - ${result.diagnostic.firstBreak.reason}`
    : 'OK';

  console.log('');
  console.log('NELLY PANEL DIAGNOSTIC');
  console.log('----------------------');
  console.log(`Pedido: ${result.pedidoId}`);
  console.log('');
  console.log('AUTH');
  console.log(`  IS_LOCAL_PANEL          ✅`);
  console.log(`  bootstrapToken          ${panelSummary.bootstrapTokenPresent ? '✅' : '❌'}`);
  console.log(`  authMode                ${panelSummary.authMode || 'null'}`);
  console.log(`  currentUser             ${panelSummary.currentUser ? '✅' : '❌'}`);
  console.log(`  authObserved            ${result.diagnostic.authObserved ? '✅' : '❌'}`);
  console.log(`  activarSesionLocal      ${result.diagnostic.authObserved ? '✅' : '❌'}`);
  console.log('');
  console.log('DATA ACCESS');
  console.log(`  active_orders           ${result.rtdb.active_orders_recibidos} ${result.rtdb.active_orders_recibidos > 0 ? '✅' : '❌'}`);
  console.log(`  today_orders            ${result.rtdb.today_orders_recibidos} ${result.rtdb.today_orders_recibidos > 0 ? '✅' : '❌'}`);
  console.log(`  historical_orders       ${result.rtdb.historical_orders_recibidos} ${result.rtdb.historical_orders_recibidos > 0 ? '✅' : '❌'}`);
  console.log('');
  console.log('HYDRATION');
  console.log(`  canonical               ${panelSummary.canonical_count} ${panelSummary.canonical_count > 0 ? '✅' : '❌'}`);
  console.log(`  operationOrders         ${panelSummary.operationOrders_count} ${panelSummary.operationOrders_count > 0 ? '✅' : '❌'}`);
  console.log(`  renderizados            ${panelSummary.renderizados_count} ${panelSummary.renderizados_count > 0 ? '✅' : '❌'}`);
  console.log('');
  console.log('');
  console.log('HTML');
  console.log(`  htmlLocalPath           ${result.html.localPath}`);
  console.log(`  htmlDiff.line           ${result.html.diff.line ?? 'null'}`);
  console.log(`  htmlDiff.localLines     ${result.html.diff.localLines}`);
  console.log(`  htmlDiff.servedLines    ${result.html.diff.servedLines}`);
  console.log(`  htmlDiff.localSnippet   ${(result.html.diff.local || 'null').slice(0, 120)}`);
  console.log(`  htmlDiff.servedSnippet  ${(result.html.diff.served || 'null').slice(0, 120)}`);
  console.log(`  localHash               ${result.html.localHash}`);
  console.log(`  servedHash              ${result.html.servedHash || 'null'}`);
  console.log(`  matchesLocal            ${result.html.matchesLocal ? '✅' : '❌'}`);
  console.log(`  servedUrl               ${result.html.servedUrl || 'null'}`);
  console.log(`  pageUrl                 ${result.panel.pageUrl || 'null'}`);
  console.log(`  localNormalizedHash     ${result.html.localNormalizedHash}`);
  console.log(`  servedNormalizedHash    ${result.html.servedNormalizedHash || 'null'}`);
  console.log(`  normalizedMatchesLocal  ${result.html.normalizedMatchesLocal ? '✅' : '❌'}`);
  console.log(`  localScripts            ${result.html.localScripts.length}`);
  console.log(`  servedScripts           ${result.html.servedScripts.length}`);
  console.log(`  runtimeScripts          ${result.panel.scripts.length}`);
  console.log(`  scriptDiff.onlyLocal    ${result.html.scriptDiff.onlyLocal.length}`);
  console.log(`  scriptDiff.onlyServed   ${result.html.scriptDiff.onlyServed.length}`);
  console.log(`  runtimeScriptDiff.onlyLocal  ${result.html.runtimeScriptDiff.onlyLocal.length}`);
  console.log(`  runtimeScriptDiff.onlyServed ${result.html.runtimeScriptDiff.onlyServed.length}`);
  console.log('');
  console.log('RUNTIME');
  console.log(`  pid                     ${result.runtime.pid}`);
  console.log(`  cwd                     ${result.runtime.cwd}`);
  console.log(`  documentRoot            ${result.runtime.documentRoot}`);
  console.log(`  entrypoint              ${result.runtime.entrypoint}`);
  console.log(`  baseUrl                 ${result.runtime.baseUrl}`);
  console.log(`  port                    ${result.runtime.port}`);
  console.log('FIRST BREAK');
  console.log(`  ${renderLabel}`);
  console.log('');
  console.log('VERDICT');
  const verdictLabel = result.panel.found && result.panel.completeness.complete
    ? '🟢 CONTRATO COMPLETO'
    : (result.rtdb.presence.status === 'ACTIVE'
      ? '🔴 PANEL BOOTSTRAP FAILURE'
      : `🟡 PEDIDO ${result.rtdb.presence.status}`);
  console.log(`  ${verdictLabel}`);
  console.log('');
  console.log('ARTIFACTS');
  console.log(`  ${OUTPUT_DIR}`);
  console.log(`  manifest.json`);
  console.log(`  git.json`);
  console.log(`  backend.json`);
  console.log(`  auth.json`);
  console.log(`  data-access.json`);
  console.log(`  panel-trace.json`);
  console.log(`  diagnosis.json`);
  console.log(`  auth-diagnosis.json`);
  console.log(`  auth-trace.json`);
  console.log(`  module-evaluation-trace.json`);
  console.log(`  module-http-trace.json`);

  await browser.close();
  await stopPanelLocalServer(localServer.server);
}

main().catch(async (error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
