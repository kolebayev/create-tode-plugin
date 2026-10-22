import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { compose } from './compose.js';
import { layersFor, slugify, templateVars, type Bundler, type Framework } from './matrix.js';

export interface GenerateOptions {
  dir: string;
  name: string;
  framework: Framework;
  bundler: Bundler;
  apiKey?: string;
  templatesDir: string;
}

export function generateProject(o: GenerateOptions): { files: string[] } {
  const files = compose({
    templatesDir: o.templatesDir,
    layers: layersFor(o.framework, o.bundler),
    outDir: o.dir,
    vars: templateVars({ name: o.name, slug: slugify(o.name) || 'figma-plugin', framework: o.framework, bundler: o.bundler }),
  });
  if (o.apiKey) {
    writeFileSync(join(o.dir, '.env'), `TODE_API_KEY=${o.apiKey}\n`);
    files.push('.env');
  }
  return { files: files.sort() };
}
