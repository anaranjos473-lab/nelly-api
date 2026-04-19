// scripts/cron-resumen-semanal.js
// Automatización: Ejecuta el resumen semanal cada lunes a las 08:00 AM
const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('0 8 * * 1', () => {
  console.log('⏰ Ejecutando resumen semanal estratégico (lunes 08:00)...');
  exec('node scripts/generarResumenSemanal.js', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Error al ejecutar el resumen semanal:', err.message);
    } else {
      console.log(stdout);
      if (stderr) console.error(stderr);
    }
  });
});

console.log('🟢 Cron de resumen semanal programado: lunes 08:00 AM');
