# RUNBOOK_PANEL_UBICACION_MAPA.md

## Objetivo

Certificar la nueva experiencia de captura de ubicación en el panel administrativo basada en mapa, sin modificar el contrato del backend.

## Alcance

- Panel administrativo web.
- Captura de ubicación de pedidos manuales.
- Geocodificación y reverse geocoding en el formulario.
- Confirmación de ubicación con pin fijo en el centro.

## Fuera de alcance

- Android.
- Firebase RTDB.
- Firestore.
- Algoritmo de despacho.
- Contratos de API existentes.

## Contrato preservado

El panel debe seguir enviando los mismos campos técnicos que consume el backend:

- `cliente_lat`
- `cliente_lng`
- `tienda_lat`
- `tienda_lng`

## Precondiciones

- El panel carga correctamente en navegador.
- El usuario administrativo tiene sesión válida.
- La sección de ubicación del formulario está visible.
- El mapa carga sin bloquear el resto del formulario.

## Criterios de Aprobación

- El mapa carga sin errores de consola.
- La búsqueda de dirección centra el mapa.
- El pin permanece fijo en el centro.
- El reverse geocoding actualiza la dirección visible.
- Las coordenadas quedan ocultas al operador.
- `Confirmar ubicación` conserva la dirección y las coordenadas listas para envío.
- La creación de pedido mantiene el flujo operativo sin cambios.

## Casos de Prueba

### Caso 1: Inicialización

**Objetivo:** Verificar que el componente carga correctamente.

**Pasos:**

1. Abrir el panel administrativo.
2. Verificar que el mapa aparece en el bloque de ubicación.
3. Confirmar que el formulario sigue siendo funcional.
4. Revisar la consola del navegador.

**Resultado esperado:**

- Mapa visible.
- Sin errores JavaScript.
- Botones habilitados correctamente.

### Caso 2: Búsqueda de dirección

**Objetivo:** Validar geocodificación.

**Pasos:**

1. Escribir una dirección como `Ave La Coyote, Tuxtla Gutiérrez`.
2. Ejecutar la búsqueda.
3. Confirmar que el mapa se centra en el resultado.
4. Verificar que el pin permanece fijo.
5. Comprobar que la dirección visible se actualiza.
6. Confirmar que las coordenadas ocultas cambian.

**Resultado esperado:**

- El mapa se centra correctamente.
- La dirección encontrada aparece debajo del mapa.
- Las coordenadas se actualizan de forma automática.

### Caso 3: Ajuste manual

**Objetivo:** Validar reverse geocoding al mover el mapa.

**Pasos:**

1. Desplazar el mapa ligeramente.
2. Esperar a que termine el movimiento.
3. Verificar que la dirección cambia.
4. Confirmar que Reverse Geocoding responde.
5. Revisar que `lat/lng` cambian automáticamente.

**Resultado esperado:**

- La dirección visible cambia.
- Las coordenadas ocultas se actualizan.

### Caso 4: Usar mi ubicación

**Objetivo:** Validar captura por GPS del navegador.

**Pasos:**

1. Pulsar `Usar mi ubicación`.
2. Aceptar permisos si el navegador los solicita.
3. Verificar que el mapa se centra en la posición actual.
4. Confirmar que dirección y coordenadas se actualizan.

**Resultado esperado:**

- El mapa se centra automáticamente.
- La dirección actual se muestra.
- Las coordenadas quedan listas para enviar.

### Caso 5: Confirmar ubicación

**Objetivo:** Validar el cierre de captura.

**Pasos:**

1. Pulsar `Confirmar ubicación`.
2. Verificar que el estado de captura cambia a confirmado.
3. Confirmar que el resumen del pedido conserva la dirección.
4. Revisar que las coordenadas siguen listas para envío.

**Resultado esperado:**

- Estado confirmado.
- Resumen actualizado.
- Coordenadas listas para el payload.

### Caso 6: Crear pedido

**Objetivo:** Validar el envío al backend.

**Pasos:**

1. Completar cliente.
2. Completar productos.
3. Completar pago.
4. Crear el pedido.
5. Verificar que el pedido llega al backend.
6. Confirmar que la dirección y las coordenadas se conservan.

**Resultado esperado:**

- Pedido creado.
- Dirección correcta.
- Coordenadas enviadas.
- Backend sin cambios funcionales.

### Caso 7: Flujo completo

**Objetivo:** Validar continuidad operativa end-to-end.

**Pasos:**

1. Crear un pedido desde el panel.
2. Confirmar que aparece en Cocina.
3. Confirmar que el flujo de despacho continúa.
4. Confirmar que Android consume el mismo contrato.

**Resultado esperado:**

- Panel, backend, Firebase, Cocina y Android conservan la información.
- No hay pérdida de datos operativos.

## Criterio de Aprobación Final

La UX base se considera certificada cuando todos los casos anteriores pasan en navegador y en flujo operativo real.

## Indicador de Precisión

Este indicador se documenta por separado y no forma parte de la certificación base.

### Estados sugeridos

- `none`: no existen coordenadas válidas.
- `approximate`: hay coordenadas, pero la ubicación todavía no fue confirmada.
- `confirmed`: el operador confirmó el punto en el mapa.
- `gps`: la ubicación proviene del GPS del dispositivo.

### Regla de implementación

Centralizar la lógica en una sola función, por ejemplo:

```js
setLocationStatus("none")
setLocationStatus("approximate")
setLocationStatus("confirmed")
setLocationStatus("gps")
```

Esa función debe controlar:

- icono
- color
- texto
- mensaje

## Observaciones

- No agregar cambios adicionales antes de certificar la UX base.
- Si el proveedor de geocodificación cambia en el futuro, la abstracción actual debe permitir reemplazarlo sin reescribir el formulario.

## Historial de Cambios

- 2026-07-20: guía operativa creada para certificar la UX de ubicación del panel.

## Nota de Cierre

Verificación final realizada sobre el panel administrativo:

- el script del panel pasó verificación sintáctica;
- el bloque de ubicación con mapa, búsqueda y confirmación quedó enlazado;
- la documentación operativa quedó publicada en runbook y checklist;
- el contrato del backend permanece sin cambios.

## Pendiente de continuidad

La siguiente sesión debe continuar exactamente en estos puntos, ya confirmados en navegador:

- Al pulsar `Abrir en Maps` se duplica la pantalla o se abre una vista adicional. Ese comportamiento no debe ocurrir.
- Al usar `Confirmar ubicación`, el panel conserva la primera ubicación capturada y no toma la ubicación actualmente señalada en el mapa.
- El selector `Tienda` no actualiza el estado de captura como corresponde.
- Las coordenadas de tienda no se copian ni se habilitan correctamente.
- El botón de captura/confirmación para tienda no da acceso al flujo esperado.

Objetivo de la siguiente sesión:

1. Corregir la duplicación de pantalla al abrir Maps.
2. Hacer que `Confirmar ubicación` use la ubicación visible actual, no la primera captura.
3. Verificar que `Cliente` y `Tienda` cambien realmente el target de captura.
4. Habilitar la copia y confirmación de coordenadas para tienda.
5. Dejar ambos flujos, cliente y tienda, funcionando con el mismo contrato técnico pero con estado independiente.

## Cierre de Implementación

Se completó la implementación de la nueva experiencia de captura de ubicación basada en mapa para el panel administrativo. La interfaz reemplaza la captura manual de coordenadas por un flujo asistido mediante búsqueda de dirección, mapa interactivo y geocodificación, manteniendo intacto el contrato técnico con el backend (`cliente_lat`, `cliente_lng`, `tienda_lat`, `tienda_lng`).

La documentación operativa y la checklist de validación fueron incorporadas al repositorio.

Estado actual:

- implementación completada;
- verificación estática completada;
- certificación funcional en navegador pendiente.

El siguiente hito es ejecutar las pruebas en navegador para certificar carga del mapa, búsqueda de direcciones, reverse geocoding, `Usar mi ubicación`, `Confirmar ubicación` y creación completa del pedido.
