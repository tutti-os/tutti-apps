<p align="center">
  <img src="./apps/daily-tech-radar/public/icon.png" alt="Daily Product Radar icon" width="88" />
</p>

<h1 align="center">Tutti Apps</h1>

<p align="center">
  <strong>Workspace apps and packageable Tutti app experiences.</strong>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="./README.zh-CN.md">简体中文</a>
  ·
  <a href="#tutti-package-mode">Tutti Package</a>
  ·
  <a href="#cli-commands">CLI</a>
  ·
  <a href="./docs/README.md">Docs</a>
</p>

<p align="center">
  <img alt="Workspace: pnpm and Turbo" src="https://img.shields.io/badge/workspace-pnpm%20%7C%20Turbo-111827" />
  <img alt="App: TanStack Start" src="https://img.shields.io/badge/app-TanStack%20Start-2563eb" />
  <img alt="Package: Tutti app" src="https://img.shields.io/badge/package-Tutti%20app-0f766e" />
  <img alt="CLI: radar" src="https://img.shields.io/badge/CLI-radar-7c3aed" />
  <img alt="i18n: en-US and zh-CN" src="https://img.shields.io/badge/i18n-en--US%20%7C%20zh--CN-16a34a" />
</p>

![Daily Product Radar home screen](./docs/assets/daily-tech-radar-home.png)

Tutti Apps is a pnpm/Turbo monorepo for building small, self-contained apps
that can run locally during development and be packaged for the Tutti
workspace runtime.

The first app is **Daily Product Radar**, a TanStack Start dashboard that turns
Product Hunt launches and GitHub trending repositories into searchable discovery
cards by date, source, category, language, and keyword.

## Features

- Daily discovery board: browse Product Hunt launches and GitHub repositories
  in one searchable card grid.
- Focused filtering: switch source, date, category, locale, search text, and
  card density without leaving the page.
- Rich item views: open cards into media, metrics, tags, and source links for
  deeper review.
- Tutti packaging: bundle app manifests, bootstrap scripts, icons, CLI
  metadata, static assets, and server wrappers under `build/tutti-app`.
- Read-only CLI surface: packaged installs expose the `radar` command scope for
  board, search, and item lookup commands.
- Bilingual UI: the app ships `en-US` by default and includes Simplified
  Chinese localization.

## Quick Start

Requirements:

- Node.js 22 or newer
- pnpm 10.26.2, preferably through Corepack

```bash
corepack enable
pnpm install
pnpm --filter @tutti-apps/daily-tech-radar dev
```

Then open:

```txt
http://127.0.0.1:3002
```

Run the main checks:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

## Tutti Package Mode

Build the Daily Product Radar package:

```bash
pnpm package:tutti --app daily-tech-radar
```

Outputs:

```txt
build/tutti-app/daily-tech-radar/package/
build/tutti-app/daily-tech-radar/daily-tech-radar-0.0.0.zip
```

Run the packaged server locally:

```bash
pnpm --filter @tutti-apps/daily-tech-radar start
```

The package wrapper serves static assets from `dist/`, delegates SSR and server
functions to `server/server.js`, and exposes `/api/health` for the Tutti
runtime.

## CLI Commands

Daily Product Radar packages include
[`tutti.cli.json`](./apps/daily-tech-radar/tutti-package/tutti.cli.json),
which exposes the read-only `radar` command scope inside Tutti:

```bash
tutti --json radar board
tutti --json radar board --date 2026-06-05 --locale zh-CN
tutti --json radar search --query agent --source github --limit 10
tutti --json radar item --id github:123456 --locale en-US
```

See
[`apps/daily-tech-radar/tutti-package/COMMANDS.md`](./apps/daily-tech-radar/tutti-package/COMMANDS.md)
for the full command reference and response envelope shape.

## Workspace Layout

```txt
apps/
  daily-tech-radar/      TanStack Start app and Tutti package files
packages/                Shared packages when more than one app needs them
docs/                    Architecture notes and workflow conventions
scripts/                 Repository-level packaging and validation helpers
tutti.publish.json      Publishable app registry
```

Repository boundaries:

- `apps/*` contains independently runnable apps.
- `apps/<app-id>/tutti-package` contains package manifest files and runtime
  adapters for publishable apps.
- `packages/*` is reserved for real shared boundaries.
- `docs/*` stores durable architecture notes, packaging details, and agent
  conventions.

## Documentation

- [Architecture overview](./docs/architecture/README.md)
- [Project structure](./docs/architecture/project-structure.md)
- [Build system](./docs/architecture/build-system.md)
- [Tutti packaging](./docs/architecture/tutti-packaging.md)
- [Agent workflow conventions](./docs/conventions/agent-workflow.md)
- [Daily Product Radar app README](./apps/daily-tech-radar/README.md)

## Development

Root commands delegate to Turbo:

```bash
pnpm dev
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

Use package filters when working on one app:

```bash
pnpm --filter @tutti-apps/daily-tech-radar dev
pnpm --filter @tutti-apps/daily-tech-radar test
pnpm --filter @tutti-apps/daily-tech-radar typecheck
pnpm --filter @tutti-apps/daily-tech-radar i18n:check
```

Before publishing meaningful app changes, run:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm package:tutti --app daily-tech-radar
```

For UI changes, verify the main screen in a browser at both desktop and mobile
widths.

## Adding Apps

1. Create `apps/<app-id>` with its own `package.json`, `src/`, and validation
   scripts.
2. Keep app-specific product logic inside that app.
3. Move code into `packages/*` only when more than one app needs it.
4. Add `apps/<app-id>/tutti-package` if the app should be publishable.
5. Register publishable apps in `tutti.publish.json`.
6. Add app-specific docs under `apps/<app-id>/docs` when the app grows beyond
   the root README summary.

## Status

This repository currently contains one publishable MVP app:

| App | Package | Path |
| --- | --- | --- |
| Daily Product Radar | `@tutti-apps/daily-tech-radar` | `apps/daily-tech-radar` |

The repository is still marked `private` in `package.json`, and no open-source
license has been selected yet.
