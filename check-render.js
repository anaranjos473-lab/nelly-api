import https from 'https';

function checkRender() {
  return new Promise((resolve) => {
    const req = https.get('https://nelly-api-8lh1.onrender.com/api/health', { timeout: 5000 }, (res) => {
      console.log(`\n✅ Render VIVO: HTTP ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`\n❌ Render OFFLINE: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`\n⏱️ Timeout (5s): Render no responde`);
      req.destroy();
      resolve(false);
    });
  });
}

checkRender().then(() => process.exit(0));
