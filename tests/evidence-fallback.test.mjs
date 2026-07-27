import { fileToDataUrl } from '../public/evidence-fallback.js';

test('fileToDataUrl convierte un blob en data URL', async () => {
  const blob = new Blob(['hola'], { type: 'image/png' });
  const dataUrl = await fileToDataUrl(blob);

  expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  expect(dataUrl.length).toBeGreaterThanOrEqual(30);
});
