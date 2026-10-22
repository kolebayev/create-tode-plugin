# __TPL_NAME__

A Figma plugin with [tode](https://usetode.dev) analytics wired in. Scaffolded with `npm create @tode-sdk` (__TPL_FRAMEWORK__ + __TPL_BUNDLER__).

## Run it

```bash
npm install
npm run dev
```

In Figma Desktop: Plugins → Development → Import plugin from manifest → pick `manifest.json`. Turn on "Hot reload plugin" in the same menu and the plugin reloads on every save.

## Analytics

Copy `.env.example` to `.env` and set `TODE_API_KEY` (free plan at [app.usetode.dev](https://app.usetode.dev)). Rebuild. Events appear in the dashboard as soon as the plugin runs. With no key the plugin works and sends nothing.

The example tracks `rectangles_created` (main thread, with the count as a metric) and `help_opened` (UI). Sessions are recorded by the UI adapter.

## Commands

`npm run dev`, `npm run build`, `npm run preview` (UI in a browser with a mocked main thread), `npm run check` (everything CI runs).

## Working with a coding agent

`AGENTS.md` explains the two threads, the commands and how to add a feature. `CLAUDE.md` includes it. `skills/figma-plugin-tode/SKILL.md` holds the sandbox rules that trip agents.

## Publish

Build, then in Figma Desktop: Plugins → Development → the plugin → Publish. Paste the id Figma shows into `manifest.json`.
