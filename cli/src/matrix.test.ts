import { describe, expect, it } from 'vitest';
import { BUNDLERS, FRAMEWORKS, layersFor, slugify, templateVars, titleCase } from './matrix.js';

describe('matrix', () => {
  it('lists four frameworks and two bundlers', () => {
    expect(FRAMEWORKS).toEqual(['react', 'vue', 'svelte', 'vanilla']);
    expect(BUNDLERS).toEqual(['vite', 'esbuild']);
  });

  it('orders layers base, bundler, framework, combo', () => {
    expect(layersFor('vue', 'esbuild')).toEqual([
      'base',
      'bundler/esbuild',
      'framework/vue',
      'combo/vue-esbuild',
    ]);
  });

  it('builds vars with trailing commas on plugin lists', () => {
    const vars = templateVars({ name: 'My Plugin', slug: 'my-plugin', framework: 'react', bundler: 'vite' });
    expect(vars.__TPL_NAME__).toBe('My Plugin');
    expect(vars.__TPL_ADAPTER__).toBe('@tode-sdk/figma-react');
    expect(vars.__TPL_UI_ENTRY__).toBe('main.tsx');
    expect(vars.__TPL_VITE_UI_PLUGINS__).toBe('react(),');
    expect(vars.__TPL_ESBUILD_UI_OPTIONS__).toBe("jsx: 'automatic',");
    expect(vars.__TPL_YEAR__).toMatch(/^\d{4}$/);
  });

  it('vanilla has empty plugin lines', () => {
    const vars = templateVars({ name: 'x', slug: 'x', framework: 'vanilla', bundler: 'esbuild' });
    expect(vars.__TPL_VITE_UI_PLUGIN_IMPORT__).toBe('');
    expect(vars.__TPL_VITE_UI_PLUGINS__).toBe('');
    expect(vars.__TPL_ESBUILD_UI_PLUGINS__).toBe('');
    expect(vars.__TPL_UI_ENTRY__).toBe('main.ts');
  });

  it('slugifies and title-cases', () => {
    expect(slugify('My Cool Plugin!')).toBe('my-cool-plugin');
    expect(slugify('  figma--thing ')).toBe('figma-thing');
    expect(titleCase('my-cool_plugin')).toBe('My Cool Plugin');
  });
});
