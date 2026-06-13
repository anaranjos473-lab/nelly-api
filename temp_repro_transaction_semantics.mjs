import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const path = 'repartidores/driver_test_001';
const ref = db.ref(path);
const snap = await ref.once('value');
console.log('initial exists', snap.exists());
console.log('initial val', JSON.stringify(snap.val(), null, 2));
const tx = await ref.transaction((current) => {
  console.log('TX callback current', JSON.stringify(current, null, 2));
  if (current === null) {
    console.log('returning null explicitly for current null');
    return null;
  }
  console.log('returning current unchanged');
  return current;
});
console.log('tx committed', tx.committed);
console.log('tx snapshot exists', tx.snapshot.exists());
console.log('tx snapshot val', JSON.stringify(tx.snapshot.val(), null, 2));
const snap2 = await ref.once('value');
console.log('after final exists', snap2.exists());
console.log('after final val', JSON.stringify(snap2.val(), null, 2));
