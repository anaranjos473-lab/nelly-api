import { buildIdentityProjection } from '../../src/integrations/index.js';

const projection = buildIdentityProjection([
  { id: 'ID-1', provider: 'Firebase', email: 'USER@EXAMPLE.COM', active: true },
  { id: 'ID-2', provider: 'OAuth', email: 'user2@example.com', active: false }
]);

let ok = true;

if (!projection.ok || projection.summary.total !== 2 || projection.summary.active !== 1) {
  console.error('La proyeccion de identidad no es valida');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-identity-adapter: OK');
