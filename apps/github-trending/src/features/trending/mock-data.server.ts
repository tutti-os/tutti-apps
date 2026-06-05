import type { CategoryBoard, CategorySummary, RepoSummary } from "./types";

function repo(
  input: Omit<RepoSummary, "id" | "fullName" | "url">,
): RepoSummary {
  return {
    ...input,
    fullName: `${input.owner} / ${input.name}`,
    id: `${input.owner}-${input.name}`.replaceAll("/", "-"),
    url: `https://github.com/${input.owner}/${input.name}`,
  };
}

const aiInfraRepos: RepoSummary[] = [
  repo({
    owner: "run-llama",
    name: "llama-stack",
    description: "Production-ready stack for building LLM applications.",
    language: "Python",
    languageColor: "bg-chart-3",
    topics: ["stack", "llm", "agents"],
    stars: 2100,
    starsGained: 2100,
    license: "MIT",
    categoryConfidence: 0.93,
    reasons: ["topic:llm", "readme:agents", "description:production-ready"],
    readmePreview: {
      title: "Llama Stack",
      badges: ["build", "passing", "v0.1.3"],
      codePreview: "pip install llama-stack",
      headings: ["Overview", "Key features", "Quick start"],
    },
  }),
  repo({
    owner: "microsoft",
    name: "bitnet",
    description: "1-bit LLMs that run anywhere.",
    language: "Python",
    languageColor: "bg-chart-3",
    topics: ["llm", "1bit", "inference"],
    stars: 1500,
    starsGained: 1500,
    license: "MIT",
    categoryConfidence: 0.88,
    reasons: ["topic:llm", "description:inference", "readme:benchmarks"],
    readmePreview: {
      title: "BitNet",
      badges: ["python", "models", "research"],
      codePreview: "python setup_env.py",
      headings: ["Introduction", "Inference", "Models"],
    },
  }),
  repo({
    owner: "vllm-project",
    name: "vllm",
    description: "High-throughput LLM inference engine.",
    language: "Python",
    languageColor: "bg-chart-3",
    topics: ["inference", "llm", "serving"],
    stars: 1200,
    starsGained: 1200,
    license: "Apache-2.0",
    categoryConfidence: 0.91,
    reasons: ["topic:inference", "topic:serving", "readme:quickstart"],
    readmePreview: {
      title: "vLLM",
      badges: ["docs", "cuda", "serving"],
      codePreview: "pip install vllm",
      headings: [
        "Install",
        "Offline batched inference",
        "OpenAI-compatible server",
      ],
    },
  }),
  repo({
    owner: "berriai",
    name: "litellm",
    description: "Unified API to call 100+ LLMs.",
    language: "Python",
    languageColor: "bg-chart-3",
    topics: ["llm", "api", "proxy"],
    stars: 860,
    starsGained: 860,
    license: "MIT",
    categoryConfidence: 0.85,
    reasons: ["topic:proxy", "readme:providers", "description:api"],
    readmePreview: {
      title: "LiteLLM",
      badges: ["proxy", "routing", "spend"],
      codePreview: "pip install litellm",
      headings: ["Usage", "Proxy server", "Supported providers"],
    },
  }),
];

const devToolRepos: RepoSummary[] = [
  repo({
    owner: "shadcn-ui",
    name: "shadcn-ui",
    description: "Beautifully designed components built with Radix UI.",
    language: "TypeScript",
    languageColor: "bg-chart-3",
    topics: ["react", "components", "ui"],
    stars: 2300,
    starsGained: 2300,
    license: "MIT",
    categoryConfidence: 0.9,
    reasons: ["topic:components", "readme:registry", "description:ui"],
    readmePreview: {
      title: "shadcn/ui",
      badges: ["components", "themes", "cli"],
      codePreview: "pnpm dlx shadcn@latest add button",
      headings: ["Documentation", "Components", "Themes"],
    },
  }),
  repo({
    owner: "biomejs",
    name: "biome",
    description: "Fast formatter and linter for modern web projects.",
    language: "TypeScript",
    languageColor: "bg-chart-3",
    topics: ["linter", "formatter", "tooling"],
    stars: 1600,
    starsGained: 1600,
    license: "MIT",
    categoryConfidence: 0.87,
    reasons: ["topic:formatter", "description:linter", "readme:install"],
    readmePreview: {
      title: "Biome",
      badges: ["formatter", "linter", "fast"],
      codePreview: "pnpm add --save-dev @biomejs/biome",
      headings: ["Getting started", "Formatter", "Linter"],
    },
  }),
  repo({
    owner: "antfu",
    name: "oxlint",
    description: "Blazing fast JavaScript and TypeScript linter.",
    language: "Rust",
    languageColor: "bg-chart-5",
    topics: ["linter", "performance", "rust"],
    stars: 1100,
    starsGained: 1100,
    license: "MIT",
    categoryConfidence: 0.86,
    reasons: ["topic:linter", "language:rust", "readme:migration"],
    readmePreview: {
      title: "Oxlint",
      badges: ["rust", "linter", "eslint"],
      codePreview: "npx oxlint@latest",
      headings: ["Usage", "Configuration", "Rules"],
    },
  }),
];

const frontendRepos: RepoSummary[] = [
  repo({
    owner: "facebook",
    name: "react",
    description: "The library for web and native user interfaces.",
    language: "JavaScript",
    languageColor: "bg-chart-4",
    topics: ["react", "ui", "library"],
    stars: 1800,
    starsGained: 1800,
    license: "MIT",
    categoryConfidence: 0.84,
    reasons: ["topic:react", "description:user interfaces", "readme:docs"],
    readmePreview: {
      title: "React",
      badges: ["docs", "compiler", "server"],
      codePreview: "npm install react react-dom",
      headings: ["Documentation", "Examples", "Contributing"],
    },
  }),
  repo({
    owner: "tailwindlabs",
    name: "tailwindcss",
    description: "Utility-first CSS framework for rapid UI development.",
    language: "TypeScript",
    languageColor: "bg-chart-3",
    topics: ["css", "design-system", "tailwind"],
    stars: 1300,
    starsGained: 1300,
    license: "MIT",
    categoryConfidence: 0.82,
    reasons: ["topic:css", "description:utility-first", "readme:install"],
    readmePreview: {
      title: "Tailwind CSS",
      badges: ["v4", "css", "utilities"],
      codePreview: "npm install tailwindcss @tailwindcss/vite",
      headings: ["Installation", "Editor setup", "Functions"],
    },
  }),
  repo({
    owner: "vitejs",
    name: "vite",
    description: "Next generation frontend tooling.",
    language: "TypeScript",
    languageColor: "bg-chart-3",
    topics: ["vite", "bundler", "dev-server"],
    stars: 970,
    starsGained: 970,
    license: "MIT",
    categoryConfidence: 0.78,
    reasons: ["topic:bundler", "description:frontend", "readme:plugin"],
    readmePreview: {
      title: "Vite",
      badges: ["hmr", "plugins", "build"],
      codePreview: "npm create vite@latest",
      headings: ["Getting started", "Features", "Plugins"],
    },
  }),
];

export const mockCategories: CategorySummary[] = [
  {
    id: "ai-infra",
    delta: 48,
    icon: "brain",
    label: "AI Infra",
    momentum: 92,
    repoCount: 342,
    tone: "hot",
    topRepos: aiInfraRepos,
  },
  {
    id: "devtools",
    delta: 36,
    icon: "terminal",
    label: "DevTools",
    momentum: 86,
    repoCount: 512,
    tone: "trending",
    topRepos: devToolRepos,
  },
  {
    id: "frontend",
    delta: 22,
    icon: "layout",
    label: "Frontend",
    momentum: 74,
    repoCount: 387,
    tone: "trending",
    topRepos: frontendRepos,
  },
];

export const mockCategoryBoard: CategoryBoard = {
  cacheStatus: "fresh",
  capturedAt: "2026-06-05T08:45:00Z",
  categories: mockCategories,
  language: "All",
  since: "daily",
};

export function findMockRepo(repoId?: string) {
  if (!repoId) {
    return undefined;
  }

  const repos = mockCategories.flatMap((category) => category.topRepos);
  return repos.find((repoItem) => repoItem.id === repoId);
}
