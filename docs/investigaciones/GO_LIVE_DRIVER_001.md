# GO_LIVE_DRIVER_001 - Conductor elegible para GO/NO-GO

## Manifiesto de apertura

```text
INCIDENT_ID: GO_LIVE_DRIVER_001
SEVERITY: S1
STATUS: OPEN
OWNER: Pendiente
DATE: 2026-08-01
BASELINE: ECOSYSTEM_CERT_001 / NAE v1.0 / P17
RELATED_CERTIFICATIONS: GO_LIVE_CERTIFICATION_001, CONTRACT_AUDIT_001, DATASET_FINALIZATION_001
RELATED_COMMITS: Pendiente
SOURCE: docs/investigaciones/GO_LIVE_READINESS_CHECKLIST.md
RELATED_FRENTS: GO_LIVE_CERTIFICATION_001, PILOT_DATASET_001
```

## 1. Clasificacion

- Tipo de incidente: Bloqueo operativo para validacion final
- Categoria: AUTH
- Severidad: S1
- Frente abierto: Si
- Impacto inicial: La aceptacion del pedido de certificacion falla por `Limite de deuda alcanzado`

### Checklist

- [ ] Clasificacion completada
- [ ] Severidad definida
- [ ] Impacto acotado
- [ ] Frente abierto

## 2. Reproduccion

- Secuencia exacta:
  - Crear un pedido nuevo.
  - Despacharlo a `LISTO`.
  - Intentar aceptarlo con un conductor no elegible.
  - Confirmar el `HTTP 403` con `Limite de deuda alcanzado`.
- Resultado esperado:
  - El conductor usado para GO/NO-GO debe aceptar el pedido con `200`.
- Resultado real:
  - Un conductor con deuda bloquea la aceptacion.
- Reproducible 100%:
  - Si el conductor no es elegible, la regla responde consistentemente con `403`.
- Observaciones:
  - La regla de negocio funciona; el bloqueo es de elegibilidad del conductor.

### Evidencia minima

- [x] Captura
- [x] Log
- [ ] TraceId
- [x] Payload

## 3. Investigacion

- Hipotesis 1: El conductor de prueba tiene deuda activa y no puede aceptar pedidos.
- Hipotesis 2: Existe otro conductor elegible que puede usarse para la certificacion final.
- Hipotesis descartadas: La regla de deuda no es un bug del producto.
- Causa probable: Faltan credenciales o estado operativo de un conductor elegible para el GO/NO-GO.
- Causa raiz: Bloqueo operativo por elegibilidad del conductor.

### Cadena de datos recorrida

- Usuario: intenta iniciar la corrida final
- UI: muestra el pedido disponible
- Estado local: conserva el pedido listo para reparto
- Cache: no es el origen del bloqueo
- Contrato: publica el pedido correctamente
- Servicio: rechaza la aceptacion por politica de deuda
- Archive Engine: no es el origen del bloqueo
- RTDB: pedido en `LISTO`
- Persistencia: deuda del conductor impide avanzar

### Checklist

- [ ] Hipotesis principal
- [ ] Hipotesis secundarias
- [ ] Descarte documentado
- [ ] Matriz de confianza
- [ ] Matriz de impacto

## 4. Evidencia

| Evidencia | Nivel | Archivo / ubicacion |
|---|---|---|
| Captura | Baja | `scripts/certificar-pedido-c-campo.mjs` salida |
| Log | Media | `HTTP 403 - Limite de deuda alcanzado` |
| HTTP | Alta | `POST /api/delivery/accept-order` |
| TraceId | Alta | Pendiente |
| RTDB Snapshot | Muy alta | Pedido en `LISTO` |
| Transaccion Firebase | Muy alta | Pendiente |

## 5. Correccion minima

- Componente a modificar: Conducto operativo de certificacion
- Cambio minimo propuesto: Usar un conductor elegible con deuda cero y disponibilidad real para cerrar la prueba
- Riesgo residual: Seleccionar un conductor que luego quede fuera de la corrida por cambios de estado
- Validacion esperada: `accept-order` responde `200`

### Regla

- Una causa.
- Una correccion.
- Un componente por iteracion.

## 6. Recertificacion

- Certificacion requerida: `GO_LIVE_CERTIFICATION_001`
- Casos a repetir: aceptar y completar el pedido nuevo con conductor elegible
- Resultado esperado: `200 -> ENTREGADO -> refresh -> incognito -> driver limpio`
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
DECISION_ID: RCA-2026-004
Problema:
La aceptacion del pedido de GO/NO-GO falla por limite de deuda del conductor.

Alternativas consideradas:
1. Cambiar la regla de deuda.
2. Cambiar el pedido de certificacion.
3. Usar un conductor elegible.

Decision tomada:
Abrir GO_LIVE_DRIVER_001 para identificar o preparar un conductor elegible y cerrar la certificacion final.

Motivo:
La regla de negocio funciona correctamente; el bloqueo es operativo y no funcional.

Impacto esperado:
Permitir la validacion GO/NO-GO sin tocar el contrato certificado.
```

## Notas

- No tocar `accept-order`.
- No tocar la validacion de deuda.
- No tocar el flujo del pedido.
