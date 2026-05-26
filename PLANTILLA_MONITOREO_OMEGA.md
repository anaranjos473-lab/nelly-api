# Plantilla de Monitoreo – Sincronía Omega

## 1. Monitoreo de Túneles y Handshake
- [ ] Dashboard en tiempo real de pedidos asignados y recibidos por la app.
- [ ] Alerta automática si un pedido asignado no es recibido en la app en <30s.
- [ ] Log de handshakes exitosos y fallidos.

## 2. Auditoría de Estados
- [ ] Script que recorra todos los repartidores y verifique:
    - Si está "Disponible" no debe tener pedido asignado.
    - Si tiene pedido, su estado debe ser EN_REPARTO o ENTREGADO.
    - Si hay desincronía, registrar alerta y detalles.

## 3. Validación Financiera
- [ ] Comparar automáticamente el nodo ganancias_hoy vs. reportes de cierre.
- [ ] Alerta si hay diferencia >$1 entre ambos extremos.

## 4. Radar y Feedback
- [ ] Validar que cada cambio de estado en la app se refleje en el radar en <1s.
- [ ] Proteger el renderizado ante datos corruptos (coordenadas inválidas, etc).

## 5. Logs y Backups
- [ ] Logs de handshakes, cambios de estado y auditoría financiera.
- [ ] Backups automáticos diarios de nodos críticos.

---

**Revisar este checklist cada semana y tras cada release.**
