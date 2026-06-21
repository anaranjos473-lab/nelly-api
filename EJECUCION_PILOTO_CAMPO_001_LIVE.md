# EJECUCIÓN PILOTO_CAMPO_001 - LIVE 2026-06-20

## Objetivo
Validar ciclo completo **sin intervención manual**:
```
Admin→ Cocina→ Driver→ GPS→ Entrega→ Finanzas
```

## Criterio de PASS
- Pedido transita todas 6 fases
- Estados sincronizados automáticamente
- Finanzas registran impacto
- **Sin editar Firebase manualmente**
- **Sin reiniciar Render**
- **Sin scripts de reparación**

---

## EJECUCIÓN

### FASE 1: Creación Pedido (T+0s)

**Timestamp Inicio**: 
- **Hora exacta**: 
- **Pedido ID**: 
- **Monto**: $1000
- **Repartidor asignado**: 
- **Estado esperado**: EN_COCINA

**Verificación**:
- ✓/✗ Pedido creado en Admin
- ✓/✗ Pedido visible en BD

**Resultado**: 

---

### FASE 2: Visibilidad en Driver (T+10s máx)

**Timestamp**: 
**Duración desde creación**: 

**Verificación**:
- ✓/✗ Pedido visible en App Driver
- ✓/✗ Estado EN_COCINA mostrado
- ✓/✗ Monto visible ($1000)

**Pantalla Driver**:
(capturar screenshot)

---

### FASE 3: Aceptación (T+13s máx)

**Timestamp aceptación**: 
**Duración desde visibilidad**: 

**Acciones**:
1. Repartidor presiona "Aceptar" en App Driver
2. Esperar confirmación

**Verificación**:
- ✓/✗ Estado cambia a EN_REPARTO
- ✓/✗ Confirmación en Driver
- ✓/✗ Cambio reflejado en Admin/Cocina

**Resultado**: 

---

### FASE 4: GPS - Primer Ping (T+43s máx)

**Timestamp primer ping**: 
**Duración desde aceptación**: 

**Verificación**:
- ✓/✗ Marker aparece en mapa
- ✓/✗ Coordenadas válidas
- ✓/✗ Movimiento registrado en RTDB

**Pantalla Mapa**:
(capturar screenshot con marker)

---

### FASE 5: Entrega (T+46s máx)

**Timestamp entrega**: 
**Duración desde GPS**: 

**Acciones**:
1. Repartidor presiona "Entregado" en App Driver
2. Confirmar diálogo
3. Esperar respuesta

**Verificación**:
- ✓/✗ Estado cambia a ENTREGADO
- ✓/✗ Sin error "complete_order_failed_all_endpoints"
- ✓/✗ Panel Cocina refleja cambio

**Resultado**: 

---

### FASE 6: Finanzas (T+51s)

**Timestamp finanzas**: 
**Duración desde entrega**: 

**Verificación en BD (finanzas)**:
- ✓/✗ Registro creado
- ✓/✗ Saldo anterior: `___________`
- ✓/✗ Monto: $1000
- ✓/✗ Comisión 18%: $180
- ✓/✗ Saldo posterior: `___________`

**Fórmula esperada**:
```
Saldo posterior = Saldo anterior + Monto - Comisión
                = X + 1000 - 180
                = X + 820
```

**Resultado**: 

---

## RESUMEN FINAL

**Pedido ID**: 
**Estado Inicial**: EN_COCINA
**Estado Final**: ENTREGADO
**Monto**: $1000
**Comisión**: $180
**Tiempo Total**: ____s

**CICLO COMPLETO SIN INTERVENCIÓN**: 
- ✓ **PASS** → Sistema operacional
- ✗ **FAIL** → Documentar fase que falló

**Evidencia Capturada**:
- Screenshot T+0s (Creación)
- Screenshot T+13s (Aceptación en Driver)
- Screenshot T+43s (GPS marker)
- Screenshot T+46s (Panel mostrando ENTREGADO)
- Logs finanzas

---

## Notas Operacionales

**Este primer ciclo exitoso es REFERENCIA DE ORO para anomalías futuras.**

Si mañana algo falla, comparamos:
- Timestamps de transición
- Estructura de datos en finanzas
- Logs de error en Render

Cualquier desviación de este patrón indicará dónde investigar.

