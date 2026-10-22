// `node scripts/build.mjs [--watch]`: builds main and UI with esbuild.
import * as esbuild from 'esbuild';
import { mainOptions, uiOptions } from './esbuild.config.mjs';

const watch = process.argv.includes('--watch');
const prod = !watch;
const contexts = await Promise.all([esbuild.context(mainOptions(prod)), esbuild.context(uiOptions(prod))]);

if (watch) {
  await Promise.all(contexts.map((c) => c.watch()));
  console.log('watching src/ → dist/');
} else {
  await Promise.all(contexts.map((c) => c.rebuild()));
  await Promise.all(contexts.map((c) => c.dispose()));
  console.log('built dist/main.js and dist/ui.html');
}
