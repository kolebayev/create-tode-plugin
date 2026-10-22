import { parseArgs } from 'node:util';
import { BUNDLERS, FRAMEWORKS, type Bundler, type Framework } from './matrix.js';

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
const PMS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

export interface CliArgs {
  dir?: string;
  framework?: Framework;
  bundler?: Bundler;
  name?: string;
  apiKey?: string;
  pm?: PackageManager;
  install: boolean;
  git: boolean;
  yes: boolean;
  list: boolean;
  help: boolean;
  version: boolean;
}

export class UsageError extends Error {}

export const USAGE = `Usage: npm create @tode-sdk@latest [dir] [options]

Scaffold a Figma plugin with tode analytics wired in.

Options:
  --framework <react|vue|svelte|vanilla>   UI framework (default: react)
  --bundler   <vite|esbuild>               bundler (default: vite)
  --name      <text>                       plugin name (default: from dir)
  --api-key   <key>                        tode API key; written to .env
  --pm        <npm|pnpm|yarn|bun>          package manager (default: detected)
  --no-install                             skip installing dependencies
  --no-git                                 skip git init and first commit
  -y, --yes                                use defaults for anything not given
  --list                                   print the matrix as JSON and exit
  -h, --help                               this text
  -v, --version                            print the version

Non-interactive (CI or no TTY): give every choice as a flag, or pass --yes.
Example:
  npm create @tode-sdk@latest my-plugin -- --framework react --bundler vite --yes --no-install
`;

function oneOf<T extends string>(flag: string, value: string | undefined, allowed: readonly T[]): T | undefined {
  if (value === undefined) return undefined;
  if (!allowed.includes(value as T)) throw new UsageError(`--${flag} must be one of ${allowed.join(', ')}, got "${value}"`);
  return value as T;
}

export function parseCliArgs(argv: string[]): CliArgs {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        framework: { type: 'string' },
        bundler: { type: 'string' },
        name: { type: 'string' },
        'api-key': { type: 'string' },
        pm: { type: 'string' },
        'no-install': { type: 'boolean', default: false },
        'no-git': { type: 'boolean', default: false },
        yes: { type: 'boolean', short: 'y', default: false },
        list: { type: 'boolean', default: false },
        help: { type: 'boolean', short: 'h', default: false },
        version: { type: 'boolean', short: 'v', default: false },
      },
    });
  } catch (err) {
    throw new UsageError((err as Error).message);
  }
  if (parsed.positionals.length > 1) throw new UsageError('expected at most one directory argument');
  const v = parsed.values;
  return {
    dir: parsed.positionals[0],
    framework: oneOf('framework', v.framework, FRAMEWORKS),
    bundler: oneOf('bundler', v.bundler, BUNDLERS),
    name: v.name,
    apiKey: v['api-key'],
    pm: oneOf('pm', v.pm, PMS),
    install: !v['no-install'],
    git: !v['no-git'],
    yes: v.yes ?? false,
    list: v.list ?? false,
    help: v.help ?? false,
    version: v.version ?? false,
  };
}
