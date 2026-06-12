# Nelly Delivery – Próximos pasos inmediatos

## Estado actual

- RTDB-Only Operacional: APROBADO
- Field Trial Controlado: APROBADO
- Producción Controlada: APROBADA
- RTDB-Only Absoluto: PENDIENTE

## Prioridad 1 – Validación E2E

Tablero rector: `CERTIFICATION_DASHBOARD.md`.

### Escenario 1
Cliente crea pedido

Validar:

- Aparición en Cocina
- Aparición en Dashboard
- Persistencia en RTDB

### Escenario 2
Cocina marca listo

Validar:

- Movimiento a pedidos_para_reparto
- Visibilidad para conductores

### Escenario 3
Conductor acepta

Validar:

- Cambio de estado
- Asignación correcta
- Telemetría ORDER_ACCEPTED

### Escenario 4
Pedido en camino

Validar:

- Tracking en repartidores_activos
- Actualización en Cliente

### Escenario 5
Entrega

Validar:

- Estado entregado
- Auditoría antifraude
- Telemetría ORDER_DELIVERED

## Prioridad 2 – Resiliencia

### Pérdida de red
Validar:

- NETWORK_LOST
- ROOM_SYNC_STARTED

### Recuperación
Validar:

- NETWORK_RESTORED
- ROOM_SYNC_FINISHED

## Prioridad 3 – Stress Test
Ejecutar:

- 100 pedidos
- 250 pedidos
- 500 pedidos

Medir:

- Latencia
- Consumo RTDB
- Errores
- Recuperación

## Prioridad 4 – Limpieza Final
Pendientes:

- usersController.js
- subirEvidencia.js
- test_evidencia.js

Clasificación:

- Administrativo
- Pruebas
- No bloqueantes

## Go / No-Go
GO:

- E2E completo exitoso
- Tracking estable
- Telemetría correcta
- Sin desincronización

NO-GO:

- Estados inconsistentes
- Pérdida de pedidos
- Tracking incorrecto
- Errores de sincronización
