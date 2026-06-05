# GitHub Trending 分类阅读器技术方案

## 1. 背景与定位

这个工具不是复刻 GitHub Trending 的线性排行榜，而是做一个面向开发者的 **开源趋势雷达 + README 阅读器**。

核心体验：

1. 从 GitHub Trending 或 GitHub Search 获取热门仓库。
2. 拉取仓库 metadata、topics、README、语言、stars 等信息。
3. 按产品语义分类聚合，例如 `AI Infra`、`DevTools`、`Frontend`、`Data`、`Security`。
4. 每个分类内部再按热度、增长、匹配置信度排序。
5. 中间列表展示 repo 基础信息和 README 缩略预览，右侧只做选中仓库的 README 阅读区。

不采用 iframe 直接嵌入 GitHub 仓库页面。GitHub 页面当前有 `x-frame-options: deny` 和 `frame-ancestors 'none'`，普通 Web 应用无法稳定 iframe 嵌入 GitHub repo 页面。

## 2. 技术选型

### 前后端框架

- `TanStack Start`
  - 使用 file-based routing 承载页面。
  - 使用 Server Functions 做类型安全的数据读取和刷新动作。
  - 使用 Server Routes 暴露 JSON API。
  - 支持 SSR，适合首屏直接渲染分类趋势板。

### UI 技术

- `React`
- `Tailwind CSS`
- `shadcn/ui`
- `lucide-react` 或项目内统一 icon library
- `TanStack Query`
- `react-markdown` + `remark-gfm` + `rehype-sanitize`
- `github-markdown-css` 或自定义 GitHub-flavored markdown 样式

### 数据与缓存

MVP 固定使用：

- `SQLite`
- `Drizzle ORM`
- `better-sqlite3`

存储原则：

- SQLite 数据文件只在服务端访问，不能从浏览器直接读写。
- 本地开发默认放在 `data/trendreader.sqlite`。
- 作为 Nextop app 运行时放在 `NEXTOP_APP_DATA_DIR/trendreader.sqlite`。
- SQLite 同时承担数据存储和缓存快照职责，MVP 不引入 PostgreSQL 或 Redis。
- 如果后续部署到无持久磁盘的平台，需要把 SQLite 文件放到该平台支持的持久卷，或者迁移到兼容 SQLite 的托管存储。

## 3. 总体架构

```txt
GitHub Trending HTML / GitHub Search API
        |
        v
trendingSource
        |
        v
githubService enrich
  - repo metadata
  - topics
  - README
  - language
  - stars/forks/license
        |
        v
classificationService
  - taxonomy rules
  - keyword scoring
  - optional LLM classification
        |
        v
rankingService
  - category momentum
  - repo ranking inside category
        |
        v
SQLite database / cache snapshots
        |
        v
TanStack Start UI
  - category sidebar
  - grouped board
  - README thumbnails in repo rows
  - README panel
```

## 4. 推荐目录结构

```txt
app/
  routes/
    __root.tsx
    index.tsx
    api.trending.ts
    api.repo.$owner.$repo.readme.ts
    api.admin.refresh.ts

  features/
    github/
      github.client.server.ts
      github.types.ts

    trending/
      trending.functions.ts
      trending.server.ts
      trending.parser.server.ts
      trending.types.ts

    classification/
      taxonomy.ts
      classify.server.ts
      scoring.ts
      classification.types.ts

    ranking/
      ranking.server.ts
      ranking.types.ts

    readme/
      readme.functions.ts
      readme.server.ts
      readme-preview.server.ts
      markdown.ts
      readme.types.ts

  components/
    app-shell.tsx
    command-bar.tsx
    category-sidebar.tsx
    category-board.tsx
    category-section.tsx
    repo-row.tsx
    readme-panel.tsx
    markdown-renderer.tsx
    ui/

  db/
    schema.ts
    client.server.ts
    migrations/
    migrate.server.ts

  lib/
    env.server.ts
    cache.server.ts
    rate-limit.server.ts
    slug.ts
```

## 5. 核心数据模型

```ts
export type Repo = {
  id: string
  owner: string
  name: string
  fullName: string
  url: string
  description: string | null
  language: string | null
  topics: string[]
  stars: number
  forks: number
  license: string | null
  homepageUrl: string | null
  pushedAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type TrendSnapshot = {
  id: string
  repoId: string
  since: "daily" | "weekly" | "monthly"
  language: string | null
  rankRaw: number
  starsGained: number
  capturedAt: string
}

export type CategoryScore = {
  repoId: string
  categoryId: string
  score: number
  confidence: number
  reasons: string[]
  isPrimary: boolean
  computedAt: string
}

export type ReadmeCache = {
  repoId: string
  sha: string
  markdown: string
  html?: string
  headings: Array<{
    depth: number
    text: string
    slug: string
  }>
  fetchedAt: string
}

export type ReadmePreviewCache = {
  repoId: string
  readmeSha: string
  imageUrl: string
  width: number
  height: number
  theme: "dark" | "light"
  generatedAt: string
}
```

## 6. 数据库表设计

数据库使用 SQLite。所有 JSON 字段先以 `text` 存储，由应用层序列化和反序列化；时间字段统一存 ISO datetime 字符串。MVP 使用 Drizzle migrations 管理 schema，应用启动或刷新任务开始前执行迁移检查。

推荐文件路径：

```txt
local dev:
  data/trendreader.sqlite

Nextop runtime:
  $NEXTOP_APP_DATA_DIR/trendreader.sqlite
```

SQLite 访问边界：

- 所有数据库调用放在 `db/*.server.ts` 或 feature `*.server.ts` 内。
- 客户端组件只能通过 Server Functions / Server Routes 读取数据。
- 写入集中在 refresh job、README cache update、classification/ranking snapshot 生成。
- 避免长事务；批量 upsert 按 repo/category 分段提交。
- 初始化时建议设置 `journal_mode = WAL` 和 `busy_timeout`，减少刷新任务与页面读取之间的锁冲突。

### repos

```txt
id                  text primary key
owner               text not null
name                text not null
full_name           text not null unique
url                 text not null
description         text
language            text
topics_json         text
stars               integer not null default 0
forks               integer not null default 0
license             text
homepage_url        text
pushed_at           datetime
created_at          datetime
updated_at          datetime
fetched_at          datetime not null
```

建议索引：

```txt
unique index repos_full_name_idx on repos(full_name)
index repos_language_idx on repos(language)
index repos_fetched_at_idx on repos(fetched_at)
```

### trend_snapshots

```txt
id                  text primary key
repo_id             text not null
since               text not null
language            text
rank_raw            integer not null
stars_gained        integer not null default 0
captured_at         datetime not null
```

建议索引：

```txt
index trend_snapshots_board_idx on trend_snapshots(since, language, captured_at)
index trend_snapshots_repo_idx on trend_snapshots(repo_id, captured_at)
```

### readme_cache

```txt
repo_id             text primary key
sha                 text not null
markdown            text not null
html                text
headings_json       text not null
fetched_at          datetime not null
```

### readme_preview_cache

```txt
repo_id             text not null
readme_sha          text not null
image_url           text not null
width               integer not null
height              integer not null
theme               text not null
generated_at        datetime not null
primary key(repo_id, readme_sha, theme, width)
```

### category_scores

```txt
repo_id             text not null
category_id         text not null
score               real not null
confidence          real not null
reasons_json        text not null
is_primary          boolean not null default false
computed_at         datetime not null
primary key(repo_id, category_id)
```

建议索引：

```txt
index category_scores_primary_idx on category_scores(category_id, is_primary, confidence)
```

### category_snapshots

```txt
id                  text primary key
category_id         text not null
since               text not null
language            text
momentum            real not null
repo_count          integer not null
top_repo_ids_json   text not null
captured_at         datetime not null
```

建议索引：

```txt
index category_snapshots_board_idx on category_snapshots(since, language, captured_at)
```

## 7. 分类体系设计

GitHub 本身有 topics，但没有现成的产品分类榜。所以分类体系需要自建。

第一版推荐固定 8-12 个大类：

```ts
export const TAXONOMY = {
  aiInfra: {
    id: "ai-infra",
    label: "AI Infra",
    keywords: [
      "llm",
      "rag",
      "agent",
      "agents",
      "mcp",
      "inference",
      "model-serving",
      "vector-database",
      "embedding",
      "transformers",
    ],
  },
  devtools: {
    id: "devtools",
    label: "DevTools",
    keywords: [
      "cli",
      "developer-tools",
      "debugger",
      "testing",
      "build-tool",
      "monorepo",
      "terminal",
      "code-editor",
    ],
  },
  frontend: {
    id: "frontend",
    label: "Frontend",
    keywords: [
      "react",
      "nextjs",
      "vue",
      "svelte",
      "tailwindcss",
      "components",
      "design-system",
      "ui",
    ],
  },
  data: {
    id: "data",
    label: "Data",
    keywords: [
      "data-engineering",
      "etl",
      "analytics",
      "database",
      "warehouse",
      "visualization",
      "notebook",
    ],
  },
  security: {
    id: "security",
    label: "Security",
    keywords: [
      "security",
      "cybersecurity",
      "pentesting",
      "vulnerability",
      "malware",
      "forensics",
      "llm-security",
    ],
  },
  infraDevops: {
    id: "infra-devops",
    label: "Infra / DevOps",
    keywords: [
      "kubernetes",
      "docker",
      "terraform",
      "observability",
      "monitoring",
      "cloud-native",
      "ci-cd",
    ],
  },
}
```

### 分类信号优先级

```txt
1. repo topics
2. repo description
3. README headings / badges / install docs
4. primary language
5. package metadata: package.json, pyproject.toml, Cargo.toml
6. optional LLM / embedding classification
```

### 分类分数

```txt
category_score =
  topic_match * 5
  + description_match * 3
  + readme_match * 2
  + package_file_hint * 2
  + language_hint * 1
```

每个仓库允许多个分类命中：

- `primaryCategory`: 分数最高且超过阈值的分类。
- `secondaryCategories`: 其他超过较低阈值的分类。
- `uncategorized`: 无分类达到阈值时进入待观察池。

### 可解释原因

分类结果必须保留原因，便于 UI 展示：

```json
{
  "categoryId": "ai-infra",
  "confidence": 0.91,
  "reasons": ["topic:mcp", "topic:llm", "readme:agent runtime"]
}
```

## 8. 排序设计

### 分类聚合排序

分类不是简单按仓库数量排，而是按 momentum 排：

```txt
category_momentum =
  sum(stars_gained of top 10 repos)
  + trending_repo_count * 20
  + median_growth_rate * 100
  + new_repo_bonus
```

### 分类内仓库排序

```txt
repo_rank =
  stars_gained * 1
  + growth_rate * 80
  + category_confidence * 30
  + readme_quality_score * 10
  + freshness_bonus
```

### README quality score

```txt
readme_quality_score =
  has_install_section * 2
  + has_usage_section * 2
  + has_code_block * 1
  + has_badges * 1
  + has_toc * 1
```

这个分数不是判断项目好坏，只用于阅读器优先展示“更容易快速判断”的项目。

### README 缩略预览

列表内每个 repo row 可以展示一个小型 README 预览图，帮助用户在不打开右侧面板前快速判断文档质量。

预览图不是 iframe，也不是 GitHub 官方截图，而是内部生成：

```txt
README markdown
  -> 渲染成受控的 GitHub-flavored HTML
  -> 使用固定宽度和暗色主题截图
  -> 存储为 preview image
  -> repo row 展示 thumbnail
```

缓存 key：

```txt
readme_preview_key = owner/repo + readme_sha + theme + width
```

MVP 可以先用“伪缩略预览”替代真实截图：

- README 标题
- 前 2 个 heading
- 第一个 code block 的前几行
- badges / install section 的简化视觉

这样可以先把产品体验跑通，后续再接 Playwright/browserless 生成真实图片。

## 9. 接口设计

### 9.1 获取分类趋势板

```http
GET /api/trending?since=daily&language=typescript&limit=5
```

Response:

```json
{
  "capturedAt": "2026-06-05T05:00:00Z",
  "since": "daily",
  "language": "typescript",
  "categories": [
    {
      "id": "ai-infra",
      "label": "AI Infra",
      "momentum": 2430,
      "repoCount": 18,
      "delta": 0.32,
      "topRepos": [
        {
          "id": "repo_1",
          "fullName": "owner/project",
          "owner": "owner",
          "name": "project",
          "url": "https://github.com/owner/project",
          "description": "Agent runtime for AI applications",
          "language": "TypeScript",
          "topics": ["agent", "mcp", "llm"],
          "stars": 18420,
          "starsGained": 612,
          "license": "MIT",
          "readmePreviewUrl": "https://cdn.example.com/previews/owner-project.png",
          "categoryConfidence": 0.91,
          "reasons": ["topic:mcp", "description:agent", "readme:llm"]
        }
      ]
    }
  ]
}
```

### 9.2 获取仓库 README

```http
GET /api/repos/:owner/:repo/readme
```

Response:

```json
{
  "repo": "owner/project",
  "sha": "abc123",
  "markdown": "# Project\n\n...",
  "html": "<article>...</article>",
  "headings": [
    { "depth": 1, "text": "Project", "slug": "project" },
    { "depth": 2, "text": "Install", "slug": "install" }
  ],
  "cached": true,
  "fetchedAt": "2026-06-05T05:00:00Z"
}
```

### 9.3 获取 README 缩略预览

```http
GET /api/repos/:owner/:repo/readme-preview?theme=dark&width=360
```

Response:

```json
{
  "repo": "owner/project",
  "readmeSha": "abc123",
  "imageUrl": "https://cdn.example.com/previews/owner-project-dark-360.png",
  "width": 360,
  "height": 220,
  "cached": true,
  "generatedAt": "2026-06-05T05:00:00Z"
}
```

第一版如果不接图片生成服务，可以返回结构化预览数据：

```json
{
  "repo": "owner/project",
  "mode": "structured",
  "title": "Project",
  "headings": ["Overview", "Quick start"],
  "codePreview": "npm install project"
}
```

### 9.4 刷新趋势数据

```http
POST /api/admin/refresh
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "since": "daily",
  "language": "typescript"
}
```

Response:

```json
{
  "ok": true,
  "capturedAt": "2026-06-05T05:00:00Z",
  "reposFetched": 25,
  "reposEnriched": 25,
  "categoriesComputed": 8
}
```

## 10. TanStack Start 数据调用设计

页面内部优先使用 Server Functions，保持类型安全。

```ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

const BoardQuerySchema = z.object({
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  language: z.string().optional(),
  limit: z.number().min(1).max(20).default(5),
})

export const getCategoryBoard = createServerFn({ method: "GET" })
  .inputValidator(BoardQuerySchema)
  .handler(async ({ data }) => {
    return trendService.getCategoryBoard(data)
  })
```

React 组件内：

```tsx
const { data } = useSuspenseQuery({
  queryKey: ["category-board", filters],
  queryFn: () => getCategoryBoard({ data: filters }),
})
```

外部或调试用 API 使用 Server Routes：

```ts
export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const query = parseBoardRequest(request)
        const board = await trendService.getCategoryBoard(query)
        return Response.json(board)
      },
    },
  },
})
```

## 11. UI 设计方案

视觉方向采用 dark command-center 风格，参考 Raycast/Linear/现代开发者工具的密度和克制感。

### 页面结构

```txt
┌─────────────────────────────────────────────────────────────────────┐
│ Command Bar: TrendReader | Search | Since | Language | Refresh      │
├───────────────┬───────────────────────────────┬─────────────────────┤
│ Category      │ Category Board                │ README Panel        │
│ Sidebar       │                               │                     │
│               │ AI Infra       momentum +32%  │ README              │
│ AI Infra 18   │   repo row + README thumb     │ markdown            │
│ DevTools 12   │   repo row + README thumb     │ only                │
│ Frontend 9    │   repo row + README thumb     │                     │
│ Data 7        │                               │                     │
│ Security 6    │ DevTools       momentum +18%  │                     │
│               │   repo row                    │                     │
└───────────────┴───────────────────────────────┴─────────────────────┘
```

### 主要组件

#### CommandBar

职责：

- 全局搜索 repo/topic/category。
- 时间范围切换：Today / Week / Month。
- 语言筛选。
- Refresh。
- 显示缓存状态。

shadcn 组件：

- `Button`
- `ToggleGroup`
- `Command`
- `DropdownMenu`
- `Badge`
- `Tooltip`

#### CategorySidebar

职责：

- 展示所有分类。
- 显示每个分类的 repo count、momentum delta。
- 支持 pinned categories。

组件行为：

- 点击分类滚动到中间面板对应 section。
- 当前分类高亮。
- 支持只看某个分类。

#### CategoryBoard

职责：

- 展示聚合后的分类 section。
- 每个 section 内展示 top repos。
- 支持 expand/collapse。

不要使用大量卡片堆叠。更适合：

- section header
- compact rows
- subtle separator
- selected row state

#### RepoRow

展示字段：

- owner/name
- description
- language dot
- stars gained
- total stars
- license
- topics
- category confidence
- README thumbnail preview

交互：

- 点击选择 repo，右侧更新 README。
- hover 展示分类原因。
- pin / open GitHub。

#### ReadmePanel

职责：

- 只渲染选中仓库的 README markdown。
- 顶部保留最小上下文：`owner/repo` 和 `Open on GitHub`。
- 支持 loading / empty / failed 状态。
- 长 README 使用内部滚动，不影响左侧分类和中间列表。

安全要求：

- 不直接插入不可信 HTML。
- 如果服务端渲染 HTML，需要 sanitize。
- 外链加 `rel="noreferrer noopener"`。

## 12. shadcn/ui 组件清单

第一批需要：

```txt
button
badge
separator
scroll-area
tooltip
dropdown-menu
toggle-group
command
skeleton
resizable
avatar
```

设计规则：

- 用 `gap-*` 做布局间距，不用 `space-x-*` / `space-y-*`。
- 用语义颜色 token，不在组件内随意写大量 raw color。
- icon 放在 button 内时使用统一尺寸和状态。
- 不把所有 section 都包成 Card；这个产品主结构是 panes + rows + sections。

## 13. 后端模块设计

### db

```ts
type DbRuntime = {
  sqlitePath: string
  runMigrations(): Promise<void>
}
```

职责：

- 初始化 SQLite 数据库文件。
- 应用 Drizzle migrations。
- 设置 SQLite pragmas，例如 `journal_mode = WAL` 和 `busy_timeout`。
- 暴露服务端-only 的 Drizzle client。
- 根据运行环境解析数据库路径：
  - `NEXTOP_APP_DATA_DIR/trendreader.sqlite`
  - `data/trendreader.sqlite`

### githubService

```ts
type GithubService = {
  getRepo(owner: string, repo: string): Promise<Repo>
  getReadme(owner: string, repo: string): Promise<GithubReadme>
  getRepoTopics(owner: string, repo: string): Promise<string[]>
  getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>>
}
```

职责：

- 统一 GitHub REST API 调用。
- 注入 `GITHUB_TOKEN`。
- 处理 rate limit。
- 支持 ETag / conditional request。

### trendingSource

```ts
type TrendingSource = {
  fetchTrending(input: {
    since: "daily" | "weekly" | "monthly"
    language?: string
  }): Promise<TrendingRepoSeed[]>
}
```

职责：

- 抓取 GitHub Trending HTML。
- 解析 repo name、description、language、stars gained、rank。
- 保存 raw response hash，方便排查 parser 失效。

### enrichmentService

职责：

- 基于 trending seed 补齐 repo metadata。
- 拉取 topics。
- 拉取 README。
- 提取 README headings、首个 code block、首屏 markdown 片段，用于列表缩略预览。

### classificationService

职责：

- 根据 taxonomy 计算分类分数。
- 输出 primary / secondary categories。
- 输出 reasons。
- 后续可插入 LLM 分类器。

### rankingService

职责：

- 计算 category momentum。
- 计算 repo rank。
- 生成 category snapshots。

### readmeService

职责：

- 按 sha 缓存 README。
- 渲染 markdown。
- 生成结构化 README preview 数据。
- 后续可接 Playwright/browserless 生成真实 README preview image。

## 14. 缓存策略

```txt
Trending HTML:
  TTL 10-30 min

Repo metadata:
  TTL 6-24 h

README:
  按 sha cache，sha 不变不重拉

README preview:
  按 readme sha + theme + width cache

Classification:
  按 repo metadata hash + readme sha cache

Category board:
  TTL 10 min，或由 refresh job materialize
```

GitHub token 只放服务端，不允许下发到浏览器。

## 15. 刷新与任务调度

MVP 可以先做手动刷新：

```txt
POST /api/admin/refresh
```

后续接 cron：

```txt
daily:
  every 30 min

weekly:
  every 2 h

monthly:
  every 6 h
```

每次 refresh 流程：

```txt
1. fetch trending seeds
2. upsert repos
3. enrich topics/readme
4. generate/update README preview data
5. classify repos
6. rank categories
7. write category snapshots
```

## 16. 错误处理

### GitHub rate limit

- 返回 cached stale data。
- UI 显示 `Showing cached data`。
- 后台延迟重试。

### Trending parser 失效

- 保存 raw HTML hash。
- 返回最近一次成功 snapshot。
- 管理端显示 parser warning。

### README 获取失败

- UI 展示 fallback：
  - README 加载失败提示
  - open GitHub 按钮
  - 简短 failed reason

### 分类置信度过低

- 进入 `Uncategorized`。
- UI 上可展示 `Needs review`。

## 17. 安全设计

- GitHub token 只在服务端读取。
- README HTML 必须 sanitize。
- 外链使用 `target="_blank"` + `rel="noreferrer noopener"`。
- admin refresh route 使用 `ADMIN_TOKEN`。
- Server Function 开启 CSRF 保护。
- 不记录用户私有 token，第一版只做公共数据。

## 18. MVP 实施计划

### Phase 1: 静态 UI 原型

目标：

- 搭建 TanStack Start + Tailwind + shadcn。
- 实现 command-center 三栏布局。
- 使用 mock 数据展示分类聚合、repo row、README 缩略预览和 README 面板。

验收：

- 分类 sidebar 可切换。
- repo row 可选中。
- README panel 只显示选中仓库的 README 内容。

### Phase 2: Trending 数据接入

目标：

- 实现 `trendingSource.fetchTrending()`。
- 解析 GitHub Trending 页面。
- 存储 trend snapshots。

验收：

- `/api/trending` 返回真实 trending repo。
- 失败时可返回最近缓存。

### Phase 3: GitHub enrichment

目标：

- 接 GitHub REST API。
- 拉取 repo metadata、topics、README。
- 缓存 README。

验收：

- 选中 repo 后右侧展示真实 README。
- README sha 不变时不重复拉取。
- repo row 可以展示结构化 README 缩略预览。

### Phase 4: 分类与排序

目标：

- 建 taxonomy。
- 实现规则分类。
- 实现 category momentum。

验收：

- 首页按分类聚合展示。
- 每个 repo 有分类 confidence 和 reasons。

### Phase 5: 产品增强

目标：

- 真实 README screenshot thumbnail 生成。
- `Why trending` insight。
- README install command 提取和复制。
- Pin / saved collections。
- LLM 分类或摘要作为可选增强。

验收：

- 用户可以快速判断一个仓库文档质量、分类原因和是否值得深入阅读。

## 19. 关键风险

1. GitHub Trending 没有官方 API，HTML 结构可能变化。
2. topics 不总是准确，不能只靠 topic 分类。
3. README 可能很大，需要截断、缓存、懒加载。
4. Markdown 渲染有 XSS 风险，必须 sanitize。
5. GitHub API rate limit 需要缓存和 token。
6. 分类体系太细会导致 UI 噪音，MVP 控制在 8-12 个大类。

## 20. 推荐第一版范围

第一版只做：

- `daily / weekly / monthly`
- 语言筛选
- 8 个固定分类
- 分类聚合排序
- README 渲染
- repo row 内 README 缩略预览
- 分类原因展示在中间列表 hover 或轻量 tooltip 中
- 缓存和手动刷新

暂不做：

- 用户登录
- 私有仓库
- 评论/协作
- 右侧 issues / pull requests / discussions tabs
- 右侧 related repos / release / security 等信息面板
- 右侧 AI 摘要或 Why trending 大卡片
- 长期趋势图
- 全量 GitHub topic 搜索
- 复杂 LLM agent 分析

## 21. 参考资料

- TanStack Start Server Functions: https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- TanStack Start Server Routes: https://tanstack.dev/start/latest/docs/framework/react/guide/server-routes
- GitHub REST Repositories API: https://docs.github.com/en/rest/repos
- GitHub Repository Topics: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics
- GitHub Trending: https://github.com/trending
