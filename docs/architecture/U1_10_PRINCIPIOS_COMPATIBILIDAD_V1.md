# U1.10 - PRINCIPIOS DE COMPATIBILIDAD V1

## Fecha
2026-07-22

## Proposito
Definir las reglas de compatibilidad que deben respetarse al evolucionar la plataforma universal, para que el crecimiento del dominio no rompa contratos, estados, eventos ni integraciones ya establecidas.

## Alcance
Este documento fija principios de evolucion. No modifica la baseline certificada de Kitchen Premium ni reemplaza los contratos canonicos de U1.7 o la maquina de estados de U1.8.

## Objetivos

- evitar cambios incompatibles sin estrategia de migracion;
- asegurar versionado explicito de contratos;
- preservar compatibilidad hacia atras cuando sea posible;
- exigir transiciones documentadas para estados y eventos;
- mantener integraciones estables y predecibles;
- impedir que los modulos nuevos dependan de detalles internos.

## Principios de compatibilidad

1. Ningun cambio rompe contratos existentes sin plan de migracion.
2. Todo contrato canonico debe tener version.
3. Todo evento de dominio debe declarar su compatibilidad.
4. Las transiciones de estado solo pueden evolucionar mediante reglas documentadas.
5. Las integraciones consumen APIs estables, no detalles internos.
6. Los modulos nuevos deben integrarse por contrato, no por acceso directo a la implementacion.
7. Las extensiones no redefinen el significado del nucleo.
8. La compatibilidad se valida con evidencia, no con suposiciones.

## Reglas de versionado

### Contratos
- `major`: cambio incompatible.
- `minor`: extension compatible hacia atras.
- `patch`: correccion no estructural.

### Eventos
- un evento nuevo no debe invalidar a los consumidores existentes sin estrategia;
- si un payload cambia, debe documentarse el mapeo entre versiones;
- cuando sea posible, se mantiene compatibilidad dual durante la transicion.

### Estados
- un estado nuevo debe convivir con los estados vigentes hasta cerrar la migracion;
- una transicion nueva no debe eliminar una transicion certificada sin evidencia de reemplazo;
- los estados terminales solo cambian mediante una version formal del contrato.

## Reglas de migracion

1. Primero se publica el contrato nuevo.
2. Luego se valida en paralelo con la referencia actual.
3. Despues se migra el consumo.
4. Finalmente se retira la compatibilidad anterior cuando exista evidencia suficiente.

## Criterios de aceptacion

- el equipo puede identificar que rompe y que no rompe cada cambio;
- existe un criterio explicito para versionar contratos y eventos;
- las transiciones de estado no dependen de interpretaciones locales;
- las integraciones pueden evolucionar sin romper el nucleo;
- el sistema conserva trazabilidad durante la transicion.

## Criterio de cierre
U1.10 se considerara estable cuando las reglas de compatibilidad puedan usarse como guia unica para evolucionar contratos, estados, eventos e integraciones sin reintroducir ambiguedad.

## Referencias
- [`docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md)
- [`docs/architecture/U1_8_MAQUINA_ESTADOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_8_MAQUINA_ESTADOS_V1.md)
- [`docs/architecture/U1_9_ARQUITECTURA_EXTENSIONES_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_9_ARQUITECTURA_EXTENSIONES_V1.md)
