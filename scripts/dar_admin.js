import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas para módulos ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function hacerAdministrador() {
    const uid = "42aUFDp3rwdczecmUgnig4BTFZY2"; // Tu UID confirmado

    try {
        console.log(`⏳ Inicializando Firebase...`);
        
        // 1. Leer el archivo JSON usando el sistema de archivos (Bypass al error de importación)
        const serviceAccountPath = path.resolve(__dirname, '../nelly-admin.json');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

        // 2. Despertar la aplicación de Firebase manualmente
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }

        // 3. Inyectar la credencial VIP
        console.log(`⏳ Buscando usuario con UID: ${uid}...`);
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        
        console.log(`✅ ¡Éxito, Jefe! El usuario ${uid} ahora tiene nivel de ADMINISTRADOR.`);
        console.log(`🔄 RECUERDA: Debes cerrar sesión en la App de Android y volver a entrar.`);
        process.exit(0);
    } catch (error) {
        console.error("❌ Error Crítico:", error);
        process.exit(1);
    }
}

hacerAdministrador();
