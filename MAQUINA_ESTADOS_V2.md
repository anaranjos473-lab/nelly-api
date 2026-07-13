# Nelly Delivery - Máquina de Estados V2

Estado: **BORRADOR PARA APROBACIÓN**

Fase: C5.1

Fecha: 2026-07-13

## Propósito

`estado` representa exclusivamente el ciclo de vida canónico del pedido. No representa la pantalla visible, el destino del mapa ni un botón pulsado por el repartidor.

## Estados permitidos

| Estado | Significado |
|---|---|
| `PENDIENTE` | Pedido canónico creado y pendiente de aceptación por Cocina |
| `COCINA` | Cocina aceptó y prepara/confirma el pedido |
| `LISTO` | Pedido disponible para asignación o aceptación de repartidor |
| `EN_CURSO` | Existe una asignación activa y la entrega está siendo ejecutada |
| `ENTREGADO` | Cierre exitoso e irreversible del pedido |
| `CANCELADO` | Cierre excepcional e irreversible con motivo y actor registrados |

No se permiten otros valores ni diferencias de caja.

## Flujo principal

```text
PENDIENTE -> COCINA -> LISTO -> EN_CURSO -> ENTREGADO
```

`CANCELADO` es una salida lateral, no el paso posterior a `ENTREGADO`.

```text
PENDIENTE ----\
COCINA --------+--> CANCELADO
LISTO --------/
EN_CURSO -----/     solo bajo política reforzada
```

## Transiciones válidas

| Desde | Hacia | Condición mínima | Actor autorizado |
|---|---|---|---|
| inexistente | `PENDIENTE` | Contrato V2 completo | Productor mediante backend |
| `PENDIENTE` | `COCINA` | Aceptación registrada | Cocina o backend autorizado |
| `COCINA` | `LISTO` | Preparación confirmada | Cocina |
| `LISTO` | `EN_CURSO` | Repartidor autenticado y asignación activa | Backend de entrega |
| `EN_CURSO` | `ENTREGADO` | Fase `EN_CLIENTE`, geocerca, evidencia y cierre válidos | Backend de entrega |
| `PENDIENTE` | `CANCELADO` | Motivo y actor | Admin o política automática aprobada |
| `COCINA` | `CANCELADO` | Motivo y actor | Admin o Cocina autorizada |
| `LISTO` | `CANCELADO` | Motivo, actor y retiro de proyecciones | Admin o Cocina autorizada |
| `EN_CURSO` | `CANCELADO` | Política reforzada completa | Solo Admin/soporte con privilegio explícito |

## Política reforzada de cancelación en `EN_CURSO`

El repartidor puede solicitar cancelación o reportar incidente, pero no cambiar directamente el estado a `CANCELADO`.

La cancelación requiere atómicamente:

1. motivo de catálogo y nota operativa;
2. actor autorizado;
3. evento `PEDIDO_CANCELADO`;
4. cierre de `logistica.asignacion_activa`;
5. liberación del `repartidor_uid` según política;
6. retiro de índices derivados;
7. resolución financiera registrada por el subsistema correspondiente;
8. preservación del historial, nunca borrado del pedido.

Los motivos iniciales deberán aprobarse antes de implementar C5.2; no se aceptará texto libre como única clasificación.

## Transiciones prohibidas

| Transición | Motivo |
|---|---|
| Cualquier estado -> `PENDIENTE` | No se retrocede el ciclo de vida |
| `LISTO` -> `COCINA` | Reapertura requiere un proceso excepcional aún no definido |
| `EN_CURSO` -> `LISTO` | La reasignación no debe falsear el estado; requiere evento/política específica |
| `ENTREGADO` -> cualquier estado | Estado terminal irreversible |
| `CANCELADO` -> cualquier estado | Estado terminal irreversible |
| Cualquier salto que omita estados | Rompe precondiciones e historial |

Una corrección administrativa de datos no equivale a una transición. Si en el futuro se necesita reapertura, será una ampliación versionada, auditable y aprobada; no un `update` libre.

## Relación con fases y eventos

- Cambiar `fase_operativa` dentro de `EN_CURSO` no cambia `estado`.
- `LLEGADA_TIENDA`, `PEDIDO_ABORDO` y `LLEGADA_CLIENTE` son eventos, no estados.
- Los nombres históricos `EN_CAMINO`, `EN_REPARTO`, `LLEGUE_A_TIENDA`, `PEDIDO_ABORDO` y `LLEGUE_A_CLIENTE` no son valores válidos de `estado` V2.
- Toda transición válida genera un evento con estado anterior y nuevo.

## Idempotencia y concurrencia

1. Cada comando de transición lleva una clave de idempotencia.
2. El backend verifica el estado actual mediante operación transaccional antes de escribir.
3. Repetir el mismo comando no duplica eventos ni efectos financieros.
4. Dos actores no pueden confirmar transiciones incompatibles desde la misma versión del pedido.
5. El pedido conserva un número de revisión o mecanismo equivalente para control optimista en C5.2.

## Tabla de aprobación

| Decisión | Estado |
|---|---|
| Seis estados exactos | Pendiente |
| Flujo principal lineal | Pendiente |
| Cancelación lateral | Pendiente |
| Cancelación reforzada en `EN_CURSO` | Pendiente |
| Estados terminales irreversibles | Pendiente |
| Prohibición de saltos y retrocesos | Pendiente |

No se implementará la máquina hasta que estas decisiones y el catálogo de cancelación sean aprobados.
