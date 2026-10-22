// `node scripts/build.mjs [--watch]`: builds main and UI with the Vite API.
import { build } from 'vite';

const watch = process.argv.includes('--watch');
const mode = watch ? 'development' : 'production';
const run = (configFile) => build({ configFile, mode, build: { watch: watch ? {} : null } });

await Promise.all([run('vite.config.main.ts'), run('vite.config.ui.ts')]);
if (!watch) console.log('built dist/main.js and dist/ui.html');
