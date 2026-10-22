// Serves dist/ui.html on localhost; src/ui/dev/mock-figma.ts stands in for the main thread.
import * as esbuild from 'esbuild';
import { uiOptions } from './esbuild.config.mjs';

const ctx = await esbuild.context(uiOptions(false));
await ctx.watch();
const { hosts, port } = await ctx.serve({ servedir: 'dist', port: 5173 });
console.log(`preview: http://${hosts[0] ?? 'localhost'}:${port}/ui.html`);
