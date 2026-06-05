# Auditoría Final de Arquitectura de Datos: Fase Alfa

## 1. Nodos a Eliminar (Deprecados)

| Nodo / Colección | Archivos que aún lo leen o escriben | Acción Requerida |
|---|---|---|
| \pedidos_activos\ (RTDB) | public/admin-dashboard.html, public/js/admin-dashboard.js, outes/admin.js, 	ests/ | Migrar escrituras/lecturas a \pedidos\ con \estado: pendiente\ |
| \pedidos_para_reparto\ (RTDB) | public/panel.html, public/repartidor.html, outes/delivery.js | Migrar escrituras/lecturas a \pedidos\ con \estado: listo\ |
| \pedidos_en_camino\ (RTDB) | public/panel.html, outes/delivery.js, \pp_fixed.js\ (Tracking/ETA) | Migrar escrituras/lecturas a \pedidos\ con \estado: en_camino\ |
| \orders\ (Firestore) | \src/controllers/ordersController.js\ | Deprecar en favor del backend Node leyendo \pedidos\ (RTDB) |
| \pedidos\ (Firestore) | \pp.js\, \outer.js\, \public/js/logistica-maps.js\, \src/agentes/agenteAntifraude.js\ | Deprecar; Firestore solo se usará para usuarios (si aplica) o nada. |

## 2. Nueva Arquitectura: Fuente Única de Verdad (Single Source of Truth)

Todo el flujo operativo de Nelly leerá y escribirá **exclusivamente** en el nodo \pedidos\ de Realtime Database.

**Máquina de Estados Unificada:**
*   \pendiente\: Creado por Admin o Cliente. Esperando en cocina.
*   \cocina\: En preparación.
*   \listo\: Terminado. Listo para que un repartidor lo tome.
*   \signado\: Repartidor asignado, en camino al restaurante.
*   \en_camino\: Recogido, en ruta al cliente.
*   \entregado\: Entregado al cliente. Genera finanzas.
*   \cancelado\: Cancelado por Admin o Soporte.
