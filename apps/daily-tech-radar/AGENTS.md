# AGENTS.md

## App Overview

`apps/daily-tech-radar` owns the Daily Tech Radar card app.

Product scope:

- reproduce `/Users/wwcome/work/demo/.codex-artifacts/tech-radar-card-prototype/index.html`
- Product Hunt and GitHub cards from `@nextop-os/daily-tech-radar`
- source/date/category/search/view filters
- prototype-style card grid, compact list, detail drawer, and favorites

`apps/github-trending` is only an architecture reference for TanStack Start,
Query, Server Functions, and Nextop packaging. Do not copy its command bar,
category board, repo rows, README panel, SQLite cache, or GitHub refresh logic.

## Validation

```bash
pnpm --filter @nextop-apps/daily-tech-radar typecheck
pnpm --filter @nextop-apps/daily-tech-radar test
pnpm package:nextop --app daily-tech-radar
```
