# Acta de Cierre - Piloto Controlado Nelly

Fecha: 2026-07-21  
Estado: Cierre tecnico pendiente de validacion final en produccion

## Objetivo

Dejar constancia de los criterios de cierre del piloto controlado y de las validaciones necesarias para retirar la compatibilidad temporal de autenticacion.

## Alcance Validado

- Backend desplegado con autenticacion endurecida para `panel-token`.
- Panel expuesto por HTTP en entorno local.
- Compatibilidad temporal con bootstrap de autenticacion.
- Auditoria minima sin registrar tokens ni claims completos.
- Separacion correcta entre `401 Unauthorized` y `403 Forbidden`.

## Evidencia Requerida Para Cierre

### 1. Autenticacion del Panel

Validar en produccion:

- `auth_method=firebase auth_result=success`
- `auth_method=firebase auth_result=forbidden`
- `auth_method=firebase auth_result=unauthorized`
- `auth_method=bootstrap auth_result=success` o `unauthorized`, solo mientras exista compatibilidad

### 2. Flujo Operativo

Confirmar un ciclo completo:

- Crear pedido.
- Cocina lo marca listo.
- Repartidor acepta.
- Seguimiento.
- Entrega.
- Cierre.

### 3. Concurrencia HTTP 409

Ejecutar la prueba con dos repartidores intentando aceptar el mismo pedido y confirmar:

- solo uno obtiene la aceptacion;
- el segundo recibe `HTTP 409 Conflict`;
- no existe doble adjudicacion.

## Criterios de Cierre

El piloto podra considerarse cerrado cuando exista evidencia de que:

- el panel de produccion autentica correctamente mediante Firebase;
- el flujo extremo a extremo funciona sin inconsistencias;
- la prueba de concurrencia HTTP 409 es satisfactoria;
- la auditoria demuestra que `auth_method=firebase` es el flujo habitual;
- el uso de `auth_method=bootstrap` desaparece o queda residual durante el periodo de observacion definido;
- el bootstrap puede retirarse sin afectar la operacion.

## Retiro del Bootstrap

Solo con evidencia confirmada:

- eliminar `AUTH_BOOTSTRAP_TOKEN`;
- eliminar `x-auth-bootstrap-token`;
- eliminar `window.AUTH_BOOTSTRAP_TOKEN`;
- simplificar `/api/auth/panel-token` para aceptar unicamente `Authorization: Bearer`.

## Conclusion Operativa

El piloto queda en estado de observacion final. La salida a produccion formal depende de la evidencia operativa mencionada, no de la existencia del cambio por si mismo.

