import fetch from 'node-fetch';
const base = 'http://localhost:3001';
for (const path of ['/api/health', '/api/public/firebase-config']) {
  try {
    const res = await fetch(base + path, { timeout: 5000 });
    const body = await res.text();
    console.log('PATH', path, 'STATUS', res.status);
    console.log(body);
  } catch (err) {
    console.error('ERROR', path, err.message);
  }
}
