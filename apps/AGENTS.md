# AGENTS.md

## Apps Boundary

`apps/*` contains independently runnable applications.

Before editing an app:

1. Read root `AGENTS.md`.
2. Read this file.
3. Read `apps/<app-id>/AGENTS.md`.
4. Read the app's `README.md` and docs.

## Rules

- Apps must not import another app's private `src`.
- App-specific product logic stays in that app.
- Shared contracts or reusable clients belong in `packages/*`.
- App-specific docs stay under `apps/<app-id>/docs`.
- Publishable app package files stay under `apps/<app-id>/nextop-package`.
- Use package-scoped commands while developing an app.

## Commands

```bash
pnpm --filter <app-package-name> dev
pnpm --filter <app-package-name> typecheck
pnpm --filter <app-package-name> test
pnpm --filter <app-package-name> build
```
