# Plantilla de Caso ICV - Investigacion de Ciclo de Vida

Esta plantilla define el formato estandar para documentar una investigacion de ciclo de vida dentro de Nelly OS.

Se usa cuando un flujo critico presenta una anomalia y es necesario reconstruir su secuencia completa con evidencia verificable.

## 1. Identificacion

- **ID:** `ICV-XX`
- **Fecha de apertura:** `AAAA-MM-DD`
- **Estado:** `Abierto | En investigacion | Cerrado | Cerrado por limite de evidencia`
- **Flujo afectado:** ``
- **Responsable:** ``

## 2. Contexto

- **Descripcion del incidente:**
- **Alcance funcional:**
- **Impacto observado:**

## 3. Evidencia

Separar la evidencia en tres niveles.

### 3.1 Evidencia primaria

- Logs
- Eventos
- Auditorias
- Backups
- Trazas

### 3.2 Evidencia secundaria

- Documentacion
- Certificaciones
- ADR
- Commits

### 3.3 Evidencia circunstancial

- Estado actual
- RTDB
- UI
- Capturas
- Observaciones

## 4. Reconstruccion Del Ciclo De Vida

Completar una fila por cada transicion relevante.

| Etapa | Evidencia | Estado | Nota |
| --- | --- | --- | --- |
| Creacion |  | `✅ / ❌` |  |
| Asignacion |  | `✅ / ❌` |  |
| Inicio |  | `✅ / ❌` |  |
| Llegada |  | `✅ / ❌` |  |
| Cierre |  | `✅ / ❌` |  |

Objetivo:

- identificar exactamente donde se interrumpe el flujo
- distinguir una transicion incompleta de un cierre correcto

## 5. Clasificacion CICP

Aplicar las reglas correspondientes (`R1` a `R7`), indicando:

- **Regla aplicada:**
- **Justificacion:**
- **Nivel de confianza:**

## 6. Decision

Documentar una sola decision principal:

- mantener
- corregir
- archivar
- cuarentena logica
- normalizacion administrativa
- pendiente de evidencia

## 7. Estado Del Conocimiento

Separar explicitamente el conocimiento en tres bloques.

### 7.1 Hechos Demostrados

- informacion respaldada por evidencia

### 7.2 Inferencias

- hipotesis consistentes con la evidencia, pero no demostradas

### 7.3 Preguntas Abiertas

- aspectos que permanecen sin resolver

## 8. Lecciones Aprendidas

- que aprendimos
- que cambio en Nelly OS
- que regla nueva surgio
- que procedimiento se mejoro

## 9. Cierre

Indicar el motivo de cierre con precision:

- cerrado por resolucion
- cerrado por normalizacion
- cerrado por evidencia insuficiente
- escalado a otra investigacion

## Integracion Con Nelly OS

Relaciones recomendadas:

- `CICP` certifica el estado del ecosistema
- `ICV` reconstruye el ciclo de vida cuando hay una anomalia
- `ADR` documenta decisiones arquitectonicas
- `CERTIFICACION_Pxx` valida una correccion implementada

## Principio Rector

Las conclusiones deben distinguir claramente entre:

- hechos
- inferencias
- preguntas abiertas

## Uso Recomendado

Esta plantilla debe usarse como base para cualquier investigacion futura de un flujo critico en Nelly OS, especialmente cuando exista duda sobre si el problema proviene de la fuente de datos, del cliente o de una transicion incompleta.

