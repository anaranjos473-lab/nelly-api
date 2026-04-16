import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ALLOWED_EXT = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx", ".kt", ".html"]);
const IGNORE_DIRS = new Set(["node_modules", ".git", "respaldos", "build", "dist"]);

const violations = [];

const forbiddenPatterns = [
  {
    regex: /NellyFirebaseService\.kt/g,
    rule: "Mensajeria debe usar NellyMessagingService.kt",
    skill: "skills/core_mensajeria.md"
  },
  {
    regex: /firebase\/compat/gi,
    rule: "Firebase compat (v9) prohibido",
    skill: "skills/backend_firebase.md"
  },
  {
    regex: /firebase\.initializeApp\s*\(/g,
    rule: "Sintaxis compat detectada: firebase.initializeApp",
    skill: "skills/backend_firebase.md"
  },
  {
    regex: /from\s+["']firebase["']/g,
    rule: "Import firebase namespace completo prohibido en panel modular",
    skill: "skills/backend_firebase.md"
  }
];

const messagingServiceClasses = [];

function walk(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const absolute = path.join(dir, item.name);
    const relative = path.relative(ROOT, absolute).replaceAll("\\", "/");

    if (item.isDirectory()) {
      if (IGNORE_DIRS.has(item.name)) {
        continue;
      }
      walk(absolute);
      continue;
    }

    const ext = path.extname(item.name).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      continue;
    }

    const content = fs.readFileSync(absolute, "utf8");
    const lines = content.split(/\r?\n/);

    for (const entry of forbiddenPatterns) {
      for (let idx = 0; idx < lines.length; idx += 1) {
        if (!entry.regex.test(lines[idx])) {
          entry.regex.lastIndex = 0;
          continue;
        }

        violations.push({
          file: relative,
          line: idx + 1,
          rule: entry.rule,
          skill: entry.skill,
          snippet: lines[idx].trim()
        });
        entry.regex.lastIndex = 0;
      }
    }

    if (ext === ".kt" && /FirebaseMessagingService/.test(content)) {
      const classMatch = content.match(/class\s+(\w+)\s*:\s*FirebaseMessagingService/);
      if (classMatch) {
        messagingServiceClasses.push({ file: relative, className: classMatch[1] });
      }
    }
  }
}

function validateMessagingServiceNaming() {
  for (const item of messagingServiceClasses) {
    if (item.className !== "NellyMessagingService") {
      violations.push({
        file: item.file,
        line: 1,
        rule: `Servicio de mensajeria invalido: ${item.className}. Debe ser NellyMessagingService`,
        skill: "skills/core_mensajeria.md",
        snippet: `class ${item.className} : FirebaseMessagingService`
      });
    }
  }
}

walk(ROOT);
validateMessagingServiceNaming();

if (violations.length > 0) {
  console.error("NO PASA: linter de arquitectura");
  for (const v of violations) {
    console.error(`- Error: ${v.rule}`);
    console.error(`  Archivo: ${v.file}:${v.line}`);
    console.error(`  Evidencia: ${v.snippet || "N/A"}`);
    console.error(`  Skill requerida: ${v.skill}`);
  }
  process.exit(1);
}

console.log("PASA: linter de arquitectura");
