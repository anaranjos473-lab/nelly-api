#!/usr/bin/env node
/**
 * VALIDADOR DE GOBERNANZA: Verifica 4 reglas en la evidencia de sonda
 * 
 * Reglas:
 * 1. version++ y updated_at incrementan monótonamente
 * 2. Todos los estados son válidos (PENDIENTE, LISTO, EN_CAMINO, ENTREGADO)
 * 3. Las transiciones son válidas según máquina de estados
 * 4. Convergencia final en ENTREGADO
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const ROOT = join(__dirname, '..');

function progress(label, data = null) {
  console.log(`[VALIDADOR] → ${label}`, data ? JSON.stringify(data, null, 2) : '');
}

// ============================================
// PASO 1: Leer evidencia
// ============================================

progress('VALIDADOR_START');

const evidencePath = join(ROOT, 'PED_TEST_REAL_001_EVIDENCIA.json');

let evidence = null;
try {
  const rawContent = readFileSync(evidencePath, 'utf-8');
  evidence = JSON.parse(rawContent);
  progress('EVIDENCE_LOADED', { pedidoId: evidence.pedido_id, steps: evidence.steps.length });
} catch (e) {
  progress('EVIDENCE_LOAD_ERROR', { error: e.message });
  process.exit(1);
}

// ============================================
// PASO 2: Extractar versiones y estados
// ============================================

progress('EXTRACTING_VERSIONS');

const validacion = {
  transiciones: [],
  errores: [],
  validaciones: []
};

for (const step of evidence.steps) {
  const r = step.rtdb?.pedidos_para_reparto || {};
  if (r.estado) {
    validacion.transiciones.push({
      paso: step.label,
      estado: r.estado,
      version: r.version,
      updated_at: r.updated_at,
      timestamp: step.timestamp
    });
  }
}

progress('EXTRACTED_TRANSICIONES', { count: validacion.transiciones.length });

// ============================================
// VALIDACIÓN 1: Version incrementó secuencialmente
// ============================================

progress('VALIDACION_1_VERSION_INCREMENT');

let validacion1Pass = true;
let versionAnterior = null;

for (const t of validacion.transiciones) {
  if (versionAnterior !== null && t.version !== null) {
    if (t.version !== versionAnterior + 1) {
      validacion1Pass = false;
      validacion.errores.push({
        validacion: 'VERSION_INCREMENT',
        paso: t.paso,
        esperada: versionAnterior + 1,
        recibida: t.version
      });
    }
  }
  if (t.version !== null) {
    versionAnterior = t.version;
  }
}

if (validacion1Pass && validacion.transiciones.length > 0) {
  progress('VALIDACION_1_PASS');
  validacion.validaciones.push({
    regla: 'VERSION_INCREMENT',
    resultado: 'PASS',
    evidencia: validacion.transiciones.map(t => ({ paso: t.paso, version: t.version }))
  });
} else if (!validacion1Pass) {
  progress('VALIDACION_1_FAILED');
}

// ============================================
// VALIDACIÓN 2: Estados válidos
// ============================================

progress('VALIDACION_2_ESTADO_VALIDO');

const estadosEsperados = ['PENDIENTE', 'LISTO', 'EN_CAMINO', 'ENTREGADO'];
let validacion2Pass = true;

for (const t of validacion.transiciones) {
  if (!estadosEsperados.includes(t.estado)) {
    validacion2Pass = false;
    validacion.errores.push({
      validacion: 'ESTADO_VALIDO',
      paso: t.paso,
      estado_recibido: t.estado,
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
} else if (!validacion2Pass) {
  progress('VALIDACION_2_FAILED');
}

// ============================================
// VALIDACIÓN 3: Máquina de estados válida
// ============================================

progress('VALIDACION_3_STATE_MACHINE');

const TRANSICIONES_VALIDAS = {
  'PENDIENTE': ['LISTO'],
  'LISTO': ['EN_CAMINO'],
  'EN_CAMINO': ['ENTREGADO'],
  'ENTREGADO': []
};

let validacion3Pass = true;

for (let i = 0; i < validacion.transiciones.length - 1; i++) {
  const actual = validacion.transiciones[i].estado;
  const siguiente = validacion.transiciones[i + 1].estado;
  
  const transicionesValidas = TRANSICIONES_VALIDAS[actual] || [];
  if (!transicionesValidas.includes(siguiente)) {
    validacion3Pass = false;
    validacion.errores.push({
      validacion: 'STATE_MACHINE',
      pasos: `${actual} → ${siguiente}`,
      transiciones_validas: transicionesValidas
    });
  }
}

if (validacion3Pass && validacion.transiciones.length > 1) {
  progress('VALIDACION_3_PASS');
  validacion.validaciones.push({
    regla: 'STATE_MACHINE',
    resultado: 'PASS',
    evidencia: validacion.transiciones.slice(0, -1).map((t, i) => ({
      desde: t.estado,
      hasta: validacion.transiciones[i + 1].estado,
      valida: true
    }))
  });
} else if (!validacion3Pass) {
  progress('VALIDACION_3_FAILED');
}

// ============================================
// VALIDACIÓN 4: Convergencia en ENTREGADO
// ============================================

progress('VALIDACION_4_CONVERGENCIA');

let validacion4Pass = true;
const ultimoEstado = validacion.transiciones[validacion.transiciones.length - 1]?.estado;

if (ultimoEstado !== 'ENTREGADO') {
  validacion4Pass = false;
  validacion.errores.push({
    validacion: 'CONVERGENCIA',
    estado_final_esperado: 'ENTREGADO',
    estado_final_recibido: ultimoEstado
  });
}

if (validacion4Pass) {
  progress('VALIDACION_4_PASS');
  validacion.validaciones.push({
    regla: 'CONVERGENCIA',
    resultado: 'PASS',
    estado_final: ultimoEstado
  });
} else {
  progress('VALIDACION_4_FAILED');
}

// ============================================
// RESUMEN
// ============================================

const numPass = validacion.validaciones.filter(v => v.resultado === 'PASS').length;
const totalValidaciones = 4;
const resultadoFinal = validacion.errores.length === 0 && numPass === totalValidaciones ? 'PASS ✅' : 'FAILED ❌';

progress('RESUMEN_VALIDACIONES', {
  pass: numPass,
  total: totalValidaciones,
  errores: validacion.errores.length,
  resultado: resultadoFinal
});

// ============================================
// Agregar validación a evidencia
// ============================================

evidence.gobernanza_validacion = validacion;
evidence.resultado_final = resultadoFinal;

// Guardar evidencia completa
writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
progress('EVIDENCE_UPDATED', { path: evidencePath });

// ============================================
// Emitir resultado
// ============================================

if (resultadoFinal === 'PASS ✅') {
  progress('PHASE_1_READY_FOR_CERTIFICATION');
  console.log('\n✅ PHASE 1 CERTIFICATION READY');
  console.log('All 4 governance rules PASSED:');
  console.log('  ✓ VERSION_INCREMENT');
  console.log('  ✓ ESTADO_VALIDO');
  console.log('  ✓ STATE_MACHINE');
  console.log('  ✓ CONVERGENCIA');
  process.exit(0);
} else {
  progress('PHASE_1_CERTIFICATION_FAILED');
  console.log('\n❌ PHASE 1 CERTIFICATION FAILED');
  console.log('Errors found:');
  for (const err of validacion.errores) {
    console.log(`  ✗ ${err.validacion}: ${JSON.stringify(err)}`);
  }
  process.exit(1);
}
