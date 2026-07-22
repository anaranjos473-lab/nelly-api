# CIERRE B2 Y PREPARACION DE B3 - KITCHEN PREMIUM V1

## Fecha
2026-07-22

## Proposito
Dejar constancia formal de que B2 puede considerarse cerrada y dejar preparada la entrada documental para B3, sin modificar el baseline certificado ni reabrir responsabilidades ya consolidadas.

## Referencias
- [`docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/BLUEPRINT_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/BLUEPRINT_KITCHEN_PREMIUM_V1.md)
- [`B3_CRITERIOS_DE_ENTRADA.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/B3_CRITERIOS_DE_ENTRADA.md)
- [`docs/architecture/NOTA_CIERRE_PAQUETE_B2_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/NOTA_CIERRE_PAQUETE_B2_B3_KITCHEN_PREMIUM_V1.md)

## 1. Cierre formal de B2

B2 se considera formalmente cerrada cuando se cumplen las condiciones ya documentadas en el tablero y el DoD:

- el render queda consolidado en un modulo modular y de solo lectura,
- la capa de presentacion deja de producir estado de negocio,
- el baseline certificado de Kitchen Premium no cambia en comportamiento,
- existe evidencia de validacion tecnica y manual,
- la documentacion refleja el estado real del repositorio.

Interpretacion operativa:

- `Estado -> Render -> Logica de negocio`
- `RenderManager` consume estado, no lo produce.
- no se introducen dependencias inversas desde render hacia estado o Firebase.

Resultado de cierre:

- B2 permanece registrada como `🟢 Completada` en el tablero oficial.
- no se requieren cambios funcionales adicionales para certificar este hito.

## 2. Plan de B3

B3 debe organizarse por casos de uso de pedidos, no por componentes visuales.

### B3.1 - Crear `orders-manager.js`
Responsabilidad:
- coordinar operaciones sobre pedidos.
- mantener el comportamiento actual sin alterarlo.

Entregable:
- estructura inicial del modulo.
- interfaz minima para orquestacion.

### B3.2 - Extraer acciones simples
Responsabilidad:
- obtener pedido.
- buscar pedido.
- actualizar coleccion.

Entregable:
- funciones puras o casi puras separadas del render.
- pruebas o validacion de no regresion segun aplique.

### B3.3 - Extraer transiciones
Responsabilidad:
- modelar cambios de estado de pedidos.

Ejemplos:
- `Pendiente -> Listo`
- `Listo -> Reparto`
- `Reparto -> Entregado`

Entregable:
- tabla o helpers de transicion.
- reglas explicitas de precondiciones y efectos.

### B3.4 - Extraer operaciones del operador
Responsabilidad:
- aceptar.
- cancelar.
- marcar listo.

Entregable:
- acciones operativas desacopladas de la UI.
- contrato claro de entrada y salida.

### B3.5 - Eliminar wrappers legacy
Responsabilidad:
- retirar capas intermedias obsoletas cuando la nueva ruta ya este validada.

Entregable:
- eliminacion de wrappers sin perder compatibilidad certificada.

### B3.6 - Consolidar `OrdersManager`
Responsabilidad:
- unificar la logica extraida en un punto estable.

Entregable:
- modulo consolidado.
- dependencias en direccion correcta.

### Dependencias objetivo

```text
Sync
  ↓
KitchenState
  ↓
OrdersManager
  ↓
RenderManager
```

Reglas:

- `RenderManager` no modifica `KitchenState`.
- `RenderManager` no llama a Firebase.
- la UI consume estado; no lo produce.

### Propuesta de commits

1. `B3.1` crear `orders-manager.js` sin cambio funcional.
2. `B3.2` extraer acciones simples.
3. `B3.3` extraer transiciones.
4. `B3.4` extraer operaciones del operador.
5. `B3.5` eliminar wrappers legacy.
6. `B3.6` consolidar `OrdersManager`.

## 3. Checklist end-to-end previo a B3

La siguiente verificacion debe completarse antes de iniciar la apertura operativa de B3:

### Creacion
- [ ] Crear pedido.
- [ ] Confirmar que Cocina lo recibe.

### Cocina
- [ ] Cocina marca `LISTO`.
- [ ] El pedido deja de depender del render antiguo para su estado.

### Conductor
- [ ] El pedido aparece en el Radar del conductor.
- [ ] El conductor acepta el pedido.
- [ ] La identidad usada en la aceptacion coincide con el backend autorizado.

### Seguimiento
- [ ] El seguimiento en tiempo real refleja el cambio.
- [ ] La transicion de fase no rompe la sincronizacion.

### Entrega
- [ ] El pedido se entrega.
- [ ] El cierre operativo conserva el contrato certificado.

### Finanzas y auditoria
- [ ] La actualizacion de finanzas ocurre correctamente.
- [ ] La auditoria conserva trazabilidad suficiente.

### Render modular
- [ ] El render modular sigue reflejando todos los cambios.
- [ ] No aparecen regresiones visuales ni de dependencia.

## Criterio de uso

Este documento no abre B3 por si mismo. Solo deja listos:

- el cierre formal de B2,
- la estructura de trabajo para B3,
- y la validacion funcional minima previa a su inicio.

La apertura de B3 sigue sujeta a `B3_CRITERIOS_DE_ENTRADA.md` y a la evidencia que ese documento exige.
