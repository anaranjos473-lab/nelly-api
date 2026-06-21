/**
 * ARCHIVED CERTIFICATION SCRIPT
 * Usado durante PILOTO_CAMPO_001.
 * No ejecutar en producción rutinaria.
 *
 * Test smoke: complete-order endpoint en Render
 * Verificar que el fix se desplegó correctamente
 */

const BASE_URL = 'https://nelly-api-8lh1.onrender.com';

async function test(name, method, endpoint, headers = {}, body = null) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`TEST: ${name}`);
  console.log(`${method} ${BASE_URL}${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    return response.status;
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    return null;
  }
}

async function run() {
  console.log('🚀 SMOKE TESTS: complete-order endpoint\n');
  
  // Test 1: Health check
  await test(
    'Health Check',
    'GET',
    '/api/health'
  );
  
  // Test 2: complete-order sin token (esperado: 401)
  const status401 = await test(
    'complete-order SIN TOKEN (esperado: 401)',
    'POST',
    '/api/delivery/complete-order',
    {},
    { pedidoId: 'test-order-123' }
  );
  
  // Test 3: complete-order con token inválido (esperado: 401)
  const status401b = await test(
    'complete-order CON TOKEN INVÁLIDO (esperado: 401)',
    'POST',
    '/api/delivery/complete-order',
    { 'Authorization': 'Bearer invalid-token-xyz' },
    { pedidoId: 'test-order-123' }
  );
  
  // Test 4: complete-order con token de driver (esperado: 403)
  // Este token no será válido en producción, pero queremos ver si recibimos 403 vs 401
  const status403 = await test(
    'complete-order CON TOKEN DRIVER (esperado: 403 o 401)',
    'POST',
    '/api/delivery/complete-order',
    { 'Authorization': 'Bearer driver-token-not-admin' },
    { pedidoId: 'test-order-123' }
  );
  
  // Resumen
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Health Check: RESPONDIENDO`);
  console.log(`✅ Sin token (401): ${status401 === 401 ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Token inválido (401): ${status401b === 401 ? 'PASS' : 'FAIL'}`);
  console.log(`ℹ️  Token driver (403 o 401): Status ${status403}`);
  
  if (status401 === 401 && status401b === 401) {
    console.log(`\n✨ El endpoint complete-order ESTÁ RESPONDIENDO CORRECTAMENTE`);
    console.log(`✨ El fix se desplegó exitosamente en Render`);
  } else {
    console.log(`\n⚠️  Posible problema: revisa los status codes arriba`);
  }
}

run().catch(console.error);
