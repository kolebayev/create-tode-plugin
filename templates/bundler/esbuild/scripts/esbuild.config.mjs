// Shared esbuild options for build.mjs and preview.mjs.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
__TPL_ESBUILD_UI_PLUGIN_IMPORT__

/** Reads KEY=value lines from .env; quotes and comments are handled, nothing else. */
export function readEnv(file = '.env') {
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || m[1].startsWith('#')) continue;
    env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}

export function mainOptions(prod) {
  const env = readEnv();
  return {
    entryPoints: ['src/main/main.ts'],
    bundle: true,
    outfile: 'dist/main.js',
    format: 'iife',
    platform: 'neutral',
    target: 'es2017',
    minify: prod,
    sourcemap: prod ? false : 'inline',
    define: { __TODE_API_KEY__: JSON.stringify(env.TODE_API_KEY ?? '') },
    logLevel: 'info',
  };
}

/** Writes dist/ui.html from src/ui/ui.html with the built JS and CSS inlined. */
const inlineHtml = {
  name: 'inline-html',
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length) return;
      const js = readFileSync('dist/.ui/main.js', 'utf8').replace(/<\/script>/g, '<\\/script>');
      const css = existsSync('dist/.ui/main.css') ? readFileSync('dist/.ui/main.css', 'utf8') : '';
      const html = readFileSync('src/ui/ui.html', 'utf8').replace(
        /<script type="module" src="\.\/main\.[jt]sx?"><\/script>/,
        // A function, not a string: bundled code contains `$&`, which a replacement string would expand.
        () => `<style>${css}</style><script>${js}</script>`,
      );
      mkdirSync('dist', { recursive: true });
      writeFileSync('dist/ui.html', html);
    });
  },
};

export function uiOptions(prod) {
  return {
    entryPoints: { main: 'src/ui/__TPL_UI_ENTRY__' },
    bundle: true,
    outdir: 'dist/.ui',
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: prod,
    sourcemap: false,
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.svg': 'dataurl', '.woff2': 'dataurl' },
    __TPL_ESBUILD_UI_OPTIONS__
    plugins: [__TPL_ESBUILD_UI_PLUGINS__ inlineHtml],
    logLevel: 'info',
  };
}
