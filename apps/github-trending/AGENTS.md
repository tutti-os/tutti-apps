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
- Design guidance: `docs/design.md`
- Docs index: `docs/README.md`
- Nextop package source: `nextop-package/`
- Repository build-system context: `../../docs/architecture/build-system.md`
- Repository package workflow: `../../docs/architecture/nextop-packaging.md`

## Framework Direction

The current app is implemented with TanStack Start, Tailwind CSS, and shadcn/ui.

When available, use the installed DeckardGer TanStack agent skills:

- `tanstack-start-best-practices` for TanStack Start scaffolding, server
  functions, middleware, SSR, Vite config, and deployment decisions.
- `tanstack-router-best-practices` for file routes, loaders, search params,
  navigation, and route-level type safety.
- `tanstack-query-best-practices` for query keys, caching, mutations,
  invalidation, and client/server data state.
- `tanstack-integration-best-practices` for Query + Router + Start data flow,
  loader prefetching, SSR hydration, and cache ownership.

Use:

- TanStack Router/Start for routes, loaders, server functions, and server routes.
- TanStack Query for client data state and request deduplication.
- Tailwind CSS and shadcn/ui for UI.
- Sanitized markdown rendering for README content.

Before implementing UI components, read `docs/design.md`. It defines the
semantic Tailwind/shadcn tokens, required component states, accessibility
acceptance criteria, and prohibited styling patterns for this app.

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

The app's Nextop package source lives in `nextop-package/`.

- `nextop-package/nextop.app.json`: source manifest.
- `nextop-package/bootstrap.sh`: runtime entrypoint copied into the package.
- `nextop-package/server.mjs`: package-local Nextop wrapper that serves
  `dist/` assets and delegates app requests to the TanStack Start server build.
- `nextop-package/AGENTS.md`: runtime package guide.
- `nextop-package/icon.svg`: App Center icon.

Do not add a package-local app server under `nextop-package/server`. The real
application routes, API routes, and Server Functions live at the app root.

- app source and Vite/TanStack Start config stay at `apps/github-trending`.
- `pnpm package:nextop --app github-trending` should copy the build output into
  `build/nextop-app/github-trending/package/server` and
  `build/nextop-app/github-trending/package/dist`.
- `nextop-package/bootstrap.sh` executes
  `$NEXTOP_APP_PACKAGE_DIR/server.mjs`.
- SQLite durable data belongs in `NEXTOP_APP_DATA_DIR/trendreader.sqlite`.

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
