#!/usr/bin/env node
/**
 * Script: Poblador de pedidos_para_reparto
 * 
 * Traslada pedidos con estado 'Listo' de pedidos/ a pedidos_para_reparto/
 * para que Nelly Driver los vea en su lista de Misiones Activas.
 * 
 * Uso:
 *   node scripts/populate-pedidos-para-reparto.js [estado]
 * 
 * Ejemplos:
 *   node scripts/populate-pedidos-para-reparto.js Listo
 *   node scripts/populate-pedidos-para-reparto.js listo
 */

import { getAdmin } from '../src/lib/firebase.js';

const estadoPorDefecto = 'Listo';
const estadoBuscado = (process.argv[2] || estadoPorDefecto).toLowerCase();

async function pobladorPedidos() {
  try {
    const admin = await getAdmin();
    const db = admin.database();

    console.log(`\n🔄 Buscando pedidos con estado "${estadoBuscado}" en /pedidos/...`);

    const pedidosSnap = await db.ref('pedidos').once('value');
    const todos = pedidosSnap.val() || {};

    const lisos = Object.entries(todos)
      .filter(([_, p]) => String(p.estado || p.mensaje_listo || '').toLowerCase().includes(estadoBuscado))
      .map(([id, pedido]) => ({ id, ...pedido }));

    console.log(`✅ Encontrados: ${lisos.length} pedidos listos\n`);

    if (lisos.length === 0) {
      console.log('Sin pedidos listos para transferir.');
      process.exit(0);
    }

    const updates = {};
    let contador = 0;

    for (const pedido of lisos) {
      const pedidoParaReparto = {
        ...pedido,
        estado_pedido: pedido.estado_pedido || 'LISTO',
        estado: pedido.estado || 'LISTO',
        timestamp_listo: pedido.fecha_listo || Date.now(),
        disponible_desde: Date.now()
      };

      updates[`pedidos_para_reparto/${pedido.id}`] = pedidoParaReparto;
      contador++;

      console.log(`  [${contador}/${lisos.length}] ${pedido.id}: ${pedido.cliente_nombre} ($${pedido.monto})`);
    }

    if (contador > 0) {
      console.log(`\n📤 Escribiendo ${contador} pedidos a pedidos_para_reparto/...`);
      await db.ref().update(updates);
      console.log('✅ Transferencia completada.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

pobladorPedidos();
