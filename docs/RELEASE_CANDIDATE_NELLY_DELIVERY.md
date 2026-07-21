# Release Candidate - Nelly Delivery

## Objetivo

Certificar de forma integral la version candidata de Nelly Delivery antes de abrir desarrollo de nuevas funciones.

## Fase 1 - Linea base estable

- Crear una linea base estable del estado certificado actual.
- Crear una etiqueta Git de referencia, por ejemplo:
  - v0.17.0
- Usar esa etiqueta como referencia para comparaciones futuras y regresiones.
- Confirmar que la documentacion y el tag correspondan al repositorio correcto.
- Evitar mezclar la rama del backend con la rama de Android; si el flujo usa `main` en backend y `master` o `main` en Android, debe registrarse por repositorio.

## Fase 2 - Regresion completa de NellyDriver

### RC1 - Regresion consecutiva de NellyDriver

Antes de crear la etiqueta `v0.17.0`, conviene completar la certificacion E2E con el backend desplegado y varios pedidos nuevos creados despues del ultimo deploy.

Ejecutar al menos tres pedidos nuevos, en secuencia:

1. Pedido 1: publicar -> mostrar -> aceptar -> iniciar -> finalizar -> limpiar.
2. Pedido 2: repetir inmediatamente con el mismo repartidor.
3. Pedido 3: repetir despues de cerrar y abrir nuevamente la app.

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

Tambien revisar en pantalla:

- El Radar vuelve a activarse despues de cada entrega.
- No quedan botones o estados residuales de un pedido anterior.
- El cronometro inicia y termina correctamente.
- Las ganancias no se duplican.
- Los sonidos y mensajes aparecen una sola vez.
- Un pedido vencido no reaparece.
- La app reconstruye el estado correctamente tras reiniciarla.

Solo despues de superar esta regresion conviene:

- Crear la etiqueta `v0.17.0`.
- Generar el APK/AAB de Release Candidate.
- Registrar el commit exacto de Android y backend.
- Iniciar el piloto controlado.

Antes de abrir el piloto, validar tambien:

- Presupuesto mensual de Google Cloud con alertas activas.
- API keys restringidas por plataforma y servicio.
- APIs de Google Maps Platform limitadas a las que realmente usa el producto.
- No hacer consultas repetitivas de geocodificacion, rutas o autocomplete si no aportan valor operativo.
- Mantener el backend como fuente de verdad y dejar a Android solo como reflejo del estado.

### Criterios de exito

- No aparecen regresiones de estado.
- La transicion entre estados es consistente.
- La experiencia del repartidor permanece estable en multiples pedidos consecutivos.

## Fase 3 - Validacion visual

Revisar que la interfaz muestre correctamente:

- Estados del pedido.
- Cronometro.
- Ganancias.
- Transiciones de pantallas.
- Mensajes y sonidos.

## Fase 4 - Preparacion para Play Store

Antes de publicar, verificar:

- Version (`versionCode` y `versionName`).
- Iconos y nombre de la aplicacion.
- Permisos.
- Configuracion de firma definitiva.

## Fase 5 - Prueba piloto

Ejecutar pruebas con pedidos reales durante varios dias para detectar problemas que no emergen en pruebas controladas.

## Recomendacion inmediata

Priorizar la regresion completa del flujo de Android, ya que es la mejor forma de detectar errores de estado, sincronizacion e interfaz que no aparecen con una sola entrega.

## Resultado esperado

Obtener una Release Candidate solida, estable y lista para preparacion de publicacion en Play Store.
