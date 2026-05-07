# Seguridad y protección de inteligencia Nelly

## Cambios recientes (2026-05-07)
- La inicialización de Firebase en el panel ahora se realiza vía endpoint seguro `/api/public/firebase-config`.
- No se expone ningún secreto ni apiKey sensible en el cliente.
- La lógica de inteligencia, listeners y sincronización de estados permanece intacta y protegida.

## Nota para desarrolladores
- Si necesitas acceder a la configuración de Firebase, usa el endpoint seguro y nunca hardcodees valores en el cliente.
- La inteligencia de Nelly (listeners, debouncing, sincronía de estados) sigue siendo el núcleo y no se elimina ni debilita con este refactor.
# Consejo Nelly-Ops: Checklist de Onboarding Rápido

1. No tocar NellyCalculator ni la comisión del 18%.
2. Nunca exponer ORDER_INGEST_API_KEY, FIREBASE_ADMIN_JSON ni URLs sensibles.
3. Usar process.env para todos los secretos.
4. Mantener sincronía de estados: pendiente, en_reparto, entregado.
5. Optimizar Firebase (listeners granulares, consultas acotadas) y entregar solo diagnóstico, código y justificación breve.

Este checklist es obligatorio para todo colaborador y agente IA en el ecosistema Nelly Delivery.
