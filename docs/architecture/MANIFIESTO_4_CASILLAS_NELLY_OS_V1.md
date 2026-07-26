# MANIFIESTO 4 CASILLAS NELLY OS V1

## Estado
Referencia oficial de arquitectura UX para el piloto controlado.

Este manifiesto reemplaza cualquier organizacion visual anterior que concentre administracion, operacion, comercio, logistica, CRM, analytics o herramientas tecnicas en un solo panel monolitico.

## Proposito
Definir la regla de separacion funcional de Nelly OS para evitar paneles monoliticos y mantener cada modulo alineado con una sola pregunta de negocio.

## Regla central
Cada funcion debe responder a una sola pregunta de negocio.

Si responde a otra pregunta, esta en el modulo equivocado.

## Casilla 1 - Administrar

**Pregunta:** Como configuro y gobierno el ecosistema?

**Modulo:** Nelly Administrador

Contiene:
- Usuarios.
- Roles.
- Permisos.
- Restaurantes.
- Conductores.
- Tarifas.
- Zonas.
- Configuracion.
- Catalogos.
- Seguridad.
- Parametros.

No contiene:
- Pedidos activos.
- Cocina.
- Mapas operativos.
- CRM.
- Marketing.

## Casilla 2 - Operar

**Pregunta:** Que esta ocurriendo en este momento?

**Modulo:** Nelly Operaciones

Contiene:
- Dashboard operativo.
- Pedidos.
- Cocina.
- Estado del pedido.
- Incidencias.
- Seguimiento.
- Alertas.
- Mapa operativo.

No contiene:
- Usuarios.
- Permisos.
- Configuracion global.
- Campanas comerciales.

## Casilla 3 - Comercial

**Pregunta:** Como vendo mas?

**Modulo:** Nelly Comercio / Tienda

Contiene:
- Perfil del restaurante.
- Menu.
- Productos.
- Horarios.
- Promociones.
- Ventas.
- Historial del restaurante.
- Pedidos del restaurante.

No contiene:
- Conductores.
- Configuracion global.
- CRM general.
- Analytics del sistema.

## Casilla 4 - Logistica

**Pregunta:** Como muevo el pedido?

**Modulo:** Nelly Logistica

Contiene:
- Conductores.
- Radar.
- Asignaciones.
- Reasignaciones.
- Cobertura.
- Balance de carga.
- Seguimiento de rutas.
- Ubicacion de repartidores.
- Entregas.

No contiene:
- Administracion general.
- Catalogos globales.
- Marketing.

## Modulos transversales

Estos modulos sirven a las cuatro casillas, pero no deben contaminar sus flujos principales.

### CRM
Contiene clientes, fidelizacion, campanas, cupones, WhatsApp, segmentacion y lectura comercial.

### Analytics
Contiene KPIs, reportes y tendencias. Es de solo lectura y no modifica informacion operativa.

### Developer
Contiene herramientas tecnicas: logs, APIs, estado, versiones y diagnostico.

## Nelly OS
Nelly OS es un centro de acceso, no un panel gigante.

Su responsabilidad es dirigir al usuario al modulo correcto:
- Administrar.
- Operar.
- Comercial.
- Logistica.
- CRM.
- Analytics.
- Developer.

## Principios congelados
- Una responsabilidad por modulo.
- Cada modulo tiene su propio dashboard, navegacion y herramientas especificas.
- Los modulos transversales permanecen separados.
- La operacion del piloto permanece intacta.
- La reorganizacion es de experiencia y estructura, sin alterar la logica de negocio certificada.

## Criterio de aplicacion
Antes de agregar una funcion a cualquier panel, responder:

1. Que pregunta de negocio responde?
2. A que casilla pertenece?
3. Modifica operacion, configuracion, venta o logistica?
4. Es transversal y deberia vivir en CRM, Analytics o Developer?

Si no hay una respuesta clara, la funcion no se incorpora hasta decidir su casilla.

## Gate de entrada para desarrollos nuevos

A partir de este manifiesto, ningun desarrollo nuevo entra al ecosistema sin responder primero estas preguntas:

1. Que problema resuelve?
2. Quien lo utiliza?
3. En cual Centro de Trabajo pertenece?
4. Afecta otro Centro de Trabajo?
5. Puede resolverse sin romper la separacion de responsabilidades?

Si alguna respuesta no esta clara, el cambio queda en revision antes de implementarse.

Este gate aplica a:
- Nuevas pantallas.
- Nuevos botones o acciones.
- Nuevos flujos operativos.
- Cambios de navegacion.
- Integraciones entre modulos.
- Funciones transversales que puedan contaminar un Centro de Trabajo.

La respuesta debe quedar registrada en la tarea, issue, commit, ADR o documento operativo correspondiente, segun el impacto del cambio.

## Decision
El Manifiesto 4 Casillas queda adoptado como regla oficial de diseno, navegacion y gobierno de producto para el piloto controlado.

Ninguna funcionalidad nueva puede incorporarse sin responder primero a que casilla pertenece. Si no pertenece con claridad a Administrar, Operar, Comercial o Logistica, debe evaluarse como modulo transversal o replantearse antes de implementarse.

Ningun cambio futuro debe convertir a Nelly OS o a cualquiera de sus Centros de Trabajo en un panel monolitico. Nelly OS dirige; cada Centro de Trabajo ejecuta solo su responsabilidad.
