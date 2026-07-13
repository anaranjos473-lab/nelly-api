# Nelly Delivery - Plan de migración y rollback V2

Estado: **BORRADOR PARA APROBACIÓN**

Fecha: 2026-07-13

## Objetivo

Migrar productores y consumidores al Contrato Canónico V2 sin interrumpir pedidos activos, sin reescribir evidencia histórica y sin volver a introducir múltiples fuentes de verdad.

## Principios

1. Compatibilidad de lectura temporal; escritura nueva exclusivamente V2.
2. Migración por productor y consumidor, nunca un cambio masivo simultáneo.
3. No se inventan coordenadas ni campos históricos ausentes.
4. No hay doble escritura V1/V2 dentro del pedido canónico.
5. Los índices se reconstruyen desde el canónico.
6. Cada ola tiene métricas, criterio de entrada, criterio de salida y rollback probado.
7. Un rollback conserva los pedidos V2; nunca los degrada destructivamente a V1.

## Preparación obligatoria

Antes de la primera implementación:

- aprobación final de los documentos C5.1;
- exportación/backup verificable de RTDB y reglas aplicables;
- conteo base por productor, versión, estado y alias;
- lista de pedidos activos que no pueden migrarse durante una entrega;
- pruebas contractuales con ejemplos válidos, inválidos y conflictos de aliases;
- flags independientes para validador, productor, consumidor y proyector;
- observabilidad sin datos personales: versión, productor, error y alias detectado;
- procedimiento ensayado para reconstruir índices.

## Olas de migración

### M0 - Línea base y congelación

- Congelar nuevos esquemas y productores.
- Capturar backup y métricas agregadas.
- Identificar pedidos activos V1 y dejarlos terminar con compatibilidad existente.
- Prohibir limpieza o transformación masiva.

Criterio de salida: inventario ratificado y respaldo restaurable comprobado en ambiente aislado.

### M1 - Contrato ejecutable en sombra

- Crear pruebas del esquema, máquina, fases y eventos.
- Ejecutar adaptador V1 -> V2 solo en memoria.
- Validar en sombra pedidos leídos sin cambiar RTDB.
- Clasificar: convertible, ambiguo, incompleto o inválido.

Criterio de salida: cero escrituras de sombra y reporte de impacto revisado.

### M2 - Servicio único de creación V2

- Implementar constructor/validador detrás de flag.
- Probar primero fixtures y ambiente aislado/controlado.
- Escribir únicamente V2 para el productor piloto aislado.
- Rechazar de forma explícita entradas sin coordenadas o con conflictos.

Criterio de salida: pedidos piloto V2 completos, historial coherente y sin aliases persistidos. No se habilita escritura V2 en producción antes de completar M3.

### M3 - Preparación de consumidores

Antes de permitir escrituras V2 en producción, todos los consumidores que puedan recibirlas deben demostrar que leen V2 de forma segura. Se despliega lectura compatible V1/V2, pero todavía se mantiene V1 como tráfico ordinario.

Orden propuesto:

1. backend delivery/tracking y proyector;
2. Cocina y Admin;
3. Android y Web Driver;
4. agentes y Cloud Functions;
5. auditorías y reportes.

Cada consumidor normaliza a una representación V2 interna y pasa pruebas con fixtures de ambas versiones. Esto evita crear un pedido V2 que un consumidor de producción todavía no pueda procesar.

### M4 - Migración de productores

Orden propuesto:

1. scripts de certificación en ambiente controlado;
2. Admin Dashboard + `/api/admin/pedidos` como una sola cadena;
3. `/api/ordenes`;
4. Cocina solo si se autoriza como productor;
5. importadores/Cloud Functions futuros.

Cada productor debe permanecer bajo observación antes de habilitar el siguiente. No se permite que un frontend genere identidad/estado por fuera del servicio canónico.

### M5 - Proyecciones e históricos

- Cambiar consumidores preparados para que V2 sea su camino principal, conservando lectura V1 temporal para históricos.
- Reconstruir índices en paralelo y comparar con los actuales antes del corte.
- Cambiar consumidores para consultar índice y confirmar siempre en canónico.
- Clasificar históricos terminados sin coordenadas como V1 histórico; no rellenarlos.
- Migrar solo registros convertibles mediante herramienta idempotente, backup y reporte.
- Los ambiguos quedan en revisión o archivo, no se corrigen silenciosamente.

### M6 - Retiro de compatibilidad

- Deshabilitar productor por productor los aliases de entrada.
- Mantener lectura histórica mientras exista necesidad aprobada.
- Retirar aliases únicamente tras cero uso observado durante el periodo que se apruebe.
- Eliminar código de compatibilidad en un cambio separado y reversible.

## Estrategia de rollback

### Qué significa rollback

Rollback revierte una versión de aplicación, un flag o una ruta de tráfico. No borra pedidos, no cambia `contract_version` y no transforma V2 de regreso a V1.

### Controles por ola

| Ola | Activación | Rollback seguro |
|---|---|---|
| M1 sombra | Flag de validación | Desactivar sombra; no hubo escrituras |
| M2 validador | Flag del servicio/piloto | Detener creación del productor afectado o volver a modo de mantenimiento; conservar V2 creados |
| M3 consumidor | Flag/versión por consumidor | Volver al lector anterior; como aún no hay tráfico V2 ordinario, no se dejan pedidos nuevos incompatibles |
| M4 productor | Flag por productor | Retirar tráfico del productor nuevo; no reactivar escritura V1 incompleta |
| M5 proyector | Namespace/flag de proyección | Volver a consultar proyección anterior, conservar la nueva y reconstruir desde canónico |
| M6 aliases | Flag por alias | Reactivar temporalmente lectura del alias específico, nunca su persistencia |

### Regla de seguridad

Si el sistema anterior no puede leer V2 con seguridad, el rollback correcto es pausar la función o la creación afectada, no producir pedidos V1. La continuidad comercial nunca justifica corromper el contrato.

### Disparadores de rollback

- pedido V2 persistido sin campo obligatorio;
- divergencia entre `estado` e `historial`;
- importes interpretados con unidad incorrecta;
- caída significativa de creación/aceptación/finalización;
- índice que ofrece un pedido no elegible;
- consumidor que no puede leer un pedido V2;
- aumento de errores geográficos o evidencia;
- conflicto no resuelto entre aliases V1.

### Recuperación

1. Desactivar el flag de la ola.
2. Preservar logs, ids afectados y métricas sin exponer datos personales.
3. Confirmar integridad de pedidos canónicos afectados.
4. Reconstruir proyecciones si corresponde.
5. Corregir y repetir pruebas en ambiente aislado.
6. Reanudar solo con aprobación de la misma puerta que autorizó la ola.

## Criterios para comenzar C5.2

- matriz C5.1 completamente verde;
- inventario ratificado;
- backup y restauración ensayados;
- plan de migración aprobado;
- rollback aprobado;
- métricas y flags diseñados;
- ninguna modificación funcional mezclada con la aprobación documental.

Este plan no autoriza despliegues. Define la secuencia y las salvaguardas que C5.2 deberá convertir primero en pruebas y después en implementación.
