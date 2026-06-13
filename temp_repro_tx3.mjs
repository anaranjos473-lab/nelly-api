import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const uid = 'driver_test_001';
const ref = db.ref(`repartidores/${uid}`);
const rootRef = db.ref('repartidores');

const rootSnap = await rootRef.once('value');
console.log('REPARTIDORES ROOT EXISTS', rootSnap.exists());
console.log('REPARTIDORES KEYS', Object.keys(rootSnap.val()||{}));
const snap = await ref.once('value');
console.log('SINGLE SNAP EXISTS', snap.exists());
console.log('SINGLE SNAP VAL', JSON.stringify(snap.val(), null, 2));

const tx = await ref.transaction((current) => {
  console.log('TX callback current type', typeof current);
  console.log('TX callback current value', JSON.stringify(current, null, 2));
  return current || { fromTx: true };
}, (error, committed, snapshot) => {
  console.log('callback done error', error?.message, 'committed', committed, 'snapshot exists', snapshot?.exists());
});
console.log('TX result', tx.committed, tx.snapshot.exists(), JSON.stringify(tx.snapshot.val(), null, 2));
