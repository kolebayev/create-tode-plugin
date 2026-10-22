# __TPL_NAME__

A Figma plugin, scaffolded with `create-tode-plugin` (__TPL_FRAMEWORK__, __TPL_BUNDLER__). Read this before changing anything.

## Two threads

- `src/main/` runs in Figma's plugin sandbox. It has the `figma` API and no DOM, no `window`, no `document`, no `localStorage`. Its tsconfig has no DOM lib, so DOM code here fails `npm run typecheck`. That is intended.
- `src/ui/` runs in an iframe with a null origin. It has the DOM and no `figma` object. Its tsconfig has `types: []`, so `figma.*` here fails typecheck. That is intended.
- The two talk only through messages. Types live in `src/shared/messages.ts`; helpers are `postToUI`/`onUIMessage` in `src/main/messaging.ts` and `postToMain`/`onMainMessage` in `src/ui/messaging.ts`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | watch-build both threads into `dist/`. In Figma Desktop turn on Plugins → Development → Hot reload plugin. |
| `npm run build` | production build |
| `npm run check` | typecheck, lint, test, build, manifest check. Run it before saying a change is done. Exit code 0 is the answer. |
| `npm run preview` | the UI in a browser tab with the main thread mocked (`src/ui/dev/mock-figma.ts`). Use it with a browser tool to click through UI changes. |
| `npm test` | vitest over `src/main/**/*.test.ts` with the `figma` global stubbed in `src/test/figma-stub.ts` |

Tests are not type-checked (they would need DOM and plugin typings together); keep them small and plain.

## Layout

```
manifest.json          what Figma reads; edit it directly
src/main/main.ts       showUI, message handlers, settings, tode.init
src/main/rectangles.ts the example command
src/main/settings.ts   figma.clientStorage with defaults
src/ui/__TPL_UI_ENTRY__       mounts the app, installs the preview mock
src/ui/App.*           the UI
src/ui/styles.css      uses --figma-color-* with fallbacks
src/shared/messages.ts message types for both directions
scripts/               build, preview, manifest check
dist/                  build output: main.js and ui.html (git-ignored)
```

## Adding a feature

1. Add a message variant to `UIToMain` or `MainToUI` in `src/shared/messages.ts`.
2. Handle it: `onUIMessage('name', handler)` in `src/main/main.ts`, or `onMainMessage('name', handler)` in the UI.
3. Put Figma work in a small module under `src/main/` with a test next to it, like `rectangles.ts`.
4. If the feature is an outcome the user cares about, track it (next section).
5. `npm run check`.

## Analytics (tode)

- `tode.init({ apiKey })` runs once in `src/main/main.ts`. The key comes from `TODE_API_KEY` in `.env`, injected at build time as `__TODE_API_KEY__`. With no key the plugin runs and analytics is off.
- The UI mounts the __TPL_ADAPTER__ adapter; that is what records sessions. Keep it mounted at the root.
- Track outcomes, not clicks: `tode.trackAction('fonts_replaced')`, `tode.trackActionWithMetric('rectangles_created', count)`. Names are lowercase with underscores, noun then past-tense verb, no values and no user data in the name. Events tracked before init finishes are queued.
- `manifest.json` must keep `permissions: ["currentuser"]` and both `processing.usetode.dev` entries in `networkAccess.allowedDomains`; `scripts/check-manifest.mjs` enforces this.
- Reference: https://docs.usetode.dev and `skills/figma-plugin-tode/SKILL.md`.

## Manifest

`manifest.json` is the file Figma imports; there is no generation step. `id` is the placeholder until the first publish, when Figma gives the real one. `editorType` lists where the plugin appears. `documentAccess: "dynamic-page"` means pages load lazily: use `figma.getNodeByIdAsync`, `figma.currentPage.loadAsync()` and `figma.loadAllPagesAsync()` instead of the sync forms. Changing `main` or `ui` breaks the build scripts; leave them.

## What you cannot verify here

Running inside Figma needs Figma Desktop: ask the user to import `manifest.json` (Plugins → Development → Import plugin from manifest) and run the plugin, and tell them what to look for. Everything else is `npm run check` and `npm run preview`.

## Links

- Figma plugin API: https://developers.figma.com/docs/plugins/
- tode docs: https://docs.usetode.dev
