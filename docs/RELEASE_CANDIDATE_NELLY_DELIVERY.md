# Release Candidate — Nelly Delivery

> Estado: documento histórico / congelado.  
> La referencia operativa actual para piloto es `release/pilot-1.0` y la release `pilot-ready`.

## Objetivo

Certificar de forma integral la versión candidata de Nelly Delivery antes de abrir desarrollo de nuevas funciones.

## Fase 1 — Línea base estable

- Crear una línea base estable del estado certificado actual.
- Crear una etiqueta Git de referencia, por ejemplo:
  - v0.17.0
- Usar esa etiqueta como referencia para comparaciones futuras y regresiones.
- Confirmar que la documentación y el tag correspondan al repositorio correcto.
- Evitar mezclar la rama del backend con la rama de Android; si el flujo usa `main` en backend y `master` o `main` en Android, debe registrarse por repositorio.

## Fase 2 — Regresión completa de NellyDriver

### RC1 — Regresión consecutiva de NellyDriver

Antes de crear la etiqueta `v0.17.0`, conviene completar la certificación E2E con el backend desplegado y varios pedidos nuevos creados después del último deploy.

Ejecutar al menos tres pedidos nuevos, en secuencia:

1. Pedido 1: publicar → mostrar → aceptar → iniciar → finalizar → limpiar.
2. Pedido 2: repetir inmediatamente con el mismo repartidor.
3. Pedido 3: repetir después de cerrar y abrir nuevamente la app.

En cada pedido validar:

- `estado = ENTREGADO`
- `estado_pedido = ENTREGADO`
- `logistica.estado = ENTREGADO`
- `pedido_activo = null`
- `pedidos_en_camino` limpio
- `pedidos_para_reparto` limpio
- El repartidor vuelve a `DISPONIBLE`
- `ganancia_hoy` acumula una sola vez
- Sin `Permission denied`
- Sin oferta residual

También revisar en pantalla:

- El Radar vuelve a activarse después de cada entrega.
- No quedan botones o estados residuales de un pedido anterior.
- El cronómetro inicia y termina correctamente.
- Las ganancias no se duplican.
- Los sonidos y mensajes aparecen una sola vez.
- Un pedido vencido no reaparece.
- La app reconstruye el estado correctamente tras reiniciarla.

Solo después de superar esta regresión conviene:

- Crear la etiqueta `v0.17.0`.
- Generar el APK/AAB de Release Candidate.
- Registrar el commit exacto de Android y backend.
- Iniciar el piloto controlado.

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
