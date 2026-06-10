# Field Trial Certification

## Estado general
Este documento valida la preparación de la plataforma para iniciar pruebas de campo controladas sobre la base del contenido del repositorio.

### Resultado final
- Clasificación: **READY WITH RISKS**
- Score: **65 / 100**
- Recomendación: puede iniciar pruebas de campo controladas, pero debe atender brechas de telemetría y resiliencia antes de escalar.

---

## 1. Telemetría

### Validación de métricas solicitadas
Se buscó en todo el repositorio los siguientes eventos/constantes:
- `SHADOW_MODE_ENTRIES`
- `ROOM_SYNC_FINISHED`
- `ROOM_SYNC_FAILED`
- `FORCE_CLOSE_RECOVERY`
- `SUCCESSFUL_DELIVERIES`
- `FINANCIAL_CALCULATION_SUCCESS`
- `FINANCIAL_CALCULATION_ERROR`

### Resultado
- No se encontraron coincidencias exactas para ninguno de estos nombres en el código o documentación.
- No existe una implementación explícita de telemetría con esos eventos en el repositorio actual.

### Observaciones adicionales
- Hay monitoreo básico en frontend y backend, pero no un esquema de eventos telemétricos nombrados para los indicadores solicitados.
- La plataforma no expone claramente un `shadow mode` o un `room sync` con estados de éxito/fallo definidos en los artefactos inspeccionados.

### Conclusión telemetría
- Estado: **No validado / Falta implementación explícita**
- Riesgo: **Alto** si la certificación requiere métricas específicas antes de iniciar pruebas de campo.

---

## 2. Resiliencia

### Simulación de escenarios
Se evaluaron scripts y código para detectar soporte de:
- pérdida de red
- recuperación de red
- cierre forzado
- reinicio de aplicación

### Hallazgos
- No se encontraron scripts específicos de simulación de pérdida de red o recuperación de red.
- `server.js` maneja `SIGINT` y `SIGTERM` para detener los agentes de RTDB:
  - `iniciarAgenteDespacho`
  - `iniciarAgenteSoporte`
  - `iniciarAgenteAntifraude`
- El manejo de cierre forzado está presente en el runtime principal del servidor.
- Existen capturas de errores de red en frontend (`public/js/admin-dashboard.js`) y manejo de reconexión en `src/lib/redis.js`.

### Observaciones adicionales
- No hay una suite de resiliencia automatizada con pasos definidos de desconexión/reconexión.
- El framework RTDB de Firebase ofrece reconexión automática, pero la repo no documenta una validación de ese comportamiento.

### Conclusión resiliencia
- Estado: **Parcialmente soportado**
- Riesgo: **Medio** porque falta una prueba de red offline/recovery formalizada.

---

## 3. Stress Test

### Soporte identificado
El repositorio contiene un script diseñado para pruebas de carga y estrés:
- `scripts/stress-test-panel.js`

### Capacidades del script
- Puede generar datos de prueba para repartidores (`drivers`) y pedidos (`orders`).
- Puede ejecutar un endpoint de carga concurrente en el backend de panel.
- Usa parámetros configurables:
  - `--drivers`
  - `--orders`
  - `--concurrency`
  - `--rounds`
  - `--cleanup`
  - `--seed-only`
  - `--out`
- Permite simular fácilmente cargas de `100`, `250`, `500` pedidos usando `--orders=100`, `--orders=250`, `--orders=500`.

### Métricas disponibles en el script
El script produce mediciones de:
- latencias de endpoint (`p50`, `p95`, `p99`)
- cantidad de solicitudes exitosas y fallidas
- tasa de error
- carga de transacciones de deuda/bloqueo en RTDB

### Evaluación de stress readiness
- Estado: **Soportado**
- Riesgo: **Bajo** en cuanto a capacidad de generar carga y medir latencias/errors.

---

## 4. Resultado y clasificación

### Métricas de certificación
| Área | Estado | Impacto |
|---|---|---|
| Telemetría solicitada | Falta implementación | Alto |
| Resiliencia | Parcial | Medio |
| Stress test | Soportado | Bajo |

### Score estimado
- Telemetría: 0 / 30
- Resiliencia: 20 / 30
- Stress test: 30 / 30
- Documentación / evidencia: 15 / 10 (se compensa por existencia de script) 

Total estimado: **65 / 100**

### Clasificación final
- **READY WITH RISKS**

### Recomendación
- Iniciar pruebas de campo controladas con monitoreo estricto.
- Priorizar antes de la fase siguiente:
  - implementar y capturar los eventos telemétricos solicitados.
  - crear una prueba de resiliencia de red/offline/recovery.
  - validar que las métricas reportadas en campo coincidan con los contadores esperados.

---

## 5. Notas de ejecución
- Este documento se genera a partir de la inspección del código del repositorio.
- No se ejecutaron las pruebas de campo ni las simulaciones en este momento.
- El score y la clasificación se basan en capacidad detectada, no en resultados de pruebas reales.
