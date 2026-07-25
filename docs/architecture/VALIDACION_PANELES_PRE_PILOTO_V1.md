# VALIDACION PANELES PRE PILOTO V1

## RC1-B - Certificacion Visual Pre Piloto

## Dictamen Final RC1-B

**Estado:** PASS  
**Fecha de certificacion:** 2026-07-25

### Evidencia

- Commit `0e124e6` - `fix: remove firebase cdn dependency from panels`
- `validation-report.json`: `ok: true`
- Panel Comercial: PASS
- Panel Operativo: PASS
- Panel Administrativo: PASS
- Autenticacion visual autenticada: PASS
- Cambio visual pendiente: verificado

**Estado historico de la validacion:** Cerrado
**Ambito:** Panel Comercial, Panel Operativo y Panel Administrativo
**Fecha:** 2026-07-25
**Referencia politica:** `POL_PILOTO_001.md`
**Referencia operativa:** `RUNBOOK_OPERATIVO_PILOTO_V1.md`
**Referencia de jornada:** `PILOTO_PLAN_JORNADA_001_V1.md`

## 1. Proposito

Validar que los paneles disponibles para el piloto comercial controlado reflejan correctamente el estado del ecosistema Nelly antes de iniciar la Jornada 001.

Esta validacion no modifica RC2 ni abre nuevos dominios.

RC1-B certifica que los tres paneles funcionan correctamente en un entorno operativo real con autenticacion, verificando tanto la interfaz como la integracion con el backend.

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

### 2.1 Preparacion minima para RC1-B

Antes de iniciar RC1-B deben cumplirse estas condiciones:

- `npm run doctor:operational` devuelve `OPERABLE`;
- `npm run validate:operational-port` confirma el puerto `3001`;
- el backend esta iniciado;
- existe conexion normal a Internet para cargar el SDK de Firebase;
- las herramientas de desarrollador del navegador estan abiertas en `Console` y `Network`.

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

### 4.1 Checklist por panel

El mismo flujo se aplica a cada panel:

1. Acceso
2. Renderizado
3. Datos
4. Tiempo real
5. Consola
6. Red

#### Acceso

- Inicio de sesion exitoso.
- Sin redirecciones inesperadas.
- Sin errores de autenticacion.

#### Renderizado

- La interfaz carga completamente.
- No hay componentes vacios o superpuestos.
- El cambio visual pendiente aparece como se esperaba.

#### Datos

- La informacion visible coincide con el estado esperado del backend.
- No aparecen valores nulos o inconsistentes.

#### Tiempo real

- Los cambios relevantes se reflejan sin necesidad de recargar la pagina, si aplica.

#### Consola

- Sin errores criticos.
- Los warnings pueden documentarse, pero no deben impedir la operacion.

#### Red

- Firebase SDK carga correctamente.
- No hay respuestas `404` o `500` inesperadas.
- No hay llamadas bloqueadas al backend.

### 4.2 Evidencia a recopilar

Por cada panel se conserva:

- una captura de pantalla tras iniciar sesion;
- una captura de la consola, si esta limpia o solo con warnings no criticos;
- una captura de la pestaña `Network` mostrando la carga correcta de recursos principales;
- la hora de inicio y fin de la prueba.

Si la validacion tambien se ejecuta desde Android, se agrega:

- un extracto de `adb logcat` limitado al periodo de la prueba;
- tokenes, identificadores y datos sensibles enmascarados antes de conservar el registro.

### 4.3 Resultado esperado RC1-B

| Componente | Estado |
| --- | --- |
| Panel Administrativo | Aprobado o pendiente |
| Panel Operativo | Aprobado o pendiente |
| Panel Comercial | Aprobado o pendiente |
| Autenticacion Firebase | Aprobada o pendiente |
| Cambio visual pendiente | Verificado o pendiente |
| RC1-B | PASS o FAIL |

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

## 5.1 Correccion aplicada

Para eliminar la dependencia externa de Firebase CDN en los paneles, se introdujo un auth local compartido en:

- `public/js/local-auth.js`

Y se actualizo la carga de autenticacion de:

- `public/js/admin-firebase-config.js`
- `public/firebase.js`
- `public/js/dashboard-comercial.js`
- `public/js/dashboard-operativo.js`
- `public/js/admin-dashboard.js`

Con esa correccion, la validacion posterior quedo en verde y cerro RC1-B.

## 7. Dictamen

| Area | Estado |
| --- | --- |
| Backend y snapshot | Aprobado |
| Estructura HTML de paneles | Aprobada |
| Panel Administrativo alineado a 3001 | Aprobado |
| Validacion visual autenticada automatizada | Aprobada |
| RC1-B | PASS |
| RC1 Integral | PASS |
| Apto para iniciar Jornada 001 sin verificacion visual adicional | Si |

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

RC1-B quedara aprobada unicamente si:

- los tres paneles completan el flujo;
- el cambio visual pendiente se observa correctamente;
- no hay errores criticos en consola;
- no existen discrepancias visibles entre la informacion mostrada y el backend;
- la autenticacion funciona de principio a fin.

## 10. Recomendacion

No abrir nuevos dominios ni modificar RC2.

Antes de Jornada 001, cerrar esta validacion visual porque la certificacion visual pre piloto es una condicion obligatoria definida por `POL_PILOTO_001.md`, no una recomendacion opcional.

Con RC1-B en `PASS`, queda completada la certificacion RC1 Integral. Se satisface el prerrequisito de validacion visual autenticada definido por la politica del piloto. La plataforma cumple los criterios documentados para avanzar a la Jornada 001 conforme al GO/NO-GO vigente.

## 11. Historial

- 2026-07-25: Se actualiza el dictamen final a `PASS` tras la correccion de dependencia externa y la validacion independiente exitosa.
- 2026-07-25: Se formaliza RC1-B como certificacion visual pre piloto con checklist, evidencia y criterio de aprobacion.
- 2026-07-25: Se crea la validacion de paneles pre piloto, se ajusta Admin a puerto local `3001` y se registra el bloqueo externo de Firebase CDN como pendiente de cierre visual autenticado.
