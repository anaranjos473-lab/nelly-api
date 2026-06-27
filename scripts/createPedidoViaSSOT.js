/**
 * Crear pedido de prueba respetando SSOT (Single Source of Truth)
 * 
 * Flujo correcto:
 * 1. Admin/Cocina → POST /api/delivery/dispatch-order (o /api/admin/pedidos)
 * 2. Backend procesa y valida
 * 3. Backend escribe en Cocina en Firestore
 * 4. Cloud Function indexa en pedidos_para_reparto
 * 5. Android recibe en tiempo real
 * 
 * Este script simula una creación de pedido desde Admin.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = process.env.RENDER_URL || 'http://localhost:3000';

async function createOrderViaSSOT() {
  try {
    // Simular pedido válido
    const orderPayload = {
      cliente_nombre: 'Cliente Prueba SSOT',
      descripcion: 'Pedido creado via API SSOT',
      monto: 145.0,
      telefono: '+34612345678',
      direccion: 'Calle Prueba, 123',
      // El backend generará id_pedido
    };

    console.log(`📤 Enviando pedido a ${BACKEND_URL}/api/admin/pedidos`);
    console.log('Payload:', JSON.stringify(orderPayload, null, 2));

    const response = await axios.post(
      `${BACKEND_URL}/api/admin/pedidos`,
      orderPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ADMIN_API_KEY || 'dev-key',
        },
        timeout: 5000,
      }
    );

    console.log('\n✅ Pedido creado exitosamente:');
    console.log('ID:', response.data.id || response.data.id_pedido);
    console.log('Estado:', response.data.estado);
    console.log('\nEl pedido ya está disponible en:');
    console.log('- Firestore: Cocina/<id_pedido>');
    console.log('- RTDB: pedidos_para_reparto/<id_pedido>');
    console.log('- Android: Visible en ~5 segundos');

  } catch (error) {
    console.error('\n❌ Error al crear pedido:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`No se pudo conectar a ${BACKEND_URL}`);
      console.error('¿Está ejecutándose el servidor?');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

createOrderViaSSOT();
