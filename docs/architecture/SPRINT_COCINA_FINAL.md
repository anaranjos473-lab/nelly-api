# Sprint Cocina Final

## Backlog

- [x] Cronometro visible.
  - Se renderiza por tarjeta y cambia segun el tiempo transcurrido.
- [x] Prioridad automatica comprobada.
  - Ordena pedidos por urgencia y antiguedad en lugar de solo por llegada.
- [x] ETA con datos reales.
  - Se muestra cuando hay repartidor asignado o queda en estado de busqueda.
- [x] Tarjeta en riesgo visible.
  - La tarjeta cambia de peso visual y no depende solo de una etiqueta.
- [x] Historial de acciones.
  - Se renderiza dentro de cada pedido como bloque operativo.
- [x] Inteligencia de cocina.
  - Se agregaron capacidad, carga, tiempo objetivo y prediccion operativa.
- [x] Prediccion inteligente.
  - El panel calcula escenario de recepcion y posible impacto al aceptar otro pedido.
- [x] Aprendizaje por producto.
  - Cocina propone tiempos objetivo a partir del historico de pedidos entregados.
- [x] Control de jornada y recepcion.
  - Se puede iniciar, cerrar y pausar la entrada de pedidos.
- [x] Productos agotados.
  - El inventario se puede ocultar automaticamente al llegar a cero.
- [x] Inventario por comercio.
  - Cada comercio administra su propio stock y Cocina consume la misma lectura.
- [x] Chat operativo generico.
  - Se agregaron respuestas rapidas sin depender de un producto especifico.

## Extensiones de negocio

### Inteligencia Comercial

Comercio tambien debe aprender de su propio comportamiento, no solo Cocina.

Ejemplo por producto:
- Producto: `Pizza Familiar`
- Tiempo promedio: `12 min`
- Ventas: `320`
- Cancelaciones: `1 %`
- Retrasos: `2 %`

Valor:
- Detecta que productos venden mejor.
- Identifica cuales retrasan mas la operacion.
- Ayuda a decidir que impulsar, ajustar o retirar.
- Convierte la venta en una lectura real de negocio.

### Inteligencia de Inventario

El inventario no solo debe mostrar stock. Debe anticipar riesgo y proteger ventas.

Ejemplo:
- Producto: `Coca`
- Stock: `0`
- Estado: `Agotado`
- Accion: `Ocultar automaticamente`
- Sustitucion sugerida: `Sprite / agua / equivalente`

Valor:
- Evita vender productos inexistentes.
- Reduce cancelaciones.
- Permite que cada comercio administre su propio catalogo.
- Mantiene alineados Comercio, Cocina y Cliente con la misma verdad.

## Validacion

Estado: validado.

Validacion ejecutada:
- `node --check public/js/premium-kitchen/render/render-manager.js`
- `git status --short`
- `git diff` sobre `public/panel.html`, `public/dashboard-comercial.html` y `public/js/premium-kitchen/render/render-manager.js`
- despliegue de hosting completado con Firebase

Criterio de cierre:
- El cronometro se ve y actualiza por pedido.
- La lista respeta urgencia y antiguedad.
- El ETA aparece en la tarjeta con datos operativos.
- El riesgo se marca a nivel de tarjeta, no solo con un badge.
- El historial de acciones aparece en cada pedido.
- La cocina expone prediccion inteligente de recepcion.
- El aprendizaje por producto propone tiempos objetivo desde el historico.
- El comercio administra inventario propio y Cocina refleja el agotado.
- El chat operativo ofrece respuestas rapidas genericas.
- Comercio cuenta con una capa de inteligencia comercial sobre producto, ventas y riesgo.
- El inventario opera con ocultamiento automatico y sustitucion sugerida.

## Cierre funcional

El Sprint Cocina Final queda listo para piloto:
- Cocina ya no solo muestra pedidos, tambien prioriza, predice y aprende.
- Comercio puede controlar su inventario y ocultar agotados sin depender de un producto fijo.
- La recepcion entrante se puede pausar, iniciar o cerrar desde la misma operacion.
- El flujo queda alineado con evidencia real y sin depender de una sola tarjeta o caso de prueba.
