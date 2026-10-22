import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { generateProject } from './generate.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLERS, FRAMEWORKS, FRAMEWORK_INFO } from './matrix.js';

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

const realTemplates = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'templates');

describe('every combo from the real templates', () => {
  for (const framework of FRAMEWORKS) {
    for (const bundler of BUNDLERS) {
      it(`${framework} + ${bundler}`, () => {
        const dir = join(mkdtempSync(join(tmpdir(), 'gen-')), 'p');
        const { files } = generateProject({ dir, name: 'Test Plugin', framework, bundler, templatesDir: realTemplates });

        for (const f of ['package.json', 'manifest.json', '.gitignore', '.env.example', 'AGENTS.md', 'CLAUDE.md', 'README.md', 'skills/figma-plugin-tode/SKILL.md', 'scripts/build.mjs', 'scripts/preview.mjs', 'scripts/check-manifest.mjs', 'src/main/main.ts', 'src/main/tsconfig.json', 'src/ui/tsconfig.json', 'src/ui/ui.html', 'src/ui/dev/mock-figma.ts', `src/ui/${FRAMEWORK_INFO[framework].uiEntry}`, '.github/workflows/ci.yml']) {
          expect(files, `${framework}+${bundler} misses ${f}`).toContain(f);
        }

        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        expect(pkg.name).toBe('test-plugin');
        expect(pkg.dependencies[FRAMEWORK_INFO[framework].adapter]).toBeDefined();
        expect(pkg.devDependencies[bundler]).toBeDefined();
        expect(Object.keys(pkg.scripts)).toEqual(expect.arrayContaining(['dev', 'build', 'preview', 'typecheck', 'lint', 'test', 'format', 'check']));

        const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
        expect(manifest.name).toBe('Test Plugin');
        expect(manifest.networkAccess.allowedDomains).toContain('wss://processing.usetode.dev');

        const mainTs = JSON.parse(readFileSync(join(dir, 'src/main/tsconfig.json'), 'utf8'));
        expect(mainTs.compilerOptions.lib).toEqual(['ES2017']);

        for (const f of files) {
          if (/\.(png|jpg|woff2?)$/.test(f)) continue;
          expect(readFileSync(join(dir, f), 'utf8'), `${f} still has a token`).not.toMatch(/__TPL_[A-Z_]+__/);
        }
      });
    }
  }
});
