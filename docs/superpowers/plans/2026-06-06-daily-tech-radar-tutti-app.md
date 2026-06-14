# Daily Tech Radar Tutti App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new Tutti app that reproduces the UI and interaction logic from `/Users/wwcome/work/demo/.codex-artifacts/tech-radar-card-prototype/index.html`, backed by `@tutti-os/daily-tech-radar`.

**Architecture:** Use `apps/github-trending` only as a software architecture reference for TanStack Start, TanStack Query, Server Functions, file-based routes, Tailwind/shadcn setup, and Tutti packaging. Do not reuse or imitate `github-trending` product UI, category board behavior, repo-row workflow, command-bar layout, README panel, or app logic.

**Tech Stack:** TanStack Start, TanStack Router, TanStack Query, React 19, Tailwind CSS v4, shadcn/ui, lucide-react, `@tutti-os/daily-tech-radar`.

---

## 1. Product Source Of Truth

The product experience must be copied from:

```txt
/Users/wwcome/work/demo/.codex-artifacts/tech-radar-card-prototype/index.html
```

The prototype defines the UI and behavior:

- Brand: `每日产品雷达`.
- Page structure: top nav, hero, search box, today signal panel, sticky filters, left sidebar, card grid, compact mode, detail drawer.
- Source filter: `全部`, `Product Hunt`, `GitHub`.
- Date controls: latest date plus prior available dates from SDK indexes.
- Category filters: generated from visible cards, same chip/filter behavior as the prototype.
- Search logic: client-side substring match over name, owner, tagline, description, summary, language, keywords, and category.
- View modes: `卡片` grid and `紧凑` list.
- Detail drawer: opens from card click and shows cover, source, title, description, tags, metrics, source link, favorite action.
- Empty state: show a no-match message when filters/search remove all cards; show missing-date message when the selected date has no data.

`apps/github-trending` must not be used for UI or product logic. Specifically do not copy its command bar, category sidebar, category board, repo rows, README-only detail panel, markdown rendering, GitHub refresh flow, SQLite cache flow, or GitHub-specific categorization/ranking behavior.

## 2. Files And Boundaries

Create a new app under:

```txt
apps/daily-tech-radar/
```

Primary files:

- `package.json`: package name `@tutti-apps/daily-tech-radar`; depends on TanStack packages, React, Tailwind/shadcn dependencies, lucide-react, zod, and `@tutti-os/daily-tech-radar`.
- `src/routes/index.tsx`: route search-param validation, loader prefetch, top-level app state wiring.
- `src/features/radar/*`: SDK access, server functions, query options, data normalization, filtering helpers, tests.
- `src/components/*`: prototype-shaped UI components only: app shell, top nav, hero, signal panel, toolbar, sidebar, card grid, radar card, detail drawer.
- `src/styles.css`: tokenized reproduction of the prototype palette, background texture, card shadows, responsive layout, and compact mode.
- `tutti-package/*`: manifest, bootstrap, server wrapper, package AGENTS, icon.

Repository-level updates:

- `tutti.publish.json`: register `daily-tech-radar`; enable it in staging and production `appIds`; keep `github-trending` as default.
- `README.md`: add the new app to the app table.
- `docs/architecture/tutti-packaging.md`: mention the new app only if package behavior or examples need updating.
- `tests/*`: extend package and publish-target tests so both apps are covered.

## 3. Data Contract

Use SDK APIs as the only data source:

```ts
import { DailyTechRadarClient } from "@tutti-os/daily-tech-radar";

const client = new DailyTechRadarClient({
  baseUrl: process.env.DAILY_TECH_RADAR_BASE_URL,
});

await client.productHunt.index("zh-CN");
await client.productHunt.latest("zh-CN");
await client.productHunt.byDate("2026-06-05", "zh-CN");
await client.github.index("zh-CN");
await client.github.latest("zh-CN");
await client.github.byDate("2026-06-05", "zh-CN");
```

Server-side data flow:

```txt
Route loader
  -> queryClient.ensureQueryData
  -> radarBoardQueryOptions
  -> createServerFn getRadarBoard
  -> DailyTechRadarClient
  -> normalize Product Hunt + GitHub payloads into RadarBoard
  -> UI reproduces prototype behavior
```

Define app-local normalized types:

```ts
export type RadarSource = "all" | "producthunt" | "github";
export type RadarViewMode = "grid" | "compact";

export type RadarCard = {
  id: string;
  type: "producthunt" | "github";
  name: string;
  owner?: string;
  title: string;
  tagline?: string;
  description: string;
  summary?: string;
  language?: string;
  keywords: string[];
  categories: string[];
  metrics: {
    votes?: number;
    comments?: number;
    stars?: number;
    forks?: number;
    score?: number;
    starsGained?: number;
  };
  rank: number;
  sourceLabel: string;
  coverUrl?: string | null;
  iconUrl?: string | null;
  sourceUrl: string;
  homepageUrl?: string | null;
};

export type RadarBoard = {
  locale: "zh-CN" | "en-US";
  date: string;
  availableDates: string[];
  generatedAt: string;
  cards: RadarCard[];
  metrics: {
    productHuntCount: number;
    githubCount: number;
    aiPercent: number;
  };
  categories: Array<{ label: string; count: number }>;
};
```

Normalization rules:

- Product Hunt item:
  - `title = item.name`
  - `tagline = item.tagline`
  - `description = item.description`
  - `keywords = item.keywords`
  - `metrics.votes = item.metrics.votes`
  - `metrics.comments = item.metrics.comments`
  - `iconUrl = item.assets.icon`
  - `coverUrl = item.assets.thumbnail || first item.assets.media image`
  - `sourceUrl = item.links.source`
- GitHub repo:
  - `title = owner / name`
  - `description = repo.metadata.description`
  - `summary = repo.readmeSignals.summary`
  - `keywords = repo.readmeSignals.keywords + repo.metadata.topics`
  - `categories = taxonomy category label + secondary labels`
  - `metrics.stars = repo.metadata.stars`
  - `metrics.forks = repo.metadata.forks`
  - `metrics.score = repo.rank.score`
  - `metrics.starsGained = repo.source.starsGained`
  - `coverUrl = repo.visual.thumbUrl || repo.visual.url || GitHub Open Graph fallback`
  - `iconUrl = repo.avatarUrl`
  - `sourceUrl = repo.url`

## 4. UI Implementation Tasks

### Task 1: Scaffold New App

**Files:**

- Create: `apps/daily-tech-radar/package.json`
- Create: `apps/daily-tech-radar/tsconfig.json`
- Create: `apps/daily-tech-radar/vite.config.ts`
- Create: `apps/daily-tech-radar/components.json`
- Create: `apps/daily-tech-radar/src/router.tsx`
- Create: `apps/daily-tech-radar/src/routes/__root.tsx`
- Create: `apps/daily-tech-radar/src/routes/index.tsx`

- [ ] Copy the TanStack Start project shape from `apps/github-trending`, but rename package, scripts, title, paths, and app identity to `daily-tech-radar`.
- [ ] Keep framework defaults: file routes, router context with `QueryClient`, default preload `intent`, scroll restoration.
- [ ] Do not copy GitHub Trending components or feature modules.
- [ ] Verify with `pnpm --filter @tutti-apps/daily-tech-radar typecheck`.

### Task 2: Add SDK-Backed Radar Data Layer

**Files:**

- Create: `apps/daily-tech-radar/src/features/radar/types.ts`
- Create: `apps/daily-tech-radar/src/features/radar/radar.client.server.ts`
- Create: `apps/daily-tech-radar/src/features/radar/radar.normalize.ts`
- Create: `apps/daily-tech-radar/src/features/radar/radar.functions.ts`
- Create: `apps/daily-tech-radar/src/features/radar/radar.queries.ts`
- Create: `apps/daily-tech-radar/src/features/radar/radar.normalize.test.ts`

- [ ] Implement `DailyTechRadarClient` construction server-side, using optional `DAILY_TECH_RADAR_BASE_URL`.
- [ ] Fetch both source indexes, build a merged `availableDates` list, and select latest date by default.
- [ ] Fetch Product Hunt and GitHub payloads for the selected date.
- [ ] Normalize both payloads into the `RadarBoard` contract above.
- [ ] Derive categories from Product Hunt keywords and GitHub taxonomy/views labels.
- [ ] Calculate `aiPercent` from cards whose keyword/category text contains `AI`, `agent`, `llm`, `模型`, or `智能`.
- [ ] Add fixture tests for Product Hunt mapping, GitHub mapping, merged dates, category counts, and AI percent.
- [ ] Verify with `pnpm --filter @tutti-apps/daily-tech-radar test`.

### Task 3: Reproduce Prototype UI And Logic

**Files:**

- Create: `apps/daily-tech-radar/src/components/app-shell.tsx`
- Create: `apps/daily-tech-radar/src/components/top-nav.tsx`
- Create: `apps/daily-tech-radar/src/components/hero-section.tsx`
- Create: `apps/daily-tech-radar/src/components/signal-panel.tsx`
- Create: `apps/daily-tech-radar/src/components/radar-toolbar.tsx`
- Create: `apps/daily-tech-radar/src/components/radar-sidebar.tsx`
- Create: `apps/daily-tech-radar/src/components/radar-card-grid.tsx`
- Create: `apps/daily-tech-radar/src/components/radar-card.tsx`
- Create: `apps/daily-tech-radar/src/components/detail-drawer.tsx`
- Create: `apps/daily-tech-radar/src/features/radar/filtering.ts`
- Create: `apps/daily-tech-radar/src/features/radar/filtering.test.ts`

- [ ] Implement the same state shape as the prototype: `source`, `filter`, `query`, `view`, `date`, selected drawer item, favorites.
- [ ] Store `source`, `filter`, `query`, `view`, and `date` in TanStack Router search params.
- [ ] Keep selected drawer item and favorites local to the client; favorites use `localStorage`.
- [ ] Implement source pills exactly as prototype behavior: all, Product Hunt, GitHub.
- [ ] Implement category filter generation from currently selected source/date cards.
- [ ] Implement search match over the same fields as prototype.
- [ ] Implement `grid` and `compact` layouts matching the prototype, not `github-trending` rows.
- [ ] Implement detail drawer matching the prototype content and metrics.
- [ ] Ensure keyboard access for pills, cards, drawer close button, source links, and favorite button.

### Task 4: Reproduce Prototype Styling With Tailwind Tokens

**Files:**

- Create/modify: `apps/daily-tech-radar/src/styles.css`
- Use existing shadcn/ui primitives where helpful: button, badge, input, tooltip, select/toggle only when they preserve prototype behavior.

- [ ] Port prototype color variables into CSS tokens: ink, muted, soft, paper, panel, line, shadow, blue, green, peach, lilac, accent.
- [ ] Recreate the warm paper background and subtle noise overlay.
- [ ] Recreate card styling: 14px radius, soft borders, hover lift, image cover, badge, title row, tags, stats footer.
- [ ] Recreate drawer styling: right fixed panel, inner card, cover hero, metrics, actions.
- [ ] Recreate responsive behavior:
  - desktop: hero two columns, layout with left sidebar and card area, grid 3 columns.
  - medium: grid 2 columns, sidebar stacks.
  - mobile: single column, wrapped nav/actions, no horizontal scroll.
- [ ] Do not import or copy `github-trending` visual classes such as its command bar, category board, or README panel styling.

### Task 5: Add Tutti Package

**Files:**

- Create: `apps/daily-tech-radar/tutti-package/tutti.app.json`
- Create: `apps/daily-tech-radar/tutti-package/bootstrap.sh`
- Create: `apps/daily-tech-radar/tutti-package/server.mjs`
- Create: `apps/daily-tech-radar/tutti-package/AGENTS.md`
- Create: `apps/daily-tech-radar/tutti-package/README.md`
- Create: `apps/daily-tech-radar/tutti-package/icon.png`

- [ ] Use `appId = "daily-tech-radar"`.
- [ ] Manifest name should be `每日产品雷达`.
- [ ] Runtime kind stays `custom`, bootstrap `bootstrap.sh`, health path `/api/health`.
- [ ] Bootstrap validates `TUTTI_APP_PACKAGE_DIR`, `TUTTI_APP_HOST`, `TUTTI_APP_PORT`, `TUTTI_APP_DATA_DIR`.
- [ ] Server wrapper serves `dist/`, delegates to `server/server.js`, and returns `{ app: "daily-tech-radar", ok: true }` from `/api/health`.
- [ ] Package AGENTS explains that runtime data comes from SDK/CDN and optional `DAILY_TECH_RADAR_BASE_URL`, with no SQLite dependency in v1.

### Task 6: Register Publishing And Tests

**Files:**

- Modify: `tutti.publish.json`
- Modify: `README.md`
- Modify: `tests/package-tutti-app.test.mjs`
- Modify: `tests/resolve-tutti-publish-target.test.mjs`
- Modify: `tests/publish-tutti-app-workflows.test.mjs` only if workflow defaults or app selection semantics change.

- [ ] Register `daily-tech-radar` package paths and package command.
- [ ] Add `daily-tech-radar` to production and staging `appIds`.
- [ ] Keep production and staging `defaultAppId` as `github-trending`.
- [ ] Extend tests to confirm `daily-tech-radar` resolves when explicitly requested.
- [ ] Extend package test to build and validate `daily-tech-radar`.
- [ ] Run `pnpm run test:workspace`.

## 5. Verification Checklist

Run narrow checks first:

```bash
pnpm --filter @tutti-apps/daily-tech-radar typecheck
pnpm --filter @tutti-apps/daily-tech-radar test
pnpm run test:workspace
pnpm package:tutti --app daily-tech-radar
```

Then run UI verification:

```bash
pnpm --filter @tutti-apps/daily-tech-radar dev
```

Browser acceptance criteria:

- First screen visually matches the prototype structure and tone.
- Latest SDK data renders Product Hunt and GitHub cards.
- Source pills, date pills, category filters, search, and view toggle behave like the prototype.
- Card click opens the prototype-style drawer.
- Drawer close works.
- Source links open safely with `target="_blank"` and `rel="noreferrer noopener"`.
- Favorite button toggles and persists in `localStorage`.
- Empty states match prototype logic.
- Desktop card grid uses 3 columns when space allows.
- Mobile 320px has no horizontal scroll or text overlap.
- No `github-trending` README panel, category board, repo-row, or command-bar behavior appears in the app.

## 6. Explicit Defaults

- Default app route locale: `zh-CN`.
- Default selected date: max latest date from Product Hunt and GitHub indexes.
- If one source is missing for a date, show cards from the source that exists.
- If both sources are missing for a date, show the prototype-style missing-data empty state.
- GitHub cover fallback: `https://opengraph.githubassets.com/daily-tech-radar/{owner}/{name}`.
- Product Hunt cover fallback: thumbnail, then first media image, then generated pastel cover.
- No SQLite, no GitHub live scraping, no README fetching, no markdown panel, no AI summary cards in v1.
