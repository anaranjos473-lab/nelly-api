# OFFICIAL SYSTEM MAP V1

## Runtime Oficial
- `server.js`
- `↓`
- `app.js`

## Creación de pedidos
- `POST /api/ordenes`
- `↓`
- `ordersController.js`

## Despacho
- `/api/delivery`
- `↓`
- `delivery.js`

## RTDB Oficial
- `pedidos`
- `pedidos_para_reparto`
- `pedidos_en_camino`

## Panel Admin/Cocina
- `public/panel.html`

## Panel Repartidor
- `public/repartidor.html`

## Estado de los archivos legacy
- `app_fixed.js`: LEGACY / NO USAR / NO DESPLEGAR
- `routes/pedidos.js`: Router legado / compatibilidad - No usar para nuevas implementaciones
