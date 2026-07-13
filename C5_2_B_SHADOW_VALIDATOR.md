# C5.2-B - Shadow Validator V2

Estado: **COMPLETO Y APROBADO; APAGADO**

Fecha: 2026-07-13

## Frontera autorizada

El Shadow Validator puede observar y medir. No puede:

- rechazar un pedido;
- transformar o completar datos;
- cambiar estados o fases;
- escribir métricas en RTDB;
- modificar índices;
- alterar Android, paneles, Delivery, Tracking o Cloud Functions.

La integración está apagada por defecto. No se activó contra RTDB productiva durante este incremento.

## Componentes

### Validador puro

`src/services/c5ShadowValidator.js` recibe un objeto en memoria y devuelve:

- si declara `contract_version=2`;
- si cumple V2;
- errores con código y ruta;
- aliases heredados detectados;
- transición inválida respecto del estado anterior.

No recibe una referencia de Firebase y no tiene capacidad de escritura.

Valida:

- identidad, `producer` y versión;
- cliente, tienda y ambos pares de coordenadas;
- items, centavos y consistencia del total;
- estados, fases y asignación;
- evidencia obligatoria al entregar;
- historial append-only, catálogo de eventos e idempotencia;
- coherencia entre estado/fase actual y último evento;
- transiciones comerciales;
- aliases persistidos en V2;
- campos superiores y estructuras V2 desconocidas.

### Observador RTDB

`src/services/c5ShadowObserver.js`:

1. lee `pedidos` una vez;
2. mantiene listeners `child_added`, `child_changed` y `child_removed`;
3. valida copias en memoria;
4. genera logs JSON estructurados sin cliente, teléfono, dirección, coordenadas, items ni evidencia;
5. mantiene métricas agregadas en memoria;
6. retira listeners mediante `stop()`.

No llama `set`, `update`, `push` ni `remove`.

Cambios que no alteran el resultado contractual —por ejemplo, otra actualización GPS con los mismos errores/aliases— se vuelven a contabilizar como validación, pero no repiten logs por pedido ni el resumen. Esto limita volumen y costo operativo.

### Integración reversible

`server.js` inicia el observador únicamente cuando:

```text
ENABLE_C5_SHADOW_VALIDATOR=true
```

Cualquier otro valor equivale a apagado y no consulta RTDB. El servidor comienza a escuchar antes de iniciar la sombra, por lo que una lectura lenta no bloquea el arranque HTTP. Si la inicialización falla, se registra el error y el backend continúa sin sombra. `SIGINT` y `SIGTERM` retiran los listeners.

Para desactivarlo se cambia el flag a `false`/ausente y se reinicia la instancia. No existe migración ni limpieza asociada al rollback.

## Métricas disponibles

| Indicador | Campo emitido |
|---|---|
| Pedidos observados | `total_orders` |
| Pedidos que declaran V2 | `v2_orders`, `v2_percentage` |
| Pedidos V2 válidos | `valid_v2_orders`, `valid_v2_percentage` |
| Pedidos con incumplimientos | `invalid_orders` |
| Pedidos con aliases | `orders_with_aliases` |
| Alias más usados | `aliases_used` |
| Desviaciones más frecuentes | `failures_by_code` |
| Distribución por productor | `by_producer` |
| Validaciones realizadas | `validation_runs` |
| Transiciones inválidas observadas | `invalid_transition_events` |

La métrica “consumidores compatibles 0 -> 9” no se inventa desde pedidos; se actualiza con pruebas por consumidor en C5.2-C. El tablero de migración combinará esa evidencia con las métricas del Shadow Validator.

## Privacidad y seguridad

Los logs por pedido incluyen únicamente:

- id técnico del pedido;
- versión;
- productor;
- resultado booleano;
- códigos de error;
- nombres de aliases.

No registran valores de campos comerciales ni datos personales. Los mensajes de error del listener se limitan a 240 caracteres.

## Validación local

Archivo: `tests/c5-shadow-validator.test.js`.

Casos certificados:

1. pedido V2 completo sin mutación;
2. pedido V1 con faltantes y aliases;
3. transición comercial inválida;
4. progresión válida hasta `EN_CURSO/ASIGNADO`;
5. coordenadas e importes inconsistentes;
6. métricas agregadas sin datos del cliente;
7. modo apagado sin consulta RTDB;
8. observador que usa solo lectura/listeners y puede detenerse.

Resultado específico del incremento:

- 8/8 pruebas del Shadow Validator verdes;
- 32/32 pruebas conjuntas de Shadow Validator, contrato Admin y Delivery verdes;
- 1/1 prueba del fallback ejecutada con `node --test` verde;
- `node --check` verde para validador, observador y `server.js`.

La suite Jest global conservó dos incidencias heredadas fuera de C5.2-B: `orders.test.js` simula la implementación Firestore anterior y no el productor RTDB actual; `evidence-fallback.test.mjs` usa `node:test` y Jest intenta resolver `test` como módulo. En la corrida global pasaron 55/56 pruebas ejecutadas; el fallback pasó con su runner correcto. No se corrigieron esos tests porque sería una ampliación ajena al Shadow Validator.

## Estado de métricas reales

No se presenta una tasa de cumplimiento de pedidos reales porque el flag no se activó. Reportar porcentajes sin ejecutar la sombra sería evidencia inventada.

La primera activación controlada deberá:

1. comenzar con una sola instancia;
2. capturar `initial_metrics` y una ventana acordada;
3. comprobar latencia, memoria y volumen de logs;
4. desactivar ante cualquier impacto;
5. publicar únicamente agregados y códigos de desviación;
6. no autorizar productores V2 por el simple hecho de observar.

## Puerta siguiente

C5.2-B está aprobado y permanece apagado. La ventana C5.2-B.1 fue autorizada bajo el protocolo `C5_2_B_1_VENTANA_OBSERVACION.md`; su activación manual y sus resultados siguen pendientes. C5.2-C adaptará consumidores uno por uno y continúa bloqueada.
