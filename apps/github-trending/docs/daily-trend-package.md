# Daily Trend Package JSON

## 1. 目标

TrendReader 每天生成一份完整 JSON 包，作为前端和 Nextop app 的稳定数据源。

这份 JSON 不是 README 全量归档，而是一个 **可离线使用的趋势索引包**：

1. 固化当天 GitHub Trending 候选仓库和原始排名。
2. 固化分类体系、分类结果、分类证据和分类内排序。
3. 固化 repo metadata、README 引用、README 派生信号。
4. 固化 repo 视觉封面：优先使用 README 中第一张有效图片，没有图片时用 Agnes 生成项目封面。
5. 允许 README 全文、README HTML、README 截图在运行时动态拉取和缓存。

核心原则：

- 分类必须在每日打包阶段完成，不能交给浏览器临时猜。
- 前端可以直接消费 `views` 里已经排好的 `repoIds`，也可以按 `repos[].classification` 和 `repos[].rank` 自己生成视图。
- README 正文可以动态抓取，但每日包必须包含足够的 `readmeRef` 和 `readmeSignals`，让卡片、分类、搜索和空态都能稳定工作。
- 卡片封面必须在每日打包阶段确定：README 图片优先，Agnes 生成图兜底，前端不临时生成图片。
- 低置信度仓库必须进入 `unclassified`，不要默认塞进 `DevTools`。

## 2. 完整 JSON 结构

```ts
type DailyTrendPackage = {
  schemaVersion: "trendreader.daily.v1";
  packageId: string;
  generatedAt: string;
  expiresAt: string;
  sourceWindow: {
    since: "daily" | "weekly" | "monthly";
    language: string;
    spokenLanguageCode?: string | null;
  };
  sources: SourceReport[];
  taxonomy: Taxonomy;
  repos: TrendRepo[];
  views?: TrendView[];
  health?: PackageHealth;
};
```

### 2.1 Package Metadata

```ts
type SourceReport = {
  id: "github_trending_html" | "huchenme_api" | "github_search" | "github_rest";
  role: "candidate" | "fallback" | "enrichment";
  url?: string;
  status: "ok" | "partial" | "failed" | "skipped";
  itemCount?: number;
  rateLimit?: {
    limit?: number;
    remaining?: number;
    resource?: string;
  };
};

type PackageHealth = {
  status: "ok" | "partial" | "degraded";
  candidateCount: number;
  enrichedRepoCount: number;
  unclassifiedRepoCount: number;
  warnings: string[];
};
```

`sources` 和 `health` 只保留运行时有用的健康信息。详细错误、完整 rate limit header、请求日志和 parser debug 应写入 job 日志或 SQLite，不进入每日 JSON。

### 2.2 冗余字段处理

默认每日 JSON 只保留首屏、分类、搜索、README 动态抓取所需字段。下面这些字段不进入默认包：

| 字段 | 原因 | 替代方案 |
| --- | --- | --- |
| `fullName` | 可由 `owner + name` 推导 | 前端拼接 |
| `sourceUrl` / `fetchedAt` | 顶层 `sources` 已表达来源状态 | 详细来源进 job 日志 |
| `languageColor` | 可由语言颜色表推导 | 前端或 shared map |
| 完整 `languages` 字节分布 | 体积大，首屏只需概览 | `topLanguages: string[]` |
| `watchers` | GitHub REST 中与 stars 语义容易混淆 | 暂不展示 |
| `openIssues` | 对发现页排序帮助有限 | detail API 再取 |
| `createdAt` / `updatedAt` | 默认只需要活跃度 | 保留 `pushedAt` |
| README 全文 / HTML | 体积大且可动态抓 | `readmeRef.rawUrl` + SQLite cache |
| README links / badges 全量 | 容易膨胀 | 只保留 `headings`、`commands`、`keywords` |
| `matchedSignals` 对象数组 | debug 信息太重 | 压缩为 `signals: string[]` |
| ranking 分项明细 | UI 默认只需要分数和顺序 | 保留 `rank.score`，详细解释进 debug |
| Agnes 完整 prompt | 可能很长 | 保留 `promptHash`，prompt 进资产 metadata |
| `diagnostics` 大对象 | 偏运维 | 压缩成 `health` |

### 2.3 体积控制

默认包按 `25-50` 个 repo 设计，目标体积：

```txt
25 repos: 80-160 KB raw, 25-60 KB gzip
50 repos: 160-320 KB raw, 50-120 KB gzip
100 repos: 320-700 KB raw, 100-250 KB gzip
```

硬限制：

- `topics` 最多 12 个。
- `topLanguages` 最多 3 个。
- `readmeSignals.headings` 最多 6 个。
- `readmeSignals.commands` 最多 3 个。
- `readmeSignals.keywords` 最多 10 个。
- `classification.secondaryCategoryIds` 最多 3 个。
- `classification.reasons` 最多 3 条。
- `classification.signals` 最多 6 条。
- `views` 可省略；客户端必须能从 `repos` 自行生成分类视图。

## 3. Taxonomy

`taxonomy` 是产品自己的分类体系定义，不是 GitHub 官方字段。它负责告诉 UI：有哪些分类、怎么显示、分类含义是什么、顺序是什么。

```ts
type Taxonomy = {
  version: string;
  generatedAt: string;
  categories: CategoryDefinition[];
};

type CategoryDefinition = {
  id: string;
  label: string;
  labelEn?: string;
  icon: string;
  order: number;
  description?: string;
};
```

推荐初始分类：

`热门推荐` 是派生频道，不建议作为 repo 的唯一 `primaryCategoryId`。每日 job 可以把高增长、高质量或编辑精选项目同时放进 `hot` view；repo 自身仍保留 `AI`、`工具`、`前端` 等更具体的主分类。

每日包里的 `taxonomy` 只发 UI 展示字段。分类用的 `keywords`、`negativeKeywords`、权重等规则属于打包脚本配置，不放进 JSON，避免每个包重复携带大段规则。

```json
[
  {
    "id": "hot",
    "label": "热门推荐",
    "labelEn": "Hot Picks",
    "description": "High-momentum repositories that deserve first-screen exposure even when category confidence is mixed.",
    "intent": "Let users quickly scan the strongest daily opportunities.",
    "icon": "flame",
    "order": 0,
    "keywords": []
  },
  {
    "id": "chatgpt",
    "label": "ChatGPT",
    "labelEn": "ChatGPT",
    "description": "ChatGPT apps, OpenAI integrations, GPT tools, prompts, plugins, agents and assistant workflows.",
    "intent": "Find projects that extend or integrate ChatGPT-style workflows.",
    "icon": "message-circle",
    "order": 10,
    "keywords": ["chatgpt", "openai", "gpt", "assistant", "prompt", "plugin", "agents", "responses api"]
  },
  {
    "id": "ai",
    "label": "AI",
    "labelEn": "AI",
    "description": "AI models, agent frameworks, RAG, MCP, local inference, model serving and AI developer infrastructure.",
    "intent": "Track broader AI infrastructure and AI-native developer tools.",
    "icon": "bot",
    "order": 20,
    "keywords": ["ai", "llm", "agent", "rag", "mcp", "model", "inference", "embedding", "vector", "cuda", "onnx"]
  },
  {
    "id": "algorithm",
    "label": "算法",
    "labelEn": "Algorithms",
    "description": "Algorithms, data structures, optimization, numerical methods, ML algorithms and coding challenge solutions.",
    "intent": "Collect algorithmic and computer science reference projects.",
    "icon": "sigma",
    "order": 30,
    "keywords": ["algorithm", "data-structures", "leetcode", "optimization", "math", "ml", "machine-learning", "numeric"]
  },
  {
    "id": "video-image",
    "label": "视频图像",
    "labelEn": "Video & Image",
    "description": "Image generation, video generation, computer vision, media editing, rendering and creative AI tools.",
    "intent": "Find visual media, generation and processing projects.",
    "icon": "image",
    "order": 40,
    "keywords": ["image", "video", "vision", "diffusion", "comfyui", "stable-diffusion", "ffmpeg", "opencv", "render"]
  },
  {
    "id": "monitoring-diagnostics",
    "label": "监控诊断",
    "labelEn": "Monitoring & Diagnostics",
    "description": "Observability, logging, tracing, metrics, profiling, error tracking and diagnostics tooling.",
    "intent": "Find tools for understanding production and development system behavior.",
    "icon": "activity",
    "order": 50,
    "keywords": ["monitoring", "observability", "logs", "logging", "trace", "tracing", "metrics", "profiling", "diagnostics", "apm"]
  },
  {
    "id": "middleware",
    "label": "中间件",
    "labelEn": "Middleware",
    "description": "Queues, brokers, gateways, proxies, caches, RPC frameworks, API middleware and integration layers.",
    "intent": "Find infrastructure glue used between apps, services and platforms.",
    "icon": "network",
    "order": 60,
    "keywords": ["middleware", "queue", "broker", "gateway", "proxy", "cache", "redis", "grpc", "rpc", "api-gateway"]
  },
  {
    "id": "3d",
    "label": "3D",
    "labelEn": "3D",
    "description": "3D engines, modeling, WebGL, Three.js, geometry, simulation, visualization and spatial tools.",
    "intent": "Find projects for 3D creation, visualization or interaction.",
    "icon": "box",
    "order": 70,
    "keywords": ["3d", "threejs", "three.js", "webgl", "webgpu", "blender", "geometry", "mesh", "simulation"]
  },
  {
    "id": "interview-career",
    "label": "面试求职",
    "labelEn": "Interview & Career",
    "description": "Interview prep, resume tools, coding interview resources, career guides and job search helpers.",
    "intent": "Help users prepare for interviews and career moves.",
    "icon": "book-open",
    "order": 80,
    "keywords": ["interview", "leetcode", "resume", "career", "job", "hiring", "coding-interview", "system-design"]
  },
  {
    "id": "design",
    "label": "设计",
    "labelEn": "Design",
    "description": "Design systems, icon sets, prototyping tools, creative workflows, UI kits and visual design resources.",
    "intent": "Find resources and tools for product and interface design.",
    "icon": "palette",
    "order": 90,
    "keywords": ["design", "design-system", "icons", "figma", "prototype", "ui-kit", "theme", "visual"]
  },
  {
    "id": "tools",
    "label": "工具",
    "labelEn": "Tools",
    "description": "General developer tools, CLIs, automation helpers, editors, linters, formatters and workflow utilities.",
    "intent": "Find practical utilities that improve day-to-day work.",
    "icon": "wrench",
    "order": 100,
    "keywords": ["tool", "tools", "cli", "terminal", "linter", "formatter", "editor", "automation", "workflow"]
  },
  {
    "id": "backend",
    "label": "后端",
    "labelEn": "Backend",
    "description": "Backend frameworks, APIs, databases, auth, server runtimes, cloud infrastructure and service tooling.",
    "intent": "Find server-side frameworks and infrastructure projects.",
    "icon": "server",
    "order": 110,
    "keywords": ["backend", "server", "api", "database", "postgres", "sqlite", "auth", "cloud", "kubernetes", "docker"]
  },
  {
    "id": "programming-language",
    "label": "编程语言",
    "labelEn": "Programming Languages",
    "description": "Programming languages, compilers, runtimes, interpreters, language tooling and language learning resources.",
    "intent": "Track languages and their ecosystems.",
    "icon": "code",
    "order": 120,
    "keywords": ["compiler", "runtime", "interpreter", "language", "typescript", "rust", "go", "python", "java", "zig"]
  },
  {
    "id": "game",
    "label": "游戏",
    "labelEn": "Games",
    "description": "Game engines, gameplay projects, game AI, emulators, tooling and interactive entertainment.",
    "intent": "Find game-related development and runnable game projects.",
    "icon": "gamepad-2",
    "order": 130,
    "keywords": ["game", "game-engine", "unity", "godot", "emulator", "gameplay", "gamedev"]
  },
  {
    "id": "frontend",
    "label": "前端",
    "labelEn": "Frontend",
    "description": "Frontend frameworks, UI components, CSS, browser tools, web performance and product interface tooling.",
    "intent": "Find projects for building user interfaces and web apps.",
    "icon": "layout",
    "order": 140,
    "keywords": ["frontend", "react", "vue", "svelte", "css", "tailwind", "component", "browser", "web"]
  },
  {
    "id": "apps",
    "label": "应用软件",
    "labelEn": "Apps",
    "description": "Runnable apps, desktop apps, browser extensions, clients, productivity software and end-user products.",
    "intent": "Find finished software users can run directly.",
    "icon": "app-window",
    "order": 150,
    "keywords": ["app", "desktop", "extension", "client", "viewer", "studio", "productivity", "software"]
  },
  {
    "id": "learning-community",
    "label": "学习社区",
    "labelEn": "Learning Community",
    "description": "Tutorials, communities, notebooks, course materials, learning paths and collaborative knowledge bases.",
    "intent": "Find places and resources for learning with others.",
    "icon": "users",
    "order": 160,
    "keywords": ["learn", "learning", "tutorial", "course", "community", "notebook", "guide", "education"]
  },
  {
    "id": "resource-library",
    "label": "资源库",
    "labelEn": "Resource Library",
    "description": "Awesome lists, datasets, templates, curated references, examples and reusable resource collections.",
    "intent": "Find curated resources and reusable collections.",
    "icon": "library",
    "order": 170,
    "keywords": ["awesome", "list", "dataset", "template", "examples", "resources", "collection", "reference"]
  },
  {
    "id": "unclassified",
    "label": "Needs Review",
    "description": "Low-confidence repositories that should not be forced into an incorrect category.",
    "intent": "Hold ambiguous repositories for later review.",
    "icon": "circle-help",
    "order": 999,
    "keywords": []
  }
]
```

## 4. Repo JSON

```ts
type TrendRepo = {
  id: string;
  owner: string;
  name: string;
  url: string;
  avatarUrl?: string | null;
  homepageUrl?: string | null;

  source: {
    primary: "github_trending_html" | "huchenme_api" | "github_search";
    sourceRank: number;
    starsGained: number;
  };

  metadata: {
    description: string;
    language: string;
    topics: string[];
    stars: number;
    forks?: number;
    license?: string | null;
    defaultBranch?: string | null;
    pushedAt?: string | null;
    topLanguages?: string[];
  };

  readmeRef: {
    status: "available" | "missing" | "rate_limited" | "unknown";
    path?: string | null;
    sha?: string | null;
    rawUrl?: string | null;
  };

  readmeSignals: {
    title?: string | null;
    summary?: string | null;
    headings: string[];
    commands: string[];
    keywords: string[];
    score: number;
  };

  visual: {
    kind: "readme_image" | "agnes_generated" | "repository_avatar" | "none";
    url?: string | null;
    thumbUrl?: string | null;
    alt?: string | null;
    sourceUrl?: string | null;
    promptHash?: string | null;
  };

  classification: {
    primaryCategoryId: string;
    secondaryCategoryIds: string[];
    confidence: number;
    method: "rules" | "rules_readme" | "llm" | "manual_override";
    reasons: string[];
    signals: string[];
  };

  rank: {
    globalRank: number;
    categoryRank?: number;
    score: number;
  };
};
```

## 5. Views JSON

`views` 是可选的预计算展示层。它不是事实数据，前端可以直接用，也可以自己从 `repos` 计算。

```ts
type TrendView = {
  id: string;
  type: "category" | "curated" | "review";
  label: string;
  categoryId?: string;
  repoIds: string[];
  sort?: "score" | "globalRank" | "starsGained" | "confidence";
};
```

规则：

- `repoIds` 的顺序就是分类内排序结果。
- `views` 可以省略；省略时，客户端按 `classification.primaryCategoryId` 分组，再按 `rank.score` 排序。
- `repoCount` 用 `repoIds.length` 推导，不进入 JSON。
- `label` 可以从 `taxonomy` 推导；这里只保留是为了让 `curated` / `review` 这类非分类视图也能直接展示。

## 6. 示例 JSON

```json
{
  "schemaVersion": "trendreader.daily.v1",
  "packageId": "daily-All-2026-06-06",
  "generatedAt": "2026-06-06T01:00:00.000Z",
  "expiresAt": "2026-06-07T01:00:00.000Z",
  "sourceWindow": {
    "since": "daily",
    "language": "All",
    "spokenLanguageCode": null
  },
  "sources": [
    {
      "id": "github_trending_html",
      "role": "candidate",
      "url": "https://github.com/trending?since=daily",
      "status": "ok",
      "itemCount": 25
    },
    {
      "id": "github_rest",
      "role": "enrichment",
      "status": "partial",
      "itemCount": 18,
      "rateLimit": {
        "limit": 60,
        "remaining": 0,
        "resource": "core"
      }
    }
  ],
  "taxonomy": {
    "version": "2026-06-06",
    "generatedAt": "2026-06-06T01:00:00.000Z",
    "categories": [
      { "id": "ai", "label": "AI", "labelEn": "AI", "icon": "bot", "order": 20 },
      { "id": "tools", "label": "工具", "labelEn": "Tools", "icon": "wrench", "order": 100 },
      { "id": "unclassified", "label": "Needs Review", "labelEn": "Needs Review", "icon": "circle-help", "order": 999 }
    ]
  },
  "repos": [
    {
      "id": "chopratejas-headroom",
      "owner": "chopratejas",
      "name": "headroom",
      "url": "https://github.com/chopratejas/headroom",
      "avatarUrl": "https://github.com/chopratejas.png",
      "homepageUrl": "https://headroom-docs.vercel.app/docs",
      "source": {
        "primary": "github_trending_html",
        "sourceRank": 1,
        "starsGained": 2503
      },
      "metadata": {
        "description": "The context compression layer for AI agents",
        "language": "Python",
        "topics": ["ai-agents", "mcp", "compression"],
        "stars": 14201,
        "forks": 420,
        "license": "Apache-2.0",
        "defaultBranch": "main",
        "pushedAt": "2026-06-05T20:20:00Z",
        "topLanguages": ["Python", "TypeScript"]
      },
      "readmeRef": {
        "status": "available",
        "path": "README.md",
        "sha": "abc123",
        "rawUrl": "https://raw.githubusercontent.com/chopratejas/headroom/main/README.md"
      },
      "readmeSignals": {
        "title": "Headroom",
        "summary": "Headroom compresses everything your AI agent reads before it reaches the LLM.",
        "headings": ["What it does", "How it works", "Get started", "Agent compatibility matrix"],
        "commands": ["pip install headroom-ai", "npm install headroom-ai"],
        "keywords": ["AI agents", "MCP", "context compression", "local-first"],
        "score": 86
      },
      "visual": {
        "kind": "readme_image",
        "url": "https://raw.githubusercontent.com/chopratejas/headroom/main/HeadroomDemo-Fast.gif",
        "thumbUrl": "https://assets.nextop.example/github-trending/readme-images/chopratejas-headroom-abc123.png",
        "alt": "Headroom in action",
        "sourceUrl": "https://raw.githubusercontent.com/chopratejas/headroom/main/HeadroomDemo-Fast.gif"
      },
      "classification": {
        "primaryCategoryId": "ai",
        "secondaryCategoryIds": ["tools"],
        "confidence": 0.88,
        "method": "rules_readme",
        "reasons": [
          "README mentions AI agents",
          "README mentions MCP",
          "description mentions context compression"
        ],
        "signals": ["readme:AI agents", "readme:MCP", "description:context compression"]
      },
      "rank": {
        "globalRank": 1,
        "categoryRank": 1,
        "score": 91.4
      }
    }
  ],
  "views": [
    {
      "id": "ai",
      "type": "category",
      "label": "AI",
      "categoryId": "ai",
      "repoIds": ["chopratejas-headroom"],
      "sort": "score"
    }
  ],
  "health": {
    "status": "partial",
    "candidateCount": 25,
    "enrichedRepoCount": 18,
    "unclassifiedRepoCount": 1,
    "warnings": ["GitHub REST rate limit reached; 7 repos used raw README fallback"]
  }
}
```

## 7. 每日获取逻辑

### 7.1 Candidate Source

每日 job 按下面顺序获取候选仓库：

1. `github_trending_html`
   - 请求 `https://github.com/trending?since=daily` 或 `https://github.com/trending/{language}?since=daily`。
   - 解析页面中 repo 卡片顺序。
   - `article index + 1` 写入 `source.sourceRank`。
   - 页面里的 `stars today / this week / this month` 写入 `source.starsGained`。
2. `huchenme_api`
   - 当自有 parser 失败时，请求 `https://ghapi.huchen.dev/repositories?language=<language>&since=<since>`。
   - 返回数组顺序写入 `source.sourceRank`。
   - `currentPeriodStars` 写入 `source.starsGained`。
   - 这个源只做 fallback，不做唯一主源。
3. `github_search`
   - 当 Trending 页面和第三方 API 都失败时使用。
   - Search 结果不等同于 GitHub Trending，`source.primary` 必须标记为 `github_search`。
   - UI 可以显示 degraded data 状态。

### 7.2 GitHub REST Enrichment

对候选列表逐个补全：

```txt
GET /repos/{owner}/{repo}
GET /repos/{owner}/{repo}/languages
GET /repos/{owner}/{repo}/topics
GET /repos/{owner}/{repo}/readme
```

写入字段：

- `metadata.description`
- `metadata.language`
- `metadata.topLanguages`
- `metadata.topics`
- `metadata.stars`
- `metadata.forks`
- `metadata.license`
- `metadata.defaultBranch`
- `metadata.pushedAt`
- `readmeRef.path`
- `readmeRef.sha`

必须支持 `GITHUB_TOKEN`。没有 token 时，匿名 GitHub REST 很容易触发 `x-ratelimit-limit: 60`。

### 7.3 README Fallback

如果 `GET /readme` 失败或被限流，尝试 raw README fallback：

```txt
https://raw.githubusercontent.com/{owner}/{repo}/{defaultBranch}/README.md
https://raw.githubusercontent.com/{owner}/{repo}/{defaultBranch}/readme.md
https://raw.githubusercontent.com/{owner}/{repo}/{defaultBranch}/README.mdx
https://raw.githubusercontent.com/{owner}/{repo}/main/README.md
https://raw.githubusercontent.com/{owner}/{repo}/master/README.md
```

raw fallback 成功时：

- `readmeRef.status = "available"`
- `readmeRef.rawUrl` 写入成功 URL
- `readmeRef.sha` 可以为空

raw fallback 失败时：

- `readmeRef.status = "unknown"` 或 `"missing"`
- `readmeSignals` 保持空数组和低质量分
- 分类仍可用 topics、description、repo name 做低置信度判断。

### 7.4 README Signals

每日包不存 README 全文，但要从 README 中抽取轻量信号：

- 第一个 H1 作为 `readmeSignals.title`
- 第一段正常文本作为 `summary`
- 前 8 个 heading 作为 `headings`
- `pip install`、`npm install`、`pnpm add`、`cargo install` 等命令作为 `commands`
- 从 title、headings、first paragraph 中抽取关键词
- 计算 `score`

这些字段给分类、搜索、卡片预览和 README 右侧 loading 状态使用。

### 7.5 Visual Cover

每日包要为每个 repo 生成一个稳定的 `visual` 字段，给卡片封面、画廊视图和 README 预览使用。

获取顺序：

1. README 第一张有效图片
   - 从 Markdown 图片语法提取：`![alt](src)`。
   - 从 HTML 图片提取：`<img src="..." alt="...">`。
   - 跳过 badge、shield、tracking pixel、Open Collective backer 图、1x1 图片。
   - 优先选择尺寸更像产品图、截图、demo GIF、架构图的图片。
2. README 图片地址解析
   - 绝对 URL 直接使用。
   - 相对路径按 README 所在目录解析到 raw URL。
   - `./assets/demo.png` 解析为 `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/assets/demo.png`。
   - `docs/image.png` 解析为 `https://raw.githubusercontent.com/{owner}/{repo}/{branch}/docs/image.png`。
3. 图片可用性检查
   - 请求 `HEAD`，失败时用小范围 `GET`。
   - 只接受 `image/png`、`image/jpeg`、`image/webp`、`image/gif`、`image/svg+xml`。
   - 大于上限的图片只保存引用，不直接内嵌到 JSON。
   - SVG 可以使用，但 UI 需要用安全的 `img` 渲染，不把 SVG 内容内联。
4. Agnes 生成图 fallback
   - README 没有有效图片，或者图片全部不可访问时触发。
   - 使用 repo name、description、topics、README title、first paragraph、category 生成 prompt。
   - 生成图写入对象存储或 release assets，JSON 只保存 `url` / `thumbUrl` / `promptHash`。
5. 最后兜底
   - Agnes 失败时使用 GitHub avatar。
   - avatar 也不可用时 `visual.kind = "none"`。

Agnes prompt 模板：

```txt
Create a clean product card cover for an open-source GitHub project.
Project: {owner}/{repo}
Category: {primaryCategoryLabel}
Description: {description}
README summary: {summary}
Topics: {topics}

Style: light editorial software product screenshot, practical developer tool, no fake UI text, no logos copied from GitHub, 16:10 composition, clear focal object.
```

示例 Agnes fallback：

```json
{
  "visual": {
    "kind": "agnes_generated",
    "url": "https://assets.nextop.example/github-trending/generated/affaan-m-ecc-2026-06-06.png",
    "thumbUrl": "https://assets.nextop.example/github-trending/generated/affaan-m-ecc-2026-06-06-thumb.png",
    "alt": "Generated cover for affaan-m / ECC",
    "sourceUrl": null,
    "promptHash": "sha256:0f4d..."
  }
}
```

规则：

- 每日 JSON 不存 base64 图片。
- 图片资产必须独立存储，JSON 只保存 URL 和 metadata。
- README 真实图片优先级高于生成图，因为真实图片更能反映项目本身。
- 生成图必须标记 `kind = "agnes_generated"`，UI 可以选择显示 generated 标识。
- 相同 `repo + readme sha + prompt hash` 命中缓存时复用旧图，不重复生成。
- 完整 Agnes prompt、模型名和生成日志进入 job 日志或资产 metadata，不进入每日 JSON。

### 7.6 Classification

分类在每日 job 中完成，按固定 taxonomy 输出：

```txt
classification score =
  topic match * 4
  + readme keyword match * 3
  + description match * 3
  + repo name match * 2
  + language hint * 1
  + package file hint * 2
  - negative keyword match * 4
```

分类规则：

- `primaryCategoryId` 取最高分分类。
- `secondaryCategoryIds` 取明显相关但不是最高分的分类。
- `confidence < 0.55` 必须归入 `unclassified`。
- 每个分类结果必须写短 `reasons` 和 `signals`。
- 人工修正后使用 `method = "manual_override"`，并优先于规则。
- 后续可以加入 LLM，但 LLM 只能在固定 taxonomy 内选择，不能自由创造分类。

### 7.7 Ranking

排序在每日 job 中完成，前端只读结果。

```txt
momentumScore =
  normalize(starsGained)

relevanceScore =
  classification.confidence * 100

freshnessScore =
  pushedAt recency + release recency

readmeScore =
  readmeSignals.score

finalScore =
  sourceRank boost
  + momentumScore * 0.45
  + relevanceScore * 0.25
  + freshnessScore * 0.15
  + readmeScore * 0.15
```

规则：

- `globalRank` 来自 Trending 原始顺序。
- `categoryRank` 来自当前分类内 `rank.score` 排序。
- `views[].repoIds` 必须按对应视图的排序顺序输出。
- `unclassified` 默认排在最后，但分类内部仍按 `starsGained` 排序。

## 8. 运行时读取逻辑

前端启动时：

1. 拉取最新 `DailyTrendPackage`。
2. 用 `taxonomy.categories` 渲染分类定义。
3. 有 `views` 时用 `views` 渲染侧栏和分类列表。
4. 用 `repos` map 按 `repoIds` 找 repo 卡片数据。
5. 用户选中 repo 后，优先读取本地 `readme_cache`。
6. 如果没有缓存，用 `readmeRef.rawUrl` 或 GitHub REST `/readme` 动态抓 README。
7. 动态抓取成功后写入 SQLite `readme_cache`。
8. 如果没有 `views`，客户端按 `classification.primaryCategoryId` 分组并按 `rank.score` 排序。
9. 卡片封面直接使用 `visual.thumbUrl` 或 `visual.url`。
10. README 截图可以在后台 worker 生成并写入缓存，不阻塞每日 JSON 包。

## 9. 存储和发布路径

建议每日包路径：

```txt
releases/github-trending/daily/latest.json
releases/github-trending/daily/2026-06-06.json
releases/github-trending/weekly/latest.json
releases/github-trending/monthly/latest.json
```

Nextop app 本地缓存：

```txt
NEXTOP_APP_DATA_DIR/trendreader.sqlite
NEXTOP_APP_DATA_DIR/packages/daily-latest.json
NEXTOP_APP_DATA_DIR/readme-cache/{owner}-{repo}-{sha}.md
NEXTOP_APP_DATA_DIR/readme-shots/{owner}-{repo}-{sha}.png
NEXTOP_APP_DATA_DIR/visuals/{owner}-{repo}-{sha-or-prompt-hash}.png
```

## 10. 最小实现顺序

1. 先实现 `DailyTrendPackage` 类型和 Zod schema。
2. 实现 candidate source adapter：Trending HTML -> huchenme fallback -> GitHub Search fallback。
3. 实现 GitHub REST enrichment，记录 rate limit。
4. 实现 README raw fallback 和 `readmeSignals` 抽取。
5. 实现 README 第一张有效图片解析和 Agnes 生成图 fallback。
6. 实现 taxonomy rules 分类器，低置信度进 `unclassified`。
7. 实现 `rank` 和可选 `views` 生成。
8. 每日 job 输出 `latest.json` 和日期归档 JSON。
9. UI 优先读取 `views[].repoIds`；没有 `views` 时从 `repos` 自行分组。
