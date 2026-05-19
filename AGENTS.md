# AGENTS

## Repo at a glance
- This is a single-package Obsidian plugin (no monorepo): source is `main.ts`, bundled output target is `main.js`, metadata is in `manifest.json`.
- There are no test, lint, or CI workflow files in this repo; do not assume standard checks exist.
- `README.md` notes the project is unsupported; prefer minimal, targeted changes over broad refactors.

## Commands (source of truth: `package.json`)
- `npm run dev` -> runs `node esbuild.config.mjs` in watch mode (default when no `production` arg).
- `npm run build` -> runs `tsc -noEmit -skipLibCheck` first, then production bundle via `node esbuild.config.mjs production`.
- `npm run version` -> runs `node version-bump.mjs && git add manifest.json versions.json`.

## Build and release quirks
- `esbuild.config.mjs` bundles `main.ts` to CommonJS `main.js` targeting `es2016`; `obsidian`, `electron`, CodeMirror packages, and Node built-ins are externalized.
- `main.js` is intentionally gitignored (`.gitignore` says compiled file should be attached to GitHub releases), so do not expect it to be tracked.
- Version numbers are easy to desync: `package.json` is the source for `npm run version`, which rewrites `manifest.json` `version` and updates `versions.json` with `minAppVersion`.

## Code navigation
- Runtime behavior is almost entirely in `main.ts` inside `ThingsLink` plugin `onload()` handlers and command registrations.
- Two protocol handlers are key integration points: `project-id` and `task-id` (used to round-trip between Things deeplinks and Obsidian edits).

## Style/conventions actually enforced
- Formatting defaults come from `.editorconfig`: tabs, width 4, UTF-8, final newline.
- TypeScript strictness is limited (`noImplicitAny: true`), and the repo currently uses `(this.app as any).getObsidianUrl(...)`; keep compatibility with the existing Obsidian API usage pattern unless intentionally refactoring.
