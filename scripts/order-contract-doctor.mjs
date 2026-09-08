#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED_FIELDS = {
  customer: ['cliente_nombre', 'cliente'],
  phone: ['telefono', 'phone', 'contacto'],
  address: ['direccion', 'ubicacion'],
  commerce: ['comercio_nombre', 'nombre_comercial', 'tienda_nombre', 'restaurante_nombre', 'comercio'],
  products: ['items', 'productos', 'lineas'],
  subtotal: ['subtotal'],
  total: ['monto', 'total', 'monto_total'],
  payment: ['pago', 'metodo_pago', 'forma_pago']
};

const STAGES = ['pedidos', 'active_orders', 'normalizarPedidoParaVista', 'renderer'];

function parseArgs(argv) {
  const args = { sample: null, order: null, input: null, baseUrl: process.env.ORDER_DOCTOR_BASE_URL || null, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--sample') args.sample = Number(argv[++i]);
    else if (arg === '--order') args.order = argv[++i];
    else if (arg === '--input') args.input = argv[++i];
    else if (arg === '--base-url') args.baseUrl = argv[++i];
    else if (arg === '--json') args.json = true;
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

function usage() {
  return [
    'Uso:',
    '  npm run doctor:orders',
    '  npm run doctor:orders -- --order <ID>',
    '  npm run doctor:orders -- --sample 20',
    '  npm run doctor:orders -- --input <evidence.json>',
    '',
    'La entrada JSON puede contener { pedidos, active_orders } o ser un arreglo de pedidos.',
    'Sin --input se consulta ORDER_DOCTOR_BASE_URL/api/data-architecture/data-access.'
  ].join('\n');
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

function shapeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    const itemShapes = [...new Set(value.slice(0, 5).map(shapeOf))];
    return `array${itemShapes.length ? `<${itemShapes.join('|')}>` : ''}`;
  }
  if (isObject(value)) return `object{${Object.keys(value).sort().join(',')}}`;
  return typeof value;
}

function fieldState(order, aliases) {
  const states = aliases.map((alias) => {
    const present = Object.prototype.hasOwnProperty.call(order || {}, alias);
    const value = present ? order[alias] : undefined;
    return { alias, present, state: !present ? 'ABSENT' : value === null ? 'NULL' : isEmpty(value) ? 'EMPTY' : 'PRESENT', type: present ? typeof value : null, shape: present ? shapeOf(value) : null };
  });
  return { aliases: states, presentAliases: states.filter((item) => item.present).map((item) => item.alias) };
}

function identity(order) {
  return String(order?.id || order?.pedido_id || order?.id_pedido || order?._rtdbKey || order?.shortId || order?.short_id || '').trim();
}

function shortId(order) {
  return order?.shortId ?? order?.short_id ?? order?.id_pedido ?? null;
}

function valueByAliases(order, aliases) {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(order || {}, alias)) return order[alias];
  }
  return undefined;
}

function mirrorPanelNormalizer(order = {}) {
  const cliente = String(order?.cliente_nombre || order?.cliente || 'Cliente').trim();
  const telefono = String(order?.telefono || order?.phone || order?.contacto || 'No disponible').trim();
  const direccion = String(order?.direccion || order?.ubicacion || 'Dirección no disponible').trim();
  const comercio = String(order?.comercio_nombre || order?.nombre_comercial || order?.tienda_nombre || order?.restaurante_nombre || 'Comercio no disponible').trim();
  const total = Number(order?.monto || order?.total || order?.monto_total || 0);
  const productsBase = Array.isArray(order?.items) ? order.items : Array.isArray(order?.productos) ? order.productos : [];
  const productos = productsBase.map((item) => {
    if (isObject(item)) return { nombre: String(item.nombre || item.producto || item.descripcion || item.name || 'Producto').trim(), cantidad: Number(item.cantidad || item.qty || item.quantity || 1) || 1 };
    const text = String(item || '').trim();
    return text ? { nombre: text, cantidad: 1 } : null;
  }).filter(Boolean);
  return { cliente, telefono, direccion, comercio, total: Number.isFinite(total) ? total : 0, productos };
}

function rendererRules() {
  return {
    source: 'public/panel.html',
    monetary_precedence: ['monto', 'total', 'monto_total'],
    product_precedence: ['items', 'productos'],
    unsupported_product_shape: 'lineas',
    note: 'Reglas observadas, no una selección de forma canónica.'
  };
}

function stageSnapshot(order, name) {
  const projected = order || {};
  const fields = Object.fromEntries(Object.entries(REQUIRED_FIELDS).map(([key, aliases]) => [key, fieldState(projected, aliases)]));
  return {
    stage: name,
    id: identity(projected),
    shortId: shortId(projected),
    estado: projected?.estado ?? projected?.estado_pedido ?? null,
    fields,
    shape: shapeOf(projected),
    values: projected
  };
}

function sameMeaning(a, b, field) {
  const aliases = REQUIRED_FIELDS[field];
  const av = valueByAliases(a, aliases);
  const bv = valueByAliases(b, aliases);
  if (av === undefined && bv === undefined) return true;
  if (av === null && bv === null) return true;
  if (isEmpty(av) && isEmpty(bv)) return true;
  if (field === 'total') {
    const an = Number(av);
    const bn = Number(bv);
    return Number.isFinite(an) && Number.isFinite(bn) && an === bn;
  }
  if (field === 'products') return Array.isArray(av) && Array.isArray(bv) && av.length === bv.length;
  return av !== undefined && bv !== undefined && String(av) === String(bv);
}

function analyzeOrder(original, active) {
  const normalized = mirrorPanelNormalizer(active || {});
  const stages = [
    stageSnapshot(original, 'pedidos'),
    stageSnapshot(active, 'active_orders'),
    stageSnapshot(normalized, 'normalizarPedidoParaVista'),
    stageSnapshot(normalized, 'renderer')
  ];
  const findings = [];
  const origin = stages[0];
  const contract = stages[1];
  const normalizedStage = stages[2];
  if (!original || !active) findings.push({ code: 'INSUFFICIENT_EVIDENCE', detail: 'Falta pedidos o active_orders para comparar fronteras.' });
  if (original && active) {
    for (const field of Object.keys(REQUIRED_FIELDS)) {
      if (!sameMeaning(original, active, field)) findings.push({ code: 'CONTRACT_DEFECT', field, detail: 'El valor o la estructura cambia entre pedidos y active_orders.' });
    }
  }
  if (origin && contract && origin.shape !== contract.shape) findings.push({ code: 'MULTIPLE_SHAPES', detail: 'La forma estructural cambia entre pedidos y active_orders.' });
  if (active) {
    if (normalizedStage.values.cliente === 'Cliente') findings.push({ code: 'CONSUMER_DEFECT', field: 'customer', detail: 'El normalizador no recupera cliente.' });
    if (normalizedStage.values.direccion === 'Dirección no disponible') findings.push({ code: 'CONSUMER_DEFECT', field: 'address', detail: 'El normalizador cae al valor de dirección no disponible.' });
    if (normalizedStage.values.comercio === 'Comercio no disponible') findings.push({ code: 'CONSUMER_DEFECT', field: 'commerce', detail: 'El normalizador cae al valor de comercio no disponible.' });
    if (normalizedStage.values.productos.length === 0 && (Array.isArray(active?.lineas) || Array.isArray(active?.items) || Array.isArray(active?.productos))) findings.push({ code: 'CONSUMER_DEFECT', field: 'products', detail: 'El normalizador no produce productos desde la forma recibida.' });
    const monetary = ['monto', 'total', 'monto_total'].filter((key) => Object.prototype.hasOwnProperty.call(active, key));
    if (monetary.length > 1 && Number(active.monto) === 0 && Number(active.total) > 0) findings.push({ code: 'CONSUMER_DEFECT', field: 'total', detail: 'Precedencia monto || total || monto_total puede ocultar un total válido cuando monto=0.' });
    if (Array.isArray(active.lineas) && !Array.isArray(active.items) && !Array.isArray(active.productos)) findings.push({ code: 'CONSUMER_DEFECT', field: 'products', detail: 'La forma lineas no está contemplada por el normalizador.' });
  }
  const codes = new Set(findings.map((item) => item.code));
  const consumerFindings = findings.filter((item) => item.code === 'CONSUMER_DEFECT');
  let verdict = 'INSUFFICIENT_EVIDENCE';
  if (codes.has('MULTIPLE_SHAPES')) verdict = 'MULTIPLE_SHAPES';
  else if (consumerFindings.length > 1) verdict = 'MULTIPLE_CONSUMER_DEFECTS';
  else if (codes.has('CONTRACT_DEFECT')) verdict = 'CONTRACT_DEFECT';
  else if (codes.has('CONSUMER_DEFECT')) verdict = 'CONSUMER_DEFECT';
  else if (active) verdict = 'CONTRACT_OK';
  const firstLoss = stages.slice(1).find((stage, index) => {
    const previous = stages[index];
    return previous && Object.keys(REQUIRED_FIELDS).some((field) => !sameMeaning(previous.values, stage.values, field));
  });
  return { id: identity(active || original), shortId: shortId(active || original), verdict, first_loss: firstLoss?.stage || null, stages, findings, renderer_rules: rendererRules() };
}

function findMatching(orderList, target) {
  if (!target) return orderList[0] || null;
  return orderList.find((order) => [order?.id, order?.pedido_id, order?.id_pedido, order?._rtdbKey, order?.shortId, order?.short_id].map(String).includes(String(target))) || null;
}

async function loadEvidence(args) {
  if (args.input) {
    const content = await readFile(resolve(args.input), 'utf8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return { pedidos: parsed, active_orders: parsed, source: `file:${args.input}` };
    return { pedidos: parsed.pedidos || parsed.orders || null, active_orders: parsed.active_orders || null, source: `file:${args.input}` };
  }
  if (!args.baseUrl) return { pedidos: null, active_orders: null, source: 'none' };
  const headers = {};
  if (process.env.ORDER_DOCTOR_TOKEN) headers.Authorization = `Bearer ${process.env.ORDER_DOCTOR_TOKEN}`;
  const response = await fetch(`${args.baseUrl.replace(/\/$/, '')}/api/data-architecture/data-access`, { headers });
  if (!response.ok) throw new Error(`data-access HTTP ${response.status}`);
  const payload = await response.json();
  return { pedidos: payload.pedidos || null, active_orders: payload.active_orders || [], source: 'data-access' };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return console.log(usage());
  const evidence = await loadEvidence(args);
  let active = Array.isArray(evidence.active_orders) ? evidence.active_orders : [];
  let orders = Array.isArray(evidence.pedidos) ? evidence.pedidos : null;
  if (args.order) {
    active = [findMatching(active, args.order)].filter(Boolean);
    orders = orders ? [findMatching(orders, args.order)].filter(Boolean) : null;
  } else if (Number.isFinite(args.sample) && args.sample > 0) {
    active = active.slice(0, args.sample);
    orders = orders ? orders.slice(0, args.sample) : null;
  }
  const results = active.map((item) => analyzeOrder(findMatching(orders || [], identity(item)), item));
  const report = { tool: 'order-contract-doctor', read_only: true, source: evidence.source, evidence: { pedidos_available: Array.isArray(orders), active_orders_count: active.length }, results };
  if (args.json) return console.log(JSON.stringify(report, null, 2));
  console.log(`order-contract-doctor | READ-ONLY | source=${evidence.source}`);
  console.log(`active_orders=${active.length} pedidos=${Array.isArray(orders) ? orders.length : 'NO DISPONIBLE'}`);
  if (!results.length) return console.log('INSUFFICIENT_EVIDENCE: no hay pedidos para analizar.');
  results.forEach((result) => console.log(`${result.id || '(sin id)'} | ${result.verdict} | FIRST LOSS=${result.first_loss || 'NO DETERMINADO'} | findings=${result.findings.length}`));
}

export { analyzeOrder, fieldState, mirrorPanelNormalizer, parseArgs, shapeOf };

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`order-contract-doctor: ${error.message}`);
    process.exitCode = 1;
  });
}
