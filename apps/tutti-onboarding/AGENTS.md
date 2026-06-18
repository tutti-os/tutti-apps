# AGENTS.md

## App Overview

`apps/tutti-onboarding` mirrors the Tutti built-in Getting Started onboarding
app UI and optimizes its packaged media assets.

Product scope:

- keep the UI, copy, and interactions aligned with
  `services/tuttid/builtin-apps/onboarding`
- serve compressed onboarding screenshots and video as inspectable media
- preserve the host bridge behavior for agent binding, app center, task panel,
  and agent chat actions

## Validation

```bash
pnpm --filter @tutti-apps/tutti-onboarding typecheck
pnpm --filter @tutti-apps/tutti-onboarding test
pnpm --filter @tutti-apps/tutti-onboarding build
pnpm package:tutti --app tutti-onboarding
```

## Runtime Notes

This app is a static Vite app. The package runtime uses
`tutti-package/server.mjs` to serve built assets and `/healthz`.

Keep user-facing copy in `public/app.js` unless the source built-in onboarding
app changes.
