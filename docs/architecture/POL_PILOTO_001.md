# POL-PILOTO-001
## Politica de Inicio de Piloto y Certificacion Visual - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Piloto comercial controlado, Jornada 001 y validacion visual previa

### 1. Proposito

Establecer la politica oficial para autorizar el inicio del piloto comercial controlado de Nelly, definiendo condiciones tecnicas, funcionales y visuales obligatorias antes de iniciar la Jornada 001.

Esta politica existe para evitar que el piloto comience con una validacion tecnica incompleta o con una experiencia operativa no certificada en navegador real.

### 2. Principio rector

El Doctor Operativo valida la salud tecnica del ecosistema.
La certificacion visual valida la capacidad real de operacion del usuario.

Ambas validaciones son complementarias y obligatorias.

### 3. Condicion obligatoria de inicio

El piloto solo puede iniciar cuando se cumplan simultaneamente estas condiciones:

#### 3.1 Tecnicas

- Doctor Operativo = `OPERABLE`.
- Puerto oficial = `3001`.
- Backend saludable.
- Snapshot actualizado.
- Ledger operativo.
- Finanzas operativas.

#### 3.2 Funcionales

- C4 visible.
- C5 visible.
- Q1 visible.
- OV1 operativo.

#### 3.3 Visuales

Los tres paneles certificados deben estar verificados en navegador real:

- Panel Administrativo.
- Panel Operativo.
- Panel Comercial.

### 4. Criterio de certificacion visual

La certificacion visual pre piloto se considera aprobada cuando, para cada uno de los tres paneles, se verifica al menos lo siguiente:

| Validacion | Admin | Operativo | Comercial |
| --- | --- | --- | --- |
| Inicio de sesion | OK | OK | OK |
| Datos cargan | OK | OK | OK |
| Tiempo real | OK | OK | OK |
| Consola sin errores criticos | OK | OK | OK |
| Cambio visual pendiente | OK | OK | OK |

La tabla anterior puede completarse con evidencia manual o automatizada, pero debe quedar respaldada por una ejecucion real en navegador operativo.

### 5. Regla de bloqueo

Si la certificacion visual no esta aprobada, la `Jornada 001` no puede iniciar, aunque el Doctor Operativo indique `OPERABLE`.

### 6. Relacion con otras reglas

- Esta politica complementa `GO_NO_GO_PRE_PILOTO_V1.md`.
- Esta politica complementa `RUNBOOK_OPERATIVO_PILOTO_V1.md`.
- Esta politica no modifica RC2 ni abre nuevos dominios.
- Esta politica no sustituye el Doctor Operativo; lo complementa.

### 7. Criterio de cumplimiento

El inicio del piloto se considera conforme solo cuando:

- la validacion tecnica esta aprobada;
- la validacion funcional esta visible y operativa;
- la certificacion visual de los tres paneles esta aprobada;
- existe evidencia trazable del cierre;
- la decision queda registrada antes de la Jornada 001.

### 8. Alcance de conservacion

Esta politica no autoriza:

- abrir O1;
- abrir Q2;
- abrir C6;
- activar IA predictiva;
- modificar RC2;
- cambiar la fuente de verdad;
- sustituir la validacion visual por una inferencia del backend.

### 9. Historial

- 2026-07-25: Se crea la politica oficial de inicio de piloto y certificacion visual pre Jornada 001.
