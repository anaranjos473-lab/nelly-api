# Front Template

Plantilla operativa para abrir un frente de investigacion bajo `Nelly Engineering Protocol v2.1`.

## Manifiesto de apertura

```text
INCIDENT_ID:
SEVERITY:
STATUS:
OWNER:
DATE:
BASELINE:
RELATED_CERTIFICATIONS:
RELATED_COMMITS:
SOURCE:
RELATED_FRENTS:
```

## 1. Clasificacion

- Tipo de incidente:
- Categoria:
- Severidad:
- Frente abierto:
- Impacto inicial:

### Checklist

- [ ] Clasificacion completada
- [ ] Severidad definida
- [ ] Impacto acotado
- [ ] Frente abierto

## 2. Reproduccion

- Secuencia exacta:
- Resultado esperado:
- Resultado real:
- Reproducible 100%:
- Observaciones:

### Evidencia minima

- [ ] Captura
- [ ] Log
- [ ] TraceId
- [ ] Payload

## 3. Investigacion

- Hipotesis 1:
- Hipotesis 2:
- Hipotesis descartadas:
- Causa probable:
- Causa raiz:

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
| Captura | Baja |  |
| Log | Media |  |
| HTTP | Alta |  |
| TraceId | Alta |  |
| RTDB Snapshot | Muy alta |  |
| Transaccion Firebase | Muy alta |  |

## 5. Correccion minima

- Componente a modificar:
- Cambio minimo propuesto:
- Riesgo residual:
- Validacion esperada:

### Regla

- Una causa.
- Una correccion.
- Un componente por iteracion.

## 6. Recertificacion

- Certificacion requerida:
- Casos a repetir:
- Resultado esperado:
- Resultado obtenido:

### Checklist

- [ ] Recertificacion ejecutada
- [ ] Casos en PASS
- [ ] Evidencia archivada

## 7. Cierre

- Acta actualizada:
- ADR ligero emitido:
- README actualizado:
- Index maestro actualizado:
- Investigacion cerrada:

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
DECISION_ID: RCA-YYYY-###
Problema:
...

Alternativas consideradas:
1.
2.
3.

Decision tomada:
...

Motivo:
...

Impacto esperado:
...
```

## Notas

- Si una fase no se puede completar, documentar el bloqueo y no avanzar.
- Si la evidencia es insuficiente, abrir observacion en lugar de correccion.
- Si cambia el alcance, abrir un frente nuevo.

