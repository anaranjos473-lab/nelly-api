# NELLY UI V1.2 - Biblioteca de Patrones

**Estado:** Propuesto  
**Ambito:** Plataforma web de Nelly  
**Fecha:** 2026-07-25

## 1. Objetivo

Definir patrones completos, no solo componentes sueltos, para acelerar la construccion de pantallas y mantener consistencia visual.

## 2. Patrones oficiales

### 2.1 Tarjeta KPI

Uso:
- resumen ejecutivo;
- conteos en tiempo real;
- estados compactos.

Estructura:
- etiqueta;
- valor principal;
- subtexto opcional;
- variante de color por estado.

### 2.2 Lista de pedidos

Uso:
- cocina;
- repartidor;
- dashboard operativo.

Estructura:
- identificador;
- cliente;
- monto;
- estado;
- accion principal.

### 2.3 Tarjeta de repartidor

Uso:
- admin;
- asignacion;
- control operativo.

Estructura:
- nombre o UID;
- estado;
- carga actual;
- bloqueo o disponibilidad;
- accion de gestion.

### 2.4 Timeline de pedido

Uso:
- rastreo operativo;
- auditoria;
- soporte.

Estructura:
- evento;
- hora;
- actor;
- resultado;
- evidencia.

### 2.5 Tabla con filtros

Uso:
- admin;
- reportes;
- finanzas;
- auditoria.

Estructura:
- encabezado;
- filtros;
- filas;
- estado vacio;
- exportacion.

### 2.6 Panel lateral

Uso:
- configuracion;
- detalle contextual;
- acciones secundarias.

Estructura:
- titulo;
- resumen;
- acciones;
- contenido persistente.

### 2.7 Mapa con capas

Uso:
- admin;
- despacho;
- ubicacion.

Estructura:
- mapa base;
- pin central o marcadores;
- leyenda;
- controles rapidos;
- estado de captura.

### 2.8 Tarjeta de comercio

Uso:
- CRM;
- comercial;
- marketplace.

Estructura:
- nombre;
- volumen;
- recurrencia;
- alerta o oportunidad;
- accion sugerida.

### 2.9 Tarjeta de cliente

Uso:
- CRM;
- comercial;
- fidelizacion.

Estructura:
- nombre;
- frecuencia;
- ultimo pedido;
- segmento;
- siguiente accion.

## 3. Regla de uso

- Un patron debe repetirse igual en todos los modulos.
- Si una pantalla requiere una variante, la variante debe nacer del mismo patron, no de una nueva composicion aislada.
- Los patrones priorizan lectura rapida y control operativo.

## 4. Orden de adopcion

1. KPI y tarjetas;
2. listas operativas;
3. tablas y filtros;
4. mapas;
5. timelines;
6. paneles laterales.

## 5. Criterio de calidad

El sistema esta bien resuelto cuando una nueva vista puede componerse con patrones existentes sin inventar layout desde cero.
