export async function fileToDataUrl(file) {
  if (!file) throw new Error('No file provided');

  if (typeof file.arrayBuffer === 'function') {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = typeof Buffer !== 'undefined' ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer);
    const mimeType = file.type || 'application/octet-stream';

    if (typeof Buffer !== 'undefined') {
      return `data:${mimeType};base64,${bytes.toString('base64')}`;
    }

    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return `data:${mimeType};base64,${btoa(binary)}`;
  }

  const FileReaderCtor = typeof FileReader !== 'undefined'
    ? FileReader
    : (typeof globalThis !== 'undefined' && typeof globalThis.FileReader !== 'undefined'
      ? globalThis.FileReader
      : null);

  if (!FileReaderCtor) {
    throw new Error('FileReader no disponible');
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReaderCtor();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });
}

export async function saveEvidenceFallback(pedidoId, file, updateDocFn) {
  const dataUrl = await fileToDataUrl(file);
  const payload = {
    fotoEvidencia: dataUrl,
    evidenciaFallback: true,
    fechaEntrega: new Date().toISOString(),
    estado: 'Entregado'
  };

  if (typeof updateDocFn === 'function') {
    await updateDocFn(pedidoId, payload);
  }

  return { url: dataUrl, payload };
}
