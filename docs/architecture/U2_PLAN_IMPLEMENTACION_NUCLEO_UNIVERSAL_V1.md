# U2 - PLAN DE IMPLEMENTACION DEL NUCLEO UNIVERSAL V1

## Fecha
2026-07-22

## Proposito
Definir la secuencia de implementacion del nucleo universal sobre la base conceptual ya establecida en U1, priorizando contratos, estados, eventos, ledger y fulfillment en ese orden.

## Alcance
U2 no reabre la definicion de arquitectura base. Su trabajo es convertir U1 en una ruta de implementacion controlada, con transicion gradual y evidencia verificable.

## Prerrequisitos

- U1.1 a U1.10 documentados;
- baseline funcional de Kitchen Premium en verde;
- doctor y validadores activos;
- sin regresiones abiertas en B4.

## Objetivo de U2
Implementar el nucleo universal sin romper la operacion certificada, usando entregables pequenos, validacion intermedia y migracion progresiva.

## Orden de ejecucion

### U2.1 - Contratos canonicos
Primero se materializan los contratos oficiales para que todos los modulos hablen el mismo lenguaje.

Entregables esperados:
- modelos canonicos compartidos;
- versionado de contratos;
- validaciones de entrada y salida;
- base comun para backend, admin, kitchen, driver y APIs futuras.

### U2.2 - Maquina de estados
Luego se implementa el motor que valida transiciones permitidas.

Entregables esperados:
- reglas de transicion centralizadas;
- rechazo de estados invalidos;
- soporte para cancelacion, reembolso y flujos parciales;
- cobertura de secuencias deterministas.

### U2.3 - Eventos de dominio
Despues se introduce el bus o capa de eventos para desacoplar reacciones del flujo principal.

Entregables esperados:
- eventos tipados y observables;
- correlacion y causacion;
- consumidores desacoplados;
- compatibilidad hacia atras cuando aplique.

### U2.4 - Ledger financiero
Cuando contratos, estados y eventos esten estables, se migra el registro financiero a un ledger inmutable.

Entregables esperados:
- movimientos financieros atomicos;
- comparacion temporal con el sistema actual;
- conciliacion de saldos y comisiones;
- ruta de migracion sin corte brusco.

### U2.5 - Fulfillment Engine
Finalmente se adapta Kitchen para operar sobre el nuevo nucleo sin rehacer el panel ni romper el baseline certificado.

Entregables esperados:
- Kitchen como nodo de fulfillment;
- contratos compartidos con otros verticales;
- consumo del ledger y eventos del nucleo;
- operacion compatible con marketplace, inventario e integraciones.

## Estrategia de transicion

1. Implementar en paralelo cuando exista riesgo de cambio de contrato.
2. Comparar resultados contra la referencia certificada.
3. Cambiar el consumo solo cuando la nueva ruta sea equivalente o superior.
4. Eliminar la ruta antigua solo con evidencia y documentacion.

## Criterios de aceptacion

- cada subetapa entrega evidencia propia;
- no se rompe la baseline certificada durante la transicion;
- los contratos quedan compartidos entre modulos;
- la maquina de estados bloquea transiciones invalidas;
- el ledger puede coexistir temporalmente con el sistema previo;
- Kitchen sigue operando como nodo de fulfillment.

## Criterio de cierre
U2 se considerara estable cuando el nucleo universal haya sido implementado de forma progresiva, verificable y compatible con la operacion certificada previa.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md)
- [`docs/architecture/U1_8_MAQUINA_ESTADOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_8_MAQUINA_ESTADOS_V1.md)
- [`docs/architecture/U1_9_ARQUITECTURA_EXTENSIONES_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_9_ARQUITECTURA_EXTENSIONES_V1.md)
