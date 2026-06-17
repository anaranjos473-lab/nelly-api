# VALIDACIÓN SONDA: Evidencia de Consistencia de Datos

## Propósito

Después de aplicar `PLAN_CORRECCIONES_DELIVERY_JS_ENDURECIDO.md`, la sonda debe capturar evidencia de que las 4 reglas se cumplen.

No solo importa que la sonda "termine", importa que sea **verificable** que no hay inconsistencias.

---

## Evidencia a Capturar (Script)

Agregar este código a la sonda (`simulacion_e2e.js` o test correspondiente):

```javascript
// ============================================
// EVIDENCIA DE CONSISTENCIA - FASE 1 VALIDACIÓN
// ============================================

const evidenciaConsistencia = {
  transiciones: [],
  eventos: [],
  validaciones: []
};

// PASO 1: Estado inicial
const pedidoInicial = await db.ref(`pedidos/${pedidoId}`).once('value');
console.log('[EVIDENCIA] Estado inicial:', {
  estado: pedidoInicial.val().estado,
  version: pedidoInicial.val().version,
  timestamp: pedidoInicial.val().updated_at
});

evidenciaConsistencia.transiciones.push({
  paso: 'INICIAL',
  estado: pedidoInicial.val().estado,
  version: pedidoInicial.val().version,
  timestamp: pedidoInicial.val().updated_at
});

// PASO 2: Después de LISTO
const pedidoListo = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
console.log('[EVIDENCIA] Después /listo:', {
  estado: pedidoListo.val().estado,
  version: pedidoListo.val().version,
  timestamp: pedidoListo.val().updated_at
});

// ✅ Validación: version incrementó
if (pedidoListo.val().version !== pedidoInicial.val().version + 1) {
  console.error('❌ VALIDACIÓN FALLIDA: version no incrementó en /listo');
  console.error(`   Esperaba ${pedidoInicial.val().version + 1}, recibí ${pedidoListo.val().version}`);
  process.exit(1);
}

evidenciaConsistencia.transiciones.push({
  paso: 'LISTO',
  estado: pedidoListo.val().estado,
  version: pedidoListo.val().version,
  timestamp: pedidoListo.val().updated_at
});

// PASO 3: Capturar evento de LISTO
const eventosListo = (await db.ref(`order_events/${pedidoId}`).once('value')).val();
console.log('[EVIDENCIA] Eventos después /listo:', eventosListo ? Object.keys(eventosListo).length : 0);

if (!eventosListo || Object.keys(eventosListo).length === 0) {
  console.error('❌ VALIDACIÓN FALLIDA: No hay evento de LISTO');
  process.exit(1);
}

const eventoListo = Object.values(eventosListo)[0];
evidenciaConsistencia.eventos.push({
  transicion: 'LISTO',
  tipo: eventoListo.tipo,
  version: eventoListo.version,
  timestamp: eventoListo.timestamp
});

// PASO 4: Después de /accept-order (EN_CAMINO)
const pedidoAceptado = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
console.log('[EVIDENCIA] Después /accept-order:', {
  estado: pedidoAceptado.val().estado,
  version: pedidoAceptado.val().version,
  timestamp: pedidoAceptado.val().updated_at
});

// ✅ Validación: version incrementó
if (pedidoAceptado.val().version !== pedidoListo.val().version + 1) {
  console.error('❌ VALIDACIÓN FALLIDA: version no incrementó en /accept-order');
  console.error(`   Esperaba ${pedidoListo.val().version + 1}, recibí ${pedidoAceptado.val().version}`);
  process.exit(1);
}

// ✅ Validación: Estado válido (LISTO → EN_CAMINO)
if (pedidoAceptado.val().estado !== 'EN_CAMINO') {
  console.error('❌ VALIDACIÓN FALLIDA: Estado no es EN_CAMINO');
  console.error(`   Recibí: ${pedidoAceptado.val().estado}`);
  process.exit(1);
}

evidenciaConsistencia.transiciones.push({
  paso: 'ACEPTADO',
  estado: pedidoAceptado.val().estado,
  version: pedidoAceptado.val().version,
  timestamp: pedidoAceptado.val().updated_at
});

// PASO 5: Capturar evento de ACEPTADO
const eventosAceptado = (await db.ref(`order_events/${pedidoId}`).once('value')).val();
console.log('[EVIDENCIA] Eventos después /accept-order:', Object.keys(eventosAceptado).length);

if (Object.keys(eventosAceptado).length !== 2) {
  console.error('❌ VALIDACIÓN FALLIDA: Debería haber 2 eventos (LISTO, ACEPTADO)');
  console.error(`   Recibí: ${Object.keys(eventosAceptado).length}`);
  process.exit(1);
}

const eventoAceptado = Object.values(eventosAceptado).find(e => e.tipo === 'ACEPTADO');
if (!eventoAceptado) {
  console.error('❌ VALIDACIÓN FALLIDA: No existe evento tipo ACEPTADO');
  process.exit(1);
}

evidenciaConsistencia.eventos.push({
  transicion: 'ACEPTADO',
  tipo: eventoAceptado.tipo,
  version: eventoAceptado.version,
  timestamp: eventoAceptado.timestamp
});

// PASO 6: Después de /complete-order (ENTREGADO)
const pedidoEntregado = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
console.log('[EVIDENCIA] Después /complete-order:', {
  estado: pedidoEntregado.val().estado,
  version: pedidoEntregado.val().version,
  timestamp: pedidoEntregado.val().updated_at
});

// ✅ Validación: version incrementó
if (pedidoEntregado.val().version !== pedidoAceptado.val().version + 1) {
  console.error('❌ VALIDACIÓN FALLIDA: version no incrementó en /complete-order');
  console.error(`   Esperaba ${pedidoAceptado.val().version + 1}, recibí ${pedidoEntregado.val().version}`);
  process.exit(1);
}

// ✅ Validación: Estado válido (EN_CAMINO → ENTREGADO)
if (pedidoEntregado.val().estado !== 'ENTREGADO') {
  console.error('❌ VALIDACIÓN FALLIDA: Estado no es ENTREGADO');
  console.error(`   Recibí: ${pedidoEntregado.val().estado}`);
  process.exit(1);
}

evidenciaConsistencia.transiciones.push({
  paso: 'ENTREGADO',
  estado: pedidoEntregado.val().estado,
  version: pedidoEntregado.val().version,
  timestamp: pedidoEntregado.val().updated_at
});

// PASO 7: Capturar evento de ENTREGADO
const eventosEntregado = (await db.ref(`order_events/${pedidoId}`).once('value')).val();
console.log('[EVIDENCIA] Eventos después /complete-order:', Object.keys(eventosEntregado).length);

if (Object.keys(eventosEntregado).length !== 3) {
  console.error('❌ VALIDACIÓN FALLIDA: Debería haber 3 eventos (LISTO, ACEPTADO, ENTREGADO)');
  console.error(`   Recibí: ${Object.keys(eventosEntregado).length}`);
  process.exit(1);
}

const eventoEntregado = Object.values(eventosEntregado).find(e => e.tipo === 'ENTREGADO');
if (!eventoEntregado) {
  console.error('❌ VALIDACIÓN FALLIDA: No existe evento tipo ENTREGADO');
  process.exit(1);
}

evidenciaConsistencia.eventos.push({
  transicion: 'ENTREGADO',
  tipo: eventoEntregado.tipo,
  version: eventoEntregado.version,
  timestamp: eventoEntregado.timestamp
});

// ============================================
// VALIDACIONES FINALES
// ============================================

console.log('\n[VALIDACIÓN] Consistencia de datos...\n');

// ✅ REGLA 1: Version incrementó en cada paso
let versionAnterior = 1; // Inicial
for (const transicion of evidenciaConsistencia.transiciones.slice(1)) {
  if (transicion.version !== versionAnterior + 1) {
    console.error(`❌ Version no incrementó de forma secuencial en ${transicion.paso}`);
    console.error(`   Anterior: ${versionAnterior}, Actual: ${transicion.version}`);
    process.exit(1);
  }
  versionAnterior = transicion.version;
}
console.log('✅ REGLA 1: Version++ en cada transición');

// ✅ REGLA 2: Número de eventos = Número de transiciones
const numTransiciones = evidenciaConsistencia.transiciones.length - 1; // Excluir inicial
const numEventos = evidenciaConsistencia.eventos.length;
if (numEventos !== numTransiciones) {
  console.error(`❌ Número de eventos no coincide con transiciones`);
  console.error(`   Transiciones: ${numTransiciones}, Eventos: ${numEventos}`);
  process.exit(1);
}
console.log(`✅ REGLA 2: ${numEventos} eventos exactamente (sin duplicados)`);

// ✅ REGLA 3: Timestamps incrementan
let timestampAnterior = 0;
for (const evento of evidenciaConsistencia.eventos) {
  if (evento.timestamp < timestampAnterior) {
    console.error(`❌ Timestamp no es monotónico en evento ${evento.transicion}`);
    process.exit(1);
  }
  timestampAnterior = evento.timestamp;
}
console.log('✅ REGLA 3: Timestamps monotónicas');

// ✅ REGLA 4: Estados válidos
const estadosEsperados = ['PENDIENTE', 'LISTO', 'EN_CAMINO', 'ENTREGADO'];
for (const transicion of evidenciaConsistencia.transiciones) {
  if (!estadosEsperados.includes(transicion.estado)) {
    console.error(`❌ Estado inválido en ${transicion.paso}: ${transicion.estado}`);
    process.exit(1);
  }
}
console.log('✅ REGLA 4: Todos los estados son válidos');

// ============================================
// RESUMEN FINAL
// ============================================

console.log('\n[RESULTADO] ✅ PED_TEST_REAL_001 PASS\n');
console.log('Transiciones capturadas:');
evidenciaConsistencia.transiciones.forEach(t => {
  console.log(`  ${t.paso.padEnd(12)} | Estado: ${t.estado.padEnd(12)} | Version: ${t.version} | TS: ${t.timestamp}`);
});

console.log('\nEventos capturados:');
evidenciaConsistencia.eventos.forEach(e => {
  console.log(`  ${e.transicion.padEnd(12)} | Tipo: ${e.tipo.padEnd(12)} | Version: ${e.version} | TS: ${e.timestamp}`);
});

console.log('\n[CONSISTENCIA] ✅ GARANTIZADA\n');

// Guardar evidencia a archivo
const fs = require('fs');
fs.writeFileSync(
  'PED_TEST_REAL_001_EVIDENCIA.json',
  JSON.stringify(evidenciaConsistencia, null, 2)
);
console.log('[LOG] Evidencia guardada en PED_TEST_REAL_001_EVIDENCIA.json');
```

---

## Salida Esperada (STDOUT)

```
[EVIDENCIA] Estado inicial: { estado: 'PENDIENTE', version: 1, timestamp: 1718... }
[EVIDENCIA] Después /listo: { estado: 'LISTO', version: 2, timestamp: 1718... }
[EVIDENCIA] Eventos después /listo: 1
[EVIDENCIA] Después /accept-order: { estado: 'EN_CAMINO', version: 3, timestamp: 1718... }
[EVIDENCIA] Eventos después /accept-order: 2
[EVIDENCIA] Después /complete-order: { estado: 'ENTREGADO', version: 4, timestamp: 1718... }
[EVIDENCIA] Eventos después /complete-order: 3

[VALIDACIÓN] Consistencia de datos...

✅ REGLA 1: Version++ en cada transición
✅ REGLA 2: 3 eventos exactamente (sin duplicados)
✅ REGLA 3: Timestamps monotónicas
✅ REGLA 4: Todos los estados son válidos

[RESULTADO] ✅ PED_TEST_REAL_001 PASS

Transiciones capturadas:
  INICIAL       | Estado: PENDIENTE    | Version: 1 | TS: 1718...
  LISTO         | Estado: LISTO        | Version: 2 | TS: 1718...
  ACEPTADO      | Estado: EN_CAMINO    | Version: 3 | TS: 1718...
  ENTREGADO     | Estado: ENTREGADO    | Version: 4 | TS: 1718...

Eventos capturados:
  LISTO         | Tipo: LISTO          | Version: 2 | TS: 1718...
  ACEPTADO      | Tipo: ACEPTADO       | Version: 3 | TS: 1718...
  ENTREGADO     | Tipo: ENTREGADO      | Version: 4 | TS: 1718...

[CONSISTENCIA] ✅ GARANTIZADA

[LOG] Evidencia guardada en PED_TEST_REAL_001_EVIDENCIA.json
```

---

## Matriz de Validación

La sonda debe validar estas 8 condiciones:

| Condición | Verificación | Status |
|-----------|-------------|--------|
| **V1** | version inicial = 1 | ✅ OK |
| **V2** | version después /listo = 2 | ✅ OK |
| **V3** | version después /accept = 3 | ✅ OK |
| **V4** | version después /complete = 4 | ✅ OK |
| **E1** | 1 evento después /listo | ✅ OK |
| **E2** | 2 eventos después /accept | ✅ OK |
| **E3** | 3 eventos después /complete | ✅ OK |
| **Consistencia** | No hay duplicados, sin saltos de version | ✅ OK |

Si CUALQUIERA falla → Sonda reporta exactamente cuál y por qué.

---

## Archivo de Evidencia (JSON)

```json
{
  "transiciones": [
    {
      "paso": "INICIAL",
      "estado": "PENDIENTE",
      "version": 1,
      "timestamp": 1718634000000
    },
    {
      "paso": "LISTO",
      "estado": "LISTO",
      "version": 2,
      "timestamp": 1718634001000
    },
    {
      "paso": "ACEPTADO",
      "estado": "EN_CAMINO",
      "version": 3,
      "timestamp": 1718634002000
    },
    {
      "paso": "ENTREGADO",
      "estado": "ENTREGADO",
      "version": 4,
      "timestamp": 1718634003000
    }
  ],
  "eventos": [
    {
      "transicion": "LISTO",
      "tipo": "LISTO",
      "version": 2,
      "timestamp": 1718634001000
    },
    {
      "transicion": "ACEPTADO",
      "tipo": "ACEPTADO",
      "version": 3,
      "timestamp": 1718634002000
    },
    {
      "transicion": "ENTREGADO",
      "tipo": "ENTREGADO",
      "version": 4,
      "timestamp": 1718634003000
    }
  ]
}
```

---

## Checklist de Validación

Después de aplicar el plan endurecido, antes de marcar FASE 1 como certificada:

- [ ] Sonda captura evidencia inicial (PENDIENTE, v1)
- [ ] Cada transición incrementa version exactamente +1
- [ ] Número de eventos = Número de transiciones (sin duplicados)
- [ ] Archivo `PED_TEST_REAL_001_EVIDENCIA.json` generado correctamente
- [ ] Todas las 8 validaciones pasan
- [ ] Matrices de gobernanza en 5️⃣ endpoints son uniformes

**Si todo pasa:** ✅ FASE 1 CERTIFICADA

---

## Próximo Paso

Después de aplicar el plan endurecido y validar la sonda:

1. Guardar evidencia en commit: `git add PED_TEST_REAL_001_EVIDENCIA.json`
2. Crear tag: `git tag phase1-certified-with-evidence`
3. Proceder a PUNTO 2: Bridge Firestore ↔ RTDB audit
