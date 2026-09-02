import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';

const PUBLIC_ROOT = path.resolve('public');
const BACKEND_BASE_URL = (process.env.BACKEND_BASE_URL || process.env.RENDER_URL || 'https://nelly-api-8lh1.onrender.com').replace(/\/+$/, '');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function contentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function safeResolvePublicPath(urlPath) {
  const normalizedPath = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relativePath = normalizedPath === '/' ? '/panel.html' : normalizedPath;
  const candidate = path.resolve(PUBLIC_ROOT, `.${relativePath}`);
  if (!candidate.startsWith(PUBLIC_ROOT)) {
    return null;
  }
  return candidate;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function proxyRequest(req, res, url) {
  const body = await readRequestBody(req);
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];

  const upstreamResponse = await fetch(new URL(url, BACKEND_BASE_URL), {
    method: req.method,
    headers,
    body: body.length > 0 && req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined
  });

  const responseBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
  const responseHeaders = Object.fromEntries(upstreamResponse.headers.entries());
  delete responseHeaders['content-encoding'];
  delete responseHeaders['content-length'];
  delete responseHeaders['transfer-encoding'];
  res.writeHead(upstreamResponse.status, responseHeaders);
  res.end(responseBuffer);
}

async function serveStatic(req, res, urlPath) {
  const filePath = safeResolvePublicPath(urlPath);
  if (!filePath) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  try {
    const stats = await fs.stat(filePath);
    if (!stats.isFile()) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    const contents = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType(filePath));
    res.end(contents);
  } catch {
    res.statusCode = 404;
    res.end('Not found');
  }
}

export async function startPanelLocalServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
      if (requestUrl.pathname.startsWith('/api/')) {
        await proxyRequest(req, res, `${requestUrl.pathname}${requestUrl.search}`);
        return;
      }

      await serveStatic(req, res, requestUrl.pathname);
    } catch (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end(error?.message || String(error));
    }
  });

  const port = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve(typeof address === 'object' && address ? address.port : 0);
    });
  });

  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    port,
    pid: process.pid,
    cwd: process.cwd(),
    documentRoot: PUBLIC_ROOT,
    entrypoint: 'scripts/lib/panel-local-server.mjs'
  };
}

export async function stopPanelLocalServer(server) {
  if (!server) return;
  await new Promise((resolve) => {
    server.close(() => resolve());
  });
}
