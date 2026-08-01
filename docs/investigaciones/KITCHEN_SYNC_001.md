# KITCHEN_SYNC_001 - Sincronizacion de memoria del panel

## Manifiesto de apertura

```text
INCIDENT_ID: KITCHEN_SYNC_001
SEVERITY: S2
STATUS: OPEN
OWNER: Pendiente
DATE: 2026-08-01
BASELINE: ECOSYSTEM_CERT_001 / NAE v1.0 / P17
RELATED_CERTIFICATIONS: ECOSYSTEM_CERT_001, NAE_E2E_CERTIFICATION, POST-NAE-001, CONTRACT_AUDIT_001
RELATED_COMMITS: Pendiente
SOURCE: docs/architecture/OPEN_INVESTIGATIONS.md
RELATED_FRENTS: PILOT_DATASET_001, CONTRACT_AUDIT_EXECUTION_001
```

## 1. Clasificacion

- Tipo de incidente: Defecto de sincronizacion de estado visible en la UI
- Categoria: CACHE
- Severidad: S2
- Frente abierto: Si
- Impacto inicial: El panel conserva o reutiliza pedidos que ya no coinciden con la memoria operativa actual

### Checklist

- [ ] Clasificacion completada
- [ ] Severidad definida
- [ ] Impacto acotado
- [ ] Frente abierto

## 2. Reproduccion

- Secuencia exacta:
  - Abrir el panel operativo.
  - Navegar entre pedidos de cocina.
  - Intentar operar un pedido ya visible pero ya no presente en `kitchenState.orders`.
  - Observar el mensaje `Pedido no encontrado en cocina`.
- Resultado esperado:
  - La UI debe mostrar solo lo que la memoria operativa sigue reconociendo como vigente.
- Resultado real:
  - El pedido sigue visible o seleccionable, pero la accion opera sobre una referencia ya perdida.
- Reproducible 100%:
  - Pendiente de corrida controlada; la evidencia actual sugiere alta reproducibilidad bajo las mismas condiciones.
- Observaciones:
  - El sintoma apunta a memoria de panel, cache o reconstruccion de coleccion local.

### Evidencia minima

- [ ] Captura
- [ ] Log
- [ ] TraceId
- [ ] Payload

## 3. Investigacion

- Hipotesis 1: `archiveEngineActiveOrdersCache` o la cache asociada conserva pedidos cuando el contrato cambia.
- Hipotesis 2: `window.__nellyOperationOrders` o la reconstruccion del panel mantiene una copia obsoleta.
- Hipotesis 3: `kitchenState.orders` pierde la referencia antes de la accion, pero la UI no se resincroniza.
- Hipotesis descartadas: Pendiente
- Causa probable: Desalineacion entre cache visible y memoria operativa viva.
- Causa raiz: Pendiente de auditoria `Panel -> cache -> kitchenState.orders -> contrato`.

### Cadena de datos recorrida

- Usuario:
- UI:
- Estado local:
- Cache:
- Contrato:
- Servicio:
- Archive Engine:
- RTDB:
- Persistencia:

### Checklist

- [ ] Hipotesis principal
- [ ] Hipotesis secundarias
- [ ] Descarte documentado
- [ ] Matriz de confianza
- [ ] Matriz de impacto

## 4. Evidencia

| Evidencia | Nivel | Archivo / ubicacion |
|---|---|---|
| Captura | Baja | `nelly_current.png`, `ui_current.xml` |
| Log | Media | `debug.log`, `firebase-debug.log` |
| HTTP | Alta | `public/panel.html`, `prompts/nelly-rca.prompt.md` |
| TraceId | Alta | Pendiente |
| RTDB Snapshot | Muy alta | Pendiente |
| Transaccion Firebase | Muy alta | Pendiente |

## 5. Correccion minima

- Componente a modificar: Pendiente de auditoria
- Cambio minimo propuesto: Eliminar o invalidar la referencia local que permita seguir operando un pedido que ya no existe en la memoria viva
- Riesgo residual: Ocultar un pedido vigente si la sincronizacion es demasiado agresiva
- Validacion esperada: El pedido desaparece de la memoria visible cuando deja de existir en la fuente correcta

### Regla

- Una causa.
- Una correccion.
- Un componente por iteracion.

## 6. Recertificacion

- Certificacion requerida: Validacion de panel / Cocina / flujo de seleccion
- Casos a repetir: 10 pedidos de referencia y la secuencia `MARCAR LISTO` sobre pedidos ya sincronizados
- Resultado esperado: Ningun pedido obsoleto permanece seleccionable ni visible como operativo
- Resultado obtenido: Pendiente

### Checklist

- [ ] Recertificacion ejecutada
- [ ] Casos en PASS
- [ ] Evidencia archivada

## 7. Cierre

- Acta actualizada: Pendiente
- ADR ligero emitido: Pendiente
- README actualizado: Pendiente
- Index maestro actualizado: Pendiente
- Investigacion cerrada: No

### Checklist de cierre

- [ ] Evidencia suficiente
- [ ] Correccion minima
- [ ] Recertificacion
- [ ] Commit
- [ ] Push
- [ ] ADR
- [ ] Acta
- [ ] README actualizado
- [ ] Investigacion cerrada

## Registro de decisiones

```text
DECISION_ID: RCA-2026-003
Problema:
El panel conserva o reutiliza pedidos que ya no coinciden con la memoria operativa actual.

Alternativas consideradas:
1. Ajustar cache de contrato.
2. Auditar la reconstruccion local del panel.
3. Revisar la sincronizacion de kitchenState.orders.

Decision tomada:
Abrir frente formal de sincronizacion de memoria del panel y no tocar mas de una capa sin evidencia causal.

Motivo:
El sintoma se manifiesta en la UI, pero la atribucion causal aun no esta demostrada.

Impacto esperado:
Eliminar pedidos obsoletos de la vista operativa sin perder pedidos vigentes.
```

## Notas

- Si una fase no se puede completar, documentar el bloqueo y no avanzar.
- Si la evidencia es insuficiente, abrir observacion en lugar de correccion.
- Si cambia el alcance, abrir un frente nuevo.

