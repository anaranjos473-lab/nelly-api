# NELLY ROLES Y ACCESO V1

## Estado
Referencia oficial de roles para el piloto controlado.

Este documento define que Nelly OS debe organizar la experiencia por rol antes que por panel.

## Proposito
Evitar que todos los usuarios vean todo el ecosistema y reducir friccion operativa durante el piloto.

Cada usuario debe entrar al Centro de Trabajo que corresponde a su responsabilidad principal.

## Regla central
El usuario no debe buscar su herramienta; Nelly OS debe dirigirlo a su espacio de trabajo.

## Matriz de roles

| Rol | Modulos visibles | Entrada recomendada | Observacion |
| --- | --- | --- | --- |
| Administrador General | Todos | `/admin` | Gobierno completo del ecosistema. |
| Operador | Operaciones + Logistica | `/control` | Gestiona el momento operativo y coordina entregas. |
| Restaurante | Centro Comercial | `/commerce` | Administra tienda, menu, horarios y ventas. |
| Repartidor | App Driver | App NellyDriver | No debe operar desde panel web salvo diagnostico controlado. |
| Supervisor Comercial | Comercio + CRM | `/commerce` | Supervisa comercios, clientes y oportunidades. |
| Analista | Analytics | `/analytics` | Solo lectura, sin modificar informacion operativa. |
| Desarrollador | Developer | `/developer` | Diagnostico tecnico separado de la operacion. |
| Direccion / Ejecutivo | Panel Ejecutivo | Post-piloto | Vista candidata para decisiones de negocio; no activa durante piloto. |
| Administrador Financiero | Centro Financiero | Post-piloto | Vista candidata para liquidaciones, comisiones y conciliaciones; no activa durante piloto. |

## Principios de acceso

- Administrador General puede ver todos los modulos.
- Operador no necesita configuracion global.
- Restaurante no debe ver conductores, deuda, configuracion global ni developer.
- Repartidor opera desde Android Driver.
- Supervisor Comercial no debe modificar operacion ni logistica.
- Analista solo observa.
- Desarrollador diagnostica, no opera pedidos.

## Relacion con las 4 Casillas

| Centro de Trabajo | Roles principales |
| --- | --- |
| Gobierno del Ecosistema | Administrador General |
| Centro de Operaciones | Operador, Administrador General |
| Centro Comercial | Restaurante, Supervisor Comercial, Administrador General |
| Centro Logistico | Operador, Administrador General |
| CRM | Supervisor Comercial, Administrador General |
| Analytics | Analista, Administrador General |
| Developer | Desarrollador, Administrador General |
| Panel Ejecutivo | Direccion / Ejecutivo, Administrador General |
| Centro Financiero | Administrador Financiero, Administrador General |

### Modulos post-piloto
Panel Ejecutivo y Centro Financiero quedan documentados como vision de producto, no como permisos activos.

Durante el piloto:
- no se crean accesos operativos obligatorios para estos Centros;
- no se mezclan finanzas dentro de Gobierno como operacion diaria;
- no se usa Analytics como sustituto del Panel Ejecutivo;
- cualquier activacion futura debe pasar por gate de desarrollo, seguridad y evidencia del piloto.

## Implementacion durante piloto

Durante el piloto, esta matriz funciona como regla de experiencia y operacion:
- Nelly OS muestra rutas por rol.
- Los responsables usan solo los modulos asignados.
- Las incidencias de acceso se registran en la bitacora del piloto.
- No se modifica la seguridad del backend sin una tarea especifica, pruebas y certificacion.

## Futuro control de permisos

Cuando el piloto lo requiera, esta matriz debe evolucionar a:
- claims de Firebase por rol;
- permisos por modulo;
- redireccion automatica post-login;
- ocultamiento de modulos no permitidos;
- bloqueo backend por rol, no solo por UI.

Ese cambio debe tratarse como capacidad de seguridad, no como ajuste visual.

## Decision
Nelly OS adopta la navegacion por rol como criterio oficial de producto para el piloto controlado.

El hub muestra los Centros de Trabajo, pero cada usuario debe operar desde su entrada recomendada segun rol.
