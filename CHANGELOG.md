# Changelog - Nelly Delivery (API & Driver)

## [4.0.1-PILOTO] - 2026-07-09
### 🧩 Ajuste de Contrato Admin y Pedido Manual
- Refactorizado `POST /api/admin/pedidos` para exigir payload completo de pedido manual.
- Validación estricta de `items`, `subtotal`, `costo_envio`, `propina`, `total` y `pago`.
- Guardado de pedidos admin con `origen: 'panel_admin'`, `logistica.estado: 'pendiente'` y campos de estado canonizados.
- Actualizada UI de panel admin para capturar ítems, subtotal, envío, propina, método de pago y total calculado.
- Prueba `tests/admin-order-contract.test.js` actualizada y verificada.

## [4.0.0-PRO] - 2026-05-09
### 🚀 Añadido (Sistema Multi-Agente Autónomo)
- **Agente de Despacho (`agenteDespacho.js`)**: Implementación de asignación geoespacial inteligente utilizando `worker_threads` y la fórmula de Haversine para cálculos de proximidad sin bloquear el hilo principal.
- **Agente Financiero (`agenteTarifaDinamica.js`)**: Motor de rentabilidad con algoritmo de oferta/demanda que muta los multiplicadores de tarifa en tiempo real (ciclo de 3 minutos).
- **Agente Antifraude (`agenteAntifraude.js`)**: Sistema de telemetría y seguridad que audita las coordenadas GPS de las entregas, bloqueando operaciones con una desviación mayor a 500 metros.
- **Agente de Soporte (`agenteSoporte.js`)**: Sistema de retención automática que inyecta compensaciones a pedidos demorados (>15 min) y gestiona reasignaciones inmediatas en caso de percance en ruta.

### 🛡️ Seguridad & Infraestructura
- Creación de índices compuestos en Firestore para optimización de consultas complejas (estado + timestamp).
- Cierre de vulnerabilidades en Realtime Database y estructuración segura de `conductores_activos`.
- Implementación de la constante global `ID_CONDUCTOR_GLOBAL` para pruebas de flujo cerrado.
- Optimización de despliegue en Render (Node.js v22.16.0) aplicando el "Protocolo Fantasma" para minimizar escrituras y optimizar costos en la capa Firebase Spark.
