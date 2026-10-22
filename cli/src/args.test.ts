import { describe, expect, it } from 'vitest';
import { parseCliArgs, UsageError } from './args.js';

describe('parseCliArgs', () => {
  it('parses a full agent invocation', () => {
    const a = parseCliArgs(['my-plugin', '--framework', 'vue', '--bundler', 'esbuild', '--api-key', 'k1', '--yes', '--no-install', '--no-git', '--pm', 'pnpm', '--name', 'My Plugin']);
    expect(a).toEqual({ dir: 'my-plugin', framework: 'vue', bundler: 'esbuild', apiKey: 'k1', yes: true, install: false, git: false, pm: 'pnpm', name: 'My Plugin', list: false, help: false, version: false });
  });

  it('defaults install and git to true', () => {
    const a = parseCliArgs([]);
    expect(a.install).toBe(true);
    expect(a.git).toBe(true);
    expect(a.dir).toBeUndefined();
  });

  it('accepts -y and --list, --help, --version', () => {
    expect(parseCliArgs(['-y']).yes).toBe(true);
    expect(parseCliArgs(['--list']).list).toBe(true);
    expect(parseCliArgs(['-h']).help).toBe(true);
    expect(parseCliArgs(['-v']).version).toBe(true);
  });

  it('rejects unknown enum values and unknown flags', () => {
    expect(() => parseCliArgs(['--framework', 'angular'])).toThrow(UsageError);
    expect(() => parseCliArgs(['--bundler', 'webpack'])).toThrow(/bundler/);
    expect(() => parseCliArgs(['--pm', 'cargo'])).toThrow(/pm/);
    expect(() => parseCliArgs(['--wat'])).toThrow(UsageError);
    expect(() => parseCliArgs(['a', 'b'])).toThrow(/one directory/);
  });
});
