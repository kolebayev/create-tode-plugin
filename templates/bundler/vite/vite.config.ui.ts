import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
__TPL_VITE_UI_PLUGIN_IMPORT__

// UI thread: everything inlined into dist/ui.html, which manifest.json points at.
export default defineConfig(({ mode }) => ({
  root: 'src/ui',
  base: './',
  plugins: [__TPL_VITE_UI_PLUGINS__ viteSingleFile()],
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    target: 'es2020',
    minify: mode === 'production',
    sourcemap: false,
    // Absolute: rollup input paths are not resolved against `root`.
    rollupOptions: { input: fileURLToPath(new URL('./src/ui/ui.html', import.meta.url)) },
  },
}));
