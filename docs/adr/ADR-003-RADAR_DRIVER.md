# ADR-003: Radar Driver Flow

## Estado

Activo

## Contexto

El flujo de pedidos disponibles debe mostrarse en el Radar del repartidor autenticado, no en la pantalla de Cocina.

## Decisión

- El Radar publica pedidos disponibles.
- Android solicita aceptación.
- El backend adjudica de forma atómica.
- Cocina termina su responsabilidad cuando marca `LISTO`.

## Consecuencias

- La identidad efectiva proviene de Firebase Auth.
- El cliente solo refleja el estado del backend.
- La adjudicación no se decide en UI.

