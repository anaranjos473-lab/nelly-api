import { spawnSync } from 'child_process';

const CHECKS = [
  {
    name: 'Puerto operativo 3001',
    command: 'node',
    args: ['scripts/validation/validate-operational-port.js'],
    layer: 'infraestructura',
    severity: 'CRITICAL',
    docs: 'docs/architecture/MAPA_DIAGNOSTICO_OPERATIVO_V1.md'
  },
  {
    name: 'Dashboard operativo',
    command: 'node',
    args: ['scripts/validation/validate-operational-dashboard.js'],
    layer: 'operacion',
    severity: 'ERROR',
    docs: 'docs/architecture/CERTIFICACION_S4_DASHBOARD_OPERATIVO_V1.md'
  },
  {
    name: 'Ledger',
    command: 'node',
    args: ['scripts/validation/validate-ledger.js'],
    layer: 'finanzas',
    severity: 'ERROR',
    docs: 'docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md'
  },
  {
    name: 'Billing adapter',
    command: 'node',
    args: ['scripts/validation/validate-billing-adapter.js'],
    layer: 'finanzas',
    severity: 'ERROR',
    docs: 'docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md'
  },
  {
    name: 'Event integrity',
    command: 'node',
    args: ['scripts/validation/validate-event-integrity.js'],
    layer: 'eventos',
    severity: 'ERROR',
    docs: 'docs/architecture/CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md'
  },
  {
    name: 'Event bus hardening',
    command: 'node',
    args: ['scripts/validation/validate-event-bus-hardening.js'],
    layer: 'eventos',
    severity: 'ERROR',
    docs: 'docs/architecture/GATE_CERTIFICACION_S3_V1.md'
  },
  {
    name: 'Audit consumer',
    command: 'node',
    args: ['scripts/validation/validate-audit-consumer.js'],
    layer: 'observabilidad',
    severity: 'WARNING',
    docs: 'docs/architecture/CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md'
  },
  {
    name: 'Metrics consumer',
    command: 'node',
    args: ['scripts/validation/validate-metrics-consumer.js'],
    layer: 'metricas',
    severity: 'WARNING',
    docs: 'docs/architecture/CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md'
  },
  {
    name: 'Finance consumer',
    command: 'node',
    args: ['scripts/validation/validate-finance-consumer.js'],
    layer: 'finanzas',
    severity: 'ERROR',
    docs: 'docs/architecture/CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md'
  },
  {
    name: 'Notification consumer',
    command: 'node',
    args: ['scripts/validation/validate-notification-consumer.js'],
    layer: 'notificaciones',
    severity: 'WARNING',
    docs: 'docs/architecture/CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md'
  },
  {
    name: 'AI consumer',
    command: 'node',
    args: ['scripts/validation/validate-ai-consumer.js'],
    layer: 'ia',
    severity: 'WARNING',
    docs: 'docs/architecture/CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md'
  }
];

const SEVERITY_WEIGHT = {
  INFO: 0,
  WARNING: 1,
  ERROR: 2,
  CRITICAL: 3
};

function tryParseJson(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    return null;
  }
}

function firstLine(text) {
  return String(text || '').trim().split('\n').find(Boolean) || '';
}

function normalizeResult(check, result) {
  const stdout = String(result.stdout || '').trim();
  const stderr = String(result.stderr || '').trim();
  const json = tryParseJson(stdout) || tryParseJson(stderr);
  const ok = result.status === 0;

  if (ok) {
    return {
      name: check.name,
      ok: true,
      layer: check.layer,
      severity: 'INFO',
      code: 'OK',
      probable_cause: null,
      affected_services: [],
      action: 'Continuar operacion.',
      docs: check.docs,
      summary: json?.snapshot || firstLine(stdout) || 'OK'
    };
  }

  return {
    name: check.name,
    ok: false,
    layer: json?.layer || check.layer,
    severity: json?.severity || check.severity,
    code: json?.code || `${check.name.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_FAILED`,
    probable_cause: json?.probable_cause || 'El validador no pudo completar correctamente.',
    affected_services: json?.affected_services || [check.layer],
    action: json?.action || 'Revisar salida del validador, logs y documento asociado.',
    docs: json?.docs || check.docs,
    details: json?.details || null,
    status: json?.status || result.status || null,
    output: firstLine(stderr) || firstLine(stdout) || null,
    timeout: result.error?.code === 'ETIMEDOUT'
  };
}

function runCheck(check) {
  const result = spawnSync(check.command, check.args, {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 60000,
    maxBuffer: 10 * 1024 * 1024,
    env: process.env
  });

  return normalizeResult(check, result);
}

function getWorstSeverity(results) {
  return results.reduce((worst, result) => {
    const current = SEVERITY_WEIGHT[result.severity] ?? 0;
    const previous = SEVERITY_WEIGHT[worst] ?? 0;
    return current > previous ? result.severity : worst;
  }, 'INFO');
}

function getHealthScore(results) {
  if (results.length === 0) return 0;
  const passed = results.filter((result) => result.ok).length;
  return Math.round((passed / results.length) * 100);
}

function groupByLayer(results) {
  return results.reduce((acc, result) => {
    if (!acc[result.layer]) acc[result.layer] = [];
    acc[result.layer].push(result);
    return acc;
  }, {});
}

function printHumanReport(report) {
  console.log('==========================');
  console.log('NELLY OPERATIONAL DOCTOR');
  console.log('==========================');
  console.log('');

  const grouped = groupByLayer(report.results);
  for (const [layer, results] of Object.entries(grouped)) {
    console.log(layer);
    for (const result of results) {
      const mark = result.ok ? 'OK' : result.severity;
      console.log(`  ${mark.padEnd(8)} ${result.name}`);
      if (!result.ok) {
        console.log(`           code: ${result.code}`);
        console.log(`           causa: ${result.probable_cause}`);
        console.log(`           accion: ${result.action}`);
      }
    }
    console.log('');
  }

  console.log(`SALUD GENERAL: ${report.health_score}%`);
  console.log(`SEVERIDAD MAXIMA: ${report.worst_severity}`);
  console.log(`DICTAMEN: ${report.ok ? 'OPERABLE' : 'NO OPERABLE'}`);

  if (report.warnings.length > 0) {
    console.log('');
    console.log('Advertencias:');
    for (const warning of report.warnings) {
      console.log(`- ${warning.name}: ${warning.code}`);
    }
  }

  if (report.failures.length > 0) {
    console.log('');
    console.log('Acciones recomendadas:');
    for (const failure of report.failures) {
      console.log(`- [${failure.layer}] ${failure.action}`);
    }
  }
}

const results = CHECKS.map(runCheck);
const failures = results.filter((result) => !result.ok);
const warnings = failures.filter((result) => result.severity === 'WARNING');
const blockingFailures = failures.filter((result) => ['ERROR', 'CRITICAL'].includes(result.severity));
const report = {
  ok: blockingFailures.length === 0,
  health_score: getHealthScore(results),
  worst_severity: getWorstSeverity(results),
  generated_at: new Date().toISOString(),
  checks_total: results.length,
  checks_ok: results.filter((result) => result.ok).length,
  checks_failed: failures.length,
  warnings,
  failures,
  results
};

if (process.env.DOCTOR_FORMAT === 'json') {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHumanReport(report);
}

process.exit(report.ok ? 0 : 1);
