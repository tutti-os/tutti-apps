# Daily Tech Radar CLI Exposure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose Daily Tech Radar through a small, user-friendly and agent-friendly Tutti CLI surface.

**Architecture:** Keep the CLI centered on the existing app interface, `getRadarBoardData({ date, locale })`, which already powers `GET /api/radar`. Add three CLI commands: `radar board` for the complete board, `radar search` for common filtered discovery, and `radar item` for stable single-card lookup. All commands route to app-owned `POST /tutti/cli/*` handlers and return a consistent JSON envelope.

**Tech Stack:** Tutti app manifest v1, Tutti app CLI manifest v1, TanStack Start server routes, TypeScript, Zod, Vitest, Node package validation tests.

---

## 1. Design Principles

The CLI should serve two audiences:

- Human users want memorable commands that match natural questions such as "show today's radar" and "search agent tools".
- Agents want a small number of stable commands with structured inputs, predictable outputs, and enough data to avoid extra round trips.

Design decisions:

- Prefer fewer commands with strong parameters over many narrowly derived commands.
- Keep `radar board` as the source-of-truth command because it directly maps to the existing `/api/radar` capability.
- Add `radar search` because every caller should not have to reimplement source/category/query filtering.
- Add `radar item` because agents need stable object references after search or board results.
- Do not add `latest`, `dates`, or `categories` commands in v1. Those are already derivable from `radar board`.
- Let `radar board --include-cards false` return metadata only so agents can fetch dates, metrics, and categories without pulling the full card payload.
- Keep the CLI read-only. Favorites, saved searches, notifications, and refresh jobs are out of scope until the app owns durable storage under `TUTTI_APP_DATA_DIR`.

## 2. Reference Contracts

Follow these reference files:

- `/Users/wwcome/work/tutti-os/tutti/services/tuttid/service/workspace/app_factory_reference/references/manifest-contract.md`
- `/Users/wwcome/work/tutti-os/tutti/services/tuttid/service/workspace/app_factory_reference/references/cli-manifest-contract.md`
- `/Users/wwcome/work/tutti-os/tutti/services/tuttid/service/workspace/app_factory_reference/references/runtime-env.md`
- `/Users/wwcome/work/tutti-os/tutti/services/tuttid/service/workspace/app_factory_reference/references/validation-checklist.md`

Contract decisions:

- `apps/daily-tech-radar/tutti-package/tutti.app.json` declares:

```json
"cli": {
  "manifest": "tutti.cli.json"
}
```

- `apps/daily-tech-radar/tutti-package/tutti.cli.json` uses:
  - `schemaVersion`: `tutti.app.cli.v1`
  - `scope`: `radar`
  - `documentation.file`: `COMMANDS.md`
  - command paths that do not repeat `radar`
  - HTTP `POST` handlers under `/tutti/cli/`

All handler responses use the Tutti `CliCommandOutput` shape:

```json
{
  "kind": "json",
  "value": {
    "ok": true,
    "data": {}
  }
}
```

Tutti invokes app CLI handlers with an envelope shaped like:

```json
{
  "schemaVersion": "tutti.app.cli.invoke.v1",
  "commandId": "app.daily-tech-radar.radar.board",
  "appId": "daily-tech-radar",
  "scope": "radar",
  "path": ["board"],
  "workspaceId": "workspace-id",
  "input": {
    "locale": "en-US"
  },
  "outputMode": "json",
  "context": {
    "source": "cli",
    "parentCommandId": null
  }
}
```

Route handlers must parse `body.input`, not the whole request body. For local `curl` debugging only, `readCliInput(request)` may also accept a bare JSON object without the invoke envelope.

Error output uses the same envelope:

```json
{
  "kind": "json",
  "value": {
    "ok": false,
    "error": {
      "code": "invalid-input",
      "message": "source must be all, producthunt, or github"
    }
  }
}
```

## 3. CLI Capability Surface

| CLI command | Handler path | Primary user story | Agent value |
| --- | --- | --- | --- |
| `radar board` | `POST /tutti/cli/board` | "Show me the radar for today or a specific date." | One call returns `date`, `availableDates`, `metrics`, `categories`, and `cards`. |
| `radar search` | `POST /tutti/cli/search` | "Find radar cards matching this query/filter." | Server-side filtering prevents each agent from duplicating UI search logic. |
| `radar item` | `POST /tutti/cli/item` | "Show details for this card id." | Stable lookup for follow-up summarization, linking, reporting, or app-to-app composition. |

### `radar board`

Examples:

```bash
tutti --json radar board
tutti --json radar board --date 2026-06-05 --locale zh-CN
tutti --json radar board --include-cards false
```

Inputs:

- `date`: optional `YYYY-MM-DD`; omitted means latest available date.
- `locale`: optional `en-US` or `zh-CN`; defaults to `en-US`.
- `source`: optional `all`, `producthunt`, or `github`; defaults to `all`.
- `limit`: optional integer; omitted returns all cards, provided values are clamped to `1..50`.
- `include-cards`: optional boolean; defaults to `true`. When `false`, return metadata with an empty `cards` array.

Output `value.data`:

```ts
type RadarBoardCliData = {
  availableDates: string[];
  cards: RadarCard[];
  categories: Array<{ count: number; label: string }>;
  date: string;
  generatedAt: string;
  locale: "en-US" | "zh-CN";
  metrics: {
    aiPercent: number;
    githubCount: number;
    productHuntCount: number;
  };
  query: {
    date?: string;
    includeCards: boolean;
    limit?: number;
    locale: "en-US" | "zh-CN";
    source: "all" | "producthunt" | "github";
  };
};
```

`source`, `limit`, and `include-cards` are convenience filters for humans and agents. `availableDates`, `metrics`, and `categories` always describe the loaded board before card limiting; `cards` reflects `include-cards`, `source`, and `limit`.

### `radar search`

Examples:

```bash
tutti --json radar search --query agent
tutti --json radar search --source github --category 开发工具 --limit 10
tutti --json radar search --date 2026-06-05 --locale zh-CN --query AI
```

Inputs:

- `date`: optional `YYYY-MM-DD`; omitted means latest available date.
- `locale`: optional `en-US` or `zh-CN`; defaults to `en-US`.
- `source`: optional `all`, `producthunt`, or `github`; defaults to `all`.
- `category`: optional category label or `all`; defaults to `all`.
- `query`: optional search text; defaults to an empty string.
- `limit`: optional integer; defaults to `10` and is clamped to `1..50`.

Output `value.data`:

```ts
type RadarSearchCliData = {
  cards: RadarCardSummary[];
  date: string;
  generatedAt: string;
  hasMore: boolean;
  locale: "en-US" | "zh-CN";
  query: {
    category: string;
    date?: string;
    limit: number;
    locale: "en-US" | "zh-CN";
    source: "all" | "producthunt" | "github";
    text: string;
  };
  returnedCount: number;
  totalCount: number;
};
```

Search matches the same fields as the UI helper `filterRadarCards`: name, owner, title, tagline, description, summary, language, source label, keywords, and categories.

### `radar item`

Examples:

```bash
tutti --json radar item --id github:123456
tutti --json radar item --id producthunt:abc --date 2026-06-05 --locale zh-CN
```

Inputs:

- `id`: required card id, such as `github:123456` or `producthunt:abc`.
- `date`: optional `YYYY-MM-DD`; omitted means latest available date.
- `locale`: optional `en-US` or `zh-CN`; defaults to `en-US`.

Output `value.data`:

```ts
type RadarItemCliData = {
  card: RadarCard | null;
  date: string;
  found: boolean;
  generatedAt: string;
  id: string;
  locale: "en-US" | "zh-CN";
};
```

If the card is not found, return `ok: true`, `found: false`, and `card: null`. Reserve `ok: false` for invalid input or runtime failures.

## 4. Files And Boundaries

Modify package metadata:

- `apps/daily-tech-radar/tutti-package/tutti.app.json`: add `cli.manifest`.
- `apps/daily-tech-radar/tutti-package/AGENTS.md`: document CLI scope, handlers, and read-only behavior.

Create package CLI docs:

- `apps/daily-tech-radar/tutti-package/tutti.cli.json`: CLI manifest consumed by Tutti.
- `apps/daily-tech-radar/tutti-package/COMMANDS.md`: human-readable help for command usage and JSON output.

Create CLI feature code:

- `apps/daily-tech-radar/src/features/radar/radar.cli.ts`: input schemas, board/search/item output shaping, and response helpers.
- `apps/daily-tech-radar/src/features/radar/radar.cli.test.ts`: tests for defaults, filtering, item lookup, response envelope, and invalid input errors.

Create route handlers:

- `apps/daily-tech-radar/src/routes/tutti.cli.board.ts`
- `apps/daily-tech-radar/src/routes/tutti.cli.search.ts`
- `apps/daily-tech-radar/src/routes/tutti.cli.item.ts`

Modify packaging:

- `scripts/package-tutti-app.mjs`: copy `cli.manifest` and `documentation.file`, and validate the declared CLI manifest.
- `tests/package-tutti-app.test.mjs`: cover the new CLI manifest copy and contract checks.
- `docs/architecture/tutti-packaging.md`: mention CLI package files as optional package artifacts.

## 5. Implementation Tasks

### Task 1: Add Package CLI Metadata

**Files:**

- Modify: `apps/daily-tech-radar/tutti-package/tutti.app.json`
- Create: `apps/daily-tech-radar/tutti-package/tutti.cli.json`
- Create: `apps/daily-tech-radar/tutti-package/COMMANDS.md`
- Modify: `apps/daily-tech-radar/tutti-package/AGENTS.md`

- [ ] **Step 1: Update the app manifest**

Add the `cli` block beside `runtime` in `apps/daily-tech-radar/tutti-package/tutti.app.json`:

```json
{
  "schemaVersion": "tutti.app.manifest.v1",
  "appId": "daily-tech-radar",
  "version": "0.0.0",
  "name": "Daily Product Radar",
  "description": "Product Hunt and GitHub daily discovery cards.",
  "icon": {
    "type": "asset",
    "src": "icon.png"
  },
  "runtime": {
    "bootstrap": "bootstrap.sh",
    "healthcheckPath": "/api/health"
  },
  "cli": {
    "manifest": "tutti.cli.json"
  },
  "localizationInfo": {
    "defaultLocale": "en-US",
    "additionalLocales": [
      {
        "locale": "zh-CN",
        "file": "locales/zh-CN/manifest.json"
      }
    ]
  },
  "launch": {
    "mode": "workspace-open"
  },
  "author": {
    "name": "Tutti"
  },
  "tags": ["daily-tech-radar", "producthunt", "github", "trends"]
}
```

- [ ] **Step 2: Create `tutti.cli.json`**

Write `apps/daily-tech-radar/tutti-package/tutti.cli.json`:

```json
{
  "schemaVersion": "tutti.app.cli.v1",
  "scope": "radar",
  "description": "Search and inspect Product Hunt and GitHub daily discovery cards.",
  "documentation": {
    "file": "COMMANDS.md"
  },
  "commands": [
    {
      "path": ["board"],
      "summary": "Show a radar board",
      "description": "Return the complete board for the latest or selected date.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "description": "Date in YYYY-MM-DD format. Omit for latest."
          },
          "locale": {
            "type": "string",
            "description": "Locale to load: en-US or zh-CN."
          },
          "source": {
            "type": "string",
            "description": "Source filter for returned cards: all, producthunt, or github."
          },
          "limit": {
            "type": "integer",
            "description": "Optional maximum cards to return, clamped to 1..50."
          },
          "include-cards": {
            "type": "boolean",
            "description": "Whether to include cards in the board response. Defaults to true."
          }
        }
      },
      "output": {
        "defaultMode": "json",
        "json": true
      },
      "handler": {
        "kind": "http",
        "method": "POST",
        "path": "/tutti/cli/board",
        "timeoutMs": 30000
      }
    },
    {
      "path": ["search"],
      "summary": "Search radar cards",
      "description": "Return cards filtered by date, locale, source, category, and query.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "date": {
            "type": "string",
            "description": "Date in YYYY-MM-DD format. Omit for latest."
          },
          "locale": {
            "type": "string",
            "description": "Locale to load: en-US or zh-CN."
          },
          "source": {
            "type": "string",
            "description": "Source filter: all, producthunt, or github."
          },
          "category": {
            "type": "string",
            "description": "Category label, or all."
          },
          "query": {
            "type": "string",
            "description": "Search text matched against card fields."
          },
          "limit": {
            "type": "integer",
            "description": "Maximum cards to return, clamped to 1..50."
          }
        }
      },
      "output": {
        "defaultMode": "json",
        "json": true
      },
      "handler": {
        "kind": "http",
        "method": "POST",
        "path": "/tutti/cli/search",
        "timeoutMs": 30000
      }
    },
    {
      "path": ["item"],
      "summary": "Show one radar card",
      "description": "Return one full normalized radar card by id.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Card id such as producthunt:123 or github:123456."
          },
          "date": {
            "type": "string",
            "description": "Date in YYYY-MM-DD format. Omit for latest."
          },
          "locale": {
            "type": "string",
            "description": "Locale to load: en-US or zh-CN."
          }
        },
        "required": ["id"]
      },
      "output": {
        "defaultMode": "json",
        "json": true
      },
      "handler": {
        "kind": "http",
        "method": "POST",
        "path": "/tutti/cli/item",
        "timeoutMs": 30000
      }
    }
  ]
}
```

- [ ] **Step 3: Add command documentation**

Write `apps/daily-tech-radar/tutti-package/COMMANDS.md`:

````markdown
# Daily Product Radar CLI

The app exposes the `radar` CLI scope for read-only automation over Product Hunt and GitHub discovery cards.

## Commands

```bash
tutti --json radar board
tutti --json radar board --date 2026-06-05 --locale zh-CN
tutti --json radar board --include-cards false
tutti --json radar search --query agent
tutti --json radar search --source github --category 开发工具 --limit 10
tutti --json radar item --id github:123456 --locale en-US
```

## Inputs

- `date`: `YYYY-MM-DD`; omitted means latest available date.
- `locale`: `en-US` or `zh-CN`; defaults to `en-US`.
- `source`: `all`, `producthunt`, or `github`; defaults to `all`.
- `include-cards`: boolean used by `radar board`; defaults to `true`. Set it to `false` for metadata-only responses.
- `category`: category label, or `all`; defaults to `all` for `radar search`.
- `query`: search text matched against name, owner, title, tagline, description, summary, language, source label, keywords, and categories.
- `limit`: maximum cards to return; defaults to `10` for `radar search`, is optional for `radar board`, and is clamped to `1..50`.
- `id`: card id required by `radar item`, such as `github:123456` or `producthunt:abc`.

All commands return JSON in the Tutti `CliCommandOutput` envelope. Success responses use `{"kind":"json","value":{"ok":true,"data":...}}`; invalid input and runtime failures use `{"kind":"json","value":{"ok":false,"error":{"code":"...","message":"..."}}}`.
````

- [ ] **Step 4: Document package-local behavior**

Append this section to `apps/daily-tech-radar/tutti-package/AGENTS.md`:

```markdown
## CLI Surface

The package exposes Tutti CLI scope `radar` through `tutti.cli.json`.

Handlers are read-only HTTP `POST` routes served by the TanStack Start build:

- `/tutti/cli/board`
- `/tutti/cli/search`
- `/tutti/cli/item`

The CLI commands reuse the same SDK-backed board data as `/api/radar`. Do not add CLI writes unless durable storage is first introduced under `TUTTI_APP_DATA_DIR`.
```

- [ ] **Step 5: Verify manifest files parse**

Run:

```bash
node -e 'JSON.parse(require("node:fs").readFileSync("apps/daily-tech-radar/tutti-package/tutti.app.json","utf8")); JSON.parse(require("node:fs").readFileSync("apps/daily-tech-radar/tutti-package/tutti.cli.json","utf8")); console.log("ok")'
```

Expected:

```txt
ok
```

### Task 2: Add CLI Command Logic

**Files:**

- Create: `apps/daily-tech-radar/src/features/radar/radar.cli.ts`
- Create: `apps/daily-tech-radar/src/features/radar/radar.cli.test.ts`

- [ ] **Step 1: Write tests for input parsing and output shaping**

Create `apps/daily-tech-radar/src/features/radar/radar.cli.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  buildBoardData,
  buildItemData,
  buildSearchData,
  parseCliBoardInput,
  parseCliItemInput,
  parseCliSearchInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "./radar.cli";
import type { RadarBoard } from "./types";

const board: RadarBoard = {
  availableDates: ["2026-06-05", "2026-06-04"],
  cards: [
    {
      categories: ["AI", "开发工具"],
      date: "2026-06-05",
      description: "Agent coding toolkit",
      homepageUrl: "https://example.com/home",
      iconUrl: null,
      id: "github:1",
      keywords: ["agent", "typescript"],
      language: "TypeScript",
      media: [],
      metrics: {
        stars: 100,
        starsGained: 10,
      },
      name: "agent-kit",
      owner: "tutti",
      rank: 1,
      sourceLabel: "GitHub · #1 · TypeScript",
      sourceUrl: "https://github.com/tutti/agent-kit",
      summary: "Build coding agents",
      title: "tutti / agent-kit",
      type: "github",
    },
    {
      categories: ["生产力"],
      date: "2026-06-05",
      description: "Daily planning app",
      homepageUrl: null,
      iconUrl: null,
      id: "producthunt:2",
      keywords: ["planning"],
      media: [],
      metrics: {
        votes: 42,
      },
      name: "Plan Day",
      rank: 2,
      sourceLabel: "Product Hunt · #2",
      sourceUrl: "https://www.producthunt.com/posts/plan-day",
      tagline: "Plan faster",
      title: "Plan Day",
      type: "producthunt",
    },
  ],
  categories: [
    { count: 1, label: "AI" },
    { count: 1, label: "开发工具" },
    { count: 1, label: "生产力" },
  ],
  date: "2026-06-05",
  generatedAt: "2026-06-05T00:00:00.000Z",
  locale: "en-US",
  metrics: {
    aiPercent: 50,
    githubCount: 1,
    productHuntCount: 1,
  },
};

describe("radar CLI helpers", () => {
  it("parses defaults and clamps limits", () => {
    expect(
      parseCliBoardInput({
        "include-cards": false,
        limit: 100,
        source: "github",
      }),
    ).toEqual({
      includeCards: false,
      limit: 50,
      locale: "en-US",
      source: "github",
    });
    expect(parseCliSearchInput({ limit: 0 })).toMatchObject({
      category: "all",
      limit: 1,
      locale: "en-US",
      query: "",
      source: "all",
    });
    expect(parseCliItemInput({ id: "github:1" })).toEqual({
      id: "github:1",
      locale: "en-US",
    });
  });

  it("builds board data with optional source and limit filters", () => {
    expect(
      buildBoardData(board, {
        includeCards: true,
        limit: 1,
        locale: "en-US",
        source: "github",
      }),
    ).toMatchObject({
      availableDates: ["2026-06-05", "2026-06-04"],
      cards: [{ id: "github:1" }],
      categories: [
        { count: 1, label: "AI" },
        { count: 1, label: "开发工具" },
        { count: 1, label: "生产力" },
      ],
      metrics: {
        aiPercent: 50,
      },
      query: {
        includeCards: true,
        limit: 1,
        source: "github",
      },
    });
    expect(
      buildBoardData(board, {
        includeCards: false,
        locale: "en-US",
        source: "all",
      }),
    ).toMatchObject({
      availableDates: ["2026-06-05", "2026-06-04"],
      cards: [],
      query: {
        includeCards: false,
        source: "all",
      },
    });
  });

  it("builds a filtered search result", () => {
    expect(
      buildSearchData(board, {
        category: "all",
        limit: 10,
        locale: "en-US",
        query: "agent",
        source: "github",
      }),
    ).toMatchObject({
      cards: [
        {
          id: "github:1",
          title: "tutti / agent-kit",
          type: "github",
        },
      ],
      hasMore: false,
      query: {
        source: "github",
        text: "agent",
      },
      returnedCount: 1,
      totalCount: 1,
    });
  });

  it("builds item data without treating not-found as command failure", () => {
    expect(buildItemData(board, { id: "producthunt:2", locale: "en-US" }))
      .toMatchObject({
        card: {
          id: "producthunt:2",
          title: "Plan Day",
        },
        found: true,
      });
    expect(buildItemData(board, { id: "missing", locale: "en-US" }))
      .toMatchObject({
        card: null,
        found: false,
        id: "missing",
      });
  });

  it("wraps output in a stable success/error envelope", () => {
    expect(toCliSuccess({ count: 1 })).toEqual({
      kind: "json",
      value: {
        data: { count: 1 },
        ok: true,
      },
    });
    expect(toCliError("invalid-input", new Error("bad input"))).toEqual({
      kind: "json",
      value: {
        error: {
          code: "invalid-input",
          message: "bad input",
        },
        ok: false,
      },
    });
  });

  it("reads Tutti invoke envelopes and bare debug inputs", async () => {
    const envelopeRequest = new Request("http://app/tutti/cli/board", {
      body: JSON.stringify({
        schemaVersion: "tutti.app.cli.invoke.v1",
        input: {
          locale: "zh-CN",
          source: "github",
        },
      }),
      method: "POST",
    });
    await expect(readCliInput(envelopeRequest)).resolves.toEqual({
      locale: "zh-CN",
      source: "github",
    });

    const bareRequest = new Request("http://app/tutti/cli/board", {
      body: JSON.stringify({
        locale: "en-US",
      }),
      method: "POST",
    });
    await expect(readCliInput(bareRequest)).resolves.toEqual({
      locale: "en-US",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm --filter @tutti-apps/daily-tech-radar test -- radar.cli.test.ts
```

Expected:

```txt
FAIL  src/features/radar/radar.cli.test.ts
Cannot find module './radar.cli'
```

- [ ] **Step 3: Implement CLI helpers**

Create `apps/daily-tech-radar/src/features/radar/radar.cli.ts`:

```ts
import { z } from "zod";

import { filterRadarCards } from "./filtering";
import type { RadarBoard, RadarCard } from "./types";

type CliCommandOutput = {
  kind: "json";
  value:
    | {
        data: unknown;
        ok: true;
      }
    | {
        error: {
          code: string;
          message: string;
        };
        ok: false;
      };
};

const localeSchema = z.enum(["zh-CN", "en-US"]).default("en-US");
const sourceSchema = z.enum(["all", "producthunt", "github"]).default("all");
const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();
const optionalBoardLimitSchema = z
  .number()
  .int()
  .optional()
  .transform((limit) =>
    typeof limit === "number" ? Math.min(Math.max(limit, 1), 50) : undefined,
  );
const requiredLimitSchema = z
  .number()
  .int()
  .default(10)
  .transform((limit) => Math.min(Math.max(limit, 1), 50));

const cliBoardInputRawSchema = z.object({
  "include-cards": z.boolean().default(true),
  date: optionalDateSchema,
  limit: optionalBoardLimitSchema,
  locale: localeSchema,
  source: sourceSchema,
});

export const cliBoardInputSchema = cliBoardInputRawSchema.transform((input) => ({
  date: input.date,
  includeCards: input["include-cards"],
  limit: input.limit,
  locale: input.locale,
  source: input.source,
}));

export const cliSearchInputSchema = z.object({
  category: z.string().default("all"),
  date: optionalDateSchema,
  limit: requiredLimitSchema,
  locale: localeSchema,
  query: z.string().default(""),
  source: sourceSchema,
});

export const cliItemInputSchema = z.object({
  date: optionalDateSchema,
  id: z.string().min(1),
  locale: localeSchema,
});

export type CliBoardInput = z.infer<typeof cliBoardInputSchema>;
export type CliSearchInput = z.infer<typeof cliSearchInputSchema>;
export type CliItemInput = z.infer<typeof cliItemInputSchema>;

export function parseCliBoardInput(input: unknown) {
  return cliBoardInputSchema.parse(input ?? {});
}

export function parseCliSearchInput(input: unknown) {
  return cliSearchInputSchema.parse(input ?? {});
}

export function parseCliItemInput(input: unknown) {
  return cliItemInputSchema.parse(input ?? {});
}

export async function readCliInput(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (
    isRecord(body) &&
    body.schemaVersion === "tutti.app.cli.invoke.v1" &&
    isRecord(body.input)
  ) {
    return body.input;
  }
  return isRecord(body) ? body : {};
}

export function buildBoardData(board: RadarBoard, input: CliBoardInput) {
  const sourceCards = filterRadarCards(board.cards, {
    category: "all",
    query: "",
    source: input.source,
  });
  const cards = input.includeCards
    ? typeof input.limit === "number"
      ? sourceCards.slice(0, input.limit)
      : sourceCards
    : [];

  return {
    availableDates: board.availableDates,
    cards,
    categories: board.categories,
    date: board.date,
    generatedAt: board.generatedAt,
    locale: board.locale,
    metrics: board.metrics,
    query: {
      ...(input.date ? { date: input.date } : {}),
      includeCards: input.includeCards,
      ...(typeof input.limit === "number" ? { limit: input.limit } : {}),
      locale: input.locale,
      source: input.source,
    },
  };
}

export function buildSearchData(board: RadarBoard, input: CliSearchInput) {
  const matches = filterRadarCards(board.cards, {
    category: input.category,
    query: input.query,
    source: input.source,
  });
  const cards = matches.slice(0, input.limit);

  return {
    cards: cards.map(toCardSummary),
    date: board.date,
    generatedAt: board.generatedAt,
    hasMore: matches.length > cards.length,
    locale: board.locale,
    query: {
      category: input.category,
      ...(input.date ? { date: input.date } : {}),
      limit: input.limit,
      locale: input.locale,
      source: input.source,
      text: input.query,
    },
    returnedCount: cards.length,
    totalCount: matches.length,
  };
}

export function buildItemData(board: RadarBoard, input: CliItemInput) {
  const card = board.cards.find((candidate) => candidate.id === input.id);

  return {
    card: card ?? null,
    date: board.date,
    found: Boolean(card),
    generatedAt: board.generatedAt,
    id: input.id,
    locale: board.locale,
  };
}

export function toCliSuccess(data: unknown): CliCommandOutput {
  return {
    kind: "json",
    value: {
      data,
      ok: true,
    },
  };
}

export function toCliError(code: string, error: unknown): CliCommandOutput {
  return {
    kind: "json",
    value: {
      error: {
        code,
        message: error instanceof Error ? error.message : "Unknown CLI error",
      },
      ok: false,
    },
  };
}

function toCardSummary(card: RadarCard) {
  return {
    categories: card.categories,
    description: card.description,
    homepageUrl: card.homepageUrl ?? null,
    id: card.id,
    language: card.language,
    metrics: card.metrics,
    name: card.name,
    owner: card.owner,
    rank: card.rank,
    sourceLabel: card.sourceLabel,
    sourceUrl: card.sourceUrl,
    title: card.title,
    type: card.type,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
```

- [ ] **Step 4: Run tests to verify helpers pass**

Run:

```bash
pnpm --filter @tutti-apps/daily-tech-radar test -- radar.cli.test.ts
```

Expected:

```txt
PASS  src/features/radar/radar.cli.test.ts
```

### Task 3: Add HTTP Route Handlers

**Files:**

- Create: `apps/daily-tech-radar/src/routes/tutti.cli.board.ts`
- Create: `apps/daily-tech-radar/src/routes/tutti.cli.search.ts`
- Create: `apps/daily-tech-radar/src/routes/tutti.cli.item.ts`

- [ ] **Step 1: Add the board route**

Create `apps/daily-tech-radar/src/routes/tutti.cli.board.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router";

import {
  buildBoardData,
  parseCliBoardInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "@/features/radar/radar.cli";
import { getRadarBoardData } from "@/features/radar/radar.server";

export const Route = createFileRoute("/tutti/cli/board")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input;
        try {
          input = parseCliBoardInput(await readCliInput(request));
        } catch (error) {
          return Response.json(toCliError("invalid-input", error));
        }

        try {
          const board = await getRadarBoardData({
            date: input.date,
            locale: input.locale,
          });
          return Response.json(toCliSuccess(buildBoardData(board, input)));
        } catch (error) {
          return Response.json(toCliError("radar-unavailable", error));
        }
      },
    },
  },
});
```

- [ ] **Step 2: Add the search route**

Create `apps/daily-tech-radar/src/routes/tutti.cli.search.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router";

import {
  buildSearchData,
  parseCliSearchInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "@/features/radar/radar.cli";
import { getRadarBoardData } from "@/features/radar/radar.server";

export const Route = createFileRoute("/tutti/cli/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input;
        try {
          input = parseCliSearchInput(await readCliInput(request));
        } catch (error) {
          return Response.json(toCliError("invalid-input", error));
        }

        try {
          const board = await getRadarBoardData({
            date: input.date,
            locale: input.locale,
          });
          return Response.json(toCliSuccess(buildSearchData(board, input)));
        } catch (error) {
          return Response.json(toCliError("radar-unavailable", error));
        }
      },
    },
  },
});
```

- [ ] **Step 3: Add the item route**

Create `apps/daily-tech-radar/src/routes/tutti.cli.item.ts`:

```ts
import { createFileRoute } from "@tanstack/react-router";

import {
  buildItemData,
  parseCliItemInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "@/features/radar/radar.cli";
import { getRadarBoardData } from "@/features/radar/radar.server";

export const Route = createFileRoute("/tutti/cli/item")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input;
        try {
          input = parseCliItemInput(await readCliInput(request));
        } catch (error) {
          return Response.json(toCliError("invalid-input", error));
        }

        try {
          const board = await getRadarBoardData({
            date: input.date,
            locale: input.locale,
          });
          return Response.json(toCliSuccess(buildItemData(board, input)));
        } catch (error) {
          return Response.json(toCliError("radar-unavailable", error));
        }
      },
    },
  },
});
```

- [ ] **Step 4: Verify route generation and typecheck**

Run:

```bash
pnpm --filter @tutti-apps/daily-tech-radar typecheck
```

Expected:

```txt
No TypeScript errors.
```

### Task 4: Update Packaging Copy And Validation

**Files:**

- Modify: `scripts/package-tutti-app.mjs`
- Modify: `tests/package-tutti-app.test.mjs`

- [ ] **Step 1: Add failing package tests for CLI artifacts**

In `tests/package-tutti-app.test.mjs`, extend `packageTuttiApp creates a valid daily-tech-radar package` with:

```js
  const cliManifest = JSON.parse(
    await readFile(path.join(packageRoot, "tutti.cli.json"), "utf8"),
  );
  const commandDocs = await readFile(
    path.join(packageRoot, "COMMANDS.md"),
    "utf8",
  );

  assert.deepEqual(manifest.cli, {
    manifest: "tutti.cli.json",
  });
  assert.equal(cliManifest.schemaVersion, "tutti.app.cli.v1");
  assert.equal(cliManifest.scope, "radar");
  assert.equal(cliManifest.documentation.file, "COMMANDS.md");
  assert.deepEqual(
    cliManifest.commands.map((command) => command.handler.path),
    ["/tutti/cli/board", "/tutti/cli/search", "/tutti/cli/item"],
  );
  assert.match(commandDocs, /tutti --json radar board/);
  assert.match(commandDocs, /tutti --json radar search/);
```

Add a validation test:

```js
test("validatePackageRoot requires declared CLI manifest and docs", async () => {
  const packageRoot = await makeTempPackageRoot();

  await writeFile(
    path.join(packageRoot, "tutti.app.json"),
    `${JSON.stringify({
      schemaVersion: "tutti.app.manifest.v1",
      appId: "test-app",
      version: "1.2.3",
      runtime: { bootstrap: "bootstrap.sh" },
      cli: { manifest: "tutti.cli.json" },
    })}\n`,
  );
  await writeFile(path.join(packageRoot, "AGENTS.md"), "Package guide\n");
  await writeFile(path.join(packageRoot, "bootstrap.sh"), "#!/bin/sh\n");
  await writeFile(path.join(packageRoot, "server.mjs"), "export {}\n");
  await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);

  await assert.rejects(
    validatePackageRoot(packageRoot),
    /Missing declared CLI manifest: tutti\.cli\.json/,
  );

  await writeFile(
    path.join(packageRoot, "tutti.cli.json"),
    `${JSON.stringify({
      schemaVersion: "tutti.app.cli.v1",
      scope: "test",
      documentation: { file: "COMMANDS.md" },
      commands: [
        {
          path: ["run"],
          summary: "Run test command",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
          output: {
            defaultMode: "json",
            json: true,
          },
          handler: {
            kind: "http",
            method: "POST",
            path: "/tutti/cli/run",
          },
        },
      ],
    })}\n`,
  );

  await assert.rejects(
    validatePackageRoot(packageRoot),
    /Missing CLI documentation file: COMMANDS\.md/,
  );
});
```

- [ ] **Step 2: Run package tests to verify they fail**

Run:

```bash
node --test tests/package-tutti-app.test.mjs
```

Expected:

```txt
not ok
Missing declared CLI manifest: tutti.cli.json
```

or a failure showing `tutti.cli.json` was not copied into the package.

- [ ] **Step 3: Copy CLI manifest and docs during packaging**

In `scripts/package-tutti-app.mjs`, add:

```js
async function copyCliManifest({ manifest, packageSourceDir, packageRoot }) {
  const cliManifestPath = manifest.cli?.manifest;
  if (!cliManifestPath) {
    return;
  }
  validatePackageRelativePath(cliManifestPath, "cli.manifest");

  const sourcePath = path.join(packageSourceDir, cliManifestPath);
  const targetPath = path.join(packageRoot, cliManifestPath);
  await cp(sourcePath, targetPath);

  const cliManifest = await readJson(sourcePath);
  const documentationFile = cliManifest.documentation?.file;
  if (documentationFile) {
    validatePackageRelativePath(documentationFile, "documentation.file");
    await cp(
      path.join(packageSourceDir, documentationFile),
      path.join(packageRoot, documentationFile),
    );
  }
}
```

Call it inside `writePackageFiles` after localization copy:

```js
  await copyManifestLocalizations({ manifest, packageSourceDir, packageRoot });
  await copyCliManifest({ manifest, packageSourceDir, packageRoot });
```

- [ ] **Step 4: Validate declared CLI manifest**

In `validatePackageRoot`, after manifest baseline validation, add:

```js
  if (manifest.cli?.manifest) {
    validatePackageRelativePath(manifest.cli.manifest, "cli.manifest");
    const cliManifestPath = path.join(packageRoot, manifest.cli.manifest);
    let cliManifest;
    try {
      cliManifest = await readJson(cliManifestPath);
    } catch {
      throw new Error(`Missing declared CLI manifest: ${manifest.cli.manifest}`);
    }

    validateCliManifest(cliManifest);

    const documentationFile = cliManifest.documentation?.file;
    if (documentationFile) {
      validatePackageRelativePath(documentationFile, "documentation.file");
      try {
        await access(path.join(packageRoot, documentationFile));
      } catch {
        throw new Error(`Missing CLI documentation file: ${documentationFile}`);
      }
    }
  }
```

Add these helper functions near `validatePackageRoot`:

```js
const CLI_SEGMENT_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function validatePackageRelativePath(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`tutti.cli.json ${label} is required.`);
  }
  if (path.isAbsolute(value) || value.startsWith("\\")) {
    throw new Error(`tutti.cli.json ${label} must be a relative package path.`);
  }
  for (const part of value.split(/[\\/]/)) {
    if (part === "..") {
      throw new Error(
        `tutti.cli.json ${label} must not contain parent path segments.`,
      );
    }
  }
}

function validateCliSegment(value, label) {
  if (typeof value !== "string" || !CLI_SEGMENT_PATTERN.test(value.trim())) {
    throw new Error(
      `tutti.cli.json ${label} must contain lowercase letters, numbers, and hyphen only.`,
    );
  }
}

function validateCliManifest(cliManifest) {
  if (cliManifest.schemaVersion !== "tutti.app.cli.v1") {
    throw new Error(
      "tutti.cli.json must use schemaVersion tutti.app.cli.v1.",
    );
  }
  validateCliSegment(cliManifest.scope, "scope");
  if (!Array.isArray(cliManifest.commands) || cliManifest.commands.length === 0) {
    throw new Error("tutti.cli.json commands must be a non-empty array.");
  }

  const seenPaths = new Set();
  for (const [index, command] of cliManifest.commands.entries()) {
    const label = `commands[${index}]`;
    if (!Array.isArray(command.path) || command.path.length === 0) {
      throw new Error(`tutti.cli.json ${label}.path is required.`);
    }
    if (command.path[0] === cliManifest.scope) {
      throw new Error(
        `tutti.cli.json ${label}.path must not repeat scope.`,
      );
    }
    for (const [segmentIndex, segment] of command.path.entries()) {
      validateCliSegment(segment, `${label}.path[${segmentIndex}]`);
    }
    const pathKey = command.path.join(".");
    if (seenPaths.has(pathKey)) {
      throw new Error(`tutti.cli.json command path ${pathKey} is duplicated.`);
    }
    seenPaths.add(pathKey);
    if (typeof command.summary !== "string" || command.summary.trim() === "") {
      throw new Error(`tutti.cli.json ${label}.summary is required.`);
    }
    validateCliInputSchema(command.inputSchema, `${label}.inputSchema`);
    validateCliOutput(command.output, `${label}.output`);
    validateCliHandler(command.handler, `${label}.handler`);
  }
}

function validateCliInputSchema(schema, label) {
  if (!schema) {
    return;
  }
  if (schema.type !== "object") {
    throw new Error(`tutti.cli.json ${label}.type must be object.`);
  }
  if (!schema.properties || typeof schema.properties !== "object") {
    throw new Error(`tutti.cli.json ${label}.properties is required.`);
  }
  for (const [name, property] of Object.entries(schema.properties)) {
    validateCliSegment(name, `${label}.properties`);
    if (!property || typeof property !== "object") {
      throw new Error(
        `tutti.cli.json ${label}.properties.${name} must be an object.`,
      );
    }
    if (!["string", "boolean", "integer"].includes(property.type)) {
      throw new Error(
        `tutti.cli.json ${label}.properties.${name}.type must be string, boolean, or integer.`,
      );
    }
    for (const key of Object.keys(property)) {
      if (!["type", "description"].includes(key)) {
        throw new Error(
          `tutti.cli.json ${label}.properties.${name} has unsupported key ${key}.`,
        );
      }
    }
  }
  if (Object.hasOwn(schema, "required") && !Array.isArray(schema.required)) {
    throw new Error(`tutti.cli.json ${label}.required must be an array.`);
  }
  for (const required of schema.required ?? []) {
    if (typeof required !== "string") {
      throw new Error(
        `tutti.cli.json ${label}.required entries must be strings.`,
      );
    }
    if (!Object.hasOwn(schema.properties, required)) {
      throw new Error(
        `tutti.cli.json ${label}.required contains unknown property ${required}.`,
      );
    }
  }
  for (const key of Object.keys(schema)) {
    if (!["type", "properties", "required"].includes(key)) {
      throw new Error(`tutti.cli.json ${label} has unsupported key ${key}.`);
    }
  }
}

function validateCliOutput(output, label) {
  if (!output || !["json", "table"].includes(output.defaultMode)) {
    throw new Error(
      `tutti.cli.json ${label}.defaultMode must be json or table.`,
    );
  }
  if (output.defaultMode === "json" && output.json !== true) {
    throw new Error(
      `tutti.cli.json ${label}.json must be true when defaultMode is json.`,
    );
  }
  if (
    output.defaultMode === "table" &&
    (!output.table ||
      !Array.isArray(output.table.columns) ||
      output.table.columns.length === 0)
  ) {
    throw new Error(
      `tutti.cli.json ${label}.table.columns is required when defaultMode is table.`,
    );
  }
  if (output.table?.columns) {
    const seenColumnKeys = new Set();
    for (const [index, column] of output.table.columns.entries()) {
      validateCliSegment(column.key, `${label}.table.columns[${index}].key`);
      if (typeof column.label !== "string" || column.label.trim() === "") {
        throw new Error(
          `tutti.cli.json ${label}.table.columns[${index}].label is required.`,
        );
      }
      if (seenColumnKeys.has(column.key)) {
        throw new Error(
          `tutti.cli.json ${label}.table.columns key ${column.key} is duplicated.`,
        );
      }
      seenColumnKeys.add(column.key);
    }
  }
}

function validateCliHandler(handler, label) {
  if (handler?.kind !== "http") {
    throw new Error(`tutti.cli.json ${label}.kind must be http.`);
  }
  if (handler.method !== "POST") {
    throw new Error(`tutti.cli.json ${label}.method must be POST.`);
  }
  if (
    typeof handler.path !== "string" ||
    !handler.path.startsWith("/tutti/cli/")
  ) {
    throw new Error(
      `tutti.cli.json ${label}.path must start with /tutti/cli/.`,
    );
  }
  if (
    handler.timeoutMs !== undefined &&
    (!Number.isInteger(handler.timeoutMs) ||
      handler.timeoutMs < 1000 ||
      handler.timeoutMs > 300000)
  ) {
    throw new Error(
      `tutti.cli.json ${label}.timeoutMs must be between 1000 and 300000.`,
    );
  }
}
```

- [ ] **Step 5: Run package tests to verify they pass**

Run:

```bash
node --test tests/package-tutti-app.test.mjs
```

Expected:

```txt
ok
```

### Task 5: Update Packaging Documentation

**Files:**

- Modify: `docs/architecture/tutti-packaging.md`

- [ ] **Step 1: Document optional CLI package files**

In the "Optional files" list, add:

````markdown
- `tutti.cli.json` can be included when `tutti.app.json` declares
  `cli.manifest`; each command must route to an app-owned
  `POST /tutti/cli/*` handler.
- `COMMANDS.md` or another package-local documentation file can be referenced
  by `tutti.cli.json` for CLI help output.
````

- [ ] **Step 2: Document the Daily Tech Radar CLI surface**

After the Daily Tech Radar package shape section, add:

````markdown
Daily Tech Radar also exposes the optional `radar` CLI scope:

```txt
tutti.cli.json
COMMANDS.md
```

The command handlers live in the TanStack Start server routes under
`/tutti/cli/*` and are packaged through the same server bundle as the UI.
````

- [ ] **Step 3: Verify docs formatting**

Run:

```bash
pnpm lint
```

Expected:

```txt
No Biome errors.
```

### Task 6: End-To-End Verification

**Files:**

- No new files.

- [ ] **Step 1: Run narrow app checks**

Run:

```bash
pnpm --filter @tutti-apps/daily-tech-radar test
pnpm --filter @tutti-apps/daily-tech-radar typecheck
```

Expected:

```txt
All app tests pass.
No TypeScript errors.
```

- [ ] **Step 2: Build the package**

Run:

```bash
pnpm package:tutti --app daily-tech-radar
```

Expected:

```txt
Packaged daily-tech-radar at ...
```

- [ ] **Step 3: Inspect packaged CLI artifacts**

Run:

```bash
node -e 'const fs=require("node:fs"); for (const file of ["tutti.app.json","tutti.cli.json","COMMANDS.md"]) { console.log(file, fs.existsSync(`build/tutti-app/daily-tech-radar/package/${file}`)); }'
```

Expected:

```txt
tutti.app.json true
tutti.cli.json true
COMMANDS.md true
```

- [ ] **Step 4: Start the packaged server**

Run:

```bash
TUTTI_APP_PACKAGE_DIR=build/tutti-app/daily-tech-radar/package \
TUTTI_APP_HOST=127.0.0.1 \
TUTTI_APP_PORT=3302 \
TUTTI_APP_DATA_DIR=build/tutti-app/daily-tech-radar/data \
node build/tutti-app/daily-tech-radar/package/server.mjs
```

Expected:

```txt
daily-tech-radar listening on http://127.0.0.1:3302
```

- [ ] **Step 5: Exercise CLI handlers over HTTP**

In a second terminal, run:

```bash
curl -sS -X POST http://127.0.0.1:3302/tutti/cli/board \
  -H 'content-type: application/json' \
  -d '{"schemaVersion":"tutti.app.cli.invoke.v1","commandId":"app.daily-tech-radar.radar.board","appId":"daily-tech-radar","scope":"radar","path":["board"],"workspaceId":"local","input":{"locale":"en-US","source":"github","limit":2},"outputMode":"json","context":{"source":"cli","parentCommandId":null}}' | node -e 'let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{const j=JSON.parse(s); console.log(j.kind, j.value.ok, Array.isArray(j.value.data.cards), j.value.data.cards.length <= 2)})'
```

Expected:

```txt
json true true true
```

Then run:

```bash
curl -sS -X POST http://127.0.0.1:3302/tutti/cli/board \
  -H 'content-type: application/json' \
  -d '{"locale":"en-US","include-cards":false}' | node -e 'let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{const j=JSON.parse(s); console.log(j.kind, j.value.ok, Array.isArray(j.value.data.availableDates), j.value.data.cards.length)})'
```

Expected:

```txt
json true true 0
```

Then run:

```bash
curl -sS -X POST http://127.0.0.1:3302/tutti/cli/search \
  -H 'content-type: application/json' \
  -d '{"locale":"en-US","source":"github","query":"ai","limit":5}' | node -e 'let s=""; process.stdin.on("data",d=>s+=d); process.stdin.on("end",()=>{const j=JSON.parse(s); console.log(j.kind, j.value.ok, j.value.data.query.source, j.value.data.cards.length <= 5)})'
```

Expected:

```txt
json true github true
```

- [ ] **Step 6: Stop the packaged server**

Use `Ctrl+C` in the server terminal.

### Task 7: Final Repository Checks

**Files:**

- No new files.

- [ ] **Step 1: Run repository checks**

Run:

```bash
pnpm test
pnpm typecheck
```

Expected:

```txt
All tests pass.
No TypeScript errors.
```

- [ ] **Step 2: Inspect git diff**

Run:

```bash
git diff -- apps/daily-tech-radar/tutti-package scripts tests docs
```

Expected:

```txt
Diff only includes CLI manifest/docs, CLI route/helper implementation, package validation, and packaging docs.
```

## 6. Risks And Decisions To Revisit

- `radar board` may return many cards if no limit is provided. This is intentional because it mirrors `/api/radar`; agents that need smaller payloads can pass `limit` or `include-cards: false`.
- `radar board --source github` returns filtered cards while preserving board-level `metrics` and `categories` from the loaded board. This keeps source-of-truth metadata intact; callers needing filtered category counts should use `radar search` results or compute them locally.
- The command scope is `radar` rather than `daily-tech-radar` because CLI scopes should be short and command-like.
- Route filenames assume TanStack Start maps `src/routes/tutti.cli.board.ts` to `/tutti/cli/board`. If typecheck or route generation shows a mismatch, use the existing route naming convention that produces the exact same URL path.
- Package validation mirrors the important local CLI manifest contract checks, but Tutti remains the final authority for installed app acceptance.

## 7. Self-Review

- Spec coverage: covers the revised 3-command CLI surface, manifest declaration, CLI manifest, command docs, route handlers, shared helper logic, packaging copy, package validation, documentation, and end-to-end handler verification.
- Placeholder scan: no forbidden placeholder patterns remain.
- Type consistency: command names, handler paths, helper names, response envelope, and test expectations are consistent across manifest, docs, routes, tests, and validation.
