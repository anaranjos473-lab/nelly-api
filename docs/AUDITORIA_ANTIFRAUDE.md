# Auditoría antifraude Nelly Delivery

## Resumen
La lógica antifraude valida que un pedido marcado como 'ENTREGADO' por el conductor realmente se haya entregado cerca del destino (cliente o tienda). Si la distancia entre la última ubicación GPS del conductor y el destino es mayor a 0.5 km, se marca como posible fraude.

## Flujo de validación
1. El agente escucha cambios en la colección 'pedidos' (en producción, vía Cloud Function o listener).
2. Cuando un pedido cambia a estado 'ENTREGADO', se obtiene:
   - Última ubicación GPS del conductor (RTDB)
   - Coordenadas de destino (cliente o tienda)
3. Se calcula la distancia usando la fórmula de Haversine.
4. Si la distancia > 0.5 km:
   - Se marca el pedido con alertaFraude y notas de auditoría.
   - Se puede pausar al conductor (estado EN_REVISION).
5. Si la distancia <= 0.5 km, la entrega se considera legítima.

## Pruebas unitarias
- El archivo `tests/antifraude.test.js` cubre:
  - Entrega legítima
  - Fraude (distancia > 0.5 km)
  - GPS faltante
  - Destino faltante

## Ejecución local
Puedes probar la lógica sin Cloud Functions usando:
- `node test-trigger-agenteAntifraude.js` (simulación manual)
- `npm test` para pruebas automatizadas

## Producción
Para despliegue en Firebase Cloud Functions, es necesario el plan Blaze.

---

# Errores en tests de API

## Diagnóstico
- Los tests de usuarios, órdenes y soporte fallan por rutas 404 (no encontradas).
- Ejemplo de error: `Route /soporte/verificar-token not found`.

## Causas posibles
- El servidor Express no está corriendo al ejecutar los tests.
- Las rutas no están definidas o no están correctamente importadas en app.js/router.js.
- El entorno de test no inicializa la app correctamente.

## Siguiente paso sugerido
1. Verificar que app.js y router.js incluyan y exporten todas las rutas necesarias.
2. Asegurarse de que los tests inicialicen la app antes de hacer peticiones.
3. Revisar si los endpoints existen y están activos en el backend.

¿Quieres que revise y corrija la definición/importación de rutas en app.js y router.js?