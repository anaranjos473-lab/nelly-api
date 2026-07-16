# Release Candidate — Nelly Delivery

## Objetivo

Certificar de forma integral la versión candidata de Nelly Delivery antes de abrir desarrollo de nuevas funciones.

## Fase 1 — Línea base estable

- Crear una línea base estable del estado certificado actual.
- Crear una etiqueta Git de referencia, por ejemplo:
  - v0.17.0
- Usar esa etiqueta como referencia para comparaciones futuras y regresiones.

## Fase 2 — Regresión completa de NellyDriver

Validar el flujo completo de entrega en varias ejecuciones consecutivas:

1. Publicar un pedido.
2. Mostrarlo en el Radar.
3. Aceptarlo desde un repartidor.
4. Iniciar la entrega.
5. Finalizar la entrega.
6. Verificar que `ganancia_hoy` se acumula correctamente.
7. Confirmar que el repartidor vuelve a quedar disponible para recibir otro pedido.

### Criterios de éxito

- No aparecen regresiones de estado.
- La transición entre estados es consistente.
- La experiencia del repartidor permanece estable en múltiples pedidos consecutivos.

## Fase 3 — Validación visual

Revisar que la interfaz muestre correctamente:

- Estados del pedido.
- Cronómetro.
- Ganancias.
- Transiciones de pantallas.
- Mensajes y sonidos.

## Fase 4 — Preparación para Play Store

Antes de publicar, verificar:

- Versión (`versionCode` y `versionName`).
- Iconos y nombre de la aplicación.
- Permisos.
- Configuración de firma definitiva.

## Fase 5 — Prueba piloto

Ejecutar pruebas con pedidos reales durante varios días para detectar problemas que no emergen en pruebas controladas.

## Recomendación inmediata

Priorizar la regresión completa del flujo de Android, ya que es la mejor forma de detectar errores de estado, sincronización e interfaz que no aparecen con una sola entrega.

## Resultado esperado

Obtener una Release Candidate sólida, estable y lista para preparación de publicación en Play Store.
