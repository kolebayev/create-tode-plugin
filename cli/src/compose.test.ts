import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compose, deepMerge, substitute, targetPath } from './compose.js';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'tpl-'));
  const put = (p: string, s: string) => {
    mkdirSync(join(root, p, '..'), { recursive: true });
    writeFileSync(join(root, p), s);
  };
  put('base/package.json', JSON.stringify({ name: '__TPL_SLUG__', scripts: { typecheck: 'tsc' }, devDependencies: { zeta: '1', alpha: '1' } }));
  put('base/_gitignore', 'dist/\n');
  put('base/src/a.ts', 'export const name = "__TPL_NAME__";\n');
  put('fw/x/package.json', JSON.stringify({ scripts: { typecheck: 'vue-tsc' }, devDependencies: { beta: '2' }, keywords: ['a'] }));
  put('fw/x/src/a.ts', 'export const name = "__TPL_NAME__ x";\n');
  put('fw/x/_github/workflows/ci.yml', 'name: ci\n');
  return root;
}

describe('deepMerge', () => {
  it('merges objects, concatenates arrays without duplicates, later scalars win', () => {
    expect(deepMerge({ a: { b: 1, c: [1, 2] }, d: 'x' }, { a: { c: [2, 3], e: 2 }, d: 'y' })).toEqual({
      a: { b: 1, c: [1, 2, 3], e: 2 },
      d: 'y',
    });
  });
});

describe('substitute', () => {
  it('replaces known tokens and rejects unknown ones', () => {
    expect(substitute('a __TPL_NAME__ b', { __TPL_NAME__: 'N' }, 'f')).toBe('a N b');
    expect(() => substitute('__TPL_NOPE__', {}, 'f')).toThrow(/__TPL_NOPE__ in f/);
  });
});

describe('targetPath', () => {
  it('turns leading underscores into dots', () => {
    expect(targetPath('_gitignore')).toBe('.gitignore');
    expect(targetPath('_github/workflows/ci.yml')).toBe('.github/workflows/ci.yml');
    expect(targetPath('src/_internal/x.ts')).toBe('src/.internal/x.ts');
    expect(targetPath('src/a_b.ts')).toBe('src/a_b.ts');
  });
});

describe('compose', () => {
  it('overlays layers, merges json, substitutes, renames', () => {
    const root = fixture();
    const out = join(root, 'out');
    const written = compose({
      templatesDir: root,
      layers: ['base', 'fw/x'],
      outDir: out,
      vars: { __TPL_NAME__: 'My Plugin', __TPL_SLUG__: 'my-plugin' },
    });
    expect(written).toEqual(['.github/workflows/ci.yml', '.gitignore', 'package.json', 'src/a.ts']);
    const pkg = JSON.parse(readFileSync(join(out, 'package.json'), 'utf8'));
    expect(pkg.name).toBe('my-plugin');
    expect(pkg.scripts.typecheck).toBe('vue-tsc');
    expect(Object.keys(pkg.devDependencies)).toEqual(['alpha', 'beta', 'zeta']);
    expect(pkg.keywords).toEqual(['a']);
    expect(readFileSync(join(out, 'src/a.ts'), 'utf8')).toBe('export const name = "My Plugin x";\n');
    expect(existsSync(join(out, '.gitignore'))).toBe(true);
  });

  it('skips missing layers', () => {
    const root = fixture();
    const out = join(root, 'out2');
    expect(() => compose({ templatesDir: root, layers: ['base', 'combo/none'], outDir: out, vars: { __TPL_NAME__: 'n', __TPL_SLUG__: 's' } })).not.toThrow();
  });
});
