# NELLY UI V1.1 - Estados Unificados

**Estado:** Propuesto  
**Ambito:** Plataforma web de Nelly  
**Fecha:** 2026-07-25

## 1. Objetivo

Definir una semantica visual comun para estados de carga, vacio, error, sin conexion, sin resultados y exito.

## 2. Estados oficiales

### 2.1 Cargando

Se usa cuando el dato aun no esta disponible.

### 2.2 Vacio

Se usa cuando la vista no tiene registros, pero la consulta fue exitosa.

### 2.3 Error

Se usa cuando la operacion fallo y requiere revision.

### 2.4 Sin conexion

Se usa cuando el origen de datos no responde o la sesion no esta viva.

### 2.5 Sin resultados

Se usa cuando hay consulta valida, pero no coincide con ningun registro.

### 2.6 Exito

Se usa cuando una accion operativa se completo correctamente.

## 3. Regla de uso

- El mismo estado debe verse igual en todos los modulos.
- No se deben inventar colores o textos distintos para el mismo estado.
- La semantica prevalece sobre la decoracion.

## 4. Aplicacion

Los componentes de estado se aplican a:

- tarjetas KPI;
- listas;
- tablas;
- modales;
- paneles de conexion;
- vistas de login;
- confirmaciones operativas.

