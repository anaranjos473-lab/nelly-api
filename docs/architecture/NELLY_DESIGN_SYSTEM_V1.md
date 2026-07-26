# NELLY DESIGN SYSTEM V1

## Estado
Referencia oficial de producto visual para los Centros de Trabajo de Nelly OS.

Este documento consolida la experiencia visual activa para:
- Gobierno del Ecosistema.
- Centro de Operaciones.
- Centro Comercial.
- Centro Logistico.
- CRM.
- Analytics.
- Developer.

No reemplaza los documentos historicos de NELLY UI; los resume como regla practica para operar y evolucionar el piloto sin romper consistencia.

## Proposito
Unificar el lenguaje visual de Nelly para que cada usuario entienda rapidamente:
- donde esta;
- que puede hacer;
- que estado tiene la operacion;
- cual es la siguiente accion.

## Regla central
Todos los Centros de Trabajo deben compartir estructura, componentes y estados.

El contenido cambia por responsabilidad, pero el lenguaje visual permanece constante.

## Estructura comun de un Centro de Trabajo
Cada Centro debe usar este orden:

1. Navegacion lateral.
2. Encabezado del Centro.
3. KPIs principales.
4. Panel principal de trabajo.
5. Panel lateral o lista de contexto.
6. Actividad, detalle o estado operativo.
7. Acciones principales siempre visibles cerca del flujo que afectan.

Nelly OS funciona como hub de entrada. Los Centros de Trabajo ejecutan responsabilidades.

## Componentes oficiales

### Header
Debe indicar:
- nombre del Centro;
- proposito en una frase;
- usuario/sesion cuando aplique;
- accion principal si existe.

### Sidebar
Debe contener:
- marca Nelly;
- nombre del Centro;
- navegacion interna;
- accesos a Centros relacionados cuando sean necesarios;
- estado operativo compacto al final.

### Card
Uso:
- agrupar informacion relacionada;
- separar lectura, accion y detalle.

Reglas:
- una tarjeta responde a una sola pregunta;
- no mezclar configuracion, operacion y analitica en la misma tarjeta;
- usar titulos cortos y subtitulos explicativos.

### KPI
Uso:
- mostrar numeros accionables;
- priorizar estado operativo antes que decoracion.

Estructura:
- etiqueta;
- valor;
- lectura corta o tendencia.

### Tabla
Uso:
- listar entidades operativas o administrativas.

Reglas:
- encabezados claros;
- acciones al final;
- estado visible por fila;
- empty state cuando no existan datos.

### Boton primario
Uso:
- accion principal del flujo.

Ejemplos:
- Crear pedido.
- Guardar alta.
- Confirmar ubicacion.

### Boton secundario
Uso:
- accion de soporte o navegacion.

Ejemplos:
- Refrescar.
- Copiar ubicacion.
- Ver detalle.

### Boton de peligro
Uso:
- acciones destructivas, bloqueo, cancelacion o suspension.

Debe ser visible, pero no competir con la accion principal.

### Modal
Uso:
- confirmar acciones sensibles;
- capturar informacion corta;
- mostrar detalle sin cambiar de Centro.

No debe sustituir pantallas completas.

### Panel lateral
Uso:
- mostrar detalle contextual;
- mantener al usuario dentro del flujo principal.

### Mapa
Uso:
- ubicacion operativa;
- zonas;
- rutas;
- asignaciones.

Reglas:
- siempre mostrar estado cuando el mapa no cargue;
- no exponer coordenadas tecnicas si el usuario no las necesita;
- mantener acciones de confirmacion junto al mapa.

### Timeline
Uso:
- estados de pedido;
- seguimiento de cliente;
- auditoria operativa.

Debe mostrar fecha/hora cuando exista evidencia.

### Badge de estado
Uso:
- estado de entidad;
- estado operativo;
- severidad de incidencia.

Debe reutilizar la convencion oficial de estados.

## Estados oficiales

| Estado | Significado | Color sugerido | Uso |
| --- | --- | --- | --- |
| Activo | Disponible u operando | Verde | Restaurante activo, conductor disponible, modulo saludable |
| Pendiente | Falta accion o validacion | Amarillo | Alta en revision, pedido por asignar |
| En proceso | La operacion esta avanzando | Azul | Pedido en curso, asignacion en progreso |
| Completado | Flujo terminado correctamente | Verde | Pedido entregado, alta completada |
| Error | Fallo tecnico o funcional | Rojo | API fallando, CRM no disponible |
| Bloqueado | No puede operar hasta resolver condicion | Rojo/Naranja | Deuda, bloqueo manual, cuenta suspendida |

## Colores funcionales

| Token | Uso |
| --- | --- |
| `--wc-green` | exito, activo, saludable |
| `--wc-blue` | informacion, proceso, navegacion |
| `--wc-yellow` | pendiente, advertencia leve |
| `--wc-orange` | riesgo operativo |
| `--wc-red` | error, peligro, bloqueo |
| `--wc-panel` | superficie principal |
| `--wc-line` | borde y separacion |
| `--wc-muted` | texto secundario |

## Clases CSS de referencia

| Componente | Clase |
| --- | --- |
| Shell de Centro | `wc-shell` |
| Sidebar | `wc-sidebar` |
| Navegacion | `wc-nav` |
| Header | `wc-topbar` |
| Tarjeta | `wc-card` |
| KPI | `wc-kpi` |
| Grid KPI | `wc-kpi-grid` |
| Accion primaria | `wc-action` |
| Accion secundaria | `wc-action-secondary` |
| Accion de peligro | `wc-action-danger` |
| Badge/Pill | `wc-pill` |
| Estado | `wc-state` |
| Tabla | `wc-table` |
| Empty state | `wc-empty` |
| Loading state | `wc-loading` |

## Convencion por Centro

| Centro | Pregunta | Componentes prioritarios |
| --- | --- | --- |
| Gobierno | Como configuro y audito? | tablas, formularios, estados, auditoria |
| Operaciones | Que ocurre ahora? | KPIs, mapa, pedidos, incidencias |
| Comercio | Como vendo mas? | ventas, menu, productos, horarios |
| Logistica | Como muevo el pedido? | mapa, conductores, asignaciones, rutas |
| CRM | Como entiendo al cliente? | fichas, segmentos, historial |
| Analytics | Que tendencia debo observar? | KPIs, graficas, reportes |
| Developer | Que esta pasando tecnicamente? | logs, estado, version, diagnostico |

## Regla de adopcion
Toda pantalla nueva debe intentar resolver su interfaz con estos componentes antes de crear CSS propio.

Si una pantalla necesita un patron nuevo, debe documentarse:
- problema visual que resuelve;
- Centro donde aplica;
- si es reutilizable;
- clase o componente propuesto;
- evidencia visual minima.

## Decision
Nelly Design System V1 queda adoptado como referencia practica para mantener consistencia visual durante el piloto controlado y las siguientes iteraciones del ecosistema.
