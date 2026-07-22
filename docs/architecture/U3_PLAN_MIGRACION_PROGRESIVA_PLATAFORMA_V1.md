# U3 - PLAN DE MIGRACION PROGRESIVA DE LA PLATAFORMA V1

## Fecha
2026-07-22

## Proposito
Definir la siguiente fase del proyecto: migrar progresivamente la plataforma existente para que consuma el nucleo universal U2 sin perder estabilidad, compatibilidad ni trazabilidad.

## Alcance
U3 no crea un nuevo núcleo. Su objetivo es mover el ecosistema Nelly hacia U2 de forma gradual, certificable y con regresion controlada.

## Prerrequisitos

- U2 certificado mediante [CERTIFICACION_U2_NUCLEO_UNIVERSAL_V1.md](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/CERTIFICACION_U2_NUCLEO_UNIVERSAL_V1.md)
- baseline funcional de Kitchen Premium en verde
- doctor estable salvo la limitacion externa conocida
- validacion funcional completa pendiente en entorno con Firebase operativo

## Objetivo de U3
Hacer que el resto de la plataforma utilice contratos canónicos, máquina de estados, bus de eventos, ledger y fulfillment engine como capa de referencia.

## Bloques de U3

### U3.1 - Adaptacion de modulos existentes
Migrar progresivamente:
- Admin
- Kitchen/Fulfillment
- Driver
- Tracking
- Finanzas

para que consuman exclusivamente:
- contratos canónicos
- máquina de estados
- eventos
- ledger

### U3.2 - Nuevos nodos
Validar que el fulfillment engine es universal con nuevos tipos de nodo:
- farmacia
- supermercado
- marketplace
- paqueteria

Matriz de cobertura de referencia:
- [`U3_2_MATRIZ_COBERTURA_FULFILLMENT_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_2_MATRIZ_COBERTURA_FULFILLMENT_V1.md)

### U3.3 - Integraciones
Conectar gradualmente:
- POS
- ERP
- inventarios
- facturacion
- IA

sin modificar el nucleo.

Integracion inicial iniciada:
- adaptador de inventario canonico en `src/integrations/inventoryAdapter.js`

### U3.4 - Certificacion universal
Demostrar:
- compatibilidad entre contratos;
- integridad de eventos;
- conciliacion del ledger;
- transiciones validas;
- funcionamiento de distintos tipos de nodo;
- ejecucion de doctor;
- validacion funcional completa en entorno con Firebase.

### U3.5 - Preparacion para marketplace
Preparar capacidades de plataforma multi-vertical:
- multiples vendedores;
- multiples nodos de cumplimiento;
- pedidos divididos;
- liquidaciones independientes;
- reglas de comision configurables.

## Estrategia de migracion

1. Mover primero consumidores de bajo riesgo.
2. Mantener compatibilidad mientras exista transicion.
3. Validar cada bloque con pruebas y doctor.
4. Retirar rutas antiguas solo cuando exista evidencia suficiente.

## Criterios de aceptacion

- los modulos existentes usan U2 como referencia;
- el comportamiento visible no se rompe durante la migracion;
- los nuevos nodos pueden operar sobre el mismo motor;
- las integraciones no redefinen el nucleo;
- la certificacion final incorpora el entorno Firebase operativo.

## Criterio de cierre
U3 se considerara estable cuando la plataforma completa haya migrado progresivamente al nucleo U2 con evidencia funcional y sin romper la operacion certificada.

## Referencias
- [`docs/architecture/CERTIFICACION_U2_NUCLEO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/CERTIFICACION_U2_NUCLEO_UNIVERSAL_V1.md)
- [`docs/architecture/U2_PLAN_IMPLEMENTACION_NUCLEO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U2_PLAN_IMPLEMENTACION_NUCLEO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_10_PRINCIPIOS_COMPATIBILIDAD_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_10_PRINCIPIOS_COMPATIBILIDAD_V1.md)
- [`docs/architecture/U3_CIERRE_INTERMEDIO_MIGRACION_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_CIERRE_INTERMEDIO_MIGRACION_V1.md)
