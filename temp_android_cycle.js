import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const localPath = path.join(process.cwd(), 'nelly-admin.json');
const serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
const dbUrl = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: dbUrl,
  });
}

const db = admin.database();
const adb = path.join(process.env.LOCALAPPDATA || '', 'Android', 'Sdk', 'platform-tools', 'adb.exe');
const id = 'ANDROID_TEST_' + Date.now();
const payload = {
  id,
  id_pedido: id,
  cliente_nombre: 'Prueba Android',
  descripcion: 'Pedido de validacion',
  monto: 180,
  estado: 'LISTO',
  estado_pedido: 'LISTO',
  timestamp: Date.now(),
  fuente_origen: 'adb_cycle',
  fase_panel: 'Despacho',
};

await Promise.all([
  db.ref('pedidos/' + id).set(payload),
  db.ref('pedidos_para_reparto/' + id).set(payload),
]);

console.log('ORDER_ID=' + id);

// Launch app and wait for sync
execFileSync(adb, ['shell', 'am', 'force-stop', 'com.example.nellydriver'], { stdio: 'inherit' });
execFileSync(adb, ['shell', 'monkey', '-p', 'com.example.nellydriver', '-c', 'android.intent.category.LAUNCHER', '1'], { stdio: 'inherit' });
await new Promise((r) => setTimeout(r, 8000));

// Dump and pull UI XML
execFileSync(adb, ['shell', 'uiautomator', 'dump', '/sdcard/window_dump.xml'], { stdio: 'inherit' });
execFileSync(adb, ['pull', '/sdcard/window_dump.xml', path.join(process.cwd(), 'window_dump.xml')], { stdio: 'inherit' });

// Capture screen
execFileSync(adb, ['shell', 'screencap', '-p', '/sdcard/nelly_screen.png'], { stdio: 'inherit' });
execFileSync(adb, ['pull', '/sdcard/nelly_screen.png', path.join(process.cwd(), 'nelly_screen.png')], { stdio: 'inherit' });

console.log('UI_XML_DOWNLOADED');
