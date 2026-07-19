import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const targets = new Set();
const problems = [];
const ignoredDirNames = new Set([
  'node_modules',
  '.git',
  '.gradle',
  '.kotlin',
  '.jest-cache',
  'build',
  'coverage'
]);

const ignoredPathPrefixes = [
  `functions${path.sep}node_modules`,
  `app${path.sep}build`
];

function shouldIgnore(relPath) {
  const normalized = relPath.split(path.sep).join(path.sep);
  const parts = normalized.split(path.sep).filter(Boolean);
  if (parts.some((part) => ignoredDirNames.has(part))) {
    return true;
  }
  return ignoredPathPrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}${path.sep}`));
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const relDir = path.relative(ROOT, full);
    if (entry.isDirectory()) {
      if (shouldIgnore(relDir)) {
        continue;
      }
      walk(full);
    } else if (entry.isFile() && /\.(md|svg|json|js|kt|html|cjs|mjs|txt)$/i.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const raw = match[1];
        if (raw.startsWith('http') || raw.startsWith('https')) continue;
        if (raw.startsWith('/C:/')) {
          const normalized = raw.replace('/C:/', 'C:/').split('#')[0];
          targets.add(normalized);
        } else if (raw.startsWith('./') || raw.startsWith('../')) {
          targets.add(path.normalize(path.resolve(path.dirname(full), raw.split('#')[0])));
        }
      }
    }
  }
}

walk(ROOT);

for (const target of targets) {
  const rel = path.relative(ROOT, target);
  if (shouldIgnore(rel)) {
    continue;
  }
  if (!fs.existsSync(target)) {
    problems.push(target);
  }
}

if (problems.length > 0) {
  console.error('Broken links found:');
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log('links-check: OK');
