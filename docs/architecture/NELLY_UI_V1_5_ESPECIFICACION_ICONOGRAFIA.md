# NELLY UI 1.5 - Especificacion Oficial de Iconografia

**Estado:** Especificacion oficial propuesta  
**Ambito:** Plataforma web de Nelly  
**Fecha:** 2026-07-25

## 1. Proposito

NELLY UI 1.5 define la biblioteca oficial de iconografia para toda la plataforma web de Nelly.

Su objetivo es evitar estilos mixtos, simbolos ambiguos y decisiones visuales aisladas por modulo. La iconografia debe acelerar el reconocimiento operativo sin competir con la informacion principal.

## 2. Objetivos

- Unificar los simbolos visuales de la plataforma.
- Asociar cada concepto a un icono principal estable.
- Reducir la mezcla de sets distintos dentro de una misma pantalla.
- Mantener consistencia entre paneles, estados y acciones.
- Facilitar la futura replica visual en Android Studio.

## 3. Principios

### 3.1 Un concepto, un icono principal

Cada dominio debe tener una referencia visual clara y estable.

### 3.2 Consistencia entre modulos

El mismo concepto debe representarse igual en Operaciones, Comercial, CRM, Admin, Cocina y Repartidor.

### 3.3 Legibilidad antes que ornamento

La iconografia debe ayudar a reconocer, no a decorar.

### 3.4 Un solo estilo por pantalla

No se deben mezclar sets con distinto grosor, relleno o lenguaje visual dentro de una misma vista.

### 3.5 Escala coherente

Los iconos deben conservar tamano, espaciado y peso visual compatibles con KPIs, badges, botones y tarjetas.

## 4. Biblioteca oficial

La biblioteca base de Nelly UI 1.5 incluye:

- pedidos;
- repartidores;
- comercios;
- clientes;
- finanzas;
- radar;
- alertas;
- incidencias;
- reporte;
- configuracion;
- mapa;
- tiempo real;
- cocina;
- marketplace;
- IA;
- auditoria;
- notificaciones;
- salud del sistema.

## 5. Categorias de iconos

### 5.1 Dominio operativo

- pedidos;
- reparto;
- cocina;
- mapa;
- tiempo real;
- incidencias.

### 5.2 Dominio comercial

- clientes;
- comercios;
- marketplace;
- alertas;
- IA;
- reporte.

### 5.3 Dominio administrativo

- finanzas;
- configuracion;
- auditoria;
- salud del sistema;
- notificaciones.

## 6. Reglas de uso

- Un icono por concepto principal.
- No usar dos iconos distintos para el mismo concepto dentro de la plataforma.
- Mantener la misma familia visual en todos los estados.
- No introducir nuevos iconos de forma ad hoc si el concepto ya existe.
- Si hace falta un icono nuevo, debe definirse primero en esta biblioteca.

## 7. Relacion con estados

La iconografia debe convivir con los estados unificados de Nelly UI 1.4 sin competir con ellos.

Casos tipicos:

- icono de carga junto a `loading`;
- icono de vacio junto a `empty state`;
- icono de error junto a `error`;
- icono de tiempo real junto a `live`;
- icono de advertencia junto a `warning`.

## 8. Relacion con patrones

Los patrones oficiales deben usar iconos consistentes en:

- tarjeta KPI;
- tarjeta de pedido;
- tarjeta de cliente;
- tarjeta de comercio;
- tarjeta de repartidor;
- panel lateral;
- timeline;
- mapa;
- alertas.

## 9. Accesibilidad

- El icono nunca debe ser la unica via para comprender una accion.
- Debe existir texto alternativo o etiqueta visible en componentes de accion.
- El contraste del icono debe ser suficiente sobre la superficie donde aparece.
- Los iconos decorativos no deben interferir con lectores de pantalla.

## 10. Guia de adopcion

1. Definir el icono oficial del concepto.
2. Registrar su uso en la biblioteca.
3. Sustituir variantes locales por el icono oficial.
4. Validar consistencia visual en todos los paneles.
5. Evitar volver a introducir estilos divergentes.

## 11. Criterios de aceptacion

La especificacion se considera correcta cuando:

- cada dominio usa una referencia visual unica;
- no hay mezcla de estilos de iconografia en una misma pantalla;
- los iconos ayudan a leer la operacion mas rapido;
- la biblioteca puede ser reutilizada por web y Android.

## 12. Historial

- 2026-07-25: se define la especificacion oficial de iconografia para Nelly UI 1.5.
