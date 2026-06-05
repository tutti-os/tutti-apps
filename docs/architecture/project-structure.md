# Project Structure

## Workspace Layout

```txt
nextop-apps/
  apps/
    github-trending/
      docs/
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

`apps/github-trending` owns the GitHub Trending Reader.

First-version product boundary:

- category-first GitHub Trending board
- repo row README preview
- README-only right panel
- GitHub API integration and README rendering

If future apps need GitHub API access, promote the GitHub client into a package
such as `packages/github`.
