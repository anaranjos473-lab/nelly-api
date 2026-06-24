/**
 * ⚠️ DEPRECATED - generar-pedido-directo-reparto-rtdb.js
 * 
 * Este script es INCOMPATIBLE con SSOT (Single Source of Truth).
 * 
 * PROBLEMA:
 * - Escribía directamente en RTDB (pedidos_para_reparto)
 * - Saltaba Backend
 * - Saltaba máquina de estados
 * - Saltaba todas las validaciones
 * - Generaba inconsistencias en datos
 * 
 * MIGRACIÓN REQUERIDA:
 * 
 * Para crear pedidos de PRUEBA, usa:
 *   node scripts/createPedidoViaSSOT.js
 * 
 * Para crear pedidos de PRODUCCIÓN, usa:
 *   POST /api/delivery/dispatch-order (desde Cocina)
 *   POST /api/admin/pedidos (desde Admin)
 * 
 * Esto asegura:
 * ✅ Flujo Backend → Cocina → Pedidos
 * ✅ Una sola fuente de verdad
 * ✅ Máquina de estados correcta
 * ✅ Auditoría completa
 */

console.error(`
╔════════════════════════════════════════════════════════════════╗
║  ❌ DEPRECATED: generar-pedido-directo-reparto-rtdb.js        ║
║                                                                ║
║  Este script es incompatible con SSOT.                        ║
║  Escribía directamente en RTDB, violando la arquitectura.     ║
║                                                                ║
║  MIGRACIÓN:                                                    ║
║  $ node scripts/createPedidoViaSSOT.js                        ║
║                                                                ║
║  O usa los endpoints:                                         ║
║  POST /api/delivery/dispatch-order                            ║
║  POST /api/admin/pedidos                                      ║
╚════════════════════════════════════════════════════════════════╝
`);

process.exit(1);
