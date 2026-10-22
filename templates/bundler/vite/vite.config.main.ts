import { defineConfig, loadEnv } from 'vite';

// Main thread: one IIFE for Figma's sandbox. `figma` is a global there, never bundled.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: { __TODE_API_KEY__: JSON.stringify(env.TODE_API_KEY ?? '') },
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      target: 'es2017',
      minify: mode === 'production',
      sourcemap: mode === 'production' ? false : 'inline',
      lib: { entry: 'src/main/main.ts', formats: ['iife'], name: 'plugin', fileName: () => 'main.js' },
      rollupOptions: { external: ['figma'] },
    },
  };
});
