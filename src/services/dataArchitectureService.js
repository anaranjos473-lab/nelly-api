const DATA_ARCHITECTURE_MODE = 'pilot_rtdb_baseline';

const TARGET_ARCHITECTURE = {
  businessPersistence: 'firestore',
  liveOperations: 'rtdb',
  migrationStatus: 'target_documented_not_active',
  runtimeRule: 'critical_writes_backend_only'
};

const RTDB_ENTITIES = [
  { path: 'pedidos', domain: 'Pedidos', sourceRole: 'pilot_canonical', owner: 'Servicio de Pedidos', centers: ['Operaciones', 'Comercio', 'Logistica', 'CRM', 'Finanzas', 'Analytics'] },
  { path: 'pedidos_para_reparto', domain: 'Pedidos', sourceRole: 'projection', owner: 'Servicio de Despacho', centers: ['Operaciones', 'Logistica', 'Driver'] },
  { path: 'pedidos_en_camino', domain: 'Pedidos', sourceRole: 'projection', owner: 'Servicio de Entrega', centers: ['Operaciones', 'Logistica', 'Cliente'] },
  { path: 'pedidos_activos', domain: 'Pedidos', sourceRole: 'projection', owner: 'Servicio Operativo', centers: ['Operaciones', 'Gobierno', 'Analytics'] },
  { path: 'pedidos_completados', domain: 'Pedidos', sourceRole: 'projection_history', owner: 'Servicio de Cierre', centers: ['Finanzas', 'Analytics', 'Gobierno'] },
  { path: 'repartidores', domain: 'Logistica', sourceRole: 'pilot_canonical', owner: 'Servicio de Repartidores', centers: ['Logistica', 'Finanzas', 'Gobierno'] },
  { path: 'usuarios/repartidores', domain: 'Identidad', sourceRole: 'legacy_projection', owner: 'Servicio de Usuarios', centers: ['Gobierno'] },
  { path: 'conductores_activos', domain: 'Logistica', sourceRole: 'live_state', owner: 'Servicio Logistico', centers: ['Logistica', 'Operaciones'] },
  { path: 'repartidores_activos', domain: 'Logistica', sourceRole: 'legacy_live_state', owner: 'Servicio Logistico Legacy', centers: ['Logistica'] },
  { path: 'finanzas', domain: 'Finanzas', sourceRole: 'pilot_projection', owner: 'Servicio Financiero', centers: ['Finanzas', 'Operaciones', 'Analytics'] },
  { path: 'historial_ventas', domain: 'Finanzas', sourceRole: 'projection_history', owner: 'Servicio Financiero', centers: ['Finanzas', 'Analytics', 'Comercio'] },
  { path: 'liquidaciones', domain: 'Finanzas', sourceRole: 'pilot_financial_canonical', owner: 'Servicio Financiero', centers: ['Finanzas', 'Gobierno'] },
  { path: 'liquidaciones_auditoria', domain: 'Finanzas', sourceRole: 'audit', owner: 'Servicio Financiero', centers: ['Finanzas', 'Gobierno', 'Developer'] },
  { path: 'market_v1/restaurantes', domain: 'Comercio', sourceRole: 'pilot_canonical', owner: 'Servicio Admin/Comercio', centers: ['Gobierno', 'Comercio', 'Operaciones'] },
  { path: 'notificaciones', domain: 'Soporte', sourceRole: 'projection', owner: 'Agentes/Soporte', centers: ['Operaciones', 'Gobierno'] },
  { path: 'eventos_operativos', domain: 'Auditoria', sourceRole: 'audit', owner: 'Agentes/Developer', centers: ['Developer', 'Gobierno', 'Operaciones'] },
  { path: 'configuracion/sistema', domain: 'Configuracion', sourceRole: 'pilot_config', owner: 'Gobierno/Agentes', centers: ['Gobierno', 'Developer'] },
  { path: 'zonas_calor', domain: 'Logistica', sourceRole: 'config_projection', owner: 'Admin/Analytics', centers: ['Operaciones', 'Logistica', 'Analytics'] },
  { path: 'chats', domain: 'Soporte', sourceRole: 'candidate', owner: 'Futuro Servicio de Chat', centers: ['Soporte', 'Cliente', 'Operaciones'] }
];

const FIRESTORE_BUSINESS_COLLECTIONS = [
  { collection: 'orders', domain: 'Pedidos', targetRole: 'target_canonical', owner: 'Servicio de Pedidos', centers: ['Operaciones', 'Comercio', 'Logistica', 'CRM', 'Finanzas', 'Analytics'] },
  { collection: 'pedidos', domain: 'Pedidos', targetRole: 'legacy_duplicate', owner: 'Servicio de Pedidos Legacy/Deprecacion', centers: [] },
  { collection: 'pedidos_en_curso', domain: 'Pedidos', targetRole: 'legacy_or_projection_candidate', owner: 'Servicio Operativo Legacy', centers: ['Operaciones', 'Logistica'] },
  { collection: 'pedidos_completados', domain: 'Pedidos', targetRole: 'target_history_candidate', owner: 'Servicio de Cierre', centers: ['Finanzas', 'Analytics'] },
  { collection: 'restaurants', domain: 'Comercio', targetRole: 'target_canonical', owner: 'Servicio Admin/Comercio', centers: ['Gobierno', 'Comercio'] },
  { collection: 'clientes', domain: 'CRM', targetRole: 'target_canonical', owner: 'Servicio CRM', centers: ['CRM', 'Comercio', 'Analytics'] },
  { collection: 'users', domain: 'Identidad', targetRole: 'target_or_legacy_identity', owner: 'Servicio de Identidad', centers: ['Gobierno', 'Developer'] },
  { collection: 'finanzas', domain: 'Finanzas', targetRole: 'target_canonical', owner: 'Servicio Financiero', centers: ['Finanzas', 'Gobierno', 'Analytics'] },
  { collection: 'liquidaciones', domain: 'Finanzas', targetRole: 'target_canonical', owner: 'Servicio Financiero', centers: ['Finanzas', 'Gobierno'] },
  { collection: 'metricas', domain: 'Analytics', targetRole: 'target_persistent_metrics', owner: 'Servicio Analytics', centers: ['Analytics'] },
  { collection: 'configuracion', domain: 'Configuracion', targetRole: 'target_canonical', owner: 'Gobierno/Config', centers: ['Gobierno', 'Developer'] },
  { collection: 'bitacora_forense', domain: 'Auditoria', targetRole: 'target_audit', owner: 'Servicio Auditoria', centers: ['Developer', 'Gobierno'] },
  { collection: 'order_events', domain: 'Auditoria', targetRole: 'target_event_log', owner: 'Servicio de Eventos', centers: ['Developer', 'Operaciones', 'Analytics'] }
];

const COEXISTENCE_RULES = [
  {
    id: 'orders_rtdb_firestore',
    domain: 'Pedidos',
    rtdbPaths: ['pedidos'],
    firestoreCollections: ['orders', 'pedidos'],
    severityWhenBoth: 'warning',
    message: 'Pedidos existen en RTDB y Firestore. Para piloto RTDB permanece baseline; Firestore no debe convertirse en escritor paralelo sin migracion.'
  },
  {
    id: 'finance_rtdb_firestore',
    domain: 'Finanzas',
    rtdbPaths: ['finanzas', 'liquidaciones', 'historial_ventas'],
    firestoreCollections: ['finanzas', 'liquidaciones'],
    severityWhenBoth: 'high',
    message: 'Datos financieros existen en RTDB y Firestore. No contabilizar dinero desde dos fuentes oficiales.'
  },
  {
    id: 'drivers_live_duplicates',
    domain: 'Logistica',
    rtdbPaths: ['conductores_activos', 'repartidores_activos'],
    firestoreCollections: [],
    severityWhenBoth: 'warning',
    message: 'Existen dos vistas vivas de repartidores. Deben tratarse como proyecciones temporales.'
  }
];

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function countChildren(snapshot) {
  if (!snapshot?.exists?.()) return 0;
  if (typeof snapshot.numChildren === 'function') return snapshot.numChildren();
  const value = snapshot.val?.();
  return value && typeof value === 'object' ? Object.keys(value).length : 1;
}

async function inspectRtdbEntity(database, descriptor) {
  try {
    const snapshot = await withTimeout(
      database.ref(descriptor.path).once('value'),
      4500,
      `rtdb:${descriptor.path}`
    );
    return {
      ...descriptor,
      store: 'rtdb',
      exists: snapshot.exists(),
      children: countChildren(snapshot),
      ok: true
    };
  } catch (error) {
    return {
      ...descriptor,
      store: 'rtdb',
      exists: false,
      children: 0,
      ok: false,
      error: error.message
    };
  }
}

async function inspectFirestoreCollections(firestore, descriptors) {
  try {
    const topLevel = await withTimeout(
      firestore.listCollections(),
      4500,
      'firestore:listCollections'
    );
    const existing = new Set(topLevel.map((collection) => collection.id));
    return descriptors.map((descriptor) => ({
      ...descriptor,
      store: 'firestore',
      exists: existing.has(descriptor.collection),
      ok: true
    }));
  } catch (error) {
    return descriptors.map((descriptor) => ({
      ...descriptor,
      store: 'firestore',
      exists: false,
      ok: false,
      error: error.message
    }));
  }
}

function hasAnyExisting(items, keyName, expectedKeys) {
  return expectedKeys.some((key) => items.some((item) => item[keyName] === key && item.exists));
}

function evaluateCoexistence({ rtdb = [], firestore = [] } = {}) {
  return COEXISTENCE_RULES.map((rule) => {
    const rtdbPresent = hasAnyExisting(rtdb, 'path', rule.rtdbPaths);
    const firestorePresent = hasAnyExisting(firestore, 'collection', rule.firestoreCollections);
    const liveDuplicate = rule.firestoreCollections.length === 0
      && rule.rtdbPaths.every((path) => rtdb.some((item) => item.path === path && item.exists));
    const triggered = rule.firestoreCollections.length === 0 ? liveDuplicate : rtdbPresent && firestorePresent;

    return {
      id: rule.id,
      domain: rule.domain,
      triggered,
      severity: triggered ? rule.severityWhenBoth : 'ok',
      message: triggered ? rule.message : 'Sin duplicidad activa detectada.',
      rtdbPaths: rule.rtdbPaths,
      firestoreCollections: rule.firestoreCollections
    };
  });
}

function buildDataArchitectureSummary({ rtdb = [], firestore = [], coexistence = [] } = {}) {
  const high = coexistence.filter((item) => item.triggered && item.severity === 'high').length;
  const warnings = coexistence.filter((item) => item.triggered && item.severity === 'warning').length;
  const failedReads = [...rtdb, ...firestore].filter((item) => item.ok === false).length;

  return {
    status: high > 0 ? 'attention_required' : (warnings > 0 || failedReads > 0 ? 'watch' : 'ok'),
    highRiskDuplicities: high,
    warnings,
    failedReads,
    rtdbExisting: rtdb.filter((item) => item.exists).length,
    firestoreExisting: firestore.filter((item) => item.exists).length
  };
}

function hasOwner(entity = {}) {
  const owner = String(entity.owner || '').trim().toLowerCase();
  return Boolean(owner) && owner !== 'pendiente' && !owner.includes('sin propietario');
}

function hasSssotRole(entity = {}) {
  return Boolean(entity.sourceRole || entity.targetRole);
}

function buildArchitectureIndicators({ rtdb = [], firestore = [], coexistence = [], failedGates = 0 } = {}) {
  const entities = [...rtdb, ...firestore];
  const total = entities.length;
  const withOwner = entities.filter(hasOwner).length;
  const withSssot = entities.filter(hasSssotRole).length;
  const highRiskDuplicities = coexistence.filter((item) => item.triggered && item.severity === 'high').length;
  const directUiWrites = 0;
  const ownerlessServices = total - withOwner;
  const entitiesWithoutSssot = total - withSssot;
  const canonicalPercentage = total > 0 ? Math.round((withSssot / total) * 100) : 100;
  const gatesFailed = Number(failedGates || 0) + highRiskDuplicities + directUiWrites + ownerlessServices + entitiesWithoutSssot;

  return [
    {
      id: 'canonical_entities',
      label: 'Entidades con SSOT declarado',
      value: canonicalPercentage,
      unit: '%',
      target: '100%',
      ok: canonicalPercentage === 100,
      details: `${withSssot}/${total} entidades con rol de fuente declarado`
    },
    {
      id: 'direct_ui_writes',
      label: 'Escrituras directas desde UI',
      value: directUiWrites,
      unit: '',
      target: '0',
      ok: directUiWrites === 0,
      details: 'Protegido por validate:data-architecture'
    },
    {
      id: 'critical_duplicities',
      label: 'Duplicidades criticas',
      value: highRiskDuplicities,
      unit: '',
      target: '0',
      ok: highRiskDuplicities === 0,
      details: 'Coexistencias de severidad high activas'
    },
    {
      id: 'ownerless_services',
      label: 'Servicios sin propietario',
      value: ownerlessServices,
      unit: '',
      target: '0',
      ok: ownerlessServices === 0,
      details: `${withOwner}/${total} entidades con propietario operativo`
    },
    {
      id: 'entities_without_ssot',
      label: 'Entidades sin SSOT',
      value: entitiesWithoutSssot,
      unit: '',
      target: '0',
      ok: entitiesWithoutSssot === 0,
      details: 'Toda entidad debe declarar sourceRole o targetRole'
    },
    {
      id: 'failed_gates',
      label: 'Gates fallidos',
      value: gatesFailed,
      unit: '',
      target: '0',
      ok: gatesFailed === 0,
      details: 'Suma de violaciones criticas observables'
    }
  ];
}

async function buildDataArchitectureSnapshot(admin) {
  const database = admin.database();
  const firestore = admin.firestore();
  const [rtdb, firestoreCollections] = await Promise.all([
    Promise.all(RTDB_ENTITIES.map((descriptor) => inspectRtdbEntity(database, descriptor))),
    inspectFirestoreCollections(firestore, FIRESTORE_BUSINESS_COLLECTIONS)
  ]);
  const coexistence = evaluateCoexistence({ rtdb, firestore: firestoreCollections });

  return {
    ok: true,
    mode: DATA_ARCHITECTURE_MODE,
    target: TARGET_ARCHITECTURE,
    generatedAt: new Date().toISOString(),
    summary: buildDataArchitectureSummary({ rtdb, firestore: firestoreCollections, coexistence }),
    indicators: buildArchitectureIndicators({ rtdb, firestore: firestoreCollections, coexistence }),
    rtdb,
    firestore: firestoreCollections,
    coexistence,
    recommendations: [
      'Mantener runtime del piloto en RTDB hasta migracion certificada.',
      'No escribir pedidos ni finanzas desde paneles directos a Firebase.',
      'Usar Firestore como verdad persistente solo cuando exista adaptador backend y pruebas de equivalencia.',
      'Tratar RTDB como memoria viva/proyeccion en la arquitectura objetivo.'
    ]
  };
}

export {
  COEXISTENCE_RULES,
  DATA_ARCHITECTURE_MODE,
  FIRESTORE_BUSINESS_COLLECTIONS,
  RTDB_ENTITIES,
  TARGET_ARCHITECTURE,
  buildDataArchitectureSnapshot,
  buildArchitectureIndicators,
  buildDataArchitectureSummary,
  evaluateCoexistence
};
