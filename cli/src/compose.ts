import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export interface ComposeOptions {
  /** Directory that holds base/, bundler/, framework/, combo/. */
  templatesDir: string;
  /** Layer directories relative to templatesDir, in overlay order. Missing ones are skipped. */
  layers: string[];
  outDir: string;
  vars: Record<string, string>;
}

const TOKEN_RE = /__TPL_[A-Z_]+__/g;
const BINARY = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2']);

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export function deepMerge(a: Json, b: Json): Json {
  if (Array.isArray(a) && Array.isArray(b)) {
    const out = [...a];
    for (const item of b) if (!out.some((x) => JSON.stringify(x) === JSON.stringify(item))) out.push(item);
    return out;
  }
  if (isObject(a) && isObject(b)) {
    const out: { [k: string]: Json } = { ...a };
    for (const [k, v] of Object.entries(b)) out[k] = k in out ? deepMerge(out[k], v) : v;
    return out;
  }
  return b;
}

function isObject(v: Json): v is { [k: string]: Json } {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function substitute(text: string, vars: Record<string, string>, label: string): string {
  return text.replace(TOKEN_RE, (token) => {
    if (!(token in vars)) throw new Error(`unknown template token ${token} in ${label}`);
    return vars[token];
  });
}

/** `_gitignore` → `.gitignore`, `_github/x` → `.github/x`; only a leading underscore of a segment. */
export function targetPath(rel: string): string {
  return rel
    .split('/')
    .map((seg) => (seg.startsWith('_') ? `.${seg.slice(1)}` : seg))
    .join('/');
}

function walk(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) out.push(...walk(abs, base));
    else out.push(relative(base, abs).split(sep).join('/'));
  }
  return out;
}

function sortDeps(pkg: { [k: string]: Json }): void {
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = pkg[key];
    if (!isObject(deps)) continue;
    pkg[key] = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
  }
}

export function compose({ templatesDir, layers, outDir, vars }: ComposeOptions): string[] {
  // rel path (template spelling) → absolute sources in layer order
  const sources = new Map<string, string[]>();
  for (const layer of layers) {
    const dir = join(templatesDir, layer);
    if (!existsSync(dir)) continue;
    for (const rel of walk(dir)) {
      const list = sources.get(rel) ?? [];
      list.push(join(dir, rel));
      sources.set(rel, list);
    }
  }

  const written: string[] = [];
  for (const [rel, files] of sources) {
    const target = targetPath(rel);
    const abs = join(outDir, target);
    mkdirSync(dirname(abs), { recursive: true });
    const ext = rel.slice(rel.lastIndexOf('.'));

    if (BINARY.has(ext)) {
      writeFileSync(abs, readFileSync(files[files.length - 1]));
    } else if (ext === '.json' && files.length > 1) {
      let merged: Json = {};
      for (const f of files) merged = deepMerge(merged, JSON.parse(substitute(readFileSync(f, 'utf8'), vars, f)) as Json);
      if (target === 'package.json' && isObject(merged)) sortDeps(merged);
      writeFileSync(abs, JSON.stringify(merged, null, 2) + '\n');
    } else {
      const last = files[files.length - 1];
      writeFileSync(abs, substitute(readFileSync(last, 'utf8'), vars, last));
    }
    written.push(target);
  }
  return written.sort();
}
