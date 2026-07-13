# MANIFIESTO NELLY DELIVERY

## Fase C4 - Geonavegacion operativa

Fecha de inicio: 2026-07-13

### Mision

Convertir la aplicacion del repartidor en un copiloto: mostrar donde esta, indicar el siguiente destino y permitir las llegadas solamente dentro de la geocerca operativa.

### Frontera congelada

Durante C4 no se modifican backend de pedidos, flujo de estados, evidencias, Admin, Cocina, RTDB, contrato de pedidos ni fallback Base64. Solo se permiten cambios de GPS, mapas, coordenadas, rutas, ETA, geocercas y navegacion.

## Matriz de certificacion

| Casilla | Estado actual | Evidencia disponible | Falta para PASS |
|---|---|---|---|
| 1. Contrato de ubicacion | Pendiente de campo | Android rechaza ofertas sin pares de coordenadas operativas; `Pedido` contiene direcciones de tienda y cliente | Auditar un pedido nacido por el flujo oficial y demostrar origen/destino con lat, lng y direccion |
| 2. Motor de mapa | Pendiente de mision | Google Maps y ubicacion real del conductor validados visualmente en Motorola; APK muestra marcadores simultaneos y encuadre de los tres puntos cuando hay pedido | Captura con un pedido oficial y los tres puntos visibles |
| 3. Navegacion | Pendiente de mision | Motor Directions implementado desde ubicacion actual; destino tienda en recoleccion y cliente desde `PEDIDO_ABORDO`; refresco cada 100 m o 2 minutos | Demostrar polilinea real y cambio tienda -> cliente |
| 4. Validacion GPS | Pendiente de campo | Politica pura de 80 m integrada; botones de llegada bloqueados sin GPS o fuera de geocerca; cuatro pruebas unitarias verdes | Intento real fuera de geocerca bloqueado e intento dentro de geocerca permitido para tienda y cliente |

Ninguna casilla se marca verde solo por revision de codigo o compilacion.

## Incremento C4.1 - Base geografica

Cambios Android limitados al modulo geografico:

- `C4GeoPolicy.kt`
  - valida coordenadas;
  - calcula distancia Haversine;
  - aplica radio estricto menor a 80 m;
  - bloquea cuando no existe ubicacion GPS o el destino es invalido.
- `DriverDashboardScreen.kt`
  - mantiene visibles los marcadores de tienda y cliente;
  - conserva la ubicacion actual mediante Google Maps;
  - encuadra conductor, tienda y cliente;
  - deshabilita `YA ESTOY EN LA TIENDA` y `LLEGUE CON EL CLIENTE` cuando la geocerca no da PASS;
  - muestra distancia o motivo del bloqueo.
- `C4GeoPolicyTest.kt`
  - permite dentro de 80 m;
  - bloquea fuera de 80 m;
  - bloquea sin GPS;
  - bloquea destino invalido.

Validacion local: `testDebugUnitTest assembleDebug` con resultado `BUILD SUCCESSFUL`.

Validacion en Motorola: APK instalada, Google Maps activo y punto azul de ubicacion real visible sin fallos. No habia pedido activo, por lo que esta evidencia no certifica aun los marcadores de tienda/cliente.

## Incremento C4.2 - Navegacion dinamica

- La ruta se solicita a Google Directions desde la ubicacion actual del conductor.
- `EN_CURSO` y `LLEGUE_A_TIENDA` apuntan a la tienda.
- `PEDIDO_ABORDO` y `LLEGUE_A_CLIENTE` apuntan al cliente.
- Al cambiar el destino se descarta la ruta anterior.
- La ruta se refresca al avanzar 100 m o al cumplir dos minutos.
- Sin mision activa no se traza una ruta.
- La suite C4 paso de cuatro a siete pruebas unitarias y la APK volvio a compilar correctamente.

Commit Android: `904cf2c Add C4 dynamic route destination`.

## Secuencia de trabajo controlada

1. Certificar C4.1 en Motorola sin ubicacion simulada.
2. Registrar evidencia de los tres puntos del mapa.
3. Intentar llegada fuera de 80 m y comprobar bloqueo.
4. Repetir dentro de 80 m y comprobar habilitacion.
5. Solo despues implementar C4.2: ruta real a la tienda.
6. Validar cambio automatico de ruta al cliente sin escribir direcciones manualmente.
7. Ejecutar un piloto con un repartidor y un restaurante.

## Evidencia requerida del piloto

Por pedido se registrara hora de creacion, aceptacion, llegada a tienda, salida, llegada al cliente, distancia recorrida, tiempo total, calidad GPS, red e incidentes. No se alterara el contrato del pedido para obtener esta evidencia; se usaran registros y telemetria geografica existentes mientras C4 mantenga congelado C3.

## Definition of Done

C4 termina exclusivamente con cuatro evidencias de campo verdes:

- todos los pedidos del piloto nacen con coordenadas y direcciones validas;
- mapa con conductor, tienda y cliente;
- ruta que cambia automaticamente de tienda a cliente;
- llegadas bloqueadas fuera de geocerca y habilitadas dentro de ella.
