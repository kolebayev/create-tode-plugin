import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateProject } from './generate.js';

describe('generateProject', () => {
  it('composes layers for the pair and writes .env when a key is given', () => {
    const tpl = mkdtempSync(join(tmpdir(), 'tpl-'));
    mkdirSync(join(tpl, 'base'), { recursive: true });
    writeFileSync(join(tpl, 'base/package.json'), '{"name":"__TPL_SLUG__","x":"__TPL_FRAMEWORK__-__TPL_BUNDLER__"}');
    const dir = join(tpl, 'out');
    const { files } = generateProject({ dir, name: 'Hello World', framework: 'svelte', bundler: 'vite', apiKey: 'abc', templatesDir: tpl });
    expect(files).toEqual(['.env', 'package.json']);
    expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))).toEqual({ name: 'hello-world', x: 'svelte-vite' });
    expect(readFileSync(join(dir, '.env'), 'utf8')).toBe('TODE_API_KEY=abc\n');
  });

  it('writes no .env without a key', () => {
    const tpl = mkdtempSync(join(tmpdir(), 'tpl-'));
    mkdirSync(join(tpl, 'base'), { recursive: true });
    writeFileSync(join(tpl, 'base/README.md'), '# __TPL_NAME__');
    const dir = join(tpl, 'out');
    generateProject({ dir, name: 'N', framework: 'react', bundler: 'esbuild', templatesDir: tpl });
    expect(existsSync(join(dir, '.env'))).toBe(false);
  });
});
