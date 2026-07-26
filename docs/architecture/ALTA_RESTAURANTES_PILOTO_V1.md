# ALTA DE RESTAURANTES PARA PILOTO V1

**Estado:** Protocolo operativo preliminar  
**Ambito:** Alta controlada de restaurantes durante el piloto  
**Fecha:** 2026-07-26  
**Referencia ejecutiva:** `RC2_PILOTO_CONTROLADO_V1.md`  
**Referencia operativa:** `RUNBOOK_OPERATIVO_PILOTO_V1.md`  
**Referencia comercial:** `PILOTO_MANUAL_COMERCIOS_V1.md`

## 1. Proposito

Definir un proceso controlado, repetible y verificable para incorporar restaurantes al piloto sin abrir registro libre.

La regla base es simple:

- primero se valida el prospecto;
- luego se crea el alta en Admin;
- despues se configura el acceso del restaurante;
- al final se ejecuta un pedido de prueba;
- solo si todo responde bien el restaurante queda operativo.

## 2. Regla de piloto

Durante el piloto no se habilita auto-registro.

Todo restaurante debe entrar por invitacion o aprobacion directa del equipo operativo.

Esto reduce riesgo de soporte, asegura calidad de datos y evita altas incompletas.

## 3. Flujo operativo

### 3.1 Prospeccion

El restaurante se registra primero como prospecto en CRM.

Campos minimos:

- nombre comercial;
- responsable;
- telefono;
- WhatsApp;
- direccion;
- ubicacion en mapa;
- horario;
- tipo de comida;
- observaciones;
- estado inicial `Prospecto`.

### 3.2 Validacion

El administrador verifica que:

- el negocio exista;
- la ubicacion sea correcta;
- el restaurante pueda atender pedidos;
- exista contacto responsable;
- acepte condiciones del piloto.

Si cumple, el estado pasa a `Aprobado para alta`.

### 3.3 Alta en Admin

Desde el Panel Administrativo se crea el restaurante con los datos minimos del piloto:

- nombre comercial;
- razon social opcional;
- responsable;
- telefono;
- WhatsApp;
- correo;
- direccion;
- coordenadas;
- horario;
- comision;
- zona de cobertura;
- estado operativo.

Estados permitidos:

- `Activo`;
- `En revision`;
- `Suspendido`.

### 3.4 Usuario del restaurante

Se crea la cuenta del encargado con:

- usuario;
- rol `Restaurante`;
- contrasena temporal.

En el primer ingreso el usuario debe:

- cambiar contrasena;
- aceptar terminos;
- confirmar acceso.

### 3.5 Configuracion inicial

Antes de activar el restaurante se debe registrar:

- menu;
- categorias;
- tiempo promedio de preparacion;
- horario;
- metodos de pago;
- disponibilidad.

### 3.6 Prueba operativa

Antes de publicar el restaurante a clientes se ejecuta un pedido interno.

La prueba debe verificar:

- el pedido llega a cocina;
- el pedido cambia estados correctamente;
- el pedido aparece en pool;
- un repartidor lo acepta;
- el pedido se entrega;
- el cierre impacta finanzas y CRM;
- el sistema queda limpio al terminar.

Si la prueba falla, el restaurante no se activa.

## 4. Criterio de activacion

Un restaurante solo puede pasar a `Operativo` si:

- fue aprobado por validacion;
- tiene usuario creado;
- tiene menu minimo cargado;
- supero un pedido de prueba;
- no dejo incidencias bloqueantes.

## 5. Registro minimo por restaurante

| Campo | Estado esperado |
| --- | --- |
| Nombre comercial | Obligatorio |
| Responsable | Obligatorio |
| Telefono / WhatsApp | Obligatorio |
| Direccion | Obligatorio |
| Coordenadas | Obligatorio |
| Horario | Obligatorio |
| Menu inicial | Obligatorio |
| Usuario del restaurante | Obligatorio |
| Pedido de prueba | Obligatorio |
| Dictamen final | Obligatorio |

## 6. Que no se debe hacer

- No habilitar registro libre durante el piloto.
- No activar restaurantes sin pedido de prueba.
- No omitir validacion de ubicacion.
- No crear cuentas sin responsable asignado.
- No marcar `Operativo` si existe duda de calidad o soporte.

## 7. Criterio de exito

El protocolo se considera correcto si permite incorporar restaurantes de forma uniforme, con trazabilidad y sin romper el flujo operativo ni la calidad del piloto.

## 8. Siguiente frente

Cuando este protocolo quede implementado y validado, el siguiente paso natural sera construir un asistente de alta dentro del Panel Administrativo para reducir friccion sin perder control.

## 9. Historial

- 2026-07-26: Se formaliza el alta controlada de restaurantes para el piloto.
