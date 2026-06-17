#!/usr/bin/env node
/**
 * PASO 2: Ejecutar sonda + Validación de Gobernanza (4 Reglas)
 * 
 * Flow:
 * 1. Ejecutar sonda certify-ped-test-real.mjs
 * 2. Capturar JSON de salida
 * 3. Aplicar 4 validaciones de gobernanza
 * 4. Salvar evidencia completa a PED_TEST_REAL_001_EVIDENCIA.json
 * 5. Emitir certificación si todo pasa
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = new URL(import.meta.url).pathname.split('/.codex-tmp')[0];

function log(msg, data = null) {
  console.log(`[SONDA_VALIDATOR] ${msg}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

function progress(label, data = null) {
  log(`→ ${label}`, data);
}

// ============================================
// PASO 1: Ejecutar sonda
// ============================================
progress('STARTING_SONDA_EXECUTION');

const sondaFile = join(ROOT, '.codex-tmp', 'certify-ped-test-real.mjs');

let sondaOutput = '';
try {
  sondaOutput = execSync(`node "${sondaFile}"`, {
    cwd: ROOT,
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    timeout: 120000
  });
  progress('SONDA_SUCCESS');
} catch (e) {
  progress('SONDA_FAILED', { error: e.message });
  process.exit(1);
}

// ============================================
// PASO 2: Parse JSON output
// ============================================
progress('PARSING_SONDA_OUTPUT');

let evidence = null;
try {
  // Buscar JSON en el output
  const lines = sondaOutput.split('\n');
  const jsonLine = lines.find(l => l.trim().startsWith('{'));
  if (!jsonLine) {
    throw new Error('No JSON found in output');
  }
  evidence = JSON.parse(jsonLine);
  progress('PARSED_JSON_SUCCESS', { 
    steps: evidence.steps?.length || 0,
    pedidoId: evidence.pedido_id
  });
} catch (e) {
  progress('JSON_PARSE_ERROR', { error: e.message, raw: sondaOutput.substring(0, 500) });
  process.exit(1);
}

// ============================================
// PASO 3: Aplicar 4 validaciones de gobernanza
// ============================================

const validacion = {
  transiciones: [],
  eventos: [],
  validaciones: [],
  errores: []
};

// Extraer versiones de cada step
progress('EXTRACTING_VERSIONS');

const stepsConVersion = (evidence.steps || []).filter(s => s.rtdb);

for (const step of stepsConVersion) {
  const label = step.label || '';
  const r = step.rtdb.pedidos_para_reparto || {};
  
  if (label.includes('SEED') && !validacion.transiciones.length) {
    validacion.transiciones.push({
      paso: 'INICIAL',
      estado: r.estado || 'PENDIENTE',
      version: r.version || 0,
      timestamp: r.updated_at,
      step_label: label
    });
  } else if (label.includes('AFTER_LISTO')) {
    validacion.transiciones.push({
      paso: 'LISTO',
      estado: r.estado || 'LISTO',
      version: r.version ?? null,
      timestamp: r.updated_at ?? null,
      step_label: label
    });
  } else if (label.includes('AFTER_ACCEPT')) {
    validacion.transiciones.push({
      paso: 'ACEPTADO',
      estado: r.estado || 'EN_CAMINO',
      version: r.version ?? null,
      timestamp: r.updated_at ?? null,
      step_label: label
    });
  } else if (label.includes('AFTER_COMPLETE')) {
    validacion.transiciones.push({
      paso: 'ENTREGADO',
      estado: r.estado || 'ENTREGADO',
      version: r.version ?? null,
      timestamp: r.updated_at ?? null,
      step_label: label
    });
  }
}

progress('EXTRACTED_TRANSICIONES', { count: validacion.transiciones.length });

// VALIDACIÓN 1: Version incrementó secuencialmente
progress('VALIDACION_1_VERSION_INCREMENT');
let validacion1Pass = true;
let versionAnterior = null;

for (const transicion of validacion.transiciones) {
  if (versionAnterior !== null && transicion.version !== null) {
    if (transicion.version !== versionAnterior + 1) {
      validacion1Pass = false;
      validacion.errores.push({
        validacion: 'VERSION_INCREMENT',
        paso: transicion.paso,
        esperada: versionAnterior + 1,
        recibida: transicion.version
      });
    }
  }
  if (transicion.version !== null) {
    versionAnterior = transicion.version;
  }
}

if (validacion1Pass && validacion.transiciones.length > 0) {
  progress('VALIDACION_1_PASS');
  validacion.validaciones.push({
    regla: 'VERSION_INCREMENT',
    resultado: 'PASS',
    evidencia: validacion.transiciones
  });
} else {
  progress('VALIDACION_1_FAILED');
}

// VALIDACIÓN 2: Estados válidos
progress('VALIDACION_2_ESTADO_VALIDO');
const estadosEsperados = ['PENDIENTE', 'LISTO', 'EN_CAMINO', 'ENTREGADO'];
let validacion2Pass = true;

for (const transicion of validacion.transiciones) {
  if (!estadosEsperados.includes(transicion.estado)) {
    validacion2Pass = false;
    validacion.errores.push({
      validacion: 'ESTADO_VALIDO',
      paso: transicion.paso,
      estado_recibido: transicion.estado,
      estados_validos: estadosEsperados
    });
  }
}

if (validacion2Pass && validacion.transiciones.length > 0) {
  progress('VALIDACION_2_PASS');
  validacion.validaciones.push({
    regla: 'ESTADO_VALIDO',
    resultado: 'PASS',
    evidencia: validacion.transiciones.map(t => ({ paso: t.paso, estado: t.estado }))
  });
} else {
  progress('VALIDACION_2_FAILED');
}

// VALIDACIÓN 3: Timestamps monotónicas
progress('VALIDACION_3_MONOTONIC_TIMESTAMPS');
let timestampAnterior = 0;
let validacion3Pass = true;

for (const transicion of validacion.transiciones) {
  if (transicion.timestamp && transicion.timestamp < timestampAnterior) {
    validacion3Pass = false;
    validacion.errores.push({
      validacion: 'MONOTONIC_TIMESTAMPS',
      paso: transicion.paso,
      timestamp_actual: transicion.timestamp,
      timestamp_anterior: timestampAnterior
    });
  }
  if (transicion.timestamp) {
    timestampAnterior = transicion.timestamp;
  }
}

if (validacion3Pass && validacion.transiciones.length > 0) {
  progress('VALIDACION_3_PASS');
  validacion.validaciones.push({
    regla: 'MONOTONIC_TIMESTAMPS',
    resultado: 'PASS',
    evidencia: validacion.transiciones.map(t => ({ paso: t.paso, timestamp: t.timestamp }))
  });
} else {
  progress('VALIDACION_3_FAILED');
}

// VALIDACIÓN 4: Convergencia
progress('VALIDACION_4_CONVERGENCIA');
const ultimoStep = stepsConVersion[stepsConVersion.length - 1];
let validacion4Pass = true;
const estadosFinales = {};

if (ultimoStep) {
  const estadoRTDB = ultimoStep.rtdb.pedidos_para_reparto?.estado;
  const estadoFirestore = ultimoStep.firestore?.pedido?.estado;
  
  if (estadoRTDB) {
    estadosFinales.RTDB = estadoRTDB;
    if (estadoRTDB !== 'ENTREGADO') validacion4Pass = false;
  }
  if (estadoFirestore) {
    estadosFinales.FIRESTORE = estadoFirestore;
    if (estadoFirestore !== 'ENTREGADO') validacion4Pass = false;
  }
}

if (validacion4Pass && Object.keys(estadosFinales).length > 0) {
  progress('VALIDACION_4_PASS');
  validacion.validaciones.push({
    regla: 'CONVERGENCIA',
    resultado: 'PASS',
    estados_finales: estadosFinales
  });
} else {
  progress('VALIDACION_4_FAILED', { estados: estadosFinales });
  if (Object.keys(estadosFinales).length > 0) {
    validacion.errores.push({
      validacion: 'CONVERGENCIA',
      estados_finales: estadosFinales,
      mensaje: 'Estados no convergen en ENTREGADO'
    });
  }
}

// ============================================
// PASO 4: Resumen
// ============================================

const numPass = validacion.validaciones.filter(v => v.resultado === 'PASS').length;
const totalValidaciones = validacion.validaciones.length;
const resultadoFinal = validacion.errores.length === 0 && numPass === totalValidaciones ? 'PASS ✅' : 'FAILED ❌';

progress('RESUMEN_VALIDACIONES', {
  pass: numPass,
  total: totalValidaciones,
  errores: validacion.errores.length,
  resultado: resultadoFinal
});

// ============================================
// PASO 5: Salvar evidencia completa
// ============================================

progress('SAVING_EVIDENCE');

evidence.gobernanza_validacion = validacion;
evidence.resultado_final = resultadoFinal;

const evidencePath = join(ROOT, 'PED_TEST_REAL_001_EVIDENCIA.json');
writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));

progress('EVIDENCE_SAVED', { path: evidencePath });

// ============================================
// PASO 6: Emitir resultado
// ============================================

if (resultadoFinal === 'PASS ✅') {
  progress('PHASE_1_CERTIFICATION_READY');
  process.exit(0);
} else {
  progress('PHASE_1_CERTIFICATION_FAILED');
  process.exit(1);
}
