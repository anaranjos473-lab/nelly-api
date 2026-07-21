# CHECKLIST_PANEL_UBICACION_MAPA.md

## Checklist Operativo

### 1. Carga del mapa

- Abrir el panel administrativo.
- Verificar que el mapa aparezca en el bloque de ubicación.
- Confirmar que no haya errores JavaScript en consola.
- Confirmar que el formulario siga respondiendo.

### 2. Búsqueda de dirección

- Escribir una dirección como `Ave La Coyote, Tuxtla Gutiérrez`.
- Ejecutar la búsqueda.
- Verificar que el mapa se centre.
- Verificar que el pin permanezca fijo en el centro.
- Confirmar que la dirección visible se actualice.
- Confirmar que las coordenadas ocultas cambien.

### 3. Ajuste manual

- Mover ligeramente el mapa.
- Confirmar que la dirección visible cambie.
- Confirmar que Reverse Geocoding responda.
- Verificar que `lat/lng` cambien automáticamente.

### 4. Usar mi ubicación

- Pulsar `Usar mi ubicación`.
- Aceptar permisos si el navegador los solicita.
- Verificar que el mapa se centre en la posición actual.
- Confirmar que dirección y coordenadas se actualicen.

### 5. Confirmar ubicación

- Pulsar `Confirmar ubicación`.
- Verificar que el estado cambie a confirmado.
- Confirmar que el resumen conserve la dirección.
- Verificar que las coordenadas queden listas para envío.

### 6. Crear pedido

- Completar cliente.
- Completar productos.
- Completar pago.
- Crear el pedido.
- Verificar que el pedido llegue al backend.
- Confirmar que la dirección y las coordenadas se conserven.

### 7. Flujo completo

- Confirmar que el pedido aparezca en Cocina.
- Confirmar que el flujo de despacho continúe.
- Confirmar que Android consuma el mismo contrato.

## Aprobación

- Todos los puntos anteriores deben pasar.
- No debe haber pérdida de información.
- El backend no debe cambiar.

