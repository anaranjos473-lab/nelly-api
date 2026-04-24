// Script: convertir_a_base64_y_validar.js
// Uso: node convertir_a_base64_y_validar.js archivo_entrada.ext archivo_salida.txt
// Convierte un archivo a base64 y ejecuta los tests tras la conversión

const fs = require('fs');
const { exec } = require('child_process');

if (process.argv.length < 4) {
  console.error('Uso: node convertir_a_base64_y_validar.js <archivo_entrada> <archivo_salida>');
  process.exit(1);
}

const archivoEntrada = process.argv[2];
const archivoSalida = process.argv[3];

function isBase64(str) {
  // Detecta si la cadena es base64 válida (sin saltos de línea)
  if (!str || str.length < 16) return false;
  const base64Regex = /^[A-Za-z0-9+/=\r\n]+$/;
  return base64Regex.test(str) && str.length % 4 === 0;
}


try {
  const buffer = fs.readFileSync(archivoEntrada);
  let contenido = buffer.toString();
  let base64;
  let jsonDecoded = null;
  if (isBase64(contenido)) {
    base64 = contenido.trim();
    // Intentar decodificar para validar formato
    try {
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      jsonDecoded = JSON.parse(decoded);
      console.log('ℹ️ El archivo ya estaba en base64 y es JSON válido.');
    } catch (e) {
      console.error('❌ El archivo parece base64 pero no es un JSON válido.');
      process.exit(2);
    }
  } else {
    // Validar que sea JSON antes de codificar
    try {
      jsonDecoded = JSON.parse(contenido);
    } catch (e) {
      console.error('❌ El archivo de entrada no es JSON válido.');
      process.exit(2);
    }
    base64 = buffer.toString('base64');
    console.log('✅ Archivo convertido a base64.');
  }
  fs.writeFileSync(archivoSalida, base64);
  console.log(`✅ Base64 guardado en ${archivoSalida}`);

  // Validar vigencia de JWT/credencial
  if (jsonDecoded && jsonDecoded.private_key_id) {
    // Si existe client_email, intentar extraer dominio y advertir si es de testing
    if (jsonDecoded.client_email && jsonDecoded.client_email.includes('gserviceaccount.com')) {
      console.log('ℹ️ client_email detectado:', jsonDecoded.client_email);
    }
    // No se puede validar la vigencia real del JWT sin firmar, pero se advierte si el archivo es muy antiguo
    const creado = jsonDecoded.created_at || jsonDecoded.created || null;
    if (creado) {
      const fecha = new Date(creado);
      const ahora = new Date();
      const dias = Math.floor((ahora - fecha) / (1000*60*60*24));
      if (dias > 365) {
        console.warn('⚠️ Advertencia: la credencial tiene más de 1 año, podría estar expirada.');
      }
    }
  }
} catch (e) {
  console.error('❌ Error en la conversión:', e.message);
  process.exit(2);
}

// Ejecutar tests tras la conversión, sobreescribiendo temporalmente FIREBASE_ADMIN_JSON
console.log('🚦 Ejecutando tests con FIREBASE_ADMIN_JSON del archivo generado...');
const base64Generado = fs.readFileSync(archivoSalida, 'utf8');
const testEnv = { ...process.env, FIREBASE_ADMIN_JSON: base64Generado };
exec('npm test', { env: testEnv }, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Error al ejecutar tests: ${error.message}`);
    process.exit(3);
  }
  if (stderr) {
    console.error(`⚠️ STDERR:\n${stderr}`);
  }
  console.log(`🧪 Resultado tests:\n${stdout}`);
  if (stdout.includes('failing') || stdout.toLowerCase().includes('error')) {
    console.error('❌ Al menos un test falló.');
    process.exit(4);
  } else {
    console.log('✅ Todos los tests pasaron correctamente.');
  }
});
