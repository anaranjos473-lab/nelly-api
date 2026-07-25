# NELLY UI 2.0 - UX del Dashboard Operativo

**Estado:** Propuesta oficial  
**Ambito:** Dashboard Operativo de Nelly  
**Fecha:** 2026-07-25

## 1. Proposito

NELLY UI 2.0 define la siguiente etapa del Dashboard Operativo como una experiencia de producto y no solo como una composicion visual.

La pantalla debe contar la historia de la operacion en tiempo real y convertir KPIs, alertas y salud del sistema en una lectura guiada para decidir rapido.

## 2. Objetivos de experiencia

- Convertir el Dashboard Operativo en la pantalla insignia de Nelly.
- Guiar la lectura de la operacion desde lo mas importante hacia lo tactico.
- Reducir la carga cognitiva del operador.
- Priorizar accion sobre decoracion.
- Mostrar el estado real del negocio en secuencia comprensible.

## 3. Principios UX

### 3.1 La pantalla cuenta una historia

La vista debe presentar la operacion como una secuencia, no como bloques aislados.

### 3.2 Una jerarquia clara

Primero el estado general, luego la lectura critica, despues el soporte analitico.

### 3.3 Decisiones rapidas

La pantalla debe permitir entender que esta sano, que requiere atencion y que necesita accion.

### 3.4 Carga cognitiva baja

El operador no debe reconstruir mentalmente el estado del negocio a partir de fragmentos sueltos.

### 3.5 Tiempo real visible

La pantalla debe comunicar con claridad cuando la lectura viene en vivo y cuando esta pendiente o degradada.

## 4. Secuencia de lectura propuesta

La estructura narrativa objetivo es:

1. Ciudad u operacion activa;
2. Pedidos vivos;
3. Alertas;
4. Mapa;
5. Conductores;
6. Incidentes;
7. Actividad reciente;
8. IA o recomendacion asistida.

## 5. Zonas funcionales

### 5.1 Cabecera

Debe comunicar:
- nombre de la vista;
- estado general;
- tiempo real;
- acceso rapido a refresco o retorno.

### 5.2 Lectura principal

Debe concentrar:
- KPIs criticos;
- estado del backend;
- visibilidad de sanidad operativa.

### 5.3 Bloques tacticos

Debe mostrar:
- consumidores;
- finanzas;
- notificaciones;
- salud;
- marketplace.

### 5.4 Proyecciones consolidadas

Debe resumir:
- audit;
- metrics;
- finance;
- estado general.

## 6. Patrones UX

### 6.1 Estado general primero

La pantalla debe abrir con la situacion global antes de mostrar el detalle.

### 6.2 Bloques de lectura por prioridad

Los bloques deben ordenarse por impacto operativo, no por afinidad tecnica.

### 6.3 Señales cortas y accionables

Cada bloque debe responder una pregunta operativa clara.

### 6.4 Estados visibles sin esfuerzo

Loading, empty, warning y error deben leerse sin duda.

## 7. Regla de composicion

El Dashboard Operativo debe abandonar la idea de "muchos bloques independientes" y convertirse en una vista orquestada.

La referencia de composicion debe ser:

- estado general;
- lectura prioritaria;
- soporte de datos;
- decisiones y proyecciones.

## 8. Relacion con UI 1.3, 1.4 y 1.5

- UI 1.3 aporta la base visual.
- UI 1.4 aporta la semantica de estados.
- UI 1.5 aporta la iconografia.
- UI 2.0 convierte todo lo anterior en experiencia de producto.

## 9. Criterios de exito

La UX del Dashboard Operativo se considera correcta cuando:

- el operador entiende la situacion general en segundos;
- la pantalla prioriza accion sobre lectura dispersa;
- los estados visuales son evidentes;
- la experiencia se siente como una consola de control, no como un conjunto de tarjetas.

## 10. Guia de evolucion

1. Consolidar la jerarquia narrativa.
2. Reducir bloques redundantes.
3. Fortalecer el bloque principal de lectura.
4. Simplificar las acciones secundarias.
5. Ajustar la presentacion solo cuando mejore la toma de decisiones.

## 11. Regla de gobierno

No se debe transformar la pantalla por estetica aislada.

Todo ajuste del Dashboard Operativo debe responder a una mejora clara en lectura, accion o confianza operativa.

## 12. Historial

- 2026-07-25: se define UI 2.0 como la evolucion UX del Dashboard Operativo de Nelly.
