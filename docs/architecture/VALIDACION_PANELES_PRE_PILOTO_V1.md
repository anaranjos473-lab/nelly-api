# VALIDACION PANELES PRE PILOTO V1

**Estado:** Pendiente de cierre visual autenticado
**Ambito:** Panel Comercial, Panel Operativo y Panel Administrativo
**Fecha:** 2026-07-25
**Referencia operativa:** `RUNBOOK_OPERATIVO_PILOTO_V1.md`
**Referencia de jornada:** `PILOTO_PLAN_JORNADA_001_V1.md`

## 1. Proposito

Validar que los paneles disponibles para el piloto comercial controlado reflejan correctamente el estado del ecosistema Nelly antes de iniciar la Jornada 001.

Esta validacion no modifica RC2 ni abre nuevos dominios.

## 2. Precheck tecnico

Se ejecutaron los comandos oficiales antes de la validacion visual:

```bash
npm run doctor:operational
npm run validate:operational-port
```

Resultado:

| Validacion | Estado |
| --- | --- |
| Doctor Operativo | OPERABLE |
| Salud general | 100% |
| Severidad maxima | INFO |
| Puerto oficial | 3001 |
| Backend | OK |
| Ledger/finanzas | OK |
| C4 | 5 oportunidades / 5 acciones |
| C5 | 5 promociones |
| Q1 | Visible con incidencia, causa raiz, merma y accion |

## 3. Ajuste aplicado

Durante la revision se detecto que el Panel Administrativo priorizaba el endpoint remoto de Render.

Para reducir ruido durante el piloto local, se ajusto:

```text
public/js/admin-dashboard.js
```

Nuevo comportamiento:

- el Panel Administrativo usa primero `window.location.origin`;
- en entorno local apunta al puerto oficial `3001`;
- Render permanece como fallback;
- no se modifica la arquitectura ni el contrato RC2.

## 4. Validador creado

Se crea el comando:

```bash
npm run validate:panels-pre-pilot
```

Alcance del validador:

- abre Panel Comercial, Panel Operativo y Panel Administrativo;
- prueba desktop y mobile;
- intenta autenticacion con cuenta autorizada;
- revisa textos y selectores clave;
- registra errores de consola, respuestas HTTP fallidas y capturas locales;
- genera reporte en `.codex-tmp/panel-validation/validation-report.json`.

## 5. Resultado de la corrida automatizada

La corrida automatizada no pudo cerrar la validacion visual autenticada.

Resultado:

| Panel | Estructura HTML | Autenticacion visual | Datos visibles | Estado |
| --- | --- | --- | --- | --- |
| Comercial | OK | No completada | No visible por login | Pendiente |
| Operativo | OK | No completada | No visible por login | Pendiente |
| Administrativo | OK | No completada | No visible por login | Pendiente |

Hallazgo:

```text
Failed to load resource: net::ERR_CONNECTION_RESET
```

Recursos afectados:

```text
https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js
https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js
https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js
```

Adicionalmente, la verificacion directa de conectividad hacia `gstatic` hizo timeout desde el entorno de validacion.

## 6. Interpretacion

El hallazgo no contradice el estado operativo del backend.

El Doctor Operativo y `validate:operational-port` confirman que:

- el backend esta vivo;
- el puerto oficial `3001` responde;
- el snapshot expone C4, C5 y Q1;
- ledger y finanzas estan saludables.

Sin embargo, la experiencia visual autenticada no queda certificada automaticamente porque el navegador de validacion no puede cargar dependencias externas de Firebase.

## 7. Dictamen

| Area | Estado |
| --- | --- |
| Backend y snapshot | Aprobado |
| Estructura HTML de paneles | Aprobada |
| Panel Administrativo alineado a 3001 | Aprobado |
| Validacion visual autenticada automatizada | Pendiente |
| Apto para iniciar Jornada 001 sin verificacion visual adicional | No |

## 8. Condicion antes de Jornada 001

Antes de iniciar la Jornada 001 debe cumplirse una de estas condiciones:

1. ejecutar una validacion manual en navegador operativo con acceso a Firebase CDN y confirmar que los tres paneles muestran datos reales;
2. resolver la dependencia externa de Firebase SDK para que `npm run validate:panels-pre-pilot` pueda cerrar en verde;
3. implementar un mecanismo local certificado de autenticacion/render para paneles sin depender de CDN externo.

## 9. Criterio de cierre

La validacion de paneles pre piloto quedara cerrada cuando:

- Panel Comercial muestre C4 y C5 con datos reales;
- Panel Operativo muestre snapshot y salud general;
- Panel Administrativo muestre metricas, finanzas, repartidores y generador de pedidos;
- no existan errores de consola bloqueantes;
- no existan llamadas HTTP locales fallidas;
- desktop y mobile sean visualmente operables;
- el resultado quede registrado como evidencia.

## 10. Recomendacion

No abrir nuevos dominios ni modificar RC2.

Antes de Jornada 001, priorizar el cierre de esta validacion visual porque el riesgo pendiente ya no es de backend, sino de experiencia operativa del usuario.

## 11. Historial

- 2026-07-25: Se crea la validacion de paneles pre piloto, se ajusta Admin a puerto local `3001` y se registra el bloqueo externo de Firebase CDN como pendiente de cierre visual autenticado.
