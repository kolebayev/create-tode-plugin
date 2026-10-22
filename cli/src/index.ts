#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { parseCliArgs, USAGE, UsageError, type CliArgs, type PackageManager } from './args.js';
import { generateProject } from './generate.js';
import {
  BUNDLERS, BUNDLER_INFO, DEFAULT_BUNDLER, DEFAULT_FRAMEWORK, FRAMEWORKS, FRAMEWORK_INFO, titleCase,
  type Bundler, type Framework,
} from './matrix.js';

const here = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(here, '..', 'templates');
const pkg = JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')) as { version: string };

const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY && !process.env.CI);

function detectPm(): PackageManager {
  const ua = process.env.npm_config_user_agent ?? '';
  if (ua.startsWith('pnpm')) return 'pnpm';
  if (ua.startsWith('yarn')) return 'yarn';
  if (ua.startsWith('bun')) return 'bun';
  return 'npm';
}

/** Unwraps a prompt answer; Ctrl-C exits. */
function answer<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel('Cancelled.');
    process.exit(1);
  }
  return value as T;
}

async function resolveChoices(args: CliArgs) {
  const missing: string[] = [];

  let dir = args.dir;
  if (!dir) {
    if (interactive) {
      const v = answer(await p.text({ message: 'Where should the plugin be created?', placeholder: 'my-figma-plugin', validate: (s) => (s?.trim() ? undefined : 'Enter a directory name') }));
      dir = String(v).trim();
    } else if (args.yes) dir = 'my-figma-plugin';
    else missing.push('[dir]');
  }

  let framework = args.framework;
  if (!framework) {
    if (interactive) {
      const v = answer<Framework>(await p.select<Framework>({ message: 'UI framework', options: FRAMEWORKS.map((f) => ({ value: f, label: FRAMEWORK_INFO[f].label, hint: FRAMEWORK_INFO[f].hint })) }));
      framework = v;
    } else if (args.yes) framework = DEFAULT_FRAMEWORK;
    else missing.push('--framework');
  }

  let bundler = args.bundler;
  if (!bundler) {
    if (interactive) {
      const v = answer<Bundler>(await p.select<Bundler>({ message: 'Bundler', options: BUNDLERS.map((b) => ({ value: b, label: BUNDLER_INFO[b].label, hint: BUNDLER_INFO[b].hint })) }));
      bundler = v;
    } else if (args.yes) bundler = DEFAULT_BUNDLER;
    else missing.push('--bundler');
  }

  let apiKey = args.apiKey;
  if (apiKey === undefined && interactive && !args.yes) {
    const v = answer(await p.password({ message: 'tode API key (Enter to skip; get one at https://usetode.dev)', mask: '*' }));
    apiKey = String(v ?? '').trim() || undefined;
  }

  let install = args.install;
  if (install && interactive && !args.yes) {
    const v = answer(await p.confirm({ message: 'Install dependencies now?', initialValue: true }));
    install = Boolean(v);
  }

  let git = args.git;
  if (git && interactive && !args.yes) {
    const v = answer(await p.confirm({ message: 'Initialise a git repository?', initialValue: true }));
    git = Boolean(v);
  }

  if (missing.length) {
    process.stderr.write(`${USAGE}\nMissing: ${missing.join(', ')} (or pass --yes)\n`);
    process.exit(2);
  }

  return { dir: dir!, framework: framework!, bundler: bundler!, apiKey, install, git, name: args.name ?? titleCase(basename(resolve(dir!))), pm: args.pm ?? detectPm() };
}

async function main() {
  let args: CliArgs;
  try {
    args = parseCliArgs(process.argv.slice(2));
  } catch (err) {
    if (err instanceof UsageError) {
      process.stderr.write(`${err.message}\n\n${USAGE}`);
      process.exit(2);
    }
    throw err;
  }
  if (args.help) return process.stdout.write(USAGE);
  if (args.version) return process.stdout.write(`${pkg.version}\n`);
  if (args.list) {
    return process.stdout.write(
      JSON.stringify({ frameworks: FRAMEWORKS.map((f) => ({ id: f, label: FRAMEWORK_INFO[f].label, adapter: FRAMEWORK_INFO[f].adapter })), bundlers: BUNDLERS.map((b) => ({ id: b, label: BUNDLER_INFO[b].label })), defaults: { framework: DEFAULT_FRAMEWORK, bundler: DEFAULT_BUNDLER } }, null, 2) + '\n',
    );
  }

  if (interactive) p.intro(`create-tode-plugin ${pkg.version}`);
  const c = await resolveChoices(args);
  const dir = resolve(c.dir);

  if (existsSync(dir) && readdirSync(dir).length > 0) {
    process.stderr.write(`${dir} exists and is not empty\n`);
    process.exit(1);
  }

  const { files } = generateProject({ dir, name: c.name, framework: c.framework, bundler: c.bundler, apiKey: c.apiKey, templatesDir });
  if (interactive) p.log.success(`Wrote ${files.length} files to ${c.dir}`);
  else process.stdout.write(`wrote ${files.length} files to ${dir}\n`);

  if (c.install) {
    const s = interactive ? p.spinner() : undefined;
    s?.start(`Installing with ${c.pm}`);
    const r = spawnSync(c.pm, ['install'], { cwd: dir, stdio: interactive ? 'ignore' : 'inherit', shell: process.platform === 'win32' });
    if (r.status !== 0) {
      s?.stop('Install failed');
      process.stderr.write(`${c.pm} install failed; run it yourself in ${c.dir}\n`);
    } else s?.stop('Dependencies installed');
  }

  if (c.git) {
    const run = (a: string[]) => spawnSync('git', a, { cwd: dir, stdio: 'ignore' }).status === 0;
    const ok = run(['init', '-q', '-b', 'main']) && run(['add', '-A']) && run(['commit', '-q', '-m', 'chore: scaffold with create-tode-plugin']);
    if (!ok) process.stderr.write('git init skipped (git missing or commit failed)\n');
  }

  const steps = [
    `cd ${c.dir}`,
    c.install ? '' : `${c.pm} install`,
    `${c.pm} run dev`,
    'In Figma Desktop: Plugins → Development → Import plugin from manifest → manifest.json',
    c.apiKey ? '' : 'Analytics: copy .env.example to .env and set TODE_API_KEY (https://usetode.dev)',
    'Coding agents: AGENTS.md explains the project',
  ].filter(Boolean);
  if (interactive) {
    p.note(steps.join('\n'), 'Next steps');
    p.outro('Done.');
  } else process.stdout.write(steps.map((s) => `  ${s}`).join('\n') + '\n');
}

main().catch((err) => {
  process.stderr.write(`${(err as Error).stack ?? err}\n`);
  process.exit(1);
});
