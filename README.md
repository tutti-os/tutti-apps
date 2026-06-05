# nextop-apps

Monorepo for Nextop workspace apps and standalone product experiments.

This repository follows the same broad workspace shape as `ai-media-canvas`:

- `apps/*`: independently runnable applications.
- `packages/*`: shared libraries, config, contracts, and utilities.
- `docs/*`: durable architecture notes and agent-facing conventions.
- root scripts delegate to Turbo so each app/package owns its own build, test,
  and typecheck commands.

## Apps

| App | Path | Status | Notes |
| --- | --- | --- | --- |
| GitHub Trending Reader | `apps/github-trending` | Planning | Category-first GitHub Trending reader with README preview and README-only detail panel. |

## Documentation

- Repository architecture: `docs/architecture/README.md`
- Project structure: `docs/architecture/project-structure.md`
- Build system: `docs/architecture/build-system.md`
- Nextop app packaging: `docs/architecture/nextop-packaging.md`
- Agent workflow conventions: `docs/conventions/agent-workflow.md`
- Root agent guide: `AGENTS.md`
- GitHub Trending plan: `apps/github-trending/docs/technical-plan.md`

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm package:nextop --app github-trending
pnpm test
pnpm typecheck
pnpm lint
```

Run a single app by filtering:

```bash
pnpm --filter @nextop-apps/github-trending dev
pnpm --filter @nextop-apps/github-trending typecheck
pnpm --filter @nextop-apps/github-trending test
```

## Monorepo Conventions

- New runnable apps go under `apps/<app-id>`.
- Shared runtime code goes under `packages/<package-id>`.
- App package names use `@nextop-apps/<app-id>`.
- Shared package names use `@nextop-apps/<package-id>`.
- Apps may depend on packages with `workspace:*`.
- Cross-app imports are not allowed; move shared code into `packages/*`.
- Each app should keep its product/technical docs under `apps/<app-id>/docs`.
- Each publishable app keeps Nextop package source files under
  `apps/<app-id>/nextop`.
- Root `nextop.publish.json` configures which apps can be published and which
  app each environment publishes by default.
- Repository-wide architecture and conventions belong in `docs/*`.
- Root scripts should remain generic and call `turbo run <task>`.

## Framework Guidance

Use Turbo at the repository root for monorepo orchestration. Use the app's own
framework build tool inside each app package.

- Dashboard/tool apps: prefer TanStack Start.
- Content-heavy SEO sites: consider Next.js.
- Static prototypes: Vite SPA is acceptable when no server runtime is needed.

The GitHub Trending Reader is planned as a TanStack Start app because it is a
data-heavy dashboard with server functions, API routes, and strong TanStack
Query/Router fit.

## Validation Bar

Before publishing meaningful changes, run:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

For UI-heavy apps, also run the local dev server and verify the main screen in a
browser.
