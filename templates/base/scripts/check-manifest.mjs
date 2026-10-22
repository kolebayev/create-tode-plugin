// Fails when manifest.json or dist/ is not what Figma and tode need.
import { existsSync, readFileSync } from 'node:fs';

const m = JSON.parse(readFileSync('manifest.json', 'utf8'));
const errors = [];
const need = (ok, msg) => ok || errors.push(msg);

need(typeof m.name === 'string' && m.name.trim(), 'name is empty');
need(/^\d+$/.test(String(m.id)), 'id must be the numeric id Figma shows in the publish dialog (the zeros placeholder is fine until then)');
need(m.api === '1.0.0', 'api must be "1.0.0"');
need(m.main === 'dist/main.js', 'main must be "dist/main.js"');
need(m.ui === 'dist/ui.html', 'ui must be "dist/ui.html"');
need(Array.isArray(m.editorType) && m.editorType.length > 0, 'editorType must be a non-empty array');
need((m.permissions ?? []).includes('currentuser'), 'permissions must include "currentuser" so tode can count unique users');
const domains = m.networkAccess?.allowedDomains ?? [];
for (const d of ['https://processing.usetode.dev', 'wss://processing.usetode.dev']) {
  need(domains.includes(d), `networkAccess.allowedDomains must include ${d}`);
}
need(existsSync('dist/main.js') && existsSync('dist/ui.html'), 'dist/main.js or dist/ui.html missing: run npm run build');

if (errors.length) {
  console.error('manifest check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('manifest ok');
