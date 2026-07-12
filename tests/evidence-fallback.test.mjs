import test from 'node:test';
import assert from 'node:assert/strict';
import { fileToDataUrl } from '../public/evidence-fallback.js';

test('fileToDataUrl convierte un blob en data URL', async () => {
  const blob = new Blob(['hola'], { type: 'image/png' });
  const dataUrl = await fileToDataUrl(blob);

  assert.match(dataUrl, /^data:image\/png;base64,/);
  assert.ok(dataUrl.length >= 30);
});
