import type { RadarCard } from "./types";

export const radarCategories = [
  "AI",
  "AI代理",
  "图像生成",
  "财务AI",
  "开发工具",
  "生产力",
  "商业智能",
  "电商自动化",
  "安全隐私",
  "健康应用",
  "内容创作",
  "开源模型",
  "其他",
] as const;

export type RadarCategory = (typeof radarCategories)[number];

const categoryRules: Array<{
  label: RadarCategory;
  patterns: string[];
}> = [
  {
    label: "AI代理",
    patterns: ["ai代理", "agent", "代理", "智能体", "autonomous"],
  },
  {
    label: "图像生成",
    patterns: ["图像", "视觉", "image", "photo", "video", "design", "生成"],
  },
  {
    label: "财务AI",
    patterns: ["财务", "金融", "投资", "cash", "finance", "revenue", "invest"],
  },
  {
    label: "开发工具",
    patterns: [
      "开发",
      "工具",
      "编程",
      "代码",
      "github",
      "api",
      "cli",
      "sdk",
      "python",
      "typescript",
      "javascript",
      "jupyter",
      "前端",
      "后端",
    ],
  },
  {
    label: "生产力",
    patterns: ["生产力", "项目管理", "写作", "笔记", "workflow", "效率"],
  },
  {
    label: "商业智能",
    patterns: ["商业智能", "analytics", "分析", "报表", "metrics", "dashboard"],
  },
  {
    label: "电商自动化",
    patterns: ["电商", "商店", "ecommerce", "shopify", "commerce", "store"],
  },
  {
    label: "安全隐私",
    patterns: ["安全", "隐私", "privacy", "security", "prompt injection"],
  },
  {
    label: "健康应用",
    patterns: ["健康", "health", "fitness", "apple health", "treadmill"],
  },
  {
    label: "内容创作",
    patterns: ["内容", "文本", "语音", "tts", "slide", "幻灯片", "创作"],
  },
  {
    label: "开源模型",
    patterns: ["开源模型", "开放权重", "open weight", "model", "模型", "moe"],
  },
  {
    label: "AI",
    patterns: ["ai", "llm", "模型", "智能", "claude", "gpt", "agent"],
  },
];

export function deriveFiniteCategories(values: Array<string | undefined>) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  const categories = categoryRules
    .filter((rule) => rule.patterns.some((pattern) => text.includes(pattern)))
    .map((rule) => rule.label);

  return unique(categories.length ? categories : ["其他"]);
}

export function categoryRank(label: string) {
  const index = radarCategories.indexOf(label as RadarCategory);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function primaryDisplayTags(card: RadarCard, limit = 3) {
  return card.categories.slice(0, limit);
}

export function secondaryDisplayTags(card: RadarCard, limit = 8) {
  return card.keywords
    .filter((keyword) => !card.categories.includes(keyword))
    .slice(0, limit);
}

function unique<T>(values: T[]) {
  return [...new Set(values.filter(Boolean))];
}
