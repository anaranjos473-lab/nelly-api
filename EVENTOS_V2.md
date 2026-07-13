# Nelly Delivery - Eventos V2

Estado: **BORRADOR PARA APROBACIÓN**

Fase: C5.1

Fecha: 2026-07-13

## Propósito

Un evento es un hecho inmutable que ya ocurrió. No es un estado ni una fase. Los eventos se almacenan bajo `pedidos/{id}/historial/{evento_id}` y explican cómo llegó el pedido a su situación actual. El historial permite auditoría, métricas, idempotencia y certificación de campo.

## Catálogo inicial

| Evento | Hecho representado | Efecto esperado |
|---|---|---|
| `PEDIDO_CREADO` | Nació un pedido V2 válido | Estado `PENDIENTE` |
| `COCINA_ACEPTO` | Cocina aceptó preparar | Estado `COCINA` |
| `PEDIDO_LISTO` | Cocina terminó preparación | Estado `LISTO` |
| `REPARTIDOR_ACEPTO` | Repartidor aceptó la misión y quedó vinculado | Asigna UID, activa asignación, estado `EN_CURSO` y fase `ASIGNADO` atómicamente |
| `RUTA_TIENDA_INICIADA` | Comenzó desplazamiento | Fase `EN_RUTA_TIENDA` |
| `LLEGADA_TIENDA` | Llegada validada geográficamente | Fase `EN_TIENDA` |
| `COMPRA_INICIADA` | Comenzó recolección/preparación en sitio | Fase `COMPRA_EN_CURSO` |
| `PEDIDO_ABORDO` | Repartidor confirmó posesión | Fase `EN_RUTA_CLIENTE` |
| `LLEGADA_CLIENTE` | Llegada validada geográficamente | Fase `EN_CLIENTE` |
| `EVIDENCIA_CAPTURADA` | Evidencia persistida y validada | Completa metadatos de evidencia |
| `PEDIDO_ENTREGADO` | Cierre operativo y financiero permitido | Estado `ENTREGADO`, fase `null` |
| `CANCELACION_SOLICITADA` | Un actor pidió cancelar | No cambia estado por sí sola |
| `PEDIDO_CANCELADO` | Cancelación autorizada y ejecutada | Estado `CANCELADO`, fase `null` |

Agregar un tipo exige ampliar y aprobar este catálogo; no se admiten nombres libres.

El V2 inicial no separa asignación y aceptación: en el flujo actual ambas ocurren en una sola operación. Si en el futuro existe reserva previa o despacho forzoso, deberá diseñarse como una ampliación explícita y no reutilizar `REPARTIDOR_ACEPTO` con otra semántica.

## Estructura de un evento

```json
{
  "id": "evt_...",
  "tipo": "LLEGADA_TIENDA",
  "idempotency_key": "...",
  "ocurrido_en": 1783970000000,
  "registrado_en": 1783970000500,
  "actor": {
    "tipo": "REPARTIDOR",
    "uid": "uid_..."
  },
  "estado_anterior": "EN_CURSO",
  "estado_nuevo": "EN_CURSO",
  "fase_anterior": "EN_RUTA_TIENDA",
  "fase_nueva": "EN_TIENDA",
  "ubicacion": {
    "lat": 16.75,
    "lng": -93.11,
    "precision_m": 12.4,
    "distancia_objetivo_m": 32.1
  },
  "motivo_codigo": null,
  "metadata": {}
}
```

## Reglas comunes

1. Los eventos son append-only: no se editan ni borran durante la operación normal.
2. `id` e `idempotency_key` son obligatorios y únicos dentro del pedido.
3. `ocurrido_en` expresa el momento del hecho; `registrado_en`, la confirmación del servidor.
4. El actor se autentica; `tipo` inicial: `SISTEMA`, `ADMIN`, `COCINA`, `REPARTIDOR`, `INTEGRACION`.
5. Estado/fase anterior y nuevo deben coincidir con la máquina vigente.
6. `metadata` no puede sustituir campos canónicos ni introducir estados libres.
7. Repetir una solicitud con la misma clave devuelve el resultado anterior sin duplicar efectos.
8. El backend registra evento y cambio canónico de forma atómica o con un mecanismo de consistencia explícito.

## Historial de transiciones

`historial` es el registro canónico único de hechos y transiciones. No se mantiene una segunda lista de estados que pueda divergir.

Cada evento que cambia `estado` conserva `estado_anterior`, `estado_nuevo` y sus timestamps. Por tanto, la secuencia:

```text
PENDIENTE -> COCINA -> LISTO -> EN_CURSO
```

se reconstruye filtrando los eventos cuyo estado anterior y nuevo son diferentes. Los cambios de fase y los hechos sin cambio comercial permanecen en el mismo historial, con estado anterior y nuevo iguales.

Reglas adicionales:

1. El estado actual debe coincidir con el último `estado_nuevo` de una transición confirmada.
2. Crear el pedido y `PEDIDO_CREADO` forma una única operación lógica.
3. Ningún consumidor calcula el estado actual contando eventos; lee `estado` y usa el historial para comprobar/auditar.
4. Si estado e historial discrepan, el pedido se bloquea para revisión; no se repara silenciosamente.

## Eventos geográficos

`LLEGADA_TIENDA` y `LLEGADA_CLIENTE` requieren:

- ubicación válida del dispositivo;
- precisión dentro del umbral que apruebe C4;
- distancia al objetivo dentro de la geocerca vigente;
- timestamp razonable y no reutilizado;
- UID igual al repartidor asignado.

Un intento fuera de geocerca no crea un evento de llegada. Puede registrarse en telemetría separada, sin alterar pedido ni fase.

`PEDIDO_ABORDO` exige `LLEGADA_TIENDA` previa. No es una coordenada ni un estado; es una confirmación operativa auditable.

## Evidencia

`EVIDENCIA_CAPTURADA` registra metadatos, no duplica el binario completo dentro del historial:

- `tipo` aprobado;
- `mime` real;
- referencia o URL;
- indicador de fallback;
- hash del contenido cuando se apruebe su algoritmo;
- tamaño en bytes;
- timestamp del servidor;
- actor.

El evento se crea solamente después de persistir evidencia válida. Si Storage falla y el fallback es aceptado, el evento registra `fallback=true` y la referencia canónica correspondiente.

## Finalización

`PEDIDO_ENTREGADO` requiere como mínimo:

1. estado `EN_CURSO`;
2. fase `EN_CLIENTE`;
3. `LLEGADA_CLIENTE` previa;
4. evidencia canónica válida;
5. repartidor autenticado y asignación activa;
6. cierre financiero permitido;
7. idempotencia;
8. limpieza o actualización posterior de proyecciones.

El retorno de la app a Radar es una reacción de UI al cierre confirmado, no un evento del pedido.

## Cancelación

`CANCELACION_SOLICITADA` no cambia el estado. `PEDIDO_CANCELADO` requiere autorización conforme a `MAQUINA_ESTADOS_V2.md` y contiene `motivo_codigo`; una nota puede complementar, nunca sustituir, el motivo catalogado.

## Historial y métricas

Las horas del piloto C4/C5 se derivan de eventos:

- creación: `PEDIDO_CREADO`;
- aceptación: `REPARTIDOR_ACEPTO`;
- llegada a tienda: `LLEGADA_TIENDA`;
- salida: `PEDIDO_ABORDO`;
- llegada al cliente: `LLEGADA_CLIENTE`;
- cierre: `PEDIDO_ENTREGADO`.

No se infieren estas horas a partir de la última modificación del pedido.

## Tabla de aprobación

| Decisión | Estado |
|---|---|
| Catálogo inicial | Pendiente |
| Estructura común | Pendiente |
| Historial append-only | Pendiente |
| Reglas geográficas | Pendiente |
| Evidencia como hecho y metadatos | Pendiente |
| Idempotencia y atomicidad | Pendiente |

La aprobación del catálogo no autoriza todavía su persistencia; habilita el diseño del validador y del mecanismo transaccional en C5.2.
