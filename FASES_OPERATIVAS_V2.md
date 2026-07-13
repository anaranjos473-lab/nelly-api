# Nelly Delivery - Fases Operativas V2

Estado: **VALIDADAS DOCUMENTALMENTE; IMPLEMENTACIÓN PENDIENTE**

Fase: C5.1

Fecha: 2026-07-13

## Propósito

`logistica.fase_operativa` describe qué está haciendo el repartidor y qué destino debe presentar la interfaz. Es independiente del estado comercial, aunque solo tiene sentido con un pedido `EN_CURSO` y una asignación activa.

## Fases permitidas

| Fase | Significado | Destino del mapa | Acción principal de UI |
|---|---|---|---|
| `ASIGNADO` | El repartidor aceptó y la misión se prepara | Tienda | Iniciar desplazamiento |
| `EN_RUTA_TIENDA` | Se desplaza hacia la tienda | Tienda | Navegar / registrar llegada |
| `EN_TIENDA` | Llegada geográfica confirmada | Tienda | Iniciar o continuar recolección |
| `COMPRA_EN_CURSO` | Pedido en preparación/recolección con el repartidor presente | Tienda, sin recalcular ruta salvo necesidad | Confirmar pedido a bordo |
| `EN_RUTA_CLIENTE` | Pedido a bordo y desplazamiento al cliente | Cliente | Navegar / registrar llegada |
| `EN_CLIENTE` | Llegada geográfica al cliente confirmada | Cliente | Capturar evidencia y finalizar |

Fuera de `EN_CURSO`, `fase_operativa` debe ser `null`.

## Secuencia ordinaria

```text
null
  -> ASIGNADO
  -> EN_RUTA_TIENDA
  -> EN_TIENDA
  -> COMPRA_EN_CURSO
  -> EN_RUTA_CLIENTE
  -> EN_CLIENTE
  -> null al quedar ENTREGADO o CANCELADO
```

`ASIGNADO -> EN_RUTA_TIENDA` puede ocurrir automáticamente al iniciar la misión, pero ambas fases se conservan porque representan hechos distintos y permiten medir tiempo de reacción.

## Reglas de transición

| Desde | Hacia | Disparador requerido |
|---|---|---|
| `null` | `ASIGNADO` | Transición del pedido `LISTO -> EN_CURSO` |
| `ASIGNADO` | `EN_RUTA_TIENDA` | Evento de inicio de ruta o arranque automático confirmado |
| `EN_RUTA_TIENDA` | `EN_TIENDA` | Evento `LLEGADA_TIENDA` con GPS/geocerca válidos |
| `EN_TIENDA` | `COMPRA_EN_CURSO` | Confirmación operativa de recolección/preparación |
| `COMPRA_EN_CURSO` | `EN_RUTA_CLIENTE` | Evento `PEDIDO_ABORDO` |
| `EN_RUTA_CLIENTE` | `EN_CLIENTE` | Evento `LLEGADA_CLIENTE` con GPS/geocerca válidos |
| `EN_CLIENTE` | `null` | Pedido `ENTREGADO` o cancelación autorizada |
| Cualquier fase | `null` | Cancelación autorizada y cierre de asignación |

No se permiten saltos silenciosos. Si una recuperación excepcional necesita cambiar de fase, debe generar un evento administrativo con motivo y conservar fase anterior y nueva.

## Relación con C4

- `ASIGNADO` y `EN_RUTA_TIENDA`: ruta activa hacia tienda.
- `EN_TIENDA` y `COMPRA_EN_CURSO`: mostrar ambos puntos y contexto, sin guiar al cliente todavía.
- `EN_RUTA_CLIENTE`: ruta activa hacia cliente.
- `EN_CLIENTE`: mantener destino cliente y habilitar cierre solo con geocerca/evidencia.
- Sin pedido `EN_CURSO`, el mapa puede mostrar la ubicación actual, pero no una ruta de misión.

La selección del destino depende únicamente de la fase canónica, no de textos del botón ni de estados heredados.

## Relación con la UI

La UI traduce fases a mensajes; los mensajes no se persisten como contrato. Ejemplos:

| Fase | Texto posible |
|---|---|
| `EN_RUTA_TIENDA` | “Ve a la tienda” |
| `EN_TIENDA` | “Llegaste a la tienda” |
| `COMPRA_EN_CURSO` | “Confirma cuando tengas el pedido” |
| `EN_RUTA_CLIENTE` | “Ve con el cliente” |
| `EN_CLIENTE` | “Captura evidencia y finaliza” |

Admin, Cocina, Android y Web Driver pueden presentar textos distintos, pero leen el mismo valor canónico.

## Incidentes y conectividad

- Perder GPS o red no cambia por sí mismo la fase.
- Los intentos locales pendientes deben reconciliarse mediante claves idempotentes.
- Una geocerca fallida registra un intento o telemetría, pero no una llegada.
- La reasignación y el abandono de misión requieren política separada antes de C5.2; no se resuelven retrocediendo fases.

## Tabla de aprobación

| Decisión | Estado |
|---|---|
| Seis fases exactas | Validadas documentalmente |
| Fase solo durante `EN_CURSO` | Validada documentalmente |
| Secuencia y disparadores | Validados documentalmente |
| Relación fase -> destino del mapa | Validada documentalmente |
| Política de recuperación excepcional | Validada como principio; detalle previo a implementación |

Estas fases son la referencia aprobada para alinear C4 sin convertir eventos geográficos en estados comerciales. Su implementación continúa pendiente.
