const fs = require("fs");
const path = require("path");

const rootPanel = path.resolve(__dirname, "..", "panel.html");
const publicPanel = path.resolve(__dirname, "..", "public", "panel.html");

function syncPanel() {
  if (!fs.existsSync(rootPanel)) {
    throw new Error(`No existe el archivo fuente: ${rootPanel}`);
  }

  fs.copyFileSync(rootPanel, publicPanel);
  console.log("[sync-panel] panel.html sincronizado -> public/panel.html");
}

try {
  syncPanel();
} catch (error) {
  console.error("[sync-panel] Error al sincronizar:", error.message);
  process.exit(1);
}
