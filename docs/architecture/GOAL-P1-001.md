# GOAL-P1-001
## Piloto Controlado - Nelly OS

**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Ejecutar un piloto controlado sobre la base certificada de RC1 y S4 para validar la operacion real de la plataforma en un entorno medible, supervisado y trazable.

### 2. Alcance

Este goal comprende:

- ejecutar pedidos de prueba o controlados de extremo a extremo;
- verificar la integracion entre cocina, repartidor, backend y dashboard;
- confirmar que los consumidores de eventos reflejan el estado operativo;
- registrar evidencia de comportamiento real durante el piloto;
- observar el doctor y las validaciones asociadas durante la operacion.

### 3. No alcance

Este goal no incluye:

- nuevas capacidades arquitectonicas;
- cambios al productor de eventos;
- refactorizaciones del core;
- modificaciones al ledger o al bus;
- ampliacion funcional no justificada por el piloto.

### 4. Riesgos

- desviacion entre lo observado en dashboard y el estado real;
- incidencias en flujos E2E bajo carga operativa;
- dependencias externas de autenticacion o Firebase;
- regresiones al aplicar correcciones de campo;
- falta de evidencia suficiente para una conclusion objetiva.

### 5. Criterios de aceptacion

El goal se considerara cumplido cuando:

- se ejecute al menos un flujo completo con evidencia;
- el dashboard muestre el estado operativo en tiempo real;
- los consumidores de eventos reflejen la operacion sin acoplarse al core;
- el doctor permanezca estable salvo la observacion externa conocida de Firebase;
- las incidencias se documenten con causa y efecto.

### 6. Evidencias

- registro del piloto;
- capturas o logs del flujo E2E;
- snapshot del dashboard;
- salida del doctor;
- commits y push del ciclo de validacion;
- referencias en el indice maestro y la biblioteca de goals.

### 7. Referencias

- `GOAL-S4-001.md`
- `CERTIFICACION_S4_DASHBOARD_OPERATIVO_V1.md`
- `CERTIFICACION_FINAL_RC1.md`
- `RC1_REPORTE_DIARIO_OPERATIVO_V1.md`
- `MANIFIESTO_NES_V1.md`
- `POL_DEV_001.md`
- `BIBLIOTECA_GOALS_NES_V1.md`

### 8. Historial

- 2026-07-23: Version inicial del goal P1 para piloto controlado.
- 2026-07-23: Primera corrida controlada ejecutada con exito sobre el flujo crear -> despachar -> aceptar -> completar; el dashboard unificado reflejo el estado operativo y el doctor permanecio estable.
- 2026-07-23: Se ejecuto una primera tanda interna de 3 ciclos completos con resultado ok en todos los casos; la validacion global del doctor sigue condicionada por `validate-functional-metrics` debido a la dependencia externa conocida de Firebase.
