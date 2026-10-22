// Lists every pinned dependency in the template layers next to the latest version on npm.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('package.json') ? [p] : [];
  });
}

const wanted = new Map();
for (const file of walk('templates')) {
  const pkg = JSON.parse(readFileSync(file, 'utf8'));
  for (const key of ['dependencies', 'devDependencies']) {
    for (const [name, range] of Object.entries(pkg[key] ?? {})) wanted.set(name, { range, file });
  }
}
for (const [name, { range, file }] of [...wanted].sort()) {
  const latest = execFileSync('npm', ['view', name, 'version'], { encoding: 'utf8' }).trim();
  console.log(`${name.padEnd(36)} ${range.padEnd(10)} latest ${latest.padEnd(10)} ${file}`);
}
