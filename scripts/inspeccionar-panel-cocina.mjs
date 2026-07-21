import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PANEL_PATH = path.resolve('public', 'panel.html');
const URL =
  process.argv[2] ||
  pathToFileURL(PANEL_PATH).href;
const FIREBASE_CONFIG_URL = 'http://127.0.0.1:3001/api/public/firebase-config';
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const runDir = `diagnosticos/panel-cocina-${stamp}`;

const browser = await chromium.launch({
  headless: true
});

const page = await browser.newPage({
  viewport: {
    width: 1440,
    height: 900
  }
});

const cocinaLogs = [];

page.on('console', (msg) => {
  const text = msg.text();

  if (text.includes('[COCINA]')) {
    cocinaLogs.push(text);
    console.log(text);
  }
});

page.on('pageerror', (err) => {
  console.log('[PAGEERROR]', err.message);
});

page.on('requestfailed', (req) => {
  console.log('[REQUEST FAILED]', req.url(), req.failure()?.errorText);
});

await page.addInitScript(({ firebaseConfigUrl }) => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const target = typeof input === 'string' ? input : input?.url || '';
    if (target === '/api/public/firebase-config') {
      return originalFetch(firebaseConfigUrl, init);
    }
    return originalFetch(input, init);
  };
}, { firebaseConfigUrl: FIREBASE_CONFIG_URL });

async function abrirConReintentos(intentos = 5) {
  for (let i = 1; i <= intentos; i++) {
    try {
      console.log(`Intento ${i}/${intentos}: ${URL}`);

      await page.goto(URL, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await page.waitForLoadState('networkidle', {
        timeout: 10000
      }).catch(() => {});

      return;
    } catch (err) {
      console.log(`Falló intento ${i}: ${err.message}`);

      if (i === intentos) {
        throw err;
      }

      await page.waitForTimeout(2000);
    }
  }
}

await abrirConReintentos();

await page.waitForTimeout(5000);

const title = await page.title();
const bodyText = await page
  .locator('body')
  .innerText()
  .catch(() => '');

const fullHtml = await page.content();
const bodyHtml = await page
  .locator('body')
  .innerHTML()
  .catch(() => '');

await fs.mkdir(runDir, {
  recursive: true
});

await page.screenshot({
  path: `${runDir}/panel-cocina.png`,
  fullPage: true
});

await fs.writeFile(
  `${runDir}/panel-cocina-full.html`,
  fullHtml,
  'utf8'
);

await fs.writeFile(
  `${runDir}/panel-cocina.html`,
  bodyHtml,
  'utf8'
);

await fs.writeFile(
  `${runDir}/panel-cocina-resumen.json`,
  JSON.stringify({
    url: URL,
    title,
    cocinaLogs: cocinaLogs.length,
    bodyHas072199: bodyText.includes('0721-99'),
    bodyHasEsperandoRepartidor: bodyText.includes('ESPERANDO REPARTIDOR'),
    bodySnippet: bodyText.substring(0, 1200),
    archivos: [
      `${runDir}/panel-cocina.png`,
      `${runDir}/panel-cocina.html`,
      `${runDir}/panel-cocina-full.html`,
      `${runDir}/panel-cocina-resumen.json`
    ]
  }, null, 2),
  'utf8'
);

console.log('');
console.log('==============================');
console.log('DIAGNÓSTICO PANEL COCINA');
console.log('==============================');
console.log('URL:', URL);
console.log('TITLE:', title);
console.log('COCINA_LOGS:', cocinaLogs.length);
console.log('BODY_HAS_0721_99:', bodyText.includes('0721-99'));
console.log(
  'BODY_HAS_ESPERANDO_REPARTIDOR:',
  bodyText.includes('ESPERANDO REPARTIDOR')
);

console.log('');
console.log('BODY_SNIPPET');
console.log('------------------------------');
console.log(bodyText.substring(0, 1200));

console.log('');
console.log('ARCHIVOS GENERADOS');
console.log('------------------------------');
console.log(`CARPETA: ${runDir}`);
console.log(`${runDir}/panel-cocina.png`);
console.log(`${runDir}/panel-cocina.html`);
console.log(`${runDir}/panel-cocina-full.html`);
console.log(`${runDir}/panel-cocina-resumen.json`);

try {
  execFileSync('powershell.exe', ['-NoProfile', '-Command', `Set-Clipboard -Value "${runDir}"`], {
    stdio: 'ignore'
  });
  console.log('');
  console.log('Portapapeles: ruta de la carpeta copiada');
} catch (err) {
  console.log('');
  console.log('Portapapeles: no se pudo copiar la ruta');
}

await browser.close();
