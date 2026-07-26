# CHECKLIST DE ALTA DE RESTAURANTES PARA PILOTO V1

**Estado:** Checklist operativa  
**Ambito:** Ejecucion del alta controlada de restaurantes  
**Fecha:** 2026-07-26  
**Referencia base:** `ALTA_RESTAURANTES_PILOTO_V1.md`  
**Referencia operativa:** `RC2_PILOTO_CONTROLADO_V1.md`

## 1. Proposito

Dejar una secuencia corta y verificable para ejecutar el alta de un restaurante sin perder control ni trazabilidad durante el piloto.

## 2. Checklist de inicio

- [ ] El restaurante fue registrado como prospecto en CRM.
- [ ] Existe validacion de negocio y ubicacion.
- [ ] El administrador aprobo el alta.
- [ ] El Panel Administrativo esta accesible.
- [ ] El responsable del restaurante fue identificado.
- [ ] El canal de soporte fue confirmado.

## 3. Checklist de alta

- [ ] Nombre comercial capturado.
- [ ] Responsable capturado.
- [ ] Telefono y WhatsApp capturados.
- [ ] Correo capturado.
- [ ] Direccion capturada.
- [ ] Coordenadas capturadas.
- [ ] Horario capturado.
- [ ] Comision definida.
- [ ] Zona de cobertura definida.
- [ ] Estado inicial definido.

## 4. Checklist de acceso

- [ ] Usuario del restaurante creado.
- [ ] Rol asignado como `Restaurante`.
- [ ] Contrasena temporal generada.
- [ ] Primer ingreso confirmado.
- [ ] Cambio de contrasena completado.
- [ ] Aceptacion de terminos completada.

## 5. Checklist de configuracion

- [ ] Menu inicial cargado.
- [ ] Categorias cargadas.
- [ ] Tiempo promedio de preparacion definido.
- [ ] Metodos de pago definidos.
- [ ] Disponibilidad confirmada.

## 6. Checklist de prueba

- [ ] Pedido interno creado.
- [ ] El pedido llego a cocina.
- [ ] El pedido cambio estados correctamente.
- [ ] El pedido entro al pool.
- [ ] Un repartidor lo acepto.
- [ ] El pedido se entrego.
- [ ] Finanzas se actualizaron.
- [ ] CRM se actualizo.
- [ ] No quedaron incidencias bloqueantes.

## 7. Dictamen

| Resultado | Criterio |
| --- | --- |
| APROBADO | El restaurante puede activarse como `Operativo`. |
| APROBADO CON OBSERVACIONES | El restaurante puede activarse, pero queda seguimiento documentado. |
| NO APROBADO | El restaurante no se activa hasta corregir hallazgos. |

## 8. Cierre

La checklist se considera ejecutada cuando todos los campos obligatorios tienen evidencia y el dictamen fue emitido.

## 9. Historial

- 2026-07-26: Se crea la checklist operativa para altas de restaurantes del piloto.
