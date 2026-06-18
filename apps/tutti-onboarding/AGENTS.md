# AGENTS.md

## App Overview

`apps/tutti-onboarding` mirrors the Tutti built-in Getting Started onboarding
app UI and optimizes its packaged media assets.

Product scope:

- keep the UI, copy, and interactions aligned with
  `services/tuttid/builtin-apps/onboarding`
- keep the React component tree visually and behaviorally 1:1 with that
  built-in onboarding app
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

The UI entrypoint is React:

- `src/App.jsx` owns the page structure and interactions.
- `src/i18n/app-context.js` reads locale from `window.tuttiExternal.app`.
- `src/i18n/locales/en-US/onboarding.json` and
  `src/i18n/locales/zh-CN/onboarding.json` own all user-facing copy.

When adding or renaming a copy key, update both locale JSON files and run
`pnpm --filter @tutti-apps/tutti-onboarding test`. Query params `?locale=` and
`?lang=` are supported only for local web debugging.
