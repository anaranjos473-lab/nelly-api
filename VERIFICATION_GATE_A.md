# VERIFICACIÓN OBJETIVA: GATE A (SUOT - Pedidos)

**Fecha:** 2026-06-17  
**Auditoría:** public/panel.html - Búsqueda de escrituras RTDB directas

---

## ✅ VERIFICACIÓN 1: Escrituras RTDB en Panel

### Búsqueda
```bash
grep -n "set(ref(rtdb" public/panel.html
grep -n "update(ref(rtdb" public/panel.html
grep -n "push(ref(rtdb" public/panel.html
grep -n "remove(ref(rtdb" public/panel.html
```

### Resultados Encontrados: ⚠️ 2 ESCRITURAS

| Línea | Función | Operación | Nodo | Severidad |
|-------|---------|-----------|------|-----------|
| 29 | `entregarPedido()` | `remove()` | `pedidos/{id}` | 🔴 CRÍTICA |
| 404 | `entregarPedido()` (duplicado) | `remove()` | `pedidos/{id}` | 🔴 CRÍTICA |

### Código Encontrado

**Línea 29:**
```javascript
window.entregarPedido = function(id) {
    if (!confirm('¿Confirmas que el pedido está listo?')) return;
    remove(ref(rtdb, `pedidos/${id}`));  // ← ESCRITURA DIRECTA
};
```

**Línea 404:**
```javascript
window.entregarPedido = function(id) {
    const db = window.nellyDb;
    if (!db) return;
    if (confirm("¿Confirmas que el pedido está listo?")) {
        remove(ref(db, 'pedidos/' + id));  // ← ESCRITURA DIRECTA
    }
};
```

---

## ⚠️ VERIFICACIÓN 2: Función `moverAReparto()`

### Búsqueda
```bash
grep -A 50 "window.moverAReparto = async" public/panel.html
```

### Resultado: ✅ CORRECTO

La función **NO contiene** ningún `set()`, `update()` o `push()` directo a RTDB para:
- `pedidos_para_reparto`
- `pedidos_en_camino`
- `pedidos/{id}/estado`

**Línea 1715 (verificada):**
```javascript
window.moverAReparto = async function(id) {
    // ... lógica local UI ...
    
    for (const endpoint of MARK_READY_ENDPOINTS) {
        const response = await fetch(`${endpoint}/${encodeURIComponent(rtdbKey)}/listo`, {
            method: 'POST',  // ← CORRECTO: POST al backend
            headers: { ... }
        });
    }
};
```

### Hallazgo Positivo
✅ `moverAReparto()` **delegó correctamente** al backend:
```
moverAReparto() 
  └─ POST ${endpoint}/listo
      └─ Backend (routes/admin.js)
```

---

## 🔴 PROBLEMA: `entregarPedido()`

**Status:** ❌ INCUMPLE GATE A

**Problema Detectado:**
- Existen TWO definiciones de `entregarPedido()`
- Ambas hacen `remove()` directo a RTDB
- No delegan al backend

**Impacto:**
- Panel puede eliminar pedidos sin validación backend
- No hay versioning, no hay auditoría
- No es atómico con el estado en otros nodos

**Rastreabilidad:**
```
entregarPedido(id)  [PANEL]
  └─ remove(ref(rtdb, 'pedidos/{id}'))  ← ESCRITURA DIRECTA
     ├─ No incrementa version
     ├─ No crea evento
     ├─ No valida estado
     └─ No se replica a Firestore
```

---

## 🛠️ Acción Requerida (BLOQUEANTE para GATE A)

### Opción A: Delegación al Backend (RECOMENDADO)

```javascript
window.entregarPedido = async function(id) {
    if (!confirm('¿Confirmas que el pedido está listo?')) {
        return;
    }
    
    try {
        const idToken = await obtenerIdTokenPanel();
        const response = await fetch(`/api/admin/pedidos/${id}/cierre`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error en cierre: ' + response.status);
        }
        
        showToast('Pedido cerrado', 'ok');
        actualizarPanel();
    } catch (error) {
        alert('Error: ' + error.message);
    }
};
```

**Ventajas:**
- ✅ Backend valida estado antes de cerrar
- ✅ Crea evento auditado
- ✅ Incrementa versión
- ✅ Consistent con PHASE 1

### Opción B: Mantener Remove Directo (NO RECOMENDADO)

Si `entregarPedido` es solo para debugging/testing:

```javascript
// Comentado: Solo para debugging local
// window.entregarPedido = function(id) {
//     if (!confirm('[DEBUG] Eliminar pedido?')) return;
//     remove(ref(rtdb, `pedidos/${id}`));
// };
```

---

## 📊 Matriz de Estado

### Antes de Corrección

| Nodo | Escritor | Estado | Gate A |
|------|----------|--------|--------|
| `pedidos/{id}` | Panel (remove) + Backend | ⚠️ DUAL | ❌ FALLA |
| `pedidos_para_reparto/{id}` | Backend solo | ✅ Único | ✅ PASA |
| `pedidos_en_camino/{id}` | Backend solo | ✅ Único | ✅ PASA |

### Después de Corrección (Esperado)

| Nodo | Escritor | Estado | Gate A |
|------|----------|--------|--------|
| `pedidos/{id}` | Backend solo | ✅ Único | ✅ PASA |
| `pedidos_para_reparto/{id}` | Backend solo | ✅ Único | ✅ PASA |
| `pedidos_en_camino/{id}` | Backend solo | ✅ Único | ✅ PASA |

---

## ✋ Gate A: BLOQUEADO

**Status:** 🔴 INCUMPLIDO

**Razón:** `entregarPedido()` escribe directamente a RTDB sin pasar por backend

**Resolución Requerida:** 
1. Implementar endpoint `/api/admin/pedidos/{id}/cierre`
2. Reemplazar `remove()` directo con fetch POST
3. Re-ejecutar verificación

**Estimated Effort:** 30 min

---

## Próxima Fase

Una vez `entregarPedido()` sea delegado al backend:

1. ✅ GATE A PASA
2. ✅ PHASE 2A CERTIFICADA
3. 🔜 PHASE 2B: conductores_activos / GPS / TTL
