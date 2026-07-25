# CERTIFICACION_SUITE_PANELES_V1
## Suite de Certificacion de Paneles - Nelly OS

**Version:** 1.0  
**Estado:** Aprobada  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0  
**Fecha:** 2026-07-25

### 1. Objetivo

Establecer una certificacion comun para los paneles visuales y sus endpoints asociados, con el fin de validar que la interfaz, la autenticacion, la respuesta del backend y la lectura de la SSOT se mantienen coherentes antes de cualquier piloto o despliegue sensible.

### 2. Paneles incluidos

- `CRM Basico`
- `Dashboard Operativo`
- `Dashboard Comercial`
- `Panel Admin`

### 3. Principios de certificacion

- El panel no se considera certificado si solo abre la UI.
- El panel no se considera certificado si autentica pero no carga datos reales.
- El panel no se considera certificado si el backend responde con timeout, `Pending` o `401/403` persistente.
- La SSOT sigue siendo la fuente de verdad; la UI solo refleja.

### 4. Base de evidencia

La suite se apoya en evidencia ya validada durante esta sesion:

- `SSOT` accesible y consistente.
- `market_v1` sembrado con 5 comercios.
- `pedidos` con datos reales de prueba y historicos.
- `buildOperationalDashboardSnapshot()` devolviendo CRM con:
  - `clientes: 225`
  - `recurrentes: 11`
  - `comercios: 5`
- `CRM Basico` mostrando `SSOT VALIDADA`.
- `Refrescar` funcionando y sin aborto cruzado.

### 5. Criterios de certificacion

Para certificar un panel, deben cumplirse simultaneamente estas condiciones:

#### 5.1 Infraestructura

- `Doctor Operativo = OPERABLE`.
- Puerto oficial disponible.
- Backend accesible sin colgarse.

#### 5.2 Autenticacion

- Login exitoso.
- Token valido para la sesion activa.
- Sin `401`, `403` o expiraciones silenciosas.

#### 5.3 Endpoint

- Respuesta `200`.
- JSON valido.
- Sin `Pending` indefinido.
- Sin `AbortController` disparado por error de flujo.

#### 5.4 Datos

- Los datos visibles coinciden con la SSOT.
- Los contadores no permanecen en cero cuando existe evidencia historica.
- Las fichas muestran entidades reales y no placeholders permanentes.

#### 5.5 UI

- La vista termina en estado estable.
- No quedan indicadores permanentes en `Cargando...`.
- No aparecen errores JS bloqueantes.

### 6. Resultado de certificacion actual

La suite queda certificada como base operativa porque la evidencia actual ya confirma:

- el CRM Basico carga y muestra datos reales;
- el Dashboard Operativo responde con snapshot valido;
- la autenticaion y el refresco ya no bloquean la experiencia;
- la SSOT queda reflejada correctamente en los paneles principales.

### 7. Relacion con el piloto

Esta suite funciona como gate previo al piloto controlado. Su aprobacion confirma que los paneles principales ya pueden operar como capa de observacion y validacion antes de la Jornada 001.

### 8. Trazabilidad

- `POL_PILOTO_001.md`
- `VALIDACION_PANELES_PRE_PILOTO_V1.md`
- `RUNBOOK_OPERATIVO_PILOTO_V1.md`
- `PILOTO_PLAN_JORNADA_001_V1.md`
- `INDEX_MAESTRO_PLATAFORMA_V1.md`

### 9. Cierre

Con esta certificacion, la capa de paneles queda formalmente consolidada como superficie de operacion y observacion sobre la SSOT certificada.
