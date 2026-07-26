# PILOTO PROCEDIMIENTO SOPORTE V1

**Estado:** Procedimiento operativo breve  
**Ambito:** Soporte durante piloto controlado  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`

## 1. Objetivo

Establecer una forma unica de recibir, clasificar y resolver solicitudes durante el piloto, evitando respuestas improvisadas.

## 2. Canales

El piloto debe operar con un canal principal de soporte y un responsable por turno.

| Elemento | Registro |
| --- | --- |
| Canal principal | Pendiente por operacion |
| Responsable | Pendiente por turno |
| Horario | Pendiente por turno |

## 3. Clasificacion

| Severidad | Descripcion | Accion |
| --- | --- | --- |
| Critica | Impide completar pedidos o afecta pagos | Atencion inmediata |
| Alta | Afecta operacion pero tiene contencion | Atencion prioritaria |
| Media | Afecta experiencia sin bloquear flujo | Registrar y programar |
| Baja | Duda, mejora o ajuste menor | Registrar |

## 4. Flujo de soporte

1. Recibir solicitud.
2. Registrar pedido, comercio, repartidor y hora.
3. Clasificar severidad.
4. Revisar si pertenece a operacion, finanzas, calidad, panel o app.
5. Aplicar contencion si existe.
6. Registrar dictamen.
7. Escalar solo si hay evidencia de bloqueo o regresion.

## 5. Regla de evidencia

Toda solicitud relevante debe incluir al menos:

- hora;
- pedido afectado;
- comercio o repartidor;
- descripcion corta;
- captura, log o evidencia observable cuando aplique.

## 6. Criterio de exito

Soporte funciona cuando las incidencias quedan clasificadas, trazables y no se resuelven mediante cambios tecnicos sin evidencia.

## 7. Guion rapido de soporte

Usar este guion cuando entre una llamada o mensaje durante el piloto.

### Si llama un cliente

1. Saludar y pedir el numero de pedido.
2. Confirmar el estado real en panel o backend.
3. Explicar solo lo confirmado.
4. Indicar el siguiente paso si existe.
5. Registrar la llamada y el resultado.

### Si llama un restaurante

1. Confirmar el comercio y el pedido.
2. Verificar si el pedido sigue activo.
3. Definir si se reintenta, reasigna o cancela.
4. Registrar causa y hora.
5. Notificar al responsable operativo si se repite.

### Si llama un repartidor

1. Confirmar identidad y pedido.
2. Verificar si puede continuar o necesita relevo.
3. Registrar motivo y estado.
4. Reasignar solo si el pedido sigue viable.
5. Escalar si hay cancelaciones repetidas.

### Cierre estandar

- Confirmar el resumen de lo ocurrido.
- Registrar evidencia si existe.
- Clasificar severidad.
- Decidir si queda resuelto, en seguimiento o escalado.
- No prometer tiempos ni cambios que no hayan sido confirmados.

## 7. Historial

- 2026-07-25: Se crea el procedimiento de soporte para piloto.
