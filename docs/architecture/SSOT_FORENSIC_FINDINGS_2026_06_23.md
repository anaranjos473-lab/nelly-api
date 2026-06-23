# SSOT_FORENSIC_FINDINGS_2026_06_23.md

## Resultado
SSOT Gate 001 ejecutado exitosamente.

### Gate 1
PASS

Verificado:

- pedidos_para_reparto/{id} existe
- pedidos_en_camino/{id} NO existe antes de accept-order
Conclusión:

dispatch-order respeta la arquitectura SSOT y no genera pedidos_en_camino prematuramente.

---

### Gate 2
PASS

Verificado:

- cliente_nombre presente
- monto presente
- timestamp presente
Conclusión:

Los pedidos llegan correctamente a pedidos_para_reparto.

---

### Gate 3
PENDIENTE

Validación pendiente desde dispositivo Android real.

Objetivos:

- aparición del pedido en Android
- accept-order
- transición a EN_CAMINO
- limpieza de cola

---

### Gate 4
PASS

Verificado:

- sin movimientos financieros prematuros
Conclusión:

No existe generación anticipada de registros financieros.

---

## Hallazgo Principal
Se descarta definitivamente la hipótesis:

"Existe un escritor oculto que crea pedidos_en_camino antes de accept-order."

No se encontró evidencia de dicha condición.

---

## Flujo Backend Confirmado
pedidos/{id}
↓
dispatch-order
↓
pedidos_para_reparto/{id}
↓
accept-order
↓
pedidos_en_camino/{id}
↓
complete-order
↓
ENTREGADO

---

## Nueva Hipótesis Principal
El problema restante se encuentra del lado Android.

Líneas de investigación:

1. Listener pedidos_para_reparto.
2. Sincronización RTDB → UI.
3. Compatibilidad de estados EN_CAMINO / EN_CURSO.
4. Generación de "OPERACIÓN ACTIVA".

---

## Estado de Certificación
Backend SSOT: Parcialmente certificado.

Pendiente:

- Gate 3 Android.

## Estado del proyecto al cierre de sesión
- SSOT backend: certificado parcialmente
- Gate 1: PASS
- Gate 2: PASS
- Gate 3: pendiente Android
- Gate 4: PASS parcial
- Error financiero pendiente:
  - `registrarCobroEfectivoTx`
  - "No se pudo aplicar el cobro en transaccion"
- Investigación activa:
  - `feature/android-state-audit`

## Evidencia Android parcial
- APK instalada: escucha `pedidos_en_camino/<pedidoId>` según dump de la APK.
- APK instalada: contiene el texto `OPERACIÓN ACTIVA` en strings de UI.
- Estado real pendiente de certificar:
  - ¿La APK instalada escucha `pedidos_para_reparto`?
  - ¿La APK instalada escucha `pedidos_en_camino`?
  - ¿`EN_CAMINO` es reconocido?
  - ¿`EN_CURSO` es el único estado esperado?
  - ¿Por qué aparece `OPERACIÓN ACTIVA`?

## Próximo objetivo técnico
Obtener la tabla de estado recibido → resultado UI:

Estado recibido | Resultado UI
--- | ---
LISTO | ?
EN_CURSO | ?
EN_CAMINO | ?
ENTREGADO | ?
PENDIENTE | ?

---

## Decision operativa inmediata

No agregar funciones nuevas hasta cerrar la incertidumbre Android.

Prioridad unica:

pedido creado en Admin Web
-> Cocina
-> DESPACHAR
-> `pedidos/{id}` queda `LISTO`
-> existe `pedidos_para_reparto/{id}`
-> Android lo ve sin scripts
-> Android acepta
-> `pedidos/{id}` queda `EN_CAMINO`
-> existe `pedidos_en_camino/{id}`
-> Android entrega
-> `pedidos/{id}` queda `ENTREGADO`

El flujo debe certificarse desde interfaces reales. Los scripts quedan permitidos solo para lectura/forense, no para crear, aceptar, mover ni completar pedidos durante la certificacion operativa.

---

## Fase 1 - Certificar Android

Rama activa:

`feature/android-state-audit`

### Hallazgos actuales

| Artefacto | Evidencia | Lectura |
| --- | --- | --- |
| Fuente Android actual | `app/src/main/java/com/nelly/driver/di/PedidoSyncModule.kt` | escucha `pedidos_para_reparto` |
| Fuente Android actual | `PedidoRepository.normalizarEstado()` | normaliza `listo`, `listo_para_reparto`, `esperando_repartidor`, `despacho` a `LISTO` |
| Fuente Android actual | `PedidoRepository.esEstadoDisponibleParaDriver()` | solo muestra pedidos con estado normalizado `LISTO` |
| Fuente Android actual | `PedidoRepository.normalizarEstado()` | normaliza `en_camino`, `en_reparto`, `reparto` a `EN_CAMINO` |
| Fuente Android actual | `PedidoRepository.normalizarEstado()` | normaliza `entregado`, `finalizado` a `ENTREGADO` |
| APK instalada extraida | `device_apk/classes10_dexdump.txt` | contiene `pedidos_para_reparto` y `pedidos_para_reparto/` |
| APK instalada extraida | `device_apk/classes10_dexdump.txt` | contiene `pedidos_en_camino/` |
| APK instalada extraida | `device_apk/classes10_dexdump.txt` | contiene `EN_CURSO`, `ENTREGADO` y texto `OPERACION ACTIVA` |

### Tabla Android pendiente de certificar en telefono

| Estado Firebase | Android esperado por fuente actual | Android APK instalada | Resultado real |
| --- | --- | --- | --- |
| `LISTO` | visible en Pedidos Disponibles | pendiente | pendiente |
| `EN_CURSO` | descartado/no visible si llega a fuente actual | posible estado esperado en APK instalada | pendiente |
| `EN_CAMINO` | no visible en disponibles; representa pedido activo despues de aceptar | pendiente | pendiente |
| `ENTREGADO` | no visible en disponibles | reconocido por APK instalada | pendiente |

### Gate Android real

1. Crear pedido desde Admin Web.
2. Despachar desde Cocina.
3. Verificar en RTDB:
   - `pedidos/{id}/estado = LISTO`
   - `pedidos_para_reparto/{id}` existe
   - `pedidos_en_camino/{id}` no existe todavia
4. En telefono: abrir `Pedidos Disponibles`.
5. T = segundos desde despacho hasta aparicion.
6. Meta: T menor a 10 segundos.
7. Aceptar desde Android.
8. Verificar:
   - `pedidos/{id}/estado = EN_CAMINO`
   - `pedidos_en_camino/{id}` existe
   - `repartidores/{uid}/pedido_activo = id`
9. Entregar desde Android.
10. Verificar:
   - `pedidos/{id}/estado = ENTREGADO`
   - `pedidos_en_camino/{id}/estado = ENTREGADO`
   - `pedidos_para_reparto/{id}` no existe

### Criterio de bloqueo

Si el telefono muestra `OPERACION ACTIVA` antes de aceptar un pedido nuevo, investigar primero estado residual:

- `pedidos_en_camino`
- `repartidores/{uid}/pedido_activo`
- cache/offline local de la APK

No limpiar manualmente durante la medicion principal; primero registrar evidencia.

---

## Fase 2 - Discrepancias de paneles

| Componente | Lee | Evidencia |
| --- | --- | --- |
| Cocina / panel principal | `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino` | `public/panel.html` listeners en esos tres nodos |
| Admin Dashboard backend | `pedidos`, `pedidos_activos`, `conductores_activos` | `routes/admin.js` metricas de pedidos |
| Admin Dashboard finanzas | `finanzas`, `historial_ventas` | `routes/admin.js` metricas de rentabilidad |
| Repartidor Web | `pedidos_para_reparto` | `public/repartidor.html` listener unico |
| Android fuente actual | `pedidos_para_reparto` | `PedidoSyncModule.kt` |
| Android APK instalada | `pedidos_para_reparto`, `pedidos_en_camino` | strings en `device_apk/classes10_dexdump.txt` |
| Backend despacho | `pedidos` -> `pedidos_para_reparto` | `routes/delivery.js` `/dispatch-order` |
| Backend aceptar | `pedidos_para_reparto` -> `pedidos_en_camino` + `pedidos` | `routes/delivery.js` `/accept-order` |
| Backend entregar | `pedidos_en_camino` -> `pedidos` + limpia `pedidos_para_reparto` | `routes/delivery.js` `/complete-order` |
| Finanzas | `repartidores/{uid}` transaccional; dashboards leen `finanzas`/`historial_ventas` | `debtLockService.js`, `routes/admin.js` |

Conclusion de Fase 2:

La discrepancia entre Cocina, Admin, Repartidor Web y Android es esperada mientras existan indices derivados con lectores distintos. No se debe resolver cambiando UI todavia; primero certificar que Android instalado ve el indice correcto cuando el backend lo crea.

---

## Fase 3 - SSOT oficial propuesto

Declarar `pedidos/{id}` como unica verdad.

Mapa de migración asociado:
- [SSOT_MIGRATION_MAP_2026_06_23.md](SSOT_MIGRATION_MAP_2026_06_23.md)

Indices derivados:

- `pedidos_para_reparto`
- `pedidos_en_camino`
- `pedidos_completados`

Regla de arquitectura:

si se borran los indices derivados, `pedidos` debe poder reconstruirlos todos.

Esta fase queda congelada hasta que Android real complete Gate 3.

---

## Fase 4 - Error financiero separado

Error observado:

`No se pudo aplicar el cobro en transaccion`

Archivos relacionados:

- `src/services/debtLockService.js`
- `routes/delivery.js`

Decision:

No tocar este error hasta terminar Android. El riesgo operativo mayor ahora es pedido no visible / estado activo incorrecto, no cobro duplicado.

---

## Fase 5 - Certificacion operativa

Ejecutar 3 ciclos completos consecutivos sin scripts ni manipulacion manual:

| Ciclo | Admin crea | Cocina despacha | Android acepta | Android entrega | Backend finanzas | Admin visualiza | Resultado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |
| 2 | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |
| 3 | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |

Si los 3 ciclos pasan:

`SSOT Certificado`

`Piloto Operativo Real`
