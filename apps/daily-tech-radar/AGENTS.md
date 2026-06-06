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
pnpm --filter @nextop-apps/daily-tech-radar typecheck
pnpm --filter @nextop-apps/daily-tech-radar test
pnpm package:nextop --app daily-tech-radar
```
