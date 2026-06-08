# AGENTS.md

## App Overview

`apps/daily-tech-radar` owns the Daily Tech Radar card app.

Product scope:

- reproduce `/Users/wwcome/work/demo/.codex-artifacts/tech-radar-card-prototype/index.html`
- Product Hunt and GitHub cards from `@nextop-os/daily-tech-radar`
- source/date/category/search/view filters
- prototype-style card grid, compact list, detail drawer, and favorites

## Validation

```bash
pnpm --filter @nextop-apps/daily-tech-radar i18n:check
pnpm --filter @nextop-apps/daily-tech-radar typecheck
pnpm --filter @nextop-apps/daily-tech-radar test
pnpm package:nextop --app daily-tech-radar
```

## i18n Rules

- Locale must come from URL search/router state only; components must not guess
  language from browser or local state.
- Radar data requests and UI i18n must use the same locale.
- `src/i18n/locales/*/radar.json` is the only source for Daily Tech Radar UI
  copy.
- Category display labels must use i18n, while filter values keep the original
  taxonomy label.
- When adding visible copy, first add a failing test or i18n harness case, then
  implement the translation.
