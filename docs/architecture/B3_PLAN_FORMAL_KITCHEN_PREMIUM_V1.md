# PLAN FORMAL B3 - KITCHEN PREMIUM V1

## Fecha
2026-07-22

## Propósito
Definir el plan de ejecución de B3 como una migración por casos de uso de pedidos, preservando el comportamiento certificado mientras se extrae la lógica desde la capa de render.

## Alcance
Este plan cubre la extracción y consolidación de la lógica de pedidos en un `OrdersManager` estable, sin alterar los contratos certificados de cierre operativo.

## Referencias
- [`docs/architecture/KITCHEN_PREMIUM_B2_CIERRE_Y_B3_PREPARACION.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/KITCHEN_PREMIUM_B2_CIERRE_Y_B3_PREPARACION.md)
- [`docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_1P.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_1P.md)
- [`docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_MOBILE.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1_MOBILE.md)
- [`docs/architecture/BLUEPRINT_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/BLUEPRINT_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md)

## Objetivo de B3
Desacoplar la lógica de pedidos del render modular y organizarla por casos de uso verificables.

## Prerrequisito de inicio
B3 no debe iniciarse hasta que la [`ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md) quede completada con evidencia suficiente y sin regresiones respecto al baseline certificado.

## Baseline funcional congelada
La entrada a B3 queda apoyada sobre la validacion E2E aprobada y sobre la baseline funcional persistida en `docs/certificaciones/functional-metrics-baseline.json`.

Puntos congelados para comparacion:

- `pedidoId`
- `driverUid`
- `estado_final = ENTREGADO`
- `pedidos_para_reparto = 0`
- `pedidos_en_camino = 0`
- `pedido_activo = null`
- `ganancia_neta_pedido = 30`
- `tarifa_entrega = 30`
- `saldo_ganancias_before = 1452.87`
- `saldo_ganancias_after = 1482.87`
- `delta_saldo_ganancias = 30`

La validacion funcional futura debe confirmar que el saldo posterior menos el saldo previo coincide con la ganancia neta registrada y que no aparecen residuales operativos.

## Orden de ejecución

### B3.1 - Crear `orders-manager.js`
Responsabilidad:
- coordinar operaciones sobre pedidos.
- mantener el comportamiento actual sin cambios funcionales.

Entregables:
- módulo inicial creado.
- interfaz mínima para orquestación.

### B3.2 - Extraer acciones simples
Responsabilidad:
- obtener pedido.
- buscar pedido.
- actualizar colección.

Entregables:
- helpers aislados.
- comportamiento idéntico al baseline.

### B3.3 - Extraer transiciones
Responsabilidad:
- formalizar cambios de estado de pedidos.

Ejemplos:
- `Pendiente -> Listo`
- `Listo -> Reparto`
- `Reparto -> Entregado`

Entregables:
- reglas de transición documentadas.
- precondiciones y efectos explícitos.

### B3.4 - Extraer operaciones del operador
Responsabilidad:
- aceptar.
- cancelar.
- marcar listo.

Entregables:
- acciones operativas desacopladas de la UI.
- contratos de entrada y salida definidos.

### B3.5 - Eliminar wrappers legacy
Responsabilidad:
- retirar capas obsoletas cuando la nueva ruta ya esté validada.

Entregables:
- eliminación controlada de wrappers.
- sin pérdida de compatibilidad certificada.

### B3.6 - Consolidar `OrdersManager`
Responsabilidad:
- unificar la lógica extraída en un módulo estable.

Entregables:
- `OrdersManager` consolidado.
- dependencias alineadas con la arquitectura objetivo.

## Dependencias objetivo

```text
Sync
  ↓
KitchenState
  ↓
OrdersManager
  ↓
RenderManager
```

## Reglas arquitectónicas

- `RenderManager` solo consume estado.
- `RenderManager` no modifica `KitchenState`.
- `RenderManager` no llama a Firebase.
- la UI no produce estado de negocio.

## Criterios de aceptación

- el flujo certificado sigue funcionando,
- no se rompe el cierre operativo,
- no se introduce dependencia inversa,
- cada subetapa queda validada antes de pasar a la siguiente.
- la validación end-to-end previa a B3 quedó aprobada antes de ejecutar `B3.1`.

## Propuesta de commits

1. `B3.1` crear `orders-manager.js` sin cambio funcional.
2. `B3.2` extraer acciones simples.
3. `B3.3` extraer transiciones.
4. `B3.4` extraer operaciones del operador.
5. `B3.5` eliminar wrappers legacy.
6. `B3.6` consolidar `OrdersManager`.

## Criterio de cierre
El plan B3 se considera ejecutado correctamente cuando las seis subetapas queden completadas con evidencia y sin regresiones funcionales ni visuales.
