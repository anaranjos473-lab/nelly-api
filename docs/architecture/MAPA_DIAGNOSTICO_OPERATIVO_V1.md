# MAPA DIAGNOSTICO OPERATIVO V1

**Estado:** Vigente  
**Ambito:** Observabilidad, validacion y diagnostico por capas  
**Fecha:** 2026-07-25
**Referencia estrategica:** `PLAN_ESTRATEGICO_NELLY_V1.md`

## 1. Proposito

Definir una guia accionable para diagnosticar fallos del ecosistema Nelly sin adivinar ni revisar todo el repositorio.

El objetivo no es que el sistema resuelva automaticamente todos los problemas, sino que indique:

- que capa fallo;
- que evidencia revisar primero;
- cual es la causa probable;
- que accion inicial ejecutar.

## 2. Capas de diagnostico

| Capa | Pregunta | Evidencia principal | Herramienta |
| --- | --- | --- | --- |
| Infraestructura | El backend esta vivo y en el puerto correcto? | `/api/health`, PID, runtime | `npm run validate:operational-port` |
| Autenticacion | El panel puede acceder al snapshot protegido? | token Firebase Auth, 401/403 | `validate:operational-port` |
| Operacion | El flujo operativo esta consistente? | pedidos activos, entregas, dashboard GREEN | snapshot operativo |
| Datos | RTDB y SSOT estan disponibles? | health.rtdb, pedidos, proyecciones | snapshot + validadores |
| Finanzas | Ledger y finanzas concilian? | health.ledger, health.finanzas | `validate-ledger`, billing |
| Metricas | Los indicadores son razonables? | tiempo promedio, puntualidad | snapshot comercial |
| Inteligencia Comercial | C4 genera oportunidades y acciones? | commercial_insights | dashboard comercial |
| Promociones | C5 genera promociones sugeridas? | promotions | dashboard comercial |
| Calidad Operativa | Q1 registra incidencias y causas? | operational_quality | snapshot + OV1 |
| Gobernanza | El cambio respeta SSOT y dominios? | RC2, G1, OV1 | documentos NES |

## 3. Codigos accionables iniciales

| Codigo | Capa | Significado | Revisar primero |
| --- | --- | --- | --- |
| `PORT_HEALTH_UNREACHABLE` | Infraestructura | No se pudo consultar `/api/health` | puerto 3001, proceso Node, logs de arranque |
| `HEALTH_NOT_OK` | Infraestructura | Health responde, pero no confirma `success=true` | variables, arranque, dependencias |
| `SNAPSHOT_AUTH_FAILED` | Autenticacion | No se pudo obtener token del panel | Firebase Auth, credenciales, conectividad externa |
| `SNAPSHOT_REQUEST_FAILED` | Operacion | No se pudo consultar el snapshot protegido | endpoint, middleware, token, logs backend |
| `SNAPSHOT_NOT_OK` | Operacion | El snapshot no esta en estado OK | proyecciones, health interno, SSOT |
| `BACKEND_SNAPSHOT_UNHEALTHY` | Operacion | Backend no aparece saludable en snapshot | comparar snapshot vs `/api/health` |
| `RTDB_SNAPSHOT_UNHEALTHY` | Datos | RTDB no aparece saludable | Firebase Admin, reglas, credenciales |
| `LEDGER_SNAPSHOT_UNHEALTHY` | Finanzas | Ledger no aparece saludable | `validate-ledger`, movimientos recientes |
| `FINANCE_SNAPSHOT_UNHEALTHY` | Finanzas | Finanzas no aparecen saludables | deuda, saldo, ledger, billing |
| `DELIVERY_AVG_OUT_OF_RANGE` | Metricas | Tiempo promedio fuera de rango | timestamps, pedidos historicos, formula |
| `Q1_PROJECTION_MISSING` | Calidad Operativa | Q1 no aparece como `operational_quality` | captura de incidencias, proyeccion Q1 |
| `C4_OPPORTUNITIES_EMPTY` | Inteligencia Comercial | C4 no expone oportunidades | CRM, Q1, reglas de insights |
| `C4_ACTIONS_EMPTY` | Inteligencia Comercial | C4 no expone acciones | derivacion oportunidades -> acciones |
| `C5_PROMOTIONS_EMPTY` | Promociones | C5 no expone promociones | reglas C5, relacion C4 -> C5 |

## 4. Flujo de uso

### 4.0 Doctor operativo consolidado

Para una lectura consolidada de jornada se debe ejecutar:

```bash
npm run doctor:operational
```

El Doctor operativo agrupa las validaciones principales de:

- infraestructura;
- operacion;
- eventos;
- finanzas;
- dashboard;
- observabilidad;
- metricas;
- notificaciones;
- IA inicial.

El reporte muestra:

- salud general;
- severidad maxima;
- bloque afectado;
- codigo de fallo;
- accion recomendada.

Tambien puede emitirse como JSON:

```bash
$env:DOCTOR_FORMAT='json'
npm run doctor:operational
```

### 4.1 Inicio de jornada

Ejecutar:

```bash
npm run validate:operational-port
```

Si responde `ok: true`, el puerto operativo esta listo para corridas OV1.

Si responde `ok: false`, usar los campos:

- `code`;
- `layer`;
- `probable_cause`;
- `action`.

### 4.2 Corridas OV1

Ejecutar:

```bash
npm run ov1:rotation
```

El runner reutiliza tokens durante la serie para reducir dependencia de Firebase Auth en cada ciclo.

### 4.3 Cierre de jornada

Ejecutar nuevamente:

```bash
npm run validate:operational-port
```

El objetivo es confirmar:

- pedidos activos en cero;
- dashboard en estado OK;
- C4 con oportunidades y acciones;
- C5 con promociones;
- Q1 visible;
- finanzas y ledger saludables.

## 5. Regla de diagnostico

No se debe corregir codigo antes de identificar la capa afectada.

Orden recomendado:

1. Infraestructura.
2. Autenticacion.
3. Operacion.
4. Datos.
5. Finanzas.
6. Metricas.
7. C4.
8. C5.
9. Q1.
10. Gobernanza.

## 6. Relacion con OV1

OV1 usa este mapa para distinguir entre:

- fallo tecnico bloqueante;
- dependencia externa transitoria;
- desviacion de datos;
- hallazgo operativo;
- oportunidad de mejora del negocio.

La evidencia de OV1 debe citar el codigo de diagnostico cuando una corrida falle.

## 7. Relacion con O1 - Observabilidad Operativa

El Doctor operativo actual y este mapa de diagnostico constituyen la base tecnica inicial para un futuro dominio `O1 - Observabilidad Operativa`.

O1 no queda declarado como dominio activo en esta version.

La decision de abrir O1 debera tomarse despues del piloto, cuando exista evidencia real sobre:

- fallos mas frecuentes;
- dependencias externas con mayor impacto;
- alertas que realmente ahorran tiempo;
- diagnosticos que reducen investigacion manual;
- metricas que permiten decidir si continuar o detener la operacion;
- patrones de Q1, C4 y C5 que se repiten durante la operacion real.

Mientras O1 no sea autorizado formalmente:

- `npm run doctor:operational` opera como centro de diagnostico de jornada;
- `MAPA_DIAGNOSTICO_OPERATIVO_V1.md` opera como guia accionable;
- OV1 sigue siendo el mecanismo para reunir evidencia;
- no se crean nuevas fuentes de verdad;
- no se abre un nuevo dominio antes de validar valor operativo.

## 8. Historial

- 2026-07-25: Se crea el mapa de diagnostico operativo por capas y se alinea con `validate:operational-port`.
- 2026-07-25: Se agrega `npm run doctor:operational` como centro de diagnostico operativo consolidado.
- 2026-07-25: Se alinea O1 como dominio candidato post-piloto, no como dominio activo.
- 2026-07-25: Se referencia el Plan Estrategico como vision superior del diagnostico operativo.
