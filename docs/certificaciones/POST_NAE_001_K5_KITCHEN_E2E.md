# POST-NAE-001 K5: Certificacion E2E de Cocina

## Estado

K5 certificado

## Proposito

Certificar de forma integral que Cocina quedo alineada con la arquitectura basada en `DataAccessService` y con la Unica Fuente de la Verdad.

## Alcance

Esta corrida valida:

- pedido creado;
- pedido visible en Cocina desde `active_orders`;
- cambio de estado `CREADO -> LISTO -> EN_CURSO -> ENTREGADO`;
- desaparicion de la cola activa tras completar el flujo;
- presencia en `historical_orders` del pedido de referencia;
- actualizacion del historial de ventas;
- ausencia de errores en consola;
- ausencia de consultas residuales a `ref(rtdb, 'pedidos')`.

## Evidencia operacional

### Corrida controlada

- Pedido: `CICLO_REPETIBLE_1785446479913`
- Resultado operativo:
  - `dispatch-order`: `200 OK`
  - `accept-order`: `200 OK`
  - `complete-order`: `200 OK`
- Resultado final:
  - `active_orders`: `0`
  - `today_orders`: `1`
  - `historical_orders`: `0`

Observacion:

- Este pedido se cerro en la misma fecha de creacion, por lo que el archivador lo conserva en `today_orders` segun la regla vigente.

### Pedido historico de referencia

- Pedido: `PED_1784509957904`
- Resultado en contrato:
  - `active_orders`: `0`
  - `today_orders`: `0`
  - `historical_orders`: `1`

Este pedido confirma el cierre historico exacto esperado: una sola aparicion en `historical_orders` y ausencia en las colecciones activas.

### Validacion visual del panel

La corrida de navegador sobre `http://127.0.0.1:3001/panel` mostro:

- `window.__nellyArchiveEngineMeta.source = "archive-engine"`
- `window.__nellyArchiveEngineMeta.contract_version = "v1"`
- `window.__nellyArchiveEngineMeta.error = null`
- cola reconstruida desde contrato con:
  - `pendientes: 6`
  - `reparto: 13`
  - `enCamino: 1`
  - `entregados: 0`

### Consola

No se registraron errores de pagina durante la validacion visual.

### Residuales de RTDB

No se encontraron referencias residuales a `ref(rtdb, 'pedidos')` en:

- `public/panel.html`
- `public/js/premium-kitchen/render/render-manager.js`
- `public/js/premium-kitchen/firebase/index.js`
- `public/js/config.js`

## Conclusion

La evidencia disponible confirma que Cocina quedo alineada con `DataAccessService`, que la cola operativa se reconstruye desde `active_orders`, que el pedido historico de referencia aparece exactamente una vez en `historical_orders` y que no quedaron consultas residuales al listener viejo de `pedidos`.

K5 queda certificado como cierre E2E del frente de Cocina.

## Relacion con el frente

- NAE v1.0 permanece certificado y congelado.
- K1, K2, K2.1, K3 y K4 quedan cerrados.
- K5 cierra la certificacion final del frente de Cocina.

## Historial de cambios

- 2026-07-30: certificacion K5 creada con evidencia operativa y visual.
