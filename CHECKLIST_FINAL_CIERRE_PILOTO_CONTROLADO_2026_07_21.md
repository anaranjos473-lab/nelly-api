# Checklist Final de Cierre - Piloto Controlado Nelly

Fecha: 2026-07-21  
Estado: Piloto controlado en validacion final

## 1. Backend

[] Desplegar la version mas reciente del backend.  
[] Confirmar que `/api/auth/panel-token` ejecuta la logica endurecida.  
[] Verificar que `AUTH_BOOTSTRAP_TOKEN`, si sigue siendo necesario, este configurado correctamente.  

**Criterio de aceptacion:** el backend responde segun el flujo esperado: `200`, `401` o `403`.

## 2. Panel de Produccion

Abrir:

`https://nelly-delivery.web.app/panel`

Verificar:

[] El panel carga correctamente.  
[] Ya no aparece `ERROR DE ACCESO: Token invalido`.  
[] Firebase inicializa correctamente.  
[] Los listeners `[COCINA]` se ejecutan.  
[] Los pedidos se sincronizan en tiempo real.  

**Criterio de aceptacion:** autenticacion y sincronizacion funcionan en un navegador normal.

## 3. Auditoria

Revisar los registros del backend y confirmar eventos como:

- `auth_method=firebase`
- `auth_result=success`

Verificar si aun aparecen:

- `auth_method=bootstrap`

**Criterio de aceptacion:** Firebase es el mecanismo predominante y no se registran tokens ni informacion sensible.

## 4. Flujo Operativo

Validar un pedido completo:

[] Crear pedido.  
[] Cocina lo marca listo.  
[] Repartidor acepta.  
[] Seguimiento.  
[] Entrega.  
[] Cierre.  

**Criterio de aceptacion:** el pedido completa el ciclo sin inconsistencias.

## 5. Concurrencia HTTP 409

Ejecutar la prueba con dos repartidores intentando aceptar el mismo pedido.

Verificar que:

[] Solo uno obtiene la aceptacion.  
[] El segundo recibe `HTTP 409 Conflict`.  
[] No existen dos adjudicaciones del mismo pedido.  

**Criterio de aceptacion:** adjudicacion atomica garantizada.

## 6. Migracion de Autenticacion

Durante el periodo de observacion:

[] `auth_method=firebase` se convierte en el flujo habitual.  
[] `auth_method=bootstrap` desaparece o queda como uso excepcional.  

**Criterio de aceptacion:** evidencia suficiente para retirar el mecanismo temporal.

## 7. Retiro del Bootstrap

Solo cuando exista evidencia:

[] Eliminar `AUTH_BOOTSTRAP_TOKEN`.  
[] Eliminar `x-auth-bootstrap-token`.  
[] Eliminar `window.AUTH_BOOTSTRAP_TOKEN`.  
[] Simplificar `/api/auth/panel-token` para aceptar unicamente `Authorization: Bearer`.  

**Criterio de aceptacion:** un unico mecanismo de autenticacion basado en Firebase.

## Criterio de Cierre

El piloto puede considerarse tecnicamente listo cuando exista evidencia de que:

- El panel de produccion autentica correctamente mediante Firebase.
- El flujo completo del pedido funciona de extremo a extremo.
- La prueba de concurrencia HTTP 409 es satisfactoria.
- La auditoria confirma el uso normal de `auth_method=firebase`.
- El bootstrap puede retirarse sin afectar la operacion.

