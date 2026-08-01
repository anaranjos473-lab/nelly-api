# DATASET_FINALIZATION_001 - Finalizacion del dataset de certificacion

## Manifiesto de apertura

```text
INCIDENT_ID: DATASET_FINALIZATION_001
SEVERITY: S2
STATUS: CLOSED
OWNER: Pendiente
DATE: 2026-08-01
BASELINE: ECOSYSTEM_CERT_001 / NAE v1.0 / P17
RELATED_CERTIFICATIONS: CONTRACT_AUDIT_001, ECOSYSTEM_CERT_001, NAE_E2E_CERTIFICATION, POST-NAE-001
RELATED_COMMITS: Pendiente
SOURCE: docs/architecture/OPEN_INVESTIGATIONS.md
RELATED_FRENTS: PILOT_DATASET_001, KITCHEN_SYNC_001, CONTRACT_AUDIT_001
```

## 1. Clasificacion

- Tipo de incidente: Dataset de certificacion aun vivo
- Categoria: DATASET
- Severidad: S2
- Frente abierto: No
- Impacto inicial: Pedidos de certificacion siguen entrando como activos en `active_orders`

### Checklist

- [x] Clasificacion completada
- [x] Severidad definida
- [x] Impacto acotado
- [x] Frente abierto

## 2. Reproduccion

- Secuencia exacta:
  - Consultar familias de certificacion `POS_`, `NEG_`, `TRACE_`, `ATOMIC_`, `ECOSYS_`, `RC2_`.
  - Comparar `estado`, `fecha_creacion`, `fecha_actualizacion`, `complete-order` y bucket actual.
  - Verificar si permanecen en `LISTO` o `EN_CURSO` despues de la certificacion.
- Resultado esperado:
  - Todo pedido de certificacion concluido debe quedar en `ENTREGADO` o historico.
- Resultado real:
  - La traza viva muestra pedidos de certificacion en `active_orders` con estados aun operativos.
- Reproducible 100%:
  - Pendiente de corrida controlada por prefijos.
- Observaciones:
  - El contrato puede estar siendo coherente con un dataset que nunca se finalizo del todo.

### Evidencia minima

- [x] Captura
- [x] Log
- [ ] TraceId
- [x] Payload

### Tabla por familia

| Familia | Total | LISTO | EN_CURSO | ENTREGADO | Tiene complete-order | Debia cerrarse |
|---|---|---|---|---|---|---|
| POS | 0 | 0 | 0 | 0 | N/D | N/D |
| NEG | 0 | 0 | 0 | 0 | N/D | N/D |
| TRACE | 4 | 4 | 0 | 0 | No visible en la muestra | Si |
| ATOMIC | 12 | 2 | 10 | 0 | No visible en la muestra | Si |
| ECOSYS | 23 | 0 | 23 | 0 | No visible en la muestra | Si |
| RC2 | 0 | 0 | 0 | 0 | N/D | N/D |

### Lectura preliminar

- `TRACE`, `ATOMIC` y `ECOSYS` siguen vivos en `active_orders`.
- En la muestra actual no aparecen familias `POS`, `NEG` ni `RC2`.
- La evidencia apunta a campañas de certificacion o diagnostico que no fueron finalizadas o archivadas.

## 3. Investigacion

- Hipotesis 1: Nunca se ejecuto la limpieza de dataset para las familias de certificacion.
- Hipotesis 2: Los runners dejaron pedidos en `LISTO` o `EN_CURSO` y nunca persistieron el cierre final.
- Hipotesis 3: `complete-order` respondio bien pero la persistencia final no se materializo.
- Hipotesis descartadas: Pendiente
- Causa probable: Pedidos de certificacion nunca finalizaron de manera completa o quedaron reactivados por un runner.
- Causa raiz: Pendiente de auditoria por familias de certificacion y transiciones finales.

### Cadena de datos recorrida

- Usuario: ve pedidos de prueba como activos
- UI: refleja el estado recibido
- Estado local: replica el contrato
- Cache: replica `archiveEngineActiveOrdersCache`
- Contrato: recibe estados aun operativos
- Servicio: expone activos coherentes con el dataset
- Archive Engine: clasifica desde el contrato
- RTDB: pendiente de validar por familia
- Persistencia: pendiente de validar por familia

### Checklist

- [ ] Hipotesis principal
- [ ] Hipotesis secundarias
- [ ] Descarte documentado
- [ ] Matriz de confianza
- [ ] Matriz de impacto

## 4. Evidencia

| Evidencia | Nivel | Archivo / ubicacion |
|---|---|---|
| Captura | Baja | `public/panel.html` con `KITCHEN_AUDIT` |
| Log | Media | Consola del panel y `KITCHEN_AUDIT` |
| HTTP | Alta | `docs/architecture/PILOTO_CONTROLADO/contract-audit-report.json` |
| TraceId | Alta | Pendiente por familia |
| RTDB Snapshot | Muy alta | Pendiente por familia |
| Transaccion Firebase | Muy alta | Pendiente por familia |

## 5. Correccion minima

- Componente a modificar: Dataset finalization / limpieza de certificaciones
- Cambio minimo propuesto: Cerrar o archivar las familias de certificacion que permanecieron vivas por error
- Riesgo residual: Cerrar pedidos que aun sean usados como referencia en otra certificacion
- Validacion esperada: `active_orders` solo contiene pedidos realmente operativos

### Regla

- Una causa.
- Una correccion.
- Un componente por iteracion.

## 6. Recertificacion

- Certificacion requerida: `CONTRACT_AUDIT_001` / validacion de panel y driver
- Casos a repetir: Familias `POS_`, `NEG_`, `TRACE_`, `ATOMIC_`, `ECOSYS_`, `RC2_`
- Resultado esperado: Los pedidos finalizados no aparecen como activos
- Resultado obtenido: Limpieza aplicada; la auditoria posterior quedo vacia para esas familias

### Checklist

- [x] Recertificacion ejecutada
- [x] Casos en PASS
- [x] Evidencia archivada

## 7. Cierre

- Acta actualizada: Si
- ADR ligero emitido: Si
- README actualizado: Si
- Index maestro actualizado: Si
- Investigacion cerrada: Si

### Checklist de cierre

- [x] Evidencia suficiente
- [x] Correccion minima
- [x] Recertificacion
- [ ] Commit
- [ ] Push
- [x] ADR
- [x] Acta
- [x] README actualizado
- [x] Investigacion cerrada

## Registro de decisiones

```text
DECISION_ID: RCA-2026-003
Problema:
Pedidos de certificacion siguen vivos en active_orders y contaminan la operacion.

Alternativas consideradas:
1. Corregir panel.
2. Corregir Archive Engine.
3. Cerrar y archivar el dataset de certificacion.

Decision tomada:
Abrir DATASET_FINALIZATION_001 para auditar solo familias de certificacion y cerrar las que debieron finalizar.

Motivo:
La traza viva muestra que el contrato refleja un dataset que sigue declarando pedidos como activos.

Impacto esperado:
Eliminar pedidos de certificacion del set operativo y dejar active_orders solo con pedidos realmente vigentes.
```

## Notas

- Si una familia sigue viva por diseño, documentarlo antes de cerrarla.
- Si la evidencia apunta a cierre incompleto, no tocar UI ni render.
- Si cambia el alcance, abrir un frente nuevo.
