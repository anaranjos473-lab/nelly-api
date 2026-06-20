# PILOTO CAMPO 001 - RUNBOOK OPERATIVO

**Fecha objetivo:** Pendiente  
**Estado inicial:** Ready for controlled field pilot  
**Alcance:** 1 administrador, 1 cocina, 1 repartidor, 1 pedido real

---

## Veredicto De Laboratorio

Antes de este piloto, Nelly queda certificado en escritorio para:

- RC2.6: pedidos, reparto, entrega, cobro efectivo, finanzas, ledger, versionado y maquina de estados.
- Phase 2A: gobernanza, Single Writer, backend como fuente de verdad y `order_events`.
- Phase 2B GPS: timestamp servidor, `conductores_activos`, TTL 120s, cleanup automatico, `driver-offline`, UI stale filtering y prueba offline real.

Este piloto no revalida arquitectura. Valida operacion fisica en calle.

---

## Objetivo

Ejecutar un flujo real completo:

```text
Pedido creado
  -> Cocina marca LISTO
  -> Driver acepta
  -> GPS activo en panel
  -> Driver se mueve 500-1000 metros
  -> Pedido ENTREGADO
  -> Cobro/finanzas/ledger consistentes
  -> Driver offline o TTL elimina marcador
```

---

## Participantes

| Rol | Responsable | Dispositivo |
| --- | --- | --- |
| Administrador | Pendiente | Laptop o telefono con panel admin |
| Cocina | Pendiente | Panel cocina |
| Repartidor | Pendiente | Android con APK certificado |
| Observador tecnico | Pendiente | Acceso a logs Render/Firebase |

---

## Preflight Backend

Completar antes de iniciar la prueba:

- [ ] Backend actual desplegado.
- [ ] Cloud Functions actuales desplegadas.
- [ ] Variables Render verificadas.
- [ ] Firebase Production verificado.
- [ ] `POST /api/delivery/driver-offline` disponible.
- [ ] `cleanupStaleConductores` activo cada 60 segundos.
- [ ] Logs Render visibles durante la prueba.
- [ ] RTDB `conductores_activos` visible para inspeccion.

---

## Preflight Android Driver

- [ ] APK debug certificado instalado.
- [ ] Login real exitoso.
- [ ] Permisos de ubicacion concedidos.
- [ ] GPS activo.
- [ ] Datos moviles activos.
- [ ] Ahorro de bateria desactivado para la app.
- [ ] Inicio de tracking confirmado.
- [ ] `markOffline()` disponible al cerrar app o servicio.

---

## Preflight Panel Admin Y Cocina

- [ ] Panel admin abre sin errores.
- [ ] Mapa carga correctamente.
- [ ] Panel cocina abre sin errores.
- [ ] Cocina puede crear o avanzar pedido a `LISTO`.
- [ ] Admin puede ver pedido y conductor.
- [ ] Hora local sincronizada en dispositivos.

---

## Ejecucion 5/5

### 1. Crear Pedido

Accion:
- Cocina crea o toma un pedido real de prueba.
- Cocina mueve pedido a `LISTO`.

PASS:
- Pedido existe con ID registrable.
- Estado `LISTO` visible en backend/panel.
- No hay duplicado visual ni duplicado de nodo operativo.

### 2. Driver Acepta

Accion:
- Repartidor inicia sesion.
- Repartidor acepta el pedido.

PASS:
- Pedido pasa a flujo de reparto.
- Version incrementa.
- `order_events` registra evento.
- No hay error 401/403/409 inesperado.

### 3. GPS Activo En Panel

Accion:
- Confirmar ubicacion inicial del repartidor.
- Observar mapa admin.

PASS:
- Existe `conductores_activos/{uid}` con `lat`, `lng`, `timestamp`.
- Marcador aparece en panel en menos de 10 segundos.
- Timestamp es reciente y generado por backend.

### 4. Movimiento Fisico

Accion:
- Repartidor se mueve 500-1000 metros.
- Administrador observa el mapa.

PASS:
- Marcador se mueve.
- Updates llegan aproximadamente cada 30 segundos.
- No hay gaps mayores a 60 segundos durante cobertura normal.
- Pedido sigue asignado al mismo repartidor.

### 5. Entrega, Finanzas Y Offline

Accion:
- Repartidor marca entrega.
- Validar cobro efectivo/finanzas/ledger.
- Cerrar app o detener tracking.
- Alternativamente, cortar red para validar TTL.

PASS:
- Pedido termina en `ENTREGADO`.
- Finanzas del repartidor quedan consistentes.
- Ledger registra movimiento esperado.
- Si hay cierre explicito: `conductores_activos/{uid}` desaparece en menos de 10 segundos.
- Si hay perdida de cobertura: marcador desaparece por TTL en 120-180 segundos.

---

## Evidencia Obligatoria

Registrar en el acta del piloto:

- ID del pedido.
- UID o correo del repartidor.
- Hora de inicio.
- Hora de aceptacion.
- Hora de primer GPS visible.
- Hora de entrega.
- Hora de offline o TTL.
- Captura app driver aceptando o entregando.
- Captura panel admin con marcador.
- Captura panel cocina en `LISTO`.
- Extracto de logs backend.
- Captura o export de RTDB mostrando eliminacion de `conductores_activos/{uid}`.

---

## Go / No-Go

GO si se cumple:

- [ ] Pedido completo de `LISTO` a `ENTREGADO`.
- [ ] GPS visible y moviendose en panel.
- [ ] Offline explicito o TTL elimina fisicamente el nodo.
- [ ] Finanzas y ledger consistentes.
- [ ] Sin errores criticos de autenticacion, estado o duplicacion.

NO-GO si ocurre cualquiera:

- [ ] Pedido queda atorado en estado intermedio.
- [ ] Driver acepta pero panel no sincroniza.
- [ ] GPS no aparece o no se mueve con cobertura normal.
- [ ] `conductores_activos/{uid}` queda zombie despues de offline y TTL.
- [ ] Finanzas o ledger quedan inconsistentes.
- [ ] App driver se cierra durante el flujo principal.

---

## Resultado Final

Completar despues del piloto:

```text
PILOTO_CAMPO_001 = PASS | FAIL
Pedido:
Repartidor:
Inicio:
Cierre:
Hallazgos:
Decision:
```

Si `PILOTO_CAMPO_001 = PASS`, Nelly pasa de certificacion de laboratorio a certificacion operativa controlada. Despues de eso tiene sentido abrir Phase 2C.
