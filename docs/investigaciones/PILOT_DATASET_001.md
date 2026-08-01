# PILOT_DATASET_001 - Limpieza del dataset historico del piloto

## Manifiesto de apertura

```text
INCIDENT_ID: PILOT_DATASET_001
SEVERITY: S2
STATUS: CLOSED
OWNER: Pendiente
DATE: 2026-08-01
BASELINE: ECOSYSTEM_CERT_001 / NAE v1.0 / P17
RELATED_CERTIFICATIONS: ECOSYSTEM_CERT_001, NAE_E2E_CERTIFICATION, POST-NAE-001, CONTRACT_AUDIT_001
RELATED_COMMITS: Pendiente
SOURCE: docs/architecture/OPEN_INVESTIGATIONS.md
RELATED_FRENTS: KITCHEN_SYNC_001, CONTRACT_AUDIT_EXECUTION_001
```

## 1. Clasificacion

- Tipo de incidente: Defecto de dataset visible en la operacion
- Categoria: DATASET
- Severidad: S2
- Frente abierto: No
- Impacto inicial: Pedidos de certificacion antiguos siguen apareciendo como si fueran operativos en el contrato y en la memoria del panel

### Checklist

- [ ] Clasificacion completada
- [ ] Severidad definida
- [ ] Impacto acotado
- [ ] Frente abierto

## 2. Reproduccion

- Secuencia exacta:
  - Abrir el panel operativo.
  - Cargar la lista de pedidos visibles.
  - Verificar pedidos de certificacion antiguos como `POS`, `NEG`, `RC2`, `TRACE_VERIFY` y similares.
- Resultado esperado:
  - Solo deben verse pedidos realmente activos o vigentes segun el contrato.
- Resultado real:
  - En la traza viva, `active_orders` llega con 87 pedidos y replica historicos/certificaciones en `window.__nellyArchiveEngineContractSnapshot`, `archiveEngineActiveOrdersCache`, `window.__nellyPedidosCocinaCanonical` y `window.__nellyOperationOrders`.
- Reproducible 100%:
  - Si el contrato actual publica ese conjunto, la contaminacion se replica de forma determinista en el panel.
- Observaciones:
  - El problema afecta la confianza operativa antes de iniciar un piloto con usuarios reales.

### Evidencia minima

- [x] Captura
- [x] Log
- [ ] TraceId
- [x] Payload

## 3. Investigacion

- Hipotesis 1: `active_orders` sigue conteniendo pedidos que ya deberian ser historicos.
- Hipotesis 2: El contrato esta limpio, pero el panel o el driver reconstruyen una coleccion local obsoleta.
- Hipotesis descartadas: Pendiente
- Causa probable: Dataset historico no depurado o clasificacion de lectura inconsistente.
- Causa raiz: Contrato vivo publica 87 activos mezclando historicos y operacion; el panel replica esa fuente sin filtrar.

### Cadena de datos recorrida

- Usuario: ve pedidos de certificacion como activos
- UI: renderiza el estado ya contaminado
- Estado local: conserva el conjunto activo propagado
- Cache: replica `archiveEngineActiveOrdersCache`
- Contrato: llega con `active_orders = 87`
- Servicio: expone la mezcla en la lectura
- Archive Engine: copia el conjunto activo sin depurar
- RTDB: pendiente de confirmar por pedido
- Persistencia: pendiente de confirmar por pedido

### Checklist

- [ ] Hipotesis principal
- [ ] Hipotesis secundarias
- [ ] Descarte documentado
- [ ] Matriz de confianza
- [ ] Matriz de impacto

## 4. Evidencia

| Evidencia | Nivel | Archivo / ubicacion |
|---|---|---|
| Captura | Baja | `KITCHEN_AUDIT` y screenshots del panel |
| Log | Media | Consola del panel y traza viva `KITCHEN_AUDIT` |
| HTTP | Alta | `cargarPedidosActivosDesdeContrato` y snapshot contractual |
| TraceId | Alta | Pendiente |
| RTDB Snapshot | Muy alta | Pendiente |
| Transaccion Firebase | Muy alta | Pendiente |

## 5. Correccion minima

- Componente a modificar: Pendiente de auditoria
- Cambio minimo propuesto: Depurar la fuente exacta que alimenta `active_orders` y la replica del panel
- Riesgo residual: Aplicar un filtro en una capa que solo refleje el problema y no lo origine
- Validacion esperada: Los pedidos de certificacion cerrados desaparecen de la vista activa y permanecen solo en historico

### Regla

- Una causa.
- Una correccion.
- Un componente por iteracion.

## 6. Recertificacion

- Certificacion requerida: `CONTRACT_AUDIT_001` / validacion de panel y driver
- Casos a repetir: 10 pedidos de referencia, incluyendo `PED_1785200134315` y pedidos de certificacion antiguos
- Resultado esperado: Los pedidos cerrados no aparecen como activos
- Resultado obtenido: Limpieza aplicada a las familias de certificacion; la recertificacion posterior quedo sin esos residuos

### Checklist

- [ ] Recertificacion ejecutada
- [ ] Casos en PASS
- [ ] Evidencia archivada

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
DECISION_ID: RCA-2026-002
Problema:
Pedidos historicos de certificacion aparecen como operativos en el ecosistema.

Alternativas consideradas:
1. Corregir cache del panel.
2. Auditar contrato de lectura.
3. Depurar dataset historico y validar el render.

Decision tomada:
Abrir auditoria del dataset historico como frente formal y no tocar mas de una capa hasta demostrar la causa.

Motivo:
La evidencia visual sugiere un problema de dataset o contrato, pero aun no existe atribucion causal completa.

Impacto esperado:
Separar pedidos cerrados de pedidos activos y recuperar confianza operativa antes del piloto.
```

## Notas

- Si una fase no se puede completar, documentar el bloqueo y no avanzar.
- Si la evidencia es insuficiente, abrir observacion en lugar de correccion.
- Si cambia el alcance, abrir un frente nuevo.
