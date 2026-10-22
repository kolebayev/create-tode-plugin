# @tode-sdk/create

Scaffold a Figma plugin with [tode](https://usetode.dev) analytics already wired in.

```bash
npm create @tode-sdk@latest my-plugin
```

Pick a UI framework and a bundler; the rest is set up: `manifest.json` with the network access and permission tode needs, `tode.init` in the main thread, the adapter in the UI, two example events, tests, lint, CI, and the files a coding agent reads to work in the project.

| | Vite | esbuild |
|---|---|---|
| React | `--framework react --bundler vite` (default) | `--framework react --bundler esbuild` |
| Vue | `--framework vue --bundler vite` | `--framework vue --bundler esbuild` |
| Svelte | `--framework svelte --bundler vite` | `--framework svelte --bundler esbuild` |
| Vanilla TS | `--framework vanilla --bundler vite` | `--framework vanilla --bundler esbuild` |

Every cell is generated and built in CI on every push.

## Flags

```
npm create @tode-sdk@latest [dir] -- [options]
  --framework <react|vue|svelte|vanilla>
  --bundler   <vite|esbuild>
  --name      "Plugin name"
  --api-key   <key>          writes .env
  --pm        <npm|pnpm|yarn|bun>
  --no-install  --no-git  -y/--yes  --list  --help  --version
```

Without a TTY (CI, agents) nothing is asked: pass the flags or `--yes`. `--list` prints the matrix as JSON.

## What you get

```
manifest.json           Figma reads this; edit it directly
src/main/               plugin sandbox: showUI, handlers, settings, tode.init
src/ui/                 the UI; framework app + tode adapter + a mock for browser preview
src/shared/messages.ts  typed messages between the two
scripts/                build, preview, manifest check
AGENTS.md, CLAUDE.md    the project explained to coding agents
skills/figma-plugin-tode/SKILL.md   sandbox and tracking rules
```

`npm run dev` watch-builds into `dist/`; import `manifest.json` in Figma Desktop and turn on "Hot reload plugin". `npm run check` is the one command that says whether the project is fine. `npm run preview` opens the UI in a browser with the main thread mocked.

## Without a tode account

The plugin runs and sends nothing. Add `TODE_API_KEY` to `.env` later (free plan at [app.usetode.dev](https://app.usetode.dev)).

## The flattened template

[kolebayev/figma-plugin-template-with-tode](https://github.com/kolebayev/figma-plugin-template-with-tode) is the React + Vite output of this generator, regenerated on every release. Use it with "Use this template" or `npx degit kolebayev/figma-plugin-template-with-tode my-plugin`.

## How the generator works

`templates/base` → `templates/bundler/<b>` → `templates/framework/<f>` → `templates/combo/<f>-<b>`, later layers win. JSON files are deep-merged (arrays concatenated, scalars overwritten), everything else is copied whole, `__TPL_*__` tokens are substituted (see `cli/src/matrix.ts`), and a leading `_` in a path segment becomes `.`. Dependency versions are pinned in the layer `package.json` files; `npm run bump-deps` prints the ones that are behind.

Ideas borrowed with thanks from [plugma](https://github.com/gavinmcfarland/plugma) (layered templates, manifest in the root, main/ui split) and [create-figma-plugin](https://github.com/yuanqing/create-figma-plugin) (typed events, the settings helper, esbuild targets). MIT.
