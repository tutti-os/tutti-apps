# Nextop Apps

Workspace apps and publishable Nextop app packages.

This repository is a pnpm/Turbo monorepo for building small, self-contained apps
that can run locally during development and be packaged for the Nextop workspace
runtime. The current app is **Daily Product Radar**, a TanStack Start dashboard
for browsing Product Hunt launches and trending GitHub repositories by date,
source, category, language, and keyword.

![Daily Product Radar home screen](./docs/assets/daily-tech-radar-home.png)

## Features

- **Daily discovery board**: Product Hunt launches and GitHub repositories in
  one searchable card grid.
- **Focused filters**: source, date, category, locale, search text, and compact
  or card views.
- **Detail-first UI**: product cards open into richer detail views with media,
  metrics, tags, and source links.
- **Nextop packaging**: app manifests, bootstrap scripts, icons, and server
  wrappers are bundled into a zip under `build/nextop-app`.
- **Read-only CLI surface**: packaged installs expose the `radar` CLI scope for
  board, search, and item lookup commands.
- **Bilingual UI**: English and Simplified Chinese copy are managed through the
  app i18n harness.

## Status

This is an early workspace-app monorepo. It currently contains one publishable
app:

| App | Package | Path | Status |
| --- | --- | --- | --- |
| Daily Product Radar | `@nextop-apps/daily-tech-radar` | `apps/daily-tech-radar` | MVP |

The repository is still marked `private` in `package.json`, and no open-source
license has been selected yet.

## Quick Start

Requirements:

- Node.js 22 or newer
- pnpm 10.26.2 or newer

Install dependencies:

```bash
pnpm install
```

Run the Daily Product Radar app:

```bash
pnpm --filter @nextop-apps/daily-tech-radar dev
```

The dev server listens on:

```txt
http://127.0.0.1:3002
```

Run the main checks:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

## Package A Nextop App

Build the Daily Product Radar Nextop package:

```bash
pnpm package:nextop --app daily-tech-radar
```

Outputs:

```txt
build/nextop-app/daily-tech-radar/package/
build/nextop-app/daily-tech-radar/daily-tech-radar-0.0.0.zip
```

Run the packaged server locally after packaging:

```bash
pnpm --filter @nextop-apps/daily-tech-radar start
```

The package wrapper serves static assets from `dist/`, delegates SSR and server
functions to `server/server.js`, and exposes `/api/health` for the Nextop
runtime.

## CLI Commands

Daily Product Radar packages include `nextop.cli.json`, which exposes the
read-only `radar` command scope inside Nextop:

```bash
nextop --json radar board
nextop --json radar board --date 2026-06-05 --locale zh-CN
nextop --json radar search --query agent --source github --limit 10
nextop --json radar item --id github:123456 --locale en-US
```

See
[`apps/daily-tech-radar/nextop-package/COMMANDS.md`](./apps/daily-tech-radar/nextop-package/COMMANDS.md)
for the full command reference and response envelope shape.

## Workspace Layout

```txt
nextop-apps/
  apps/
    daily-tech-radar/
      nextop-package/
      src/
      package.json
  packages/
  docs/
    architecture/
    conventions/
  scripts/
  nextop.publish.json
  package.json
  pnpm-workspace.yaml
  turbo.json
```

Repository boundaries:

- `apps/*` contains independently runnable apps.
- `apps/<app-id>/nextop-package` contains package manifest files and runtime
  adapters for publishable apps.
- `packages/*` is reserved for real shared boundaries that more than one app
  needs.
- `docs/*` stores durable architecture notes, packaging details, and agent
  conventions.
- `scripts/*` contains repository-level packaging and release helpers.

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
pnpm --filter @nextop-apps/daily-tech-radar dev
pnpm --filter @nextop-apps/daily-tech-radar test
pnpm --filter @nextop-apps/daily-tech-radar typecheck
pnpm --filter @nextop-apps/daily-tech-radar i18n:check
```

Before publishing meaningful app changes, run:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm package:nextop --app daily-tech-radar
```

For UI changes, also verify the main screen in a browser at both desktop and
mobile widths.

## Documentation

- [Architecture overview](./docs/architecture/README.md)
- [Project structure](./docs/architecture/project-structure.md)
- [Build system](./docs/architecture/build-system.md)
- [Nextop packaging](./docs/architecture/nextop-packaging.md)
- [Agent workflow conventions](./docs/conventions/agent-workflow.md)
- [Daily Product Radar app README](./apps/daily-tech-radar/README.md)

## Adding Apps

1. Create `apps/<app-id>` with its own `package.json`, `src/`, and validation
   scripts.
2. Keep app-specific product logic inside that app.
3. Move code into `packages/*` only when more than one app needs it.
4. Add `apps/<app-id>/nextop-package` if the app should be publishable.
5. Register publishable apps in `nextop.publish.json`.
6. Add app-specific docs under `apps/<app-id>/docs` when the app grows beyond
   the root README summary.

## License

No license has been selected for this repository yet.
