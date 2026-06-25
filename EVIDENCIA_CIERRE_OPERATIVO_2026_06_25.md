# Evidencia cierre operativo - 2026-06-25

## Contexto

Durante la certificacion del nucleo operativo se ejecuto un ciclo real con un pedido nuevo identificado visualmente como **Certificacion Nucleo A**. El pedido fue recibido en el telefono Android del repartidor y avanzo hasta estado operativo **EN_CURSO**.

Esta evidencia queda registrada antes de continuar con Pedido B, porque Pedido A quedo contaminado por errores encontrados durante la prueba y no debe usarse como certificacion final.

## Flujo observado en telefono

Secuencia reportada por operacion:

```text
Pedido llega al telefono
  -> Aceptar
  -> EN_CURSO
  -> YA ESTOY EN LA TIENDA
  -> aparece PEDIDO A BORDO por unos segundos
  -> regresa a EN_CURSO
```

Capturas recibidas:

- Pantalla Android con pedido **Certificacion Nucleo A**.
- Monto visible: **MXN$185.00**.
- Estado visual principal: **DIRIGETE A LA TIENDA**.
- Accion visible: **YA ESTOY EN LA TIENDA**.
- Indicador visible: **ESPERANDO "LUZ VERDE" DE UBICACION (CLIENTE)**.
- Al presionar la accion, la UI cambia temporalmente a **PEDIDO A BORDO** y luego vuelve a la pantalla anterior.

## Lectura tecnica

Este comportamiento ya no corresponde a un problema de recepcion del pedido en Android.

Quedo demostrado que el flujo llego hasta:

```text
Admin
  -> Cocina
  -> LISTO
  -> Android
  -> Aceptar
  -> EN_CURSO
```

El parpadeo observado corresponde a una brecha de sincronizacion de subestado:

- La app Android realiza un cambio inmediato de UI al presionar **YA ESTOY EN LA TIENDA**.
- La UI muestra temporalmente **PEDIDO A BORDO**.
- El listener vuelve a leer el estado maestro desde RTDB/backend.
- El backend conserva **estado = EN_CURSO**.
- Como la subetapa **PEDIDO_ABORDO** no queda persistida, la UI vuelve a **EN_CURSO**.

Conclusion: la recepcion y aceptacion del pedido ya estan vivas; la observacion pendiente es la persistencia/derivacion de la subetapa **PEDIDO_ABORDO**.

## Hallazgo adicional de cierre

Durante el intento de completar Pedido A, el endpoint:

```text
POST /api/delivery/complete-order
```

fallo con:

```text
500 No se pudo aplicar el cobro en transaccion
```

Causa localizada:

```text
repartidores/{uid}
```

no existia para el UID real autenticado del repartidor, por lo que `registrarCobroEfectivoTx` abortaba la transaccion financiera y bloqueaba la entrega.

## Correcciones guardadas en codigo

Se aplicaron correcciones estrictamente operativas, sin introducir nuevas funcionalidades:

- `src/services/debtLockService.js`
  - `registrarCobroEfectivoTx` ahora inicializa de forma transaccional el perfil financiero minimo si `repartidores/{uid}` no existe.
  - Esto evita que una entrega quede bloqueada por ausencia de perfil financiero.

- `routes/delivery.js`
  - `complete-order` reconoce token con claim `panel: true` como usuario panel valido.

- `public/panel.html`
  - El panel puede resolver pedidos tambien desde la casilla local `pedidosEnCamino`, evitando perder la llave RTDB al cerrar entregas ya aceptadas.

- `tests/delivery_panel.test.js`
  - Se agrego prueba para completar pedido cuando falta el perfil financiero del repartidor.
  - Se agrego prueba para completar pedido con claim `panel: true`.

## Verificacion automatizada

Prueba ejecutada:

```text
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/delivery_panel.test.js --detectOpenHandles --forceExit --cacheDirectory=.jest-cache
```

Resultado:

```text
Test Suites: 1 passed, 1 total
Tests: 16 passed, 16 total
```

## Estado de certificacion

Avance validado:

| Modulo | Estado |
| --- | --- |
| Backend SSOT pedidos | Validado hasta EN_CURSO |
| Admin | Crea pedido real |
| Cocina | Despacha a LISTO |
| Android | Recibe pedido |
| Android | Acepta pedido |
| Estado EN_CURSO | Validado |
| Subetapa PEDIDO_ABORDO | En observacion |
| Complete-order | Fix aplicado para bloqueo financiero |
| Finanzas | Pendiente validar con Pedido B |

## Decision operativa

No continuar usando Pedido A para certificacion final.

Motivo:

- Fue creado durante una corrida donde `complete-order` todavia fallaba por Finanzas.
- Quedo como evidencia de recepcion/aceptacion Android, no como evidencia de ciclo completo certificado.

## Siguiente paso recomendado

Ejecutar Pedido B desde cero despues de desplegar/relevantar backend con los fixes:

```text
Admin
  -> Cocina
  -> LISTO
  -> Android
  -> Aceptar
  -> YA ESTOY EN LA TIENDA
  -> PEDIDO A BORDO
  -> ENTREGADO
  -> Finanzas
```

Criterio de exito para Pedido B:

- El pedido llega a Android.
- Se acepta y queda en **EN_CURSO**.
- La subetapa **PEDIDO_ABORDO** no parpadea ni retrocede por falta de persistencia.
- `complete-order` responde 200.
- `pedidos/{id}/estado = ENTREGADO`.
- Finanzas registra la transaccion sin 500.

## Evaluacion

El nucleo operativo avanzo del problema de conectividad/recepcion a una observacion de transicion interna. Esto reduce el riesgo principal: Android ya participa en el flujo real.

Pendiente final antes de piloto:

```text
PEDIDO_ABORDO
  -> ENTREGADO
  -> Finanzas
```

