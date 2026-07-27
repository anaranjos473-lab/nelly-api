export function normalizarEstado(valor) {
  const raw = String(valor || '').trim().toLowerCase();
  if (!raw) return 'PENDIENTE';
  if (['pendiente', 'preparando', 'cocina', 'creado', 'nuevo'].includes(raw)) return 'PENDIENTE';
  if (['listo', 'pendiente_aceptacion', 'listo_para_reparto', 'esperando_repartidor', 'despacho', 'aceptado'].includes(raw)) return 'LISTO';
  if (['en_camino', 'en_curso', 'en_reparto', 'reparto', 'llegue_a_tienda', 'pedido_abordo', 'llegue_a_cliente', 'asignado'].includes(raw)) return 'EN_CURSO';
  if (['entregado', 'finalizado', 'completado'].includes(raw)) return 'ENTREGADO';
  if (['cancelado', 'cancelada'].includes(raw)) return 'CANCELADO';
  return raw.toUpperCase();
}

export function debeConservarEstadoAnterior(snapshot, conteoActual) {
  if (!snapshot) return true;
  if (typeof snapshot === 'object' && 'exists' in snapshot && typeof snapshot.exists === 'function' && snapshot.exists()) {
    return false;
  }
  if (typeof snapshot === 'object' && snapshot !== null && 'val' in snapshot) {
    return false;
  }
  const total = Number(conteoActual?.pendientes || 0) + Number(conteoActual?.reparto || 0) + Number(conteoActual?.enCamino || 0);
  return total > 0;
}

export function construirFilaEstadoVacio(mensaje = 'Sin ventas en este rango') {
  return `
    <tr>
      <td colspan="5" style="text-align:center;padding:24px;color:#64748b;">${mensaje}</td>
    </tr>
  `;
}
