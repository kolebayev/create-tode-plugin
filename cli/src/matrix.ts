export const FRAMEWORKS = ['react', 'vue', 'svelte', 'vanilla'] as const;
export const BUNDLERS = ['vite', 'esbuild'] as const;
export type Framework = (typeof FRAMEWORKS)[number];
export type Bundler = (typeof BUNDLERS)[number];

export const DEFAULT_FRAMEWORK: Framework = 'react';
export const DEFAULT_BUNDLER: Bundler = 'vite';

interface FrameworkInfo {
  label: string;
  hint: string;
  adapter: string;
  /** Entry file inside src/ui/. */
  uiEntry: string;
  vite: { import: string; plugins: string };
  esbuild: { import: string; plugins: string; options: string };
}

export const FRAMEWORK_INFO: Record<Framework, FrameworkInfo> = {
  react: {
    label: 'React',
    hint: 'useTode() hook',
    adapter: '@tode-sdk/figma-react',
    uiEntry: 'main.tsx',
    vite: { import: "import react from '@vitejs/plugin-react';", plugins: 'react(),' },
    esbuild: { import: '', plugins: '', options: "jsx: 'automatic'," },
  },
  vue: {
    label: 'Vue',
    hint: 'useTode() composable',
    adapter: '@tode-sdk/figma-vue',
    uiEntry: 'main.ts',
    vite: { import: "import vue from '@vitejs/plugin-vue';", plugins: 'vue(),' },
    esbuild: { import: "import vue from 'esbuild-plugin-vue3';", plugins: 'vue(),', options: '' },
  },
  svelte: {
    label: 'Svelte',
    hint: 'createTodeStore()',
    adapter: '@tode-sdk/figma-svelte',
    uiEntry: 'main.ts',
    vite: { import: "import { svelte } from '@sveltejs/vite-plugin-svelte';", plugins: 'svelte(),' },
    esbuild: { import: "import svelte from 'esbuild-svelte';", plugins: 'svelte(),', options: '' },
  },
  vanilla: {
    label: 'Vanilla TypeScript',
    hint: 'new TodeClient()',
    adapter: '@tode-sdk/figma-vanilla',
    uiEntry: 'main.ts',
    vite: { import: '', plugins: '' },
    esbuild: { import: '', plugins: '', options: '' },
  },
};

export const BUNDLER_INFO: Record<Bundler, { label: string; hint: string }> = {
  vite: { label: 'Vite', hint: 'recommended; vite.config.*.ts' },
  esbuild: { label: 'esbuild', hint: 'no config file, one build script' },
};

export function layersFor(framework: Framework, bundler: Bundler): string[] {
  return ['base', `bundler/${bundler}`, `framework/${framework}`, `combo/${framework}-${bundler}`];
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleCase(dir: string): string {
  return dir
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export interface VarsInput {
  name: string;
  slug: string;
  framework: Framework;
  bundler: Bundler;
}

export function templateVars({ name, slug, framework, bundler }: VarsInput): Record<string, string> {
  const fw = FRAMEWORK_INFO[framework];
  return {
    __TPL_NAME__: name,
    __TPL_SLUG__: slug,
    __TPL_YEAR__: String(new Date().getFullYear()),
    __TPL_FRAMEWORK__: framework,
    __TPL_BUNDLER__: bundler,
    __TPL_ADAPTER__: fw.adapter,
    __TPL_UI_ENTRY__: fw.uiEntry,
    __TPL_VITE_UI_PLUGIN_IMPORT__: fw.vite.import,
    __TPL_VITE_UI_PLUGINS__: fw.vite.plugins,
    __TPL_ESBUILD_UI_PLUGIN_IMPORT__: fw.esbuild.import,
    __TPL_ESBUILD_UI_PLUGINS__: fw.esbuild.plugins,
    __TPL_ESBUILD_UI_OPTIONS__: fw.esbuild.options,
  };
}
