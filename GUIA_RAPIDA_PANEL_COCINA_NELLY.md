# Guía Rápida: Panel de Control - Cocina Nelly

Este manual describe el funcionamiento del panel desplegado en el commit 8fa27b6.

## 1) Indicadores Principales

### Ganancias Hoy
Muestra la suma total de los pedidos finalizados exitosamente.

Se actualiza automáticamente cada vez que un repartidor confirma una entrega con foto.

### Pedidos en Cola
Indica cuántas solicitudes están esperando a ser aceptadas por un repartidor en Tuxtla.

### Sistema Online (botón verde)
Si está en verde, la conexión con Firebase es estable.

Si cambia a rojo, revisa la conexión a internet y recarga el panel.

## 2) Ciclo de Vida del Pedido en Pantalla

| Estado | Acción en Cocina | Lo que ve el Repartidor |
|---|---|---|
| Nuevo (Cola) | Preparar el platillo de inmediato. | El pedido aparece como DISPONIBLE en su app. |
| En Camino | El pedido desaparece de la lista principal. | El repartidor ya lo aceptó y va hacia el cliente. |
| Finalizado | El monto se suma a Ganancias Hoy. | El repartidor subió evidencia y el cliente recibió su comida. |

## 3) Solución de Problemas (Troubleshooting)

### ¿No aparecen pedidos nuevos?
Presiona F5.

El bridge de Firebase reconectará automáticamente los WebSockets.

### ¿El monto de Ganancias Hoy no sube?
El monto solo se actualiza cuando el repartidor termina el flujo completo en la app.

Verifica que los repartidores usen la versión alineada al flujo actual del panel.

## 4) Nota Operativa

Si el estado del sistema permanece en rojo más de 30 segundos:
1. Confirma conectividad local.
2. Verifica autenticación de Firebase.
3. Revisa la consola del navegador para errores de sincronización.
