---
name: figma-plugin-tode
description: Rules for editing a Figma plugin that uses the tode analytics SDK. Use when changing src/main, src/ui, manifest.json or tracking calls in a project scaffolded by create-tode-plugin.
---

# Figma plugin with tode

## Sandbox rules that break builds or plugins

- Main thread (`src/main`): no DOM, no `window`, no `fetch` to domains outside `manifest.json` `networkAccess.allowedDomains`, no top-level `await`, ES2017 output. Node access is async under `documentAccess: "dynamic-page"`: `await figma.getNodeByIdAsync(id)`, `await figma.currentPage.loadAsync()`, `await figma.loadAllPagesAsync()` before touching other pages.
- Text edits need the font first: `await figma.loadFontAsync(node.fontName as FontName)` for every distinct font in the node, before setting `characters`.
- `figma.clientStorage` is per user, per plugin, about 1 MB. Store small JSON. Values survive plugin updates.
- `figma.ui.postMessage` sends structured-clonable data only. No functions, no nodes; send ids and plain objects.
- The UI iframe has a null origin: no cookies, no `localStorage` persistence you can rely on, `parent.postMessage(..., '*')` is correct.
- `figma.showUI(__html__, { themeColors: true })` gives the UI `--figma-color-*` CSS variables; keep fallbacks for the browser preview.
- Network: every host the plugin calls (main or UI) must be in `allowedDomains`, or Figma blocks it silently and the console shows a CSP error. tode needs `https://processing.usetode.dev` and `wss://processing.usetode.dev`.
- Multiple commands: add `menu` to `manifest.json` and branch on `figma.command` in `main.ts`.

## Tracking with tode

- Init once, in the main thread, after `showUI`: `await tode.init({ apiKey })`. Never in the UI.
- Mount the UI adapter at the root (hook, composable, store or client). It opens the session socket; without it sessions are not recorded.
- `trackAction('sheet_exported')`, `trackActionWithMetric('layers_processed', n)`. Name = noun + past-tense verb, lowercase, underscores. No values in names (`png_exported` + metric, not `export_png_2x`). No file, layer or user names in names.
- Do not track opens; sessions already cover them. Five to ten action names per plugin is the right size.
- Calls before init resolves are queued (up to 50); do not guard with `isReady`.
- `tode.init` and track calls never throw; errors go to the console. `debug: true` logs the SDK's activity.

## Verify

`npm run check` (exit code), `npm run preview` for the UI, `npm test` for main-thread modules. Running inside Figma is a human step: ask for it and say what to look at.
