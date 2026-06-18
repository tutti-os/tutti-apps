# AGENTS.md

## App Overview

`apps/tutti-onboarding` owns the Tutti Onboarding guide app.

Product scope:

- introduce the Tutti workspace app and agent collaboration workflow
- show the provided onboarding screenshots and video as inspectable media
- explain installing/binding Codex or Claude Code agents
- expose a read-only `onboarding status` CLI command for Tutti discovery

## Validation

```bash
pnpm --filter @tutti-apps/tutti-onboarding typecheck
pnpm --filter @tutti-apps/tutti-onboarding test
pnpm --filter @tutti-apps/tutti-onboarding build
pnpm package:tutti --app tutti-onboarding
```

## Runtime Notes

This app is a static Vite/React app. The package runtime uses
`tutti-package/server.mjs` to serve built assets, `/api/health`, and the
read-only Tutti CLI endpoint.

Keep user-facing copy in the i18n resources inside `src/main.jsx` unless the app
grows enough to justify separate locale files.
