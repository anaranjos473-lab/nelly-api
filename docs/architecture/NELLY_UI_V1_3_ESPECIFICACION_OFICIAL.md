# NELLY UI 1.3 - Especificacion Oficial del Sistema de Diseno

**Estado:** Especificacion oficial propuesta  
**Ambito:** Plataforma web de Nelly  
**Fecha:** 2026-07-25

## 1. Proposito

NELLY UI 1.3 define la base visual oficial de la plataforma web de Nelly.

Su objetivo no es decorar pantallas aisladas, sino establecer una referencia tecnica y operativa obligatoria para toda nueva interfaz, extension o migracion visual dentro del ecosistema.

## 2. Objetivos del sistema

- Unificar la experiencia visual de toda la plataforma.
- Reducir CSS duplicado y decisiones ad hoc por pantalla.
- Garantizar consistencia entre modulos.
- Facilitar la migracion futura a Android Studio.
- Acelerar la construccion de nuevos modulos sin reinventar patrones.
- Mantener una lectura clara para operaciones en tiempo real.

## 3. Principios de diseno

### 3.1 Claridad antes que decoracion

La interfaz debe priorizar lectura, accion y comprension inmediata por encima de adornos visuales.

### 3.2 Informacion critica visible rapido

La informacion operativa relevante debe poder identificarse en menos de cinco segundos.

### 3.3 Una accion principal por pantalla

Cada vista debe dejar claro cual es la accion o lectura principal.

### 3.4 Jerarquia visual consistente

Titulos, KPIs, tablas, listas y estados deben seguir la misma jerarquia en todos los modulos.

### 3.5 Tiempo real identificable

Las vistas que reflejan actividad en vivo deben comunicarlo de forma explicita y uniforme.

### 3.6 Acciones repetitivas simplificadas

Toda accion frecuente debe resolverse con el menor numero razonable de pasos.

## 4. Tokens de diseno

Los tokens son la unica fuente de verdad para decisiones base de apariencia.

### 4.1 Color

- primario;
- secundario;
- exito;
- advertencia;
- error;
- info;
- superficies;
- texto;
- bordes.

### 4.2 Tipografia

- familias tipograficas oficiales;
- escalas de titulo;
- escalas de texto;
- pesos;
- interlineado.

### 4.3 Espaciado

- escala base de margenes;
- paddings;
- gaps;
- separadores.

### 4.4 Bordes y radios

- radio pequeno;
- radio medio;
- radio grande;
- radio de chips y badges.

### 4.5 Sombras

- sombra baja;
- sombra media;
- sombra alta;
- sombra de capa flotante.

### 4.6 Animaciones

- duracion rapida;
- duracion normal;
- transiciones entre estados;
- entrada de paneles;
- microinteracciones.

### 4.7 Breakpoints

- mobile;
- tablet;
- desktop;
- escritorio amplio.

### 4.8 Z-index

- fondo;
- superficie;
- panel;
- overlay;
- modal;
- drawer;
- tooltip;
- command palette.

## 5. Componentes oficiales

Los componentes oficiales son los unicos bloques que pueden repetirse como base visual.

### 5.1 Card

Propósito:
- contener informacion resumida o contextual.

Variantes:
- base;
- destacada;
- informativa;
- operativa;
- compacta.

Estados:
- normal;
- hover;
- activa;
- deshabilitada;
- cargando.

### 5.2 KPI

Propósito:
- resumir una magnitud operativa o financiera.

Variantes:
- primaria;
- secundaria;
- advertencia;
- exito;
- neutra.

### 5.3 Button

Propósito:
- ejecutar una accion clara y directa.

Variantes:
- primary;
- secondary;
- ghost;
- danger;
- icon;
- link.

### 5.4 Badge

Propósito:
- representar estados, prioridades o categorias compactas.

Variantes:
- success;
- warning;
- error;
- info;
- live;
- neutral.

### 5.5 Table

Propósito:
- mostrar colecciones, registros y control operativo tabular.

Variantes:
- simple;
- con filtros;
- compacta;
- administrativa;
- auditada.

### 5.6 Forms

Propósito:
- capturar datos de manera clara y consistente.

### 5.7 Modal

Propósito:
- confirmar, ampliar o resolver acciones contextuales.

### 5.8 Sidebar

Propósito:
- ofrecer navegacion o contexto persistente.

### 5.9 Navbar

Propósito:
- concentrar identidad, sesion y acciones de alto nivel.

### 5.10 Chart

Propósito:
- traducir datos a lectura visual accionable.

### 5.11 Timeline

Propósito:
- representar eventos en orden causal o temporal.

### 5.12 Map

Propósito:
- representar ubicacion, cobertura o actividad territorial.

## 6. Patrones oficiales

Los patrones oficiales combinan varios componentes en una experiencia completa.

### 6.1 Dashboard

Estructura:
- KPIs superiores;
- mapa o lectura principal;
- actividad reciente;
- tabla o lista de soporte;
- acciones rapidas.

### 6.2 CRM

Estructura:
- filtros;
- tarjetas de cliente;
- timeline;
- detalle;
- alertas o oportunidades.

### 6.3 Cocina

Estructura:
- pedidos;
- detalle;
- preparacion;
- despacho;
- estados de avance.

### 6.4 Panel lateral

Estructura:
- titulo;
- resumen;
- contenido persistente;
- acciones secundarias.

### 6.5 Lista con filtros

Estructura:
- busqueda;
- filtros activos;
- conteos;
- resultados;
- estado vacio.

### 6.6 Tarjeta de pedido

Estructura:
- identificador;
- cliente;
- monto;
- estado;
- accion principal.

### 6.7 Tarjeta de repartidor

Estructura:
- identidad;
- estado;
- carga;
- disponibilidad;
- accion de gestion.

### 6.8 Tarjeta de comercio

Estructura:
- nombre;
- volumen;
- recurrencia;
- alerta;
- accion sugerida.

### 6.9 Tarjeta de cliente

Estructura:
- nombre;
- frecuencia;
- ultimo pedido;
- segmento;
- siguiente accion.

## 7. Estados oficiales

Todos los modulos deben compartir la misma semantica visual.

### 7.1 Loading

Se usa mientras la consulta o calculo sigue en curso.

### 7.2 Empty

Se usa cuando no hay datos disponibles, pero la operacion fue valida.

### 7.3 Error

Se usa cuando la operacion fallo y requiere revision.

### 7.4 Offline

Se usa cuando la fuente de datos no responde o la sesion no esta viva.

### 7.5 Success

Se usa cuando una accion se completo correctamente.

### 7.6 Warning

Se usa cuando existe una condicion que requiere atencion, pero no bloquea el flujo.

### 7.7 Processing

Se usa cuando una accion esta siendo ejecutada y aun no termino.

### 7.8 Live

Se usa cuando la vista esta conectada a una lectura en tiempo real.

## 8. Iconografia

La iconografia es un sistema unico, no una coleccion de simbolos aislados.

### 8.1 Biblioteca base

- pedidos;
- clientes;
- comercios;
- repartidores;
- cocina;
- finanzas;
- reportes;
- configuracion;
- incidencias;
- tiempo real.

### 8.2 Reglas

- un concepto, un icono principal;
- un solo estilo por pantalla;
- no mezclar sets distintos;
- mantener consistencia de grosor y escala;
- priorizar legibilidad por encima de ornamento.

## 9. Motion

El movimiento debe apoyar la lectura, no distraer.

### 9.1 Casos de uso

- apertura de paneles;
- transicion entre estados;
- aparicion de alertas;
- actualizacion de KPIs;
- confirmacion de acciones operativas.

### 9.2 Reglas

- transiciones rapidas;
- animaciones discretas;
- sin rebotes innecesarios;
- sin exagerar la presencia visual.

## 10. Accesibilidad

La accesibilidad es obligatoria desde la base del sistema.

### 10.1 Requisitos

- contraste minimo adecuado;
- foco visible;
- navegacion por teclado;
- tamanos minimos de interaccion;
- etiquetas semanticas;
- soporte para lectores de pantalla;
- no depender solo del color para comunicar estado.

## 11. Guia de migracion

La migracion de una pantalla o modulo al sistema oficial debe seguir este orden:

1. eliminar estilos locales redundantes;
2. sustituir por componentes oficiales;
3. unificar estados vacios, carga y error;
4. validar la lectura visual en escritorio y mobile;
5. verificar consistencia con la suite de certificacion;
6. aprobar la migracion antes de cerrar el cambio.

## 12. Regla de oro

Ninguna pantalla nueva puede incorporar CSS propio si ya existe un componente equivalente en NELLY UI.

Si un componente no existe, debe definirse primero en el sistema oficial antes de usarse en pantallas nuevas.

## 13. Gobernanza

- El sistema visual se considera una referencia compartida.
- Las excepciones deben estar justificadas por un caso de uso claro.
- Ningun modulo debe divergir por estilo propio si la base oficial ya cubre la necesidad.
- La evolucion del sistema debe priorizar consistencia, certificabilidad y reutilizacion.

## 14. Criterios de aceptacion

La especificacion se considera correcta cuando:

- las nuevas pantallas pueden construirse con componentes existentes;
- los estados se ven iguales en todos los modulos;
- la iconografia no cambia de estilo entre secciones;
- la experiencia se percibe como un solo producto;
- Android puede replicar el lenguaje visual sin inventar otra base.

## 15. Historial

- 2026-07-25: se crea la especificacion oficial de NELLY UI 1.3 como documento normativo del sistema de diseno.
