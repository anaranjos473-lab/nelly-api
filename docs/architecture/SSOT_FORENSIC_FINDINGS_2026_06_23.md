# SSOT_FORENSIC_FINDINGS_2026_06_23.md

## Resultado
SSOT Gate 001 ejecutado exitosamente.

### Gate 1
PASS

Verificado:

- pedidos_para_reparto/{id} existe
- pedidos_en_camino/{id} NO existe antes de accept-order
Conclusión:

dispatch-order respeta la arquitectura SSOT y no genera pedidos_en_camino prematuramente.

---

### Gate 2
PASS

Verificado:

- cliente_nombre presente
- monto presente
- timestamp presente
Conclusión:

Los pedidos llegan correctamente a pedidos_para_reparto.

---

### Gate 3
PENDIENTE

Validación pendiente desde dispositivo Android real.

Objetivos:

- aparición del pedido en Android
- accept-order
- transición a EN_CAMINO
- limpieza de cola

---

### Gate 4
PASS

Verificado:

- sin movimientos financieros prematuros
Conclusión:

No existe generación anticipada de registros financieros.

---

## Hallazgo Principal
Se descarta definitivamente la hipótesis:

"Existe un escritor oculto que crea pedidos_en_camino antes de accept-order."

No se encontró evidencia de dicha condición.

---

## Flujo Backend Confirmado
pedidos/{id}
↓
dispatch-order
↓
pedidos_para_reparto/{id}
↓
accept-order
↓
pedidos_en_camino/{id}
↓
complete-order
↓
ENTREGADO

---

## Nueva Hipótesis Principal
El problema restante se encuentra del lado Android.

Líneas de investigación:

1. Listener pedidos_para_reparto.
2. Sincronización RTDB → UI.
3. Compatibilidad de estados EN_CAMINO / EN_CURSO.
4. Generación de "OPERACIÓN ACTIVA".

---

## Estado de Certificación
Backend SSOT: Parcialmente certificado.

Pendiente:

Gate 3 Android.
