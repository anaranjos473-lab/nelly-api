# RC1 BASELINE V1

**Estado:** Consolidacion cerrada  
**Ambito:** Plataforma Nelly OS  
**Referencia de origen:** `RC1_REPORTE_DIARIO_OPERATIVO_V1.md`

## 1. Proposito

Establecer la linea base de consolidacion de RC1 antes de abrir C3, dejando constancia de la normalizacion minima del CRM, el rendimiento observado del snapshot y las restricciones operativas que deben respetarse.

## 2. Alcance

Esta baseline cubre:

- la SSOT ya certificada;
- el Dashboard Comercial;
- el CRM basico sobre C2;
- la operacion piloto validada en P1, P1.5 y P2;
- la observabilidad operativa y financiera ya certificada.

## 3. Normalizacion minima del CRM

Se deja constancia de la normalizacion minima aplicada sobre el CRM para organizar la evidencia real sin crear una nueva fuente de verdad:

- `cliente_nombre` y campos relacionados como identidad canonica de cliente;
- `items` y `normalizedItems` como base de productos favorables;
- `observaciones`, `observacion`, `notas`, `notas_ubicacion` y `descripcion` como fuente de observaciones operativas;
- `zona`, `zona_entrega`, `zona_operativa`, `direccion` y `direccion_operativa` como base para zonas frecuentes;
- `ciudad` y `city` como referencia principal de comercio.

Regla:

- la normalizacion es derivada y no introduce persistencia paralela.

## 4. Baseline de rendimiento

Se midio el snapshot operativo del dashboard en `http://127.0.0.1:3015/api/admin/dashboard/operativo` con autenticacion administrativa.

### 4.1 Resultados medidos

| Iteracion | Tiempo |
| --- | --- |
| 1 | 516.2 ms |
| 2 | 624.4 ms |
| 3 | 1020.5 ms |

### 4.2 Referencia resumida

| Indicador | Valor |
| --- | --- |
| Mejor caso | 516.2 ms |
| Promedio aproximado | 720.4 ms |
| Peor caso | 1020.5 ms |

### 4.3 Lectura operativa

- la respuesta fue consistente y con `ok: true`;
- las proyecciones disponibles incluyeron `audit`, `metrics`, `finance`, `notification`, `ai`, `marketplace`, `commercial` y `crm`;
- no se observaron regresiones funcionales en la lectura del snapshot;
- el valor queda como referencia comparativa para cambios futuros.

## 5. Restricciones de consolidacion

- no crear nuevas fuentes de verdad;
- no duplicar logica del core;
- no romper los contratos validados;
- no abrir C3 hasta que esta baseline sea la referencia oficial;
- mantener como observacion no bloqueante la dependencia externa conocida de `validate-functional-metrics`.

## 6. Criterio de cierre

La consolidacion RC1 se considera cerrada cuando:

- el CRM minimalmente normalizado consume la SSOT;
- el Dashboard Comercial y el CRM muestran la evidencia real;
- el baseline de rendimiento esta documentado;
- el indice maestro apunta a esta referencia;
- C3 puede abrirse sobre una linea base estable y trazable.

## 7. Relacion con la siguiente etapa

Esta baseline marca el cierre corto de consolidacion antes de abrir C3. La siguiente capacidad debe partir de esta linea base y no de una reinterpretacion del core.
