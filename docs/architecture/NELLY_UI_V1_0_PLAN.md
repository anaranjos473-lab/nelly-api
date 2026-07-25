# NELLY UI V1.0 - Plan Oficial

**Estado:** Propuesto como fase activa  
**Ambito:** Plataforma web de Nelly  
**Fecha:** 2026-07-25

## 1. Objetivo

Construir una base visual unica para toda la plataforma web de Nelly antes de retomar Android.

Nelly UI V1.0 no busca "hacer pantallas bonitas" de forma aislada. Busca convertir la experiencia web en un sistema coherente, reusable y certificable que exprese la identidad de Nelly como un centro de control logistico.

## 2. Resultado esperado

Al cerrar esta fase, la plataforma web debe compartir:

- tokens visuales comunes;
- componentes reutilizables;
- jerarquia tipografica estable;
- patrones consistentes de panel, tarjeta, boton, tabla, modal, badge y KPI;
- una lectura visual comun en todos los modulos.

## 3. Orden de ejecucion

La secuencia de trabajo sera:

1. definir la base del design system;
2. organizar la arquitectura de carpetas y componentes;
3. aplicar la base visual a los paneles web;
4. consolidar el lenguaje visual en los modulos operativos;
5. dejar Android para una fase posterior de replica.

## 4. Alcance de la fase web

### 4.1 Incluido

- Landing.
- Login.
- Panel Admin.
- Dashboard Operativo.
- Dashboard Comercial.
- CRM.
- Cocina.
- Repartidor Web.
- Configuracion.
- Reportes.
- Finanzas.
- Auditoria.

### 4.2 Fuera de alcance por ahora

- Android Studio.
- Redisenos de contratos backend.
- Cambios funcionales en flujos ya certificados.
- Reescritura total de pantallas que aun no dependan del design system.

## 5. Principios de diseno

### 5.1 Centro de control logistico

La UI debe sentirse como una consola operativa:

- mucha informacion;
- poca distraccion;
- acciones rapidas;
- estados claros;
- prioridad por tiempo real;
- consistencia visual por encima de decoracion.

### 5.2 Una sola verdad visual

Las pantallas no deben inventar estilos propios salvo excepciones justificadas.
Todo lo reusable debe vivir en la base comun.

### 5.3 Incrementalidad

Cada componente nuevo debe poder adoptarse sin romper el resto del sistema.

## 6. Componentes base

La primera version del sistema visual incluye:

- `card`
- `button`
- `table`
- `modal`
- `sidebar`
- `navbar`
- `badge`
- `kpi`
- `chart`
- `timeline`
- `map`
- `forms`

## 7. Criterios de exito

La fase se considera exitosa cuando:

- el sistema visual es consistente entre paneles;
- los componentes base se reutilizan sin duplicar estilos;
- el dashboard operativo refleja la identidad visual del producto;
- CRM y Comercial comparten el mismo lenguaje;
- el panel admin deja de parecer un conjunto de modulos aislados.

## 8. Regla de gobierno

No se avanza a Android hasta que la base web este consolidada.
Android debera replicar componentes ya definidos, no inventarlos de nuevo.

## 9. Historial

- 2026-07-25: se formaliza Nelly UI V1.0 como fase previa a Android.
