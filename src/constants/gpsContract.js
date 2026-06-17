/**
 * PHASE 2B - GPS LIVENESS OPERATING CONTRACT
 * 
 * Define los parámetros operacionales explícitos que evitan falsos positivos
 * de limpieza y aseguran consistencia entre Android, Backend y UI.
 * 
 * Verificar al implementar PHASE 2B.
 */

// ============================================
// PARÁMETROS OPERACIONALES (No cambiar sin auditoría)
// ============================================

export const GPS_LIVENESS_CONTRACT = {
  /**
   * TRACKING_INTERVAL_MS
   * 
   * Cuán frecuentemente Android reporta GPS al backend
   * Definido en: app/src/main/java/com/nelly/driver/service/DeliveryTrackingService.kt
   * 
   * Valor: 30_000 (30 segundos)
   * Tolerancia: ±5 segundos (network delay)
   */
  TRACKING_INTERVAL_MS: 30 * 1000,

  /**
   * TTL_MS (Time To Live)
   * 
   * Cuánto tiempo sin actualización antes de considerar que el conductor está offline
   * Equivale a: perder 4 GPS updates consecutivos
   * 
   * Fórmula: TTL = 4 × TRACKING_INTERVAL
   * Cálculo:  4 × 30s = 120s
   * 
   * Valor: 120_000 (120 segundos)
   * Justificación: 
   *   - 4 updates = cobertura confiablemente perdida
   *   - Tolera 1-2 segundos de network delay por update
   */
  TTL_MS: 120 * 1000,

  /**
   * CLEANUP_INTERVAL_MS
   * 
   * Con qué frecuencia ejecuta la Cloud Function de limpieza
   * Debe ser <= TTL/2 para evitar que haya conductores stale indefinidamente
   * 
   * Valor: 60_000 (1 minuto)
   * Justificación:
   *   - Ejecuta cada 1 minuto
   *   - Si TTL = 120s, el peor caso es ~60s de retraso (mitad del TTL)
   *   - Aceptable para operación
   */
  CLEANUP_INTERVAL_MS: 60 * 1000,

  /**
   * STALE_THRESHOLD_MS
   * 
   * Criterio de eliminación (debe ser igual a TTL_MS)
   * 
   * Regla: if (now - timestamp > STALE_THRESHOLD_MS) → delete
   * 
   * Valor: 120_000
   */
  STALE_THRESHOLD_MS: 120 * 1000,

  /**
   * MAX_NETWORK_DELAY_MS
   * 
   * Máximo delay esperado en la red
   * Usado por UI para calcular edad estimada
   * 
   * Valor: 10_000 (10 segundos)
   * Justificación:
   *   - En cobertura normal: 2-5 segundos
   *   - En cobertura débil: hasta 10 segundos
   *   - Arriba de 10s = considerar problema de conectividad
   */
  MAX_NETWORK_DELAY_MS: 10 * 1000,

  /**
   * OFFLINE_IMMEDIATE
   * 
   * Si driver llama a POST /driver-offline, eliminar inmediatamente
   * No esperar cleanup
   * 
   * Valor: true
   * Implementación: routes/delivery.js /driver-offline endpoint
   */
  OFFLINE_IMMEDIATE: true
};

// ============================================
// DEFINICIÓN DE ESTADOS (para documentación)
// ============================================

export const GPS_STATES = {
  /**
   * ACTIVE: Conductor está en pedido y reportando GPS normalmente
   * Criterio: age <= TRACKING_INTERVAL_MS + buffer (< 40s)
   */
  ACTIVE: {
    description: 'Reportando GPS normalmente',
    age_max_ms: 40 * 1000,
    color: '#00FF00',  // Green
    icon: '🟢'
  },

  /**
   * DEGRADED: Cobertura débil, pero todavía reciente
   * Criterio: age > 40s Y age <= TTL_MS * 0.5 (40-60s)
   */
  DEGRADED: {
    description: 'Cobertura débil o retardo en network',
    age_max_ms: 60 * 1000,
    color: '#FFFF00',  // Yellow
    icon: '🟡'
  },

  /**
   * STALE: Sin GPS por mucho tiempo, está para ser eliminado
   * Criterio: age > TTL_MS * 0.5 Y age <= TTL_MS (60-120s)
   */
  STALE: {
    description: 'Sin actualización, próximo a ser eliminado',
    age_max_ms: 120 * 1000,
    color: '#FF6600',  // Orange
    icon: '🟠'
  },

  /**
   * OFFLINE: No reportó en > 120s, debe estar eliminado
   * Criterio: age > TTL_MS (> 120s)
   */
  OFFLINE: {
    description: 'Conductor offline, debe estar eliminado',
    age_max_ms: Infinity,
    color: '#FF0000',  // Red
    icon: '🔴'
  }
};

// ============================================
// INVARIANTES (No se pueden violar)
// ============================================

export const GPS_INVARIANTS = [
  {
    invariant: 'Único escritor',
    description: 'conductores_activos/{uid} solo se escribe desde routes/delivery.js:/update-location',
    verification: "grep -c 'conductores_activos.*set\\|conductores_activos.*update' routes/delivery.js | grep -E '(set|update).*conductores'"
  },
  {
    invariant: 'Timestamp siempre presente',
    description: 'Si conductores_activos/{uid} existe, DEBE tener timestamp > 0',
    verification: 'Cloud Function cleanup: if (!data.timestamp) { delete; }'
  },
  {
    invariant: 'Eliminación por dos vías',
    description: 'Conductor se elimina si: (1) POST /driver-offline o (2) age > TTL durante cleanup',
    verification: 'UI debe filtrar edad antes de pintar para no confiar solo en backend cleanup'
  },
  {
    invariant: 'No existe repartidores_activos para GPS',
    description: 'GPS se consolida en conductores_activos, repartidores_activos se elimina de mapa',
    verification: "grep -r 'repartidores_activos' public/js/mapa* should return 0"
  },
  {
    invariant: 'Idem potencia de cleanup',
    description: 'Ejecutar cleanup 2 veces = ejecutar 1 vez (no causa corrupción)',
    verification: 'Cleanup usa .set(null) que es idempotente'
  }
];

// ============================================
// VERIFICACIÓN POST-IMPLEMENTACIÓN
// ============================================

export async function verifyGPSContract() {
  const verification = {
    timestamp: new Date().toISOString(),
    checks: [],
    all_pass: true
  };

  // Check 1: Parámetros documentados
  verification.checks.push({
    check: 'Parámetros documentados',
    expected: 'TRACKING_INTERVAL=30s, TTL=120s, CLEANUP=60s',
    pass: GPS_LIVENESS_CONTRACT.TRACKING_INTERVAL_MS === 30000 &&
          GPS_LIVENESS_CONTRACT.TTL_MS === 120000 &&
          GPS_LIVENESS_CONTRACT.CLEANUP_INTERVAL_MS === 60000
  });

  // Check 2: Relación TTL vs TRACKING_INTERVAL
  const ratio = GPS_LIVENESS_CONTRACT.TTL_MS / GPS_LIVENESS_CONTRACT.TRACKING_INTERVAL_MS;
  verification.checks.push({
    check: 'TTL = 4 × TRACKING_INTERVAL',
    expected: 'ratio = 4',
    actual: ratio,
    pass: ratio === 4
  });

  // Check 3: Cleanup frequency
  verification.checks.push({
    check: 'Cleanup <= TTL/2',
    expected: `${GPS_LIVENESS_CONTRACT.CLEANUP_INTERVAL_MS}ms <= ${GPS_LIVENESS_CONTRACT.TTL_MS / 2}ms`,
    pass: GPS_LIVENESS_CONTRACT.CLEANUP_INTERVAL_MS <= GPS_LIVENESS_CONTRACT.TTL_MS / 2
  });

  // Check 4: Offline immediate flag
  verification.checks.push({
    check: 'Offline es inmediato',
    expected: 'true',
    actual: GPS_LIVENESS_CONTRACT.OFFLINE_IMMEDIATE,
    pass: GPS_LIVENESS_CONTRACT.OFFLINE_IMMEDIATE === true
  });

  verification.all_pass = verification.checks.every(c => c.pass);

  return verification;
}

// ============================================
// EJEMPLO: Cálculo de edad y estado
// ============================================

export function getDriverGPSState(timestamp) {
  const now = Date.now();
  const age = now - timestamp;
  const { ACTIVE, DEGRADED, STALE, OFFLINE } = GPS_STATES;

  if (age <= ACTIVE.age_max_ms) return ACTIVE;
  if (age <= DEGRADED.age_max_ms) return DEGRADED;
  if (age <= STALE.age_max_ms) return STALE;
  return OFFLINE;
}

// ============================================
// EJEMPLO: Validación de falsos positivos
// ============================================

export function validateNoFalsePositives() {
  const scenarios = [
    {
      name: 'GPS actualizado hace 30s (normal)',
      timestamp: Date.now() - 30000,
      shouldDelete: false,
      reason: 'Dentro de TRACKING_INTERVAL'
    },
    {
      name: 'GPS actualizado hace 60s (cobertura débil)',
      timestamp: Date.now() - 60000,
      shouldDelete: false,
      reason: 'Dentro de DEGRADED range'
    },
    {
      name: 'GPS actualizado hace 100s (casi stale)',
      timestamp: Date.now() - 100000,
      shouldDelete: false,
      reason: 'Dentro de STALE range, pero no sobre TTL'
    },
    {
      name: 'GPS actualizado hace 120s (exacto TTL)',
      timestamp: Date.now() - 120000,
      shouldDelete: true,
      reason: 'Exactamente en limite TTL'
    },
    {
      name: 'GPS actualizado hace 140s (claramente stale)',
      timestamp: Date.now() - 140000,
      shouldDelete: true,
      reason: 'Sobre TTL_MS'
    }
  ];

  return scenarios.map(s => ({
    ...s,
    actualShouldDelete: (Date.now() - s.timestamp) > GPS_LIVENESS_CONTRACT.TTL_MS,
    passesValidation: 
      ((Date.now() - s.timestamp) > GPS_LIVENESS_CONTRACT.TTL_MS) === s.shouldDelete
  }));
}

// ============================================
// EXPORT FINAL
// ============================================

export default {
  contract: GPS_LIVENESS_CONTRACT,
  states: GPS_STATES,
  invariants: GPS_INVARIANTS,
  verify: verifyGPSContract,
  getState: getDriverGPSState,
  validateNoFalsePositives
};
