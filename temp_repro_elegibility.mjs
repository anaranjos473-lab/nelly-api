import { evaluarElegibilidadPedido } from './src/services/smartDispatchService.js';
const pedido = {
  cliente: { nombre: 'Validacion Final Entorno' },
  cliente_nombre: 'Validacion Final Entorno',
  descripcion: 'Tacos de Cochinita y Refresco',
  estado: 'LISTO',
  fase_panel: 'Despacho',
  fecha_creacion: '2026-04-19T23:30:01.202Z',
  fuente_origen: 'rtdb',
  hora_cocina: '2026-04-20T00:21:36.681Z',
  id: 'AUTO_1776641400683',
  id_pedido: 'AUTO_1776641400683',
  logistica: { estado: 'disponible', tiempo_estimado: '25 min' },
  monto: 250,
  pedido_id: 'AUTO_1776641400683',
  timestamp: 1776641401202
};
const driver = {
  billetera: {
    capital_disponible: 500,
    capital_reservado: 0
  },
  estatus: { bloqueado_por_deuda: false, nivel: 'BRONCE' },
  finanzas: { capital_disponible: 500, capital_reservado: 0 },
  perfil: { bloqueado_por_deuda: false }
};
console.log('ELEGIBILIDAD=', JSON.stringify(evaluarElegibilidadPedido(pedido, driver), null, 2));
