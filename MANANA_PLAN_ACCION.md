# MAÑANA — Plan de Acción Inmediata

## FASE 1: Certificación (Mañana 10:00–10:30)

### Objetivo
Validar que un pedido real completa el ciclo: Admin crea → Driver recibe → Acepta → Entrega → Cierra.

### Pedido de prueba
```
ID: PED_TEST_REAL_001
Cliente: Test Driver
Monto: $50.00
```

---

## Paso 1 (10:00) — Admin crea pedido

**Acción:**
```bash
curl -X POST http://localhost:3001/api/admin/pedidos \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Test Driver",
    "telefono": "5555551234",
    "direccion": "Calle Test 123",
    "monto": 50.00,
    "descripcion": "Test Order for PHASE 1 Certification"
  }'
```

**Validar:**
```
✅ Response: 201, {"ok": true, "id": "PED_TEST_REAL_001", ...}
✅ RTDB: pedidos/PED_TEST_REAL_001 existe
✅ Estado: "pendiente"
```

---

## Paso 2 (10:05) — Cocina marca "Listo"

**Acción:**
```bash
curl -X POST http://localhost:3001/api/admin/pedidos/PED_TEST_REAL_001/listo \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Validar:**
```
✅ Response: 200, {"ok": true, ...}
✅ RTDB: pedidos/PED_TEST_REAL_001 estado = "LISTO"
✅ RTDB: pedidos_para_reparto/PED_TEST_REAL_001 existe
✅ Estado en ambos: "LISTO"
```

---

## Paso 3 (10:10) — Driver abre app

**Acción:**
- Abrir Nelly Driver en Motorola
- Esperar sincronización (~3-5 seg)
- Ir a "Misiones Activas"

**Validar:**
```
✅ Pantalla muestra: "PED_TEST_REAL_001"
✅ Cliente: "Test Driver"
✅ Monto: "$50.00"
✅ Se reproduce sonido de notificación
✅ RTDB listener activo en: conductores_activos/$uid/last_sync
```

---

## Paso 4 (10:15) — Driver acepta

**Acción:**
- Toca botón "Aceptar" sobre el pedido

**Validar:**
```
✅ Pantalla cambia a: "Detalles de Entrega"
✅ Muestra: dirección, cliente, monto
✅ RTDB: pedidos_en_camino/PED_TEST_REAL_001 creado
✅ Estado: "EN_CAMINO"
✅ repartidores/$uid/pedido_activo = "PED_TEST_REAL_001"
```

---

## Paso 5 (10:18) — GPS reporta (automático)

**Validar:**
```
✅ RTDB: conductores_activos/$uid actualizado
✅ Timestamp reciente (< 5 seg)
✅ Lat/Lng presentes
```

---

## Paso 6 (10:20) — Driver marca "Entregado"

**Acción:**
- Toca botón "Completar entrega"
- Confirma si pide (GPS, foto, etc.)

**Validar:**
```
✅ Pantalla vuelve a: "Misiones Activas" (vacía)
✅ RTDB: pedidos/PED_TEST_REAL_001 estado = "entregado"
✅ RTDB: pedidos_en_camino/PED_TEST_REAL_001 estado = "entregado"
✅ RTDB: pedidos_para_reparto/PED_TEST_REAL_001 = null (eliminado)
✅ RTDB: repartidores/$uid/pedido_activo = null
✅ RTDB: repartidores/$uid/capital/saldo_ganancias incrementado
```

---

## Paso 7 (10:25) — Validar histórico en Admin

**Acción:**
- Abrir panel admin
- Ver histórico de pedidos

**Validar:**
```
✅ PED_TEST_REAL_001 aparece en historial
✅ Estado final: "entregado"
✅ Duración: ~15 minutos (inicio a fin)
✅ Comisión (18%): $9.00 registrada
✅ Driver recibió: $50.00 - $9.00 = $41.00
```

---

## Paso 8 (10:30) — Documentar Certificación

**Resultado:**

Si todos los ✅ pasan:

```
════════════════════════════════════════════════════════════════
✓ ¿Admin lo creó?              SÍ (PED_TEST_REAL_001)
✓ ¿Driver lo recibió?          SÍ (notificación + pantalla)
✓ ¿Driver lo entregó?          SÍ (estado "entregado")
✓ ¿Admin vio el cierre?        SÍ (histórico + capital)

RESULTADO: FASE 1 = ✅ CERTIFICADA
════════════════════════════════════════════════════════════════
```

**Archivo a crear:** `PHASE1_CERTIFICATION_LOG.md`

Contenido:
```markdown
# FASE 1 — Certificación Exitosa

Fecha: 2026-06-18
Pedido: PED_TEST_REAL_001
Driver: UID_XXX

## Timeline

- 10:00 Admin crea
- 10:05 Cocina marca listo
- 10:10 Driver recibe notificación
- 10:15 Driver acepta (reserva capital $9.00)
- 10:18 GPS reporta ubicación
- 10:20 Driver completa (libera capital)
- 10:25 Admin ve cierre

## Estados RTDB confirmados

- ✅ pedidos/PED_TEST_REAL_001: estado="entregado"
- ✅ pedidos_en_camino/PED_TEST_REAL_001: estado="entregado"
- ✅ pedidos_para_reparto/PED_TEST_REAL_001: null
- ✅ repartidores/UID_XXX/capital/saldo_ganancias: +$41.00

## Conclusión

FASE 1 operativamente funcional. Arquitectura validada.
Listo para FASE 2A: Auditoría de Fuente Única.
```

---

## Si algo falla

### Error: Driver NO ve el pedido

**Debug:**
1. Verificar `pedidos_para_reparto/PED_TEST_REAL_001` existe en RTDB
2. Verificar `PedidoSyncModule.kt` escucha `pedidos_para_reparto/`
3. Verificar Firebase project_id correcto en Android
4. Verificar auth token válido

**Solución:**
```bash
# Poblar manualmente
node scripts/populate-pedidos-para-reparto.js Listo
```

---

### Error: Driver acepta pero no va a "En ruta"

**Debug:**
1. Verificar `pedidos_en_camino/PED_TEST_REAL_001` se creó
2. Verificar `repartidores/$uid/pedido_activo` se estableció
3. Revisar logs de Backend en `/api/delivery/accept`

---

### Error: Dinero no se actualiza

**Debug:**
1. Verificar capital reservation en accept (debe deducir)
2. Verificar capital release en complete (debe sumar)
3. Revisar transacción en `routes/delivery.js`

---

## Checklist de preparación

- [ ] Backend corriendo en puerto 3001
- [ ] Firebase conectado y accesible
- [ ] Android Motorola tiene Nelly Driver instalada
- [ ] Driver Firebase Auth token listo
- [ ] Admin panel accesible
- [ ] RTDB console visible (para inspeccionar)
- [ ] Logs en Backend listos para debug

---

## GO → FASE 2A

Cuando FASE 1 esté ✅ certificada:

```
1. Crear: PHASE1_CERTIFICATION_LOG.md
2. Git tag: phase1-certified
3. Git push
4. Iniciar: FASE 2A — Auditoría de Fuente Única
```

**Duración FASE 2A:** 1 día (11:00 a 16:00)

**Resultado esperado:** Mapa completo de quién escribe/lee todo.
