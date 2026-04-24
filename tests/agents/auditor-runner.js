// auditor-runner.js (CommonJS)
const { spawnSync } = require("node:child_process");

const checks = [
  { name: "Arquitectura", cmd: ["node", "tests/agents/lint/architecture-lint.mjs"] },
  { name: "CajaNegraComisiones", cmd: ["node", "tests/agents/business/commission-blackbox.test.mjs"] },
  { name: "HostingChecklist", cmd: ["node", "tests/agents/hosting/deploy-checklist.mjs"] }
];

let hasError = false;

for (const check of checks) {
  const [bin, ...args] = check.cmd;
  const result = spawnSync(bin, args, { stdio: "inherit", shell: process.platform === "win32" });

  if (result.status !== 0) {
    hasError = true;
    console.error(`NO PASA: ${check.name}`);
  } else {
    console.log(`PASA: ${check.name}`);
  }
}

if (hasError) {
  process.exit(1);
}

console.log("PASA: protocolo completo de validacion de agentes");
