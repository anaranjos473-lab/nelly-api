# STRESS_TEST_REPORT

## Objetivo
Medir la capacidad real del ecosistema Nelly Delivery bajo cargas crecientes.

## Criterios de aprobación
- Al menos 95% de pedidos procesados
- Sin errores críticos de sincronización
- Latencia y consumo RTDB dentro de límites aceptables

## Nivel 1 — 100 pedidos
- Carga ejecutada: 100 pedidos
- Métricas capturadas:
  - CPU: No medido automáticamente en el script.
  - RAM: No medido automáticamente en el script.
  - Consumo RTDB: No medido automáticamente en el script.
  - Tiempo de despacho promedio: No disponible directamente sin métricas adicionales.
- Resultado:
  - Pedidos procesados: 100 sembrados y limpiados correctamente.
  - Errores: Endpoint admin reportó 50 errores en 125 solicitudes concurrentes.
  - Notas: El stress de 100 pedidos mostró un error rate de 40% en el endpoint admin; la plataforma requiere revisión de la ruta de consulta /api/admin/repartidores bajo carga.

## Nivel 2 — 250 pedidos
- Carga ejecutada: 250 pedidos
- Métricas capturadas:
  - CPU: No medido automáticamente en el script.
  - RAM: No medido automáticamente en el script.
  - Consumo RTDB: No medido automáticamente en el script.
  - Tiempo de despacho promedio: No disponible directamente sin métricas adicionales.
- Resultado:
  - Pedidos procesados: 250 sembrados y limpiados correctamente.
  - Errores: 0 errores en 125 solicitudes concurrentes.
  - Notas: El endpoint admin respondió al 100% bajo esta carga con p95 de 561 ms.

## Nivel 3 — 500 pedidos
- Carga ejecutada: 500 pedidos
- Métricas capturadas:
  - CPU: No medido automáticamente en el script.
  - RAM: No medido automáticamente en el script.
  - Consumo RTDB: No medido automáticamente en el script.
  - Tiempo de despacho promedio: No disponible directamente sin métricas adicionales.
- Resultado:
  - Pedidos procesados: 500 sembrados y limpiados correctamente.
  - Errores: 0 errores en 125 solicitudes concurrentes.
  - Notas: El endpoint admin mantuvo 0% de error; p95 fue 744 ms y p99 2232 ms.

## Resultado global
- Nivel de aprobación: Condicional.
- Recomendación: Revisar la indeterminación observada en el test de 100 pedidos y repetir con métricas de infraestructura (CPU/RAM/RTDB) para validar capacidad. Los tests de 250 y 500 pedidos fueron exitosos en endpoint carga concurrente.
