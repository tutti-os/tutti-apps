# Project Structure

## Workspace Layout

```txt
nextop-apps/
  apps/
    daily-tech-radar/
      docs/
      nextop-package/
      src/
      package.json
      tsconfig.json
  packages/
  docs/
    architecture/
    conventions/
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

## Ownership

### Root

The root owns:

- workspace package discovery
- Turbo task orchestration
- shared TypeScript and formatting defaults
- repository-level docs and agent instructions

The root should not own app-specific runtime logic.

### `apps/*`

Apps are independently runnable products.

An app owns:

- route structure and product UI
- app-specific server functions and API routes
- app-specific docs under `apps/<app-id>/docs`
- Nextop package source under `apps/<app-id>/nextop-package` when publishable
- app-specific validation scripts

Apps must not import from another app's private `src`.

### `packages/*`

Packages are for real shared boundaries.

Create a package when:

- more than one app needs the same contract or implementation
- an app-independent API client is useful
- a reusable config or UI primitive is needed across apps

Avoid vague package names such as `shared`, `common`, or `utils`.

## Current App Boundary

`apps/daily-tech-radar` owns Daily Tech Radar.

First-version product boundary:

- Product Hunt and GitHub daily discovery cards
- card grid and detail drawer UI
- Daily Tech Radar SDK integration
- Nextop package source under `apps/daily-tech-radar/nextop-package`

If future apps need shared trend data access, promote the boundary into a
domain package under `packages/*`.
