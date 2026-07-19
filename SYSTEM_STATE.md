# SYSTEM_STATE.md
# Estado Operativo de Nelly OS

Este documento resume qué está estable, qué está congelado y qué sigue en investigación.

## Estados

| Componente | Estado | Nota |
| --- | --- | --- |
| Backend de entrega | CERTIFICADO | Flujo `complete-order` y cierre base validados. |
| Cocina -> LISTO | CERTIFICADO | Tramo ya validado y no debe reabrirse sin evidencia nueva. |
| Radar / publicación | CERTIFICADO | La publicación al repartidor funciona como parte del flujo operativo. |
| Android Radar / aceptación | ESTABLE | Autenticación y lectura del radar operan; validar sin romper contrato. |
| Android cierre | CERTIFICADO | La cadena técnica de cierre quedó validada; al completar entrega el Radar vuelve y permanece visible sin caer al launcher. |
| RC-01 | APROBADO | Corrida E2E limpia validada con pedido nuevo: aceptar, tracking, `complete-order`, limpieza local y regreso al Radar. |
| RC-02 | APROBADO | Estabilidad de navegación post-`complete-order` validada en corridas consecutivas sin caída al launcher. |
| Finanzas del repartidor | ESTABLE | La lógica existe y no debe alterarse sin motivo funcional. |
| Panel administrativo | EN AJUSTE | Debe distinguir bloqueo manual, bloqueo por deuda y total no elegibles. |
| Modelo de datos | EN CONSOLIDACIÓN | `repartidores/{uid}` es la rama canónica; `usuarios/repartidores` queda como legado/compatibilidad. |
| Bloqueo de repartidores | CERTIFICADO | Separación operativa entre `bloqueo_manual`, `bloqueo_por_deuda` y `total_no_elegible`. |

## Congelado

No tocar sin nueva evidencia:

- `routes/delivery.js` en el contrato base de cierre
- el baseline P17
- el flujo Cocina -> Radar
- los contratos ya certificados

## En Investigacion

- consistencia de bloqueo por deuda en el perfil de prueba
- consolidación final del panel administrativo sobre una sola fuente
- ajustes finos de UX futuros solo si cambian las reglas de navegación

## No Debe Tocarse Sin Evidencia

- estados finales del pedido
- contratos de cierre
- reglas SSOT
- fuentes duplicadas de la misma entidad
- reinterpretar `bloqueo_manual` como bloqueo por deuda
