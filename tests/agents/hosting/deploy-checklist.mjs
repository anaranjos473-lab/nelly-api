const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`${relativePath}: archivo no existe`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function assertRegex(content, regex, message) {
  if (!regex.test(content)) {
    failures.push(message);
  }
}

const panel = read("public/panel.html");
const firebase = read("public/firebase.js");
const firebaseJson = read("firebase.json");

assertRegex(panel, /<script\s+type=["']module["']>/i, "public/panel.html: falta script type=module");
assertRegex(panel, /import\s*\{\s*db\s*,\s*auth\s*,\s*rtdb\s*\}\s*from\s*["']\.\/firebase\.js["']/i, "public/panel.html: falta import modular desde ./firebase.js");
assertRegex(firebase, /from\s+["']https:\/\/www\.gstatic\.com\/firebasejs\/\d+\.\d+\.\d+\/firebase-app\.js["']/i, "public/firebase.js: falta import modular firebase-app.js");
assertRegex(firebase, /export\s+const\s+db\s*=\s*getFirestore\(/, "public/firebase.js: falta export db");
assertRegex(firebase, /export\s+const\s+auth\s*=\s*getAuth\(/, "public/firebase.js: falta export auth");
assertRegex(firebase, /export\s+const\s+rtdb\s*=\s*getDatabase\(/, "public/firebase.js: falta export rtdb");

if (/firebase\/compat/i.test(panel) || /firebase\/compat/i.test(firebase)) {
  failures.push("Panel/Firebase: se detecto sintaxis compat prohibida");
}

if (!/"hosting"\s*:/.test(firebaseJson)) {
  failures.push("firebase.json: bloque hosting no detectado");
}

if (failures.length > 0) {
  console.error("NO PASA: checklist de despliegue hosting");
  for (const item of failures) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("PASA: checklist de despliegue hosting");
