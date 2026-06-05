# AGENTS.md

## App Overview

`apps/github-trending` owns the GitHub Trending Reader.

Product scope:

- category-first GitHub Trending board
- compact repo rows with README thumbnail preview
- README-only right panel
- GitHub metadata, topics, and README ingestion
- category classification and momentum ranking

The right panel should stay focused on README rendering in the MVP. Do not add
issues, pull requests, discussions, related repos, releases, or AI summary cards
to the right panel unless the product plan changes.

## Documentation

- App overview: `README.md`
- Technical plan: `docs/technical-plan.md`
- Docs index: `docs/README.md`
- Nextop package source: `nextop/`
- Repository build-system context: `../../docs/architecture/build-system.md`
- Repository package workflow: `../../docs/architecture/nextop-packaging.md`

## Framework Direction

The planned framework is TanStack Start with Tailwind CSS and shadcn/ui.

When available, use the global `tanstack-start` skill for TanStack Start
scaffolding, routing, server functions, Vite config, and deployment decisions.

Use:

- TanStack Router/Start for routes, loaders, server functions, and server routes.
- TanStack Query for client data state and request deduplication.
- Tailwind CSS and shadcn/ui for UI.
- Sanitized markdown rendering for README content.

## Module Boundary

Recommended future source layout:

```txt
src/
  routes/
  features/
    github/
    trending/
    classification/
    ranking/
    readme/
  components/
  db/
  lib/
```

Keep feature code grouped by product capability. If another app needs a GitHub
client or classification logic later, promote that code into `packages/*`.

## Nextop Package

The app's Nextop package source lives in `nextop/`.

- `nextop/nextop.app.json`: source manifest.
- `nextop/bootstrap.sh`: runtime entrypoint copied into the package.
- `nextop/AGENTS.md`: runtime package guide.
- `nextop/icon.svg`: App Center icon.
- `nextop/static` and `nextop/server`: placeholder package assets until the
  TanStack Start app is implemented.

Root `nextop.publish.json` enables this app for production and staging release
workflows.

## Validation

Use app-scoped checks first:

```bash
pnpm --filter @nextop-apps/github-trending typecheck
pnpm --filter @nextop-apps/github-trending test
```

Package validation:

```bash
pnpm package:nextop --app github-trending
```

When UI implementation exists, also run:

```bash
pnpm --filter @nextop-apps/github-trending dev
```

Then verify the main app screen in a browser.
