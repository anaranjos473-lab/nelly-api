# CHECKPOINT C3.1 – Resultado de evidencia Backend ↔ Driver

## Fecha y contexto
- Fecha de ejecución: 2026-06-30
- Objetivo: validar la transición exacta en el instante en que Cocina marca un pedido como LISTO.
- Alcance: evidenciar el contrato RTDB justo antes de aceptar un pedido por parte del driver.

## Pedido utilizado
- `PED_C3_1_LISTO_1782810938485`
- Hora de creación: `2026-06-30T09:15:38.486Z`

## Snapshot RTDB capturado en el instante LISTO

### 1) `pedidos/PED_C3_1_LISTO_1782810938485`
```json
{
  "cliente_nombre": "Pedido C3.1 Evidencia LISTO",
  "descripcion": "Pedido de certificacion C3.1 - snapshot instantaneo LISTO",
  "despachado_en": 1782810938486,
  "direccion": "Ruta C3.1, Tuxtla Gutierrez",
  "estado": "LISTO",
  "estado_pedido": "LISTO",
  "fase_panel": "Despacho",
  "fecha_creacion": 1782810938486,
  "hora_cocina": "2026-06-30T09:15:38.486Z",
  "id": "PED_C3_1_LISTO_1782810938485",
  "id_pedido": "PED_C3_1_LISTO_1782810938485",
  "logistica": {
    "estado": "disponible"
  },
  "monto": 123,
  "origen": "certificacion_c3_1",
  "pedido_id": "PED_C3_1_LISTO_1782810938485",
  "telefono": "9610000100"
}
```

### 2) `pedidos_para_reparto/PED_C3_1_LISTO_1782810938485`
```json
{
  "cliente_nombre": "Pedido C3.1 Evidencia LISTO",
  "descripcion": "Pedido de certificacion C3.1 - snapshot instantaneo LISTO",
  "despachado_en": 1782810938486,
  "direccion": "Ruta C3.1, Tuxtla Gutierrez",
  "estado": "LISTO",
  "estado_pedido": "LISTO",
  "fase_panel": "Despacho",
  "fecha_creacion": 1782810938486,
  "hora_cocina": "2026-06-30T09:15:38.486Z",
  "id": "PED_C3_1_LISTO_1782810938485",
  "id_pedido": "PED_C3_1_LISTO_1782810938485",
  "logistica": {
    "estado": "disponible"
  },
  "monto": 123,
  "origen": "certificacion_c3_1",
  "pedido_id": "PED_C3_1_LISTO_1782810938485",
  "telefono": "9610000100"
}
```

### 3) `pedidos_en_camino/PED_C3_1_LISTO_1782810938485`
```json
null
```

## Interpretación de la evidencia
- El backend publica correctamente el estado operativo en el nodo principal `pedidos`.
- El mismo pedido aparece también en `pedidos_para_reparto`, que es el nodo que típicamente alimenta al driver disponible.
- En el instante LISTO, `pedidos_en_camino` permanece ausente, lo cual es consistente con que el pedido todavía no fue aceptado.

## Cadena exacta del Driver para este snapshot

| Paso | Valor observado en el snapshot C3.1 | Resultado |
|------|--------------------------------------|-----------|
| Estado recibido por el driver | `estado_pedido = LISTO` | `LISTO` |
| Normalización en `normalizarEstado()` | `LISTO` permanece `LISTO` | `LISTO` |
| Filtro en `esEstadoDisponibleParaDriver()` | `estado == "LISTO"` | `true` |

Esto significa que, si el pedido `PED_C3_1_LISTO_1782810938485` llegara al driver con ese snapshot, el flujo interno debería considerarlo disponible.

## Conclusión C3.1
- **Backend certificado para el contrato de despacho a LISTO**.
- El problema de visibilidad para el driver, si persiste, ya no está explicado por un despacho incorrecto en RTDB.
- El foco restante debe quedar en la capa Android que consume y filtra el estado, especialmente en:
  - `PedidoRepository` (lectura desde `pedidos` y normalización)
  - `esEstadoDisponibleParaDriver()`
  - la UI de lista disponible

## Resultado final del checkpoint
- **Estado de contrato Backend ↔ Driver en el momento LISTO:** verificable y coherente.
- **Siguiente pregunta a responder:** ¿el driver realmente recibe `LISTO` desde `pedidos` y lo muestra como disponible, o hay una normalización/filtro/UI que lo oculta?
