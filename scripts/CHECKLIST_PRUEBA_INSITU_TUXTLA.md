# Checklist Operativo de Prueba In-Situ (Tuxtla)

## 1) Asignar claims de repartidor
Ejecuta uno de estos comandos:

```bash
node scripts/set-driver-claims.js UID_REPARTIDOR_1 UID_REPARTIDOR_2 UID_REPARTIDOR_3
```

```bash
DRIVER_UIDS=UID_REPARTIDOR_1,UID_REPARTIDOR_2 node scripts/set-driver-claims.js
```

Si no usas FIREBASE_ADMIN_JSON, indica la ruta de credenciales:

```bash
node scripts/set-driver-claims.js --service-account=./serviceAccountKey.json UID_REPARTIDOR_1
```

## 2) Obtener idToken del repartidor
- Opcion A: El repartidor cierra sesion y vuelve a iniciar en la app, luego comparte su idToken temporal para prueba.
- Opcion B: Obtener idToken con flujo controlado desde herramientas internas.

## 3) Probar endpoint de ubicacion

```bash
curl -X POST https://nelly-api-8lh1.onrender.com/api/delivery/update-location \
-H "Authorization: Bearer INSERTA_TU_ID_TOKEN_AQUI" \
-H "Content-Type: application/json" \
-d '{
  "lat": 16.7527,
  "lng": -93.1167,
  "pedidoId": "PEDIDO_TEST_TUXTLA_001"
}'
```

## 4) Validar respuesta esperada
Debe responder:

```json
{"status":"Location updated"}
```

## 5) Verificar en Firebase Realtime Database
- repartidores/{UID}/currentLocation con lat, lng y updatedAt.
- pedidos_en_camino/PEDIDO_TEST_TUXTLA_001/driverLocation con lat, lng, driverUid y updatedAt.

## Semaforo de riesgos
- 403 en endpoint: el usuario no tiene claim driver=true o role=repartidor.
- Claims no reflejados: refrescar sesion (logout/login) o forzar refresh de token.
- Latencia por alta frecuencia: monitorear logs de Render y ajustar frecuencia de reporte en app (ej. 15-30s).
