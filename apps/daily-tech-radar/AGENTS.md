# AGENTS.md

## App Overview

`apps/daily-tech-radar` owns the Daily Tech Radar card app.

Product scope:

- reproduce `/Users/wwcome/work/demo/.codex-artifacts/tech-radar-card-prototype/index.html`
- Product Hunt and GitHub cards from `@tutti-os/daily-tech-radar`
- source/date/category/search/view filters
- prototype-style card grid, compact list, detail drawer, and favorites

Daily Tech Radar does not own or launch an Agent runtime. Do not add
`@tutti-os/agent-acp-kit`, raw Agent catalog/composer routes, provider aliases,
or consumer package patches unless the product architecture explicitly changes.
The repository test suite enforces this no-Agent boundary.

## Validation

```bash
pnpm --filter @tutti-apps/daily-tech-radar i18n:check
pnpm --filter @tutti-apps/daily-tech-radar typecheck
pnpm --filter @tutti-apps/daily-tech-radar test
pnpm package:tutti --app daily-tech-radar
```

## i18n Rules

- Locale may come from the app's own URL/router state or language switcher.
  When no app-local locale is set, read
  `window.tuttiExternal?.app?.getContext()` and subscribe through
  `window.tuttiExternal?.app?.subscribe()`, then fall back to English.
  App-local language switching must not mutate host context or the main
  application's global language.
- Radar data requests and UI i18n must use the same locale.
- `src/i18n/locales/*/radar.json` is the only source for Daily Tech Radar UI
  copy.
- Category display labels must use i18n, while filter values keep the original
  taxonomy label.
- When adding visible copy, first add a failing test or i18n harness case, then
  implement the translation.
