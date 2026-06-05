# GitHub Trending TanStack Start Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable `apps/github-trending` TanStack Start app from `github-trending-reader-tech-plan.md`, matching the supplied dark command-center visual direction and keeping the right panel focused on README.

**Architecture:** Implement the app as a TanStack Start dashboard with file routes, typed Server Functions, TanStack Query-backed loaders, SQLite-ready server modules, and feature-oriented UI modules. The first implementation should use deterministic seed data while keeping the service boundaries ready for GitHub Trending ingestion, SQLite snapshots, and README cache.

**Tech Stack:** TanStack Start, TanStack Router, TanStack Query, React 19, Tailwind CSS v4, shadcn-style primitives, lucide-react, react-markdown, remark-gfm, rehype-sanitize, SQLite with Drizzle ORM and better-sqlite3, Turbo, Nextop app package output.

---

## Source Material

- Product/architecture spec: `/Users/wwcome/work/demo/github-trending-reader-tech-plan.md`
- Repo-local copy: `/Users/wwcome/work/demo/nextop-apps/apps/github-trending/docs/technical-plan.md`
- Visual direction: dark `TrendReader` command-center screenshot supplied in the user prompt
- Packaging rules: `/Users/wwcome/work/demo/nextop-apps/docs/architecture/nextop-packaging.md`
- App rules: `/Users/wwcome/work/demo/nextop-apps/apps/github-trending/AGENTS.md`

## Scope Decisions

- Build the app screen first, not a marketing page.
- Use mock/seed data in the first app implementation, but route it through the same feature services that real GitHub/SQLite data will use.
- Keep the right panel README-only. Do not add issues, PRs, discussions, releases, related repos, or AI summary cards.
- Keep `README thumbnail preview` in repo rows as structured visual previews, not generated screenshots.
- Use SQLite design and module boundaries, but do not require a live GitHub token or external crawler for the first UI pass.
- Replace the placeholder Nextop package `server/` and `static/` only after TanStack Start build succeeds and `.output/server/index.mjs` is packaged.
- Use Tailwind utilities directly in TSX for app visuals. Do not add CSS Modules or custom global business classes. Define the fixed visual palette by overriding Tailwind/shadcn semantic color tokens such as `background`, `foreground`, `card`, `border`, `primary`, `muted`, and `accent`; components should consume those tokens with classes like `bg-background`, `text-foreground`, `border-border`, and `text-muted-foreground`.

## File Map

Create:

- `apps/github-trending/vite.config.ts` - TanStack Start + React + Tailwind Vite config.
- `apps/github-trending/src/router.tsx` - TanStack Router factory with QueryClient context.
- `apps/github-trending/src/routes/__root.tsx` - root document, providers, styles, metadata.
- `apps/github-trending/src/routes/index.tsx` - dashboard route with search params and loader.
- `apps/github-trending/src/routes/api.trending.ts` - JSON server route for category board data.
- `apps/github-trending/src/routes/api.repos.$owner.$repo.readme.ts` - JSON server route for README data.
- `apps/github-trending/src/styles.css` - Tailwind v4 entry plus semantic theme token overrides.
- `apps/github-trending/src/components/app-shell.tsx` - three-pane application frame.
- `apps/github-trending/src/components/command-bar.tsx` - search, range, language, refresh/open controls.
- `apps/github-trending/src/components/category-sidebar.tsx` - category, saved collection, pinned topic navigation.
- `apps/github-trending/src/components/category-board.tsx` - scrollable grouped category board.
- `apps/github-trending/src/components/category-section.tsx` - category header plus repo rows.
- `apps/github-trending/src/components/repo-row.tsx` - compact repo row with metadata and README thumbnail.
- `apps/github-trending/src/components/readme-panel.tsx` - README-only detail panel.
- `apps/github-trending/src/components/markdown-renderer.tsx` - sanitized markdown renderer wrapper.
- `apps/github-trending/src/components/ui/badge.tsx` - local shadcn-style badge primitive.
- `apps/github-trending/src/components/ui/button.tsx` - local shadcn-style button primitive.
- `apps/github-trending/src/components/ui/scroll-area.tsx` - local scroll wrapper.
- `apps/github-trending/src/components/ui/separator.tsx` - local separator primitive.
- `apps/github-trending/src/lib/cn.ts` - className merge helper.
- `apps/github-trending/src/lib/format.ts` - number/date display helpers.
- `apps/github-trending/src/features/trending/types.ts` - board, category, repo, README DTOs.
- `apps/github-trending/src/features/trending/mock-data.server.ts` - deterministic seed board matching visual.
- `apps/github-trending/src/features/trending/trending.functions.ts` - `getCategoryBoard` Server Function.
- `apps/github-trending/src/features/trending/trending.queries.ts` - query options and keys.
- `apps/github-trending/src/features/readme/readme.functions.ts` - `getRepoReadme` Server Function.
- `apps/github-trending/src/features/readme/mock-readmes.server.ts` - deterministic markdown for selected repos.
- `apps/github-trending/src/features/readme/readme.queries.ts` - README query options.
- `apps/github-trending/src/db/schema.ts` - Drizzle SQLite table declarations from the spec.
- `apps/github-trending/src/db/client.server.ts` - SQLite path resolution and Drizzle client.
- `apps/github-trending/src/db/migrate.server.ts` - migration/pragmas entrypoint.
- `apps/github-trending/src/vite-env.d.ts` - Vite env types.
- `apps/github-trending/index.html` - Vite/TanStack Start HTML entry if required by current Start version.
- `apps/github-trending/tests/format.test.ts` - helper test coverage.
- `apps/github-trending/tests/trending-data.test.ts` - seed data contract tests.
- `apps/github-trending/tests/package-output.test.ts` - package output expectation tests if useful at app level.

Modify:

- `apps/github-trending/package.json` - replace placeholder scripts, add dependencies/dev dependencies.
- `apps/github-trending/tsconfig.json` - include Start route files, JSX, path alias if needed.
- `scripts/package-nextop-app.mjs` - run app build and copy `.output` for TanStack Start packages.
- `tests/package-nextop-app.test.mjs` - assert `.output/server/index.mjs` packaging instead of `server/server.mjs`.
- `nextop.publish.json` - add app build command if package script needs explicit config.
- `apps/github-trending/nextop-package/bootstrap.sh` - run `.output/server/index.mjs`.
- `apps/github-trending/nextop-package/AGENTS.md` - update layout to `.output`, remove long-term `server/` wording.
- `apps/github-trending/nextop-package/README.md` - mark placeholder folders as removed after app build.
- `docs/architecture/nextop-packaging.md` - keep it aligned if implementation details change.

Delete in Task 6 after the TanStack Start package output is copied:

- `apps/github-trending/nextop-package/server/server.mjs`
- `apps/github-trending/nextop-package/static/index.html`

## Visual Acceptance Criteria

- Overall screen uses a full-height dark command-center interface with top command bar, left sidebar, center category board, right README panel.
- Sidebar includes category counts and green momentum deltas.
- Center board shows category sections, selected repo row with cyan outline, compact metadata columns, and README thumbnail previews.
- Right panel displays only the selected repo context and rendered README content.
- No right-side issue/PR/discussion/release/related-repo panels.
- Mobile or narrow viewport stacks panes cleanly without overlapping text.
- Buttons use lucide icons where available.
- UI uses panes, rows, sections, subtle borders, and restrained glows. Avoid card-heavy marketing composition.

## Task 1: Scaffold TanStack Start Runtime

**Files:**

- Modify: `apps/github-trending/package.json`
- Modify: `apps/github-trending/tsconfig.json`
- Create: `apps/github-trending/vite.config.ts`
- Create: `apps/github-trending/index.html`
- Create: `apps/github-trending/src/vite-env.d.ts`
- Create: `apps/github-trending/src/router.tsx`
- Create: `apps/github-trending/src/routes/__root.tsx`
- Create: `apps/github-trending/src/routes/index.tsx`
- Create: `apps/github-trending/src/styles.css`

- [ ] **Step 1: Update app package scripts and dependencies**

Use the app's package-level scripts for the real framework lifecycle:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "node .output/server/index.mjs",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

Add dependencies if missing:

```bash
pnpm --filter @nextop-apps/github-trending add @tanstack/react-query @tanstack/react-router @tanstack/react-start react react-dom zod lucide-react react-markdown remark-gfm rehype-sanitize clsx tailwind-merge class-variance-authority
pnpm --filter @nextop-apps/github-trending add -D vite @vitejs/plugin-react @tailwindcss/vite tailwindcss typescript @types/node @types/react @types/react-dom vitest
```

Expected: package scripts no longer print "not scaffolded yet".

- [ ] **Step 2: Create Vite config**

Create `apps/github-trending/vite.config.ts`:

```ts
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 3000,
  },
  plugins: [tanstackStart(), react(), tailwindcss()],
})
```

Expected: TanStack Start plugin runs before React plugin.

- [ ] **Step 3: Create Router factory with QueryClient context**

Create `apps/github-trending/src/router.tsx`:

```tsx
import { QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"

import { routeTree } from "./routeTree.gen"

export type RouterContext = {
  queryClient: QueryClient
}

export function createAppRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
      },
    },
  })

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
```

Expected: route loaders can receive `context.queryClient`.

- [ ] **Step 4: Create root route document**

Create `apps/github-trending/src/routes/__root.tsx`:

```tsx
import { QueryClientProvider } from "@tanstack/react-query"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import type { ReactNode } from "react"

import type { RouterContext } from "../router"
import "../styles.css"

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "description",
        content: "Category-first GitHub Trending README Reader",
      },
      { title: "TrendReader" },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

Expected: root document includes Start scripts and query provider.

- [ ] **Step 5: Create temporary index route**

Create `apps/github-trending/src/routes/index.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: IndexRoute,
})

function IndexRoute() {
  return <main className="min-h-screen bg-background text-foreground">TrendReader</main>
}
```

Expected: initial route compiles before UI components exist.

- [ ] **Step 6: Add Tailwind semantic theme tokens**

Create `apps/github-trending/src/styles.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: #061114;
  --color-foreground: #e9f7f4;
  --color-card: #0b1b20;
  --color-card-foreground: #e9f7f4;
  --color-popover: #0b1b20;
  --color-popover-foreground: #e9f7f4;
  --color-primary: #2dd4bf;
  --color-primary-foreground: #031414;
  --color-secondary: #10272d;
  --color-secondary-foreground: #d7ece8;
  --color-muted: #10272d;
  --color-muted-foreground: #8fa8a6;
  --color-accent: #45f08a;
  --color-accent-foreground: #031414;
  --color-destructive: #fb7185;
  --color-destructive-foreground: #fff1f2;
  --color-border: #264247;
  --color-input: #1b343a;
  --color-ring: #2dd4bf;
  --color-chart-1: #45f08a;
  --color-chart-2: #2dd4bf;
  --color-chart-3: #60a5fa;
  --color-chart-4: #facc15;
  --color-chart-5: #fb923c;
}
```

Expected: Tailwind compiles. All visual styling, including dark colors, borders, glows, typography, pane backgrounds, and markdown element styling, is expressed with Tailwind utility classes in TSX using semantic tokens. Do not use arbitrary hex utility classes like `bg-[#061114]` in component code.

- [ ] **Step 7: Verify scaffold**

Run:

```bash
pnpm --filter @nextop-apps/github-trending typecheck
pnpm --filter @nextop-apps/github-trending build
```

Expected: both commands pass and `.output/server/index.mjs` exists after build.

- [ ] **Step 8: Commit**

```bash
git add apps/github-trending
git commit -m "Scaffold GitHub Trending TanStack Start app"
```

## Task 2: Add Domain Types, Seed Data, and Server Functions

**Files:**

- Create: `apps/github-trending/src/features/trending/types.ts`
- Create: `apps/github-trending/src/features/trending/mock-data.server.ts`
- Create: `apps/github-trending/src/features/trending/trending.functions.ts`
- Create: `apps/github-trending/src/features/trending/trending.queries.ts`
- Create: `apps/github-trending/src/features/readme/mock-readmes.server.ts`
- Create: `apps/github-trending/src/features/readme/readme.functions.ts`
- Create: `apps/github-trending/src/features/readme/readme.queries.ts`
- Test: `apps/github-trending/tests/trending-data.test.ts`

- [ ] **Step 1: Define DTOs**

Create `apps/github-trending/src/features/trending/types.ts`:

```ts
export type TrendRange = "daily" | "weekly" | "monthly"

export type ReadmePreview = {
  title: string
  badges: string[]
  headings: string[]
  codePreview: string
}

export type RepoSummary = {
  id: string
  owner: string
  name: string
  fullName: string
  url: string
  description: string
  language: string
  languageColor: string
  topics: string[]
  stars: number
  starsGained: number
  license: string
  categoryConfidence: number
  reasons: string[]
  readmePreview: ReadmePreview
}

export type CategorySummary = {
  id: string
  label: string
  icon: "brain" | "terminal" | "layout" | "database" | "shield" | "box"
  repoCount: number
  momentum: number
  delta: number
  tone: "hot" | "trending" | "steady"
  topRepos: RepoSummary[]
}

export type CategoryBoard = {
  capturedAt: string
  since: TrendRange
  language: string
  cacheStatus: "fresh" | "stale"
  categories: CategorySummary[]
}
```

Expected: DTOs match the product spec and visual layout.

- [ ] **Step 2: Add seed board data**

Create `apps/github-trending/src/features/trending/mock-data.server.ts` with deterministic categories from the screenshot:

```ts
import type { CategoryBoard } from "./types"

export const mockCategoryBoard: CategoryBoard = {
  capturedAt: "2026-06-05T08:45:00Z",
  since: "daily",
  language: "All",
  cacheStatus: "fresh",
  categories: [
    {
      id: "ai-infra",
      label: "AI Infra",
      icon: "brain",
      repoCount: 342,
      momentum: 92,
      delta: 48,
      tone: "hot",
      topRepos: [
        {
          id: "run-llama-llama-stack",
          owner: "run-llama",
          name: "llama-stack",
          fullName: "run-llama / llama-stack",
          url: "https://github.com/run-llama/llama-stack",
          description: "Production-ready stack for building LLM applications.",
          language: "Python",
          languageColor: "#60a5fa",
          topics: ["stack", "llm", "agents"],
          stars: 2100,
          starsGained: 2100,
          license: "MIT",
          categoryConfidence: 0.93,
          reasons: ["topic:llm", "readme:agents", "description:production-ready"],
          readmePreview: {
            title: "Llama Stack",
            badges: ["build", "passing", "v0.1.3"],
            headings: ["Overview", "Key features", "Quick start"],
            codePreview: "pip install llama-stack",
          },
        },
      ],
    },
    {
      id: "devtools",
      label: "DevTools",
      icon: "terminal",
      repoCount: 512,
      momentum: 86,
      delta: 36,
      tone: "trending",
      topRepos: [],
    },
    {
      id: "frontend",
      label: "Frontend",
      icon: "layout",
      repoCount: 387,
      momentum: 74,
      delta: 22,
      tone: "trending",
      topRepos: [],
    },
  ],
}
```

During implementation, fill `DevTools` and `Frontend` with at least three repos each so the center board matches the screenshot density. Use names already shown in the image: `shadcn-ui / shadcn-ui`, `biomejs / biome`, `antfu / oxlint`, `facebook / react`, `tailwindlabs / tailwindcss`.

- [ ] **Step 3: Add server function**

Create `apps/github-trending/src/features/trending/trending.functions.ts`:

```ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { mockCategoryBoard } from "./mock-data.server"

export const boardQuerySchema = z.object({
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  language: z.string().default("All"),
  limit: z.number().min(1).max(10).default(5),
})

export const getCategoryBoard = createServerFn({ method: "GET" })
  .inputValidator(boardQuerySchema)
  .handler(async ({ data }) => {
    return {
      ...mockCategoryBoard,
      since: data.since,
      language: data.language,
      categories: mockCategoryBoard.categories.map((category) => ({
        ...category,
        topRepos: category.topRepos.slice(0, data.limit),
      })),
    }
  })
```

Expected: all client calls go through a typed server function.

- [ ] **Step 4: Add query options**

Create `apps/github-trending/src/features/trending/trending.queries.ts`:

```ts
import { queryOptions } from "@tanstack/react-query"

import { getCategoryBoard } from "./trending.functions"
import type { TrendRange } from "./types"

export const trendingQueryKeys = {
  board: (input: { since: TrendRange; language: string; limit: number }) => [
    "category-board",
    input,
  ],
}

export function categoryBoardQueryOptions(input: {
  since: TrendRange
  language: string
  limit: number
}) {
  return queryOptions({
    queryKey: trendingQueryKeys.board(input),
    queryFn: () => getCategoryBoard({ data: input }),
    staleTime: 60_000,
  })
}
```

Expected: route loader can use `ensureQueryData(categoryBoardQueryOptions(...))`.

- [ ] **Step 5: Add README mock and function**

Create `apps/github-trending/src/features/readme/readme.functions.ts`:

```ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { getMockReadme } from "./mock-readmes.server"

export const readmeQuerySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
})

export const getRepoReadme = createServerFn({ method: "GET" })
  .inputValidator(readmeQuerySchema)
  .handler(async ({ data }) => {
    return getMockReadme(data.owner, data.repo)
  })
```

Create `apps/github-trending/src/features/readme/mock-readmes.server.ts`:

```ts
export type RepoReadme = {
  repo: string
  sha: string
  markdown: string
  headings: Array<{ depth: number; text: string; slug: string }>
  cached: boolean
  fetchedAt: string
}

export function getMockReadme(owner: string, repo: string): RepoReadme {
  const fullName = `${owner}/${repo}`

  return {
    repo: fullName,
    sha: "mock-readme-sha",
    cached: true,
    fetchedAt: "2026-06-05T08:45:00Z",
    headings: [
      { depth: 1, text: "Llama Stack", slug: "llama-stack" },
      { depth: 2, text: "Key features", slug: "key-features" },
      { depth: 2, text: "Quick start", slug: "quick-start" },
    ],
    markdown: `# Llama Stack

Production-ready stack for building, deploying, and scaling LLM applications.

## Key features

- Composable building blocks for LLM applications
- Scalable inference with vLLM and Ray
- Auth, observability, caching, and rate limiting built in

## Quick start

\`\`\`bash
pip install llama-stack
\`\`\`

\`\`\`python
from llamastack import LlamaStack

app = LlamaStack()
app.run()
\`\`\`
`,
  }
}
```

- [ ] **Step 6: Add seed data tests**

Create `apps/github-trending/tests/trending-data.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { mockCategoryBoard } from "../src/features/trending/mock-data.server"

describe("mockCategoryBoard", () => {
  it("keeps README-only product categories available", () => {
    expect(mockCategoryBoard.categories.map((category) => category.id)).toContain("ai-infra")
    expect(mockCategoryBoard.categories[0]?.topRepos[0]?.readmePreview.title).toBe("Llama Stack")
  })
})
```

- [ ] **Step 7: Verify and commit**

```bash
pnpm --filter @nextop-apps/github-trending test
pnpm --filter @nextop-apps/github-trending typecheck
git add apps/github-trending
git commit -m "Add GitHub Trending seed data services"
```

## Task 3: Implement Command-Center UI

**Files:**

- Create: all component files listed in File Map.
- Modify: `apps/github-trending/src/routes/index.tsx`
- Modify: `apps/github-trending/src/styles.css`
- Test: `apps/github-trending/tests/format.test.ts`

- [ ] **Step 1: Add utility helpers**

Create `apps/github-trending/src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Create `apps/github-trending/src/lib/format.ts`:

```ts
export function formatCompactNumber(value: number) {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`
  }
  return String(value)
}

export function formatDelta(value: number) {
  return `↑ ${value}`
}

export function formatStarsGained(value: number) {
  return `+${formatCompactNumber(value)}`
}
```

- [ ] **Step 2: Add helper tests**

Create `apps/github-trending/tests/format.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  formatCompactNumber,
  formatDelta,
  formatStarsGained,
} from "../src/lib/format"

describe("format helpers", () => {
  it("formats compact numbers and deltas for the dense UI", () => {
    expect(formatCompactNumber(2100)).toBe("2.1k")
    expect(formatStarsGained(1500)).toBe("+1.5k")
    expect(formatDelta(48)).toBe("↑ 48")
  })
})
```

- [ ] **Step 3: Add local UI primitives**

Create `button`, `badge`, `separator`, and `scroll-area` components with `cn()` and small variant props. Keep them local under `src/components/ui` so shadcn style is available without depending on generated registry files. These primitives should use Tailwind utility classes directly and must not rely on CSS Modules or global business classes.

The `Button` primitive should support this minimum shape:

```tsx
import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "../../lib/cn"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "icon"
  children: ReactNode
}

export function Button({
  className,
  variant = "default",
  size = "sm",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border text-sm transition",
        variant === "default" && "border-primary/40 bg-primary/15 text-primary hover:bg-primary/20",
        variant === "ghost" && "border-transparent bg-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        variant === "outline" && "border-border bg-card/70 text-foreground hover:border-primary/50 hover:bg-secondary",
        size === "sm" && "h-9 px-3",
        size === "icon" && "h-9 w-9 px-0",
        className,
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 4: Build layout components**

Implement components with these responsibilities:

- `AppShell`: grid container with top command bar and three columns.
- `CommandBar`: search input, Today/Week/Month segmented buttons, language select, refresh, GitHub link, cache status, settings icon.
- `CategorySidebar`: categories, saved collections, pinned topics, compact tip panel.
- `CategoryBoard`: scrollable category sections.
- `CategorySection`: heading, repo count, momentum sparkline, repo rows.
- `RepoRow`: selected state, metadata, language dot, topics, compact README thumbnail.
- `ReadmePanel`: selected repo header, README markdown only, no issue/PR/release tabs.
- `MarkdownRenderer`: `react-markdown` + `remark-gfm` + `rehype-sanitize`, styled through the `components` prop with Tailwind utilities instead of `.markdown-body` CSS.

Expected: component tree is visually close to the screenshot but not a pixel copy.

- [ ] **Step 5: Wire route loader and selection state**

Update `apps/github-trending/src/routes/index.tsx`:

```tsx
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { AppShell } from "../components/app-shell"
import { categoryBoardQueryOptions } from "../features/trending/trending.queries"

const searchSchema = z.object({
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  language: z.string().default("All"),
  repo: z.string().optional(),
})

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      categoryBoardQueryOptions({
        since: deps.since,
        language: deps.language,
        limit: 5,
      }),
    )
  },
  component: IndexRoute,
})

function IndexRoute() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(
    categoryBoardQueryOptions({
      since: search.since,
      language: search.language,
      limit: 5,
    }),
  )

  return <AppShell board={data} selectedRepoId={search.repo} />
}
```

Expected: page loads with route search params and no client-only data waterfall.

- [ ] **Step 6: Verify in browser**

Run:

```bash
pnpm --filter @nextop-apps/github-trending dev
```

Open `http://127.0.0.1:3000`.

Check:

- no blank screen
- three panes visible on desktop
- no text overlap
- README panel is README-only
- selected row has cyan outline

- [ ] **Step 7: Verify and commit**

```bash
pnpm --filter @nextop-apps/github-trending test
pnpm --filter @nextop-apps/github-trending typecheck
pnpm --filter @nextop-apps/github-trending build
git add apps/github-trending
git commit -m "Build GitHub Trending command center UI"
```

## Task 4: Add API Routes and README Rendering

**Files:**

- Create: `apps/github-trending/src/routes/api.trending.ts`
- Create: `apps/github-trending/src/routes/api.repos.$owner.$repo.readme.ts`
- Modify: `apps/github-trending/src/components/readme-panel.tsx`
- Modify: `apps/github-trending/src/components/markdown-renderer.tsx`

- [ ] **Step 1: Add trending API route**

Create `apps/github-trending/src/routes/api.trending.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router"

import { getCategoryBoard } from "../features/trending/trending.functions"

export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const since = url.searchParams.get("since") || "daily"
        const language = url.searchParams.get("language") || "All"
        const board = await getCategoryBoard({
          data: { since, language, limit: 5 },
        })

        return Response.json(board)
      },
    },
  },
})
```

- [ ] **Step 2: Add README API route**

Create `apps/github-trending/src/routes/api.repos.$owner.$repo.readme.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router"

import { getRepoReadme } from "../features/readme/readme.functions"

export const Route = createFileRoute("/api/repos/$owner/$repo/readme")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const readme = await getRepoReadme({
          data: { owner: params.owner, repo: params.repo },
        })

        return Response.json(readme)
      },
    },
  },
})
```

Expected: API is available for debugging and future external callers.

- [ ] **Step 3: Render README markdown safely**

In `MarkdownRenderer`, use:

```tsx
import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"

type MarkdownRendererProps = {
  markdown: string
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  return (
    <div className="space-y-5 text-sm leading-7 text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-semibold tracking-normal text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="pt-3 text-xl font-semibold tracking-normal text-foreground">
              {children}
            </h2>
          ),
          p: ({ children }) => <p className="text-foreground/85">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-5 text-foreground/85">{children}</ul>
          ),
          code: ({ children }) => (
            <code className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-primary">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md border border-border bg-card p-4">
              {children}
            </pre>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
```

Expected: README content is rendered without injecting untrusted HTML and without global markdown CSS.

- [ ] **Step 4: Verify API routes**

Run app and check:

```bash
curl -fsSL "http://127.0.0.1:3000/api/trending?since=daily&language=All"
curl -fsSL "http://127.0.0.1:3000/api/repos/run-llama/llama-stack/readme"
```

Expected: both return JSON.

- [ ] **Step 5: Commit**

```bash
git add apps/github-trending
git commit -m "Add GitHub Trending API routes"
```

## Task 5: Add SQLite-Ready DB Module

**Files:**

- Modify: `apps/github-trending/package.json`
- Create: `apps/github-trending/src/db/schema.ts`
- Create: `apps/github-trending/src/db/client.server.ts`
- Create: `apps/github-trending/src/db/migrate.server.ts`
- Create: `apps/github-trending/tests/db-schema.test.ts`

- [ ] **Step 1: Add DB dependencies**

```bash
pnpm --filter @nextop-apps/github-trending add drizzle-orm better-sqlite3
pnpm --filter @nextop-apps/github-trending add -D drizzle-kit @types/better-sqlite3
```

- [ ] **Step 2: Create SQLite schema**

Create `apps/github-trending/src/db/schema.ts` with Drizzle SQLite tables matching the plan:

```ts
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const repos = sqliteTable("repos", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull().unique(),
  url: text("url").notNull(),
  description: text("description"),
  language: text("language"),
  topicsJson: text("topics_json"),
  stars: integer("stars").notNull().default(0),
  forks: integer("forks").notNull().default(0),
  license: text("license"),
  homepageUrl: text("homepage_url"),
  pushedAt: text("pushed_at"),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  fetchedAt: text("fetched_at").notNull(),
})

export const trendSnapshots = sqliteTable("trend_snapshots", {
  id: text("id").primaryKey(),
  repoId: text("repo_id").notNull(),
  since: text("since").notNull(),
  language: text("language"),
  rankRaw: integer("rank_raw").notNull(),
  starsGained: integer("stars_gained").notNull().default(0),
  capturedAt: text("captured_at").notNull(),
})
```

Continue the file with `readmeCache`, `readmePreviewCache`, `categoryScores`, and `categorySnapshots` using the table names and columns from section 6 of the technical plan.

- [ ] **Step 3: Create DB client**

Create `apps/github-trending/src/db/client.server.ts`:

```ts
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { mkdirSync } from "node:fs"
import path from "node:path"

import * as schema from "./schema"

export function resolveSqlitePath() {
  const dataDir =
    process.env.NEXTOP_APP_DATA_DIR || path.resolve(process.cwd(), "data")
  mkdirSync(dataDir, { recursive: true })
  return path.join(dataDir, "trendreader.sqlite")
}

export function createDb(sqlitePath = resolveSqlitePath()) {
  const sqlite = new Database(sqlitePath)
  sqlite.pragma("journal_mode = WAL")
  sqlite.pragma("busy_timeout = 5000")
  return drizzle(sqlite, { schema })
}
```

Expected: SQLite path respects `NEXTOP_APP_DATA_DIR`.

- [ ] **Step 4: Add schema test**

Create `apps/github-trending/tests/db-schema.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { resolveSqlitePath } from "../src/db/client.server"

describe("SQLite runtime path", () => {
  it("uses NEXTOP_APP_DATA_DIR when provided", () => {
    const previous = process.env.NEXTOP_APP_DATA_DIR
    process.env.NEXTOP_APP_DATA_DIR = "/tmp/trendreader-test"

    expect(resolveSqlitePath()).toBe("/tmp/trendreader-test/trendreader.sqlite")

    if (previous === undefined) {
      delete process.env.NEXTOP_APP_DATA_DIR
    } else {
      process.env.NEXTOP_APP_DATA_DIR = previous
    }
  })
})
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm --filter @nextop-apps/github-trending test
pnpm --filter @nextop-apps/github-trending typecheck
git add apps/github-trending
git commit -m "Add SQLite storage foundation"
```

## Task 6: Migrate Nextop Package to TanStack Start Output

**Files:**

- Modify: `scripts/package-nextop-app.mjs`
- Modify: `tests/package-nextop-app.test.mjs`
- Modify: `nextop.publish.json`
- Modify: `apps/github-trending/nextop-package/bootstrap.sh`
- Modify: `apps/github-trending/nextop-package/AGENTS.md`
- Modify: `apps/github-trending/nextop-package/README.md`
- Delete: `apps/github-trending/nextop-package/server/server.mjs`
- Delete: `apps/github-trending/nextop-package/static/index.html`

- [ ] **Step 1: Add build command to publish config**

Update `nextop.publish.json` app config:

```json
{
  "buildCommand": "pnpm --filter @nextop-apps/github-trending build",
  "packageSourceDir": "apps/github-trending/nextop-package"
}
```

- [ ] **Step 2: Run app build from package script**

In `scripts/package-nextop-app.mjs`, before copying package files, run `appConfig.buildCommand` when present. Split it safely:

```js
async function runShell(command) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd: rootDir,
      stdio: "inherit",
      shell: true,
    })
    child.on("error", reject)
    child.on("exit", (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} exited with code ${code}`))
    })
  })
}
```

Call:

```js
if (app.buildCommand) {
  await runShell(app.buildCommand)
}
```

- [ ] **Step 3: Copy `.output` into package root**

Add to `writePackageFiles`:

```js
await copyIfExists(
  path.join(rootDir, appConfig.sourceDir, ".output"),
  path.join(packageRoot, ".output"),
)
```

Keep `static` and `server` copying only as fallback if `.output` does not exist:

```js
const copiedOutput = await copyIfExists(
  path.join(rootDir, appConfig.sourceDir, ".output"),
  path.join(packageRoot, ".output"),
)

if (!copiedOutput) {
  await copyIfExists(path.join(packageSourceDir, "server"), path.join(packageRoot, "server"))
  await copyIfExists(path.join(packageSourceDir, "static"), path.join(packageRoot, "dist"))
}
```

- [ ] **Step 4: Update bootstrap**

Change `apps/github-trending/nextop-package/bootstrap.sh`:

```sh
#!/bin/sh
set -eu

: "${NEXTOP_APP_PACKAGE_DIR:?}"
: "${NEXTOP_APP_HOST:?}"
: "${NEXTOP_APP_PORT:?}"
: "${NEXTOP_APP_DATA_DIR:?}"

export HOST="$NEXTOP_APP_HOST"
export PORT="$NEXTOP_APP_PORT"
export GITHUB_TRENDING_DATA_DIR="$NEXTOP_APP_DATA_DIR"

exec node "$NEXTOP_APP_PACKAGE_DIR/.output/server/index.mjs"
```

- [ ] **Step 5: Delete placeholder files**

```bash
rm -rf apps/github-trending/nextop-package/server
rm -rf apps/github-trending/nextop-package/static
```

- [ ] **Step 6: Update tests**

In `tests/package-nextop-app.test.mjs`, replace:

```ts
assert.match(
  bootstrap,
  /exec node "\$NEXTOP_APP_PACKAGE_DIR\/server\/server\.mjs"/,
)
assert.match(index, /TanStack Start/)
```

with:

```ts
assert.match(
  bootstrap,
  /exec node "\$NEXTOP_APP_PACKAGE_DIR\/\.output\/server\/index\.mjs"/,
)
await readFile(path.join(packageRoot, ".output", "server", "index.mjs"), "utf8")
```

- [ ] **Step 7: Verify package output**

```bash
pnpm package:nextop --app github-trending
test -f build/nextop-app/github-trending/package/.output/server/index.mjs
```

Expected: package zip includes `.output/server/index.mjs`.

- [ ] **Step 8: Commit**

```bash
git add scripts/package-nextop-app.mjs tests/package-nextop-app.test.mjs nextop.publish.json apps/github-trending
git commit -m "Package GitHub Trending TanStack Start output"
```

## Task 7: Full Visual and Runtime Verification

**Files:**

- No source changes unless verification reveals a bug.
- Save screenshots under `outputs/` only if needed for review; do not commit generated screenshots unless requested.

- [ ] **Step 1: Run core checks**

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm --filter @nextop-apps/github-trending build
pnpm package:nextop --app github-trending
```

Expected: all commands pass.

- [ ] **Step 2: Run local dev server**

```bash
pnpm --filter @nextop-apps/github-trending dev
```

Expected: server prints local URL, usually `http://127.0.0.1:3000`.

- [ ] **Step 3: Browser verification**

Use Browser/Chrome tooling to inspect desktop and mobile:

```txt
Desktop viewport: 1536x1024
Mobile viewport: 390x844
```

Check:

- top command bar does not overflow
- left category sidebar is usable
- center category board scrolls
- selected repo row has visible focus/selected style
- right panel shows rendered README only
- no layout overlap at desktop or mobile widths
- no blank screen or hydration error

- [ ] **Step 4: Nextop package smoke test**

Run package script and start packaged bootstrap with temporary env:

```bash
NEXTOP_APP_PACKAGE_DIR="$PWD/build/nextop-app/github-trending/package" \
NEXTOP_APP_HOST=127.0.0.1 \
NEXTOP_APP_PORT=4567 \
NEXTOP_APP_DATA_DIR="$(mktemp -d)" \
build/nextop-app/github-trending/package/bootstrap.sh
```

In another shell:

```bash
curl -fsSL http://127.0.0.1:4567/api/health
```

Expected: health route returns success or the app root loads successfully. If TanStack Start does not expose `/api/health`, add a server route for `/api/health` before completing this task.

- [ ] **Step 5: Commit fixes from verification**

Only if verification required changes:

```bash
git add apps/github-trending scripts tests docs nextop.publish.json
git commit -m "Verify GitHub Trending app runtime"
```

## Task 8: Subagent Review Gate

**Files:**

- Review only unless subagent findings require fixes.

- [ ] **Step 1: Dispatch spec compliance review subagent**

Prompt the review subagent with:

```txt
Review /Users/wwcome/work/demo/nextop-apps against:
- /Users/wwcome/work/demo/github-trending-reader-tech-plan.md
- /Users/wwcome/work/demo/nextop-apps/docs/superpowers/plans/2026-06-05-github-trending-tanstack-start.md
- the supplied TrendReader dark command-center screenshot

Focus on mismatches:
- right panel must be README-only
- category-first board, not global ranking
- SQLite storage plan and server-only DB boundary
- TanStack Start + Query + Router architecture
- Nextop package should use .output/server/index.mjs after implementation
- UI density and dark command-center visual direction

Return findings ordered by severity with file/line references.
```

Expected: reviewer either approves or lists actionable mismatches.

- [ ] **Step 2: Dispatch code quality review subagent**

Prompt:

```txt
Review code quality for /Users/wwcome/work/demo/nextop-apps after the GitHub Trending TanStack Start implementation.

Prioritize:
- runtime bugs
- route/search param type issues
- server/client boundary leaks
- unsafe markdown rendering
- fragile packaging script behavior
- tests that do not cover changed behavior
- layout overlap risks

Return findings ordered by severity with file/line references.
```

Expected: reviewer either approves or lists actionable code issues.

- [ ] **Step 3: Fix review findings**

For each accepted finding:

```bash
git add <changed-files>
git commit -m "Address GitHub Trending review findings"
```

Run:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm package:nextop --app github-trending
```

Expected: all checks pass after review fixes.

- [ ] **Step 4: Final status**

Report:

- implementation commit SHAs
- tests run
- browser verification result
- package verification result
- subagent spec review result
- subagent code review result
- any remaining risks

## Self-Review Checklist

- [ ] The plan implements the README-only right panel requirement.
- [ ] The plan implements category aggregation before repo ranking.
- [ ] The plan keeps GitHub token and SQLite on the server side.
- [ ] The plan uses TanStack Start Server Functions and Server Routes.
- [ ] The plan uses TanStack Query query options and route loader prefetch.
- [ ] The plan replaces placeholder `nextop-package/server` with `.output` during implementation.
- [ ] The plan includes browser verification for the supplied visual style.
- [ ] The plan includes subagent review after implementation.
- [ ] The plan avoids private GitHub data and user login in MVP.
- [ ] The plan has no `TBD` implementation steps.
