import type {
  DailyTrendFeed,
  DailyTrendFeedItem,
  DailyTrendPackage,
  GitHubTrendRepo,
  Locale,
  RadarBoard,
  RadarCard,
  TrendIndex,
} from "./types";
import { categoryRank, deriveFiniteCategories } from "./taxonomy";

type BoardInput = {
  date: string;
  githubIndex?: TrendIndex | null;
  githubPackage?: DailyTrendPackage | null;
  locale: Locale;
  productFeed?: DailyTrendFeed | null;
  productIndex?: TrendIndex | null;
};

const aiPatterns = ["ai", "agent", "llm", "模型", "智能"];
export function normalizeProductHuntItem(
  item: DailyTrendFeedItem,
  feed: DailyTrendFeed,
): RadarCard {
  const media = item.assets.media.filter((asset) => Boolean(asset.url));
  const imageMedia = media.find((asset) => asset.type === "image") ?? media[0];
  const keywords = unique(item.keywords);
  const categories = deriveFiniteCategories([
    item.name,
    item.tagline,
    item.description,
    ...keywords,
  ]);

  return {
    categories,
    coverUrl: imageMedia?.url ?? item.assets.thumbnail ?? null,
    date: feed.date,
    description: item.description,
    homepageUrl: item.links.homepage ?? null,
    iconUrl: item.assets.icon ?? null,
    id: `producthunt:${item.id}`,
    keywords,
    media,
    metrics: compactMetrics({
      comments: item.metrics.comments,
      votes: item.metrics.votes,
    }),
    name: item.name,
    rank: item.rank,
    sourceLabel: `Product Hunt · #${item.rank}`,
    sourceUrl: item.links.source,
    tagline: item.tagline,
    title: item.name,
    type: "producthunt",
  };
}

export function normalizeGitHubRepo(
  repo: GitHubTrendRepo,
  trendPackage: DailyTrendPackage,
): RadarCard {
  const taxonomy = new Map(
    trendPackage.taxonomy.categories.map((category) => [
      category.id,
      category.label,
    ]),
  );
  const primaryCategory =
    taxonomy.get(repo.classification.primaryCategoryId) ??
    repo.classification.primaryCategoryId;
  const secondaryCategories = repo.classification.secondaryCategoryIds.map(
    (id) => taxonomy.get(id) ?? id,
  );
  const keywords = unique([
    ...repo.readmeSignals.keywords,
    ...repo.metadata.topics,
    ...repo.classification.signals,
  ]);
  const categories = deriveFiniteCategories([
      primaryCategory,
      ...secondaryCategories,
      repo.name,
      repo.owner,
      repo.metadata.description,
      repo.readmeSignals.summary ?? undefined,
      repo.metadata.language,
      ...keywords,
    ]);
  const coverUrl =
    repo.visual.thumbUrl ??
    repo.visual.url ??
    `https://opengraph.githubassets.com/daily-tech-radar/${repo.owner}/${repo.name}`;
  const score = repo.rank.score;
  const description = repo.readmeSignals.summary || repo.metadata.description;
  const summary =
    repo.readmeSignals.summary && repo.readmeSignals.summary !== repo.metadata.description
      ? repo.metadata.description
      : undefined;

  return {
    categories,
    coverUrl,
    date: trendPackage.packageId.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "",
    description,
    homepageUrl: repo.homepageUrl ?? null,
    iconUrl: repo.avatarUrl ?? null,
    id: `github:${repo.id}`,
    keywords,
    language: repo.metadata.language,
    media: coverUrl
      ? [
          {
            type: "image",
            url: coverUrl,
          },
        ]
      : [],
    metrics: compactMetrics({
      forks: repo.metadata.forks,
      score,
      stars: repo.metadata.stars,
      starsGained: repo.source.starsGained,
    }),
    name: repo.name,
    owner: repo.owner,
    rank: repo.rank.globalRank,
    sourceLabel: `GitHub · #${repo.rank.globalRank} · ${
      repo.metadata.language || "Repo"
    }`,
    sourceUrl: repo.url,
    ...(summary ? { summary } : {}),
    title: `${repo.owner} / ${repo.name}`,
    type: "github",
  };
}

export function buildRadarBoard(input: BoardInput): RadarBoard {
  const productCards =
    input.productFeed?.items.map((item) =>
      normalizeProductHuntItem(item, input.productFeed as DailyTrendFeed),
    ) ?? [];
  const githubCards =
    input.githubPackage?.repos.map((repo) =>
      normalizeGitHubRepo(repo, input.githubPackage as DailyTrendPackage),
    ) ?? [];
  const cards = [...productCards, ...githubCards].sort(
    (left, right) =>
      sourceOrder(left.type) - sourceOrder(right.type) || left.rank - right.rank,
  );

  return {
    availableDates: mergeDates(input.productIndex, input.githubIndex),
    cards,
    categories: buildCategoryCounts(cards),
    date: input.date,
    generatedAt:
      input.githubPackage?.generatedAt ??
      input.productFeed?.generatedAt ??
      input.githubIndex?.generatedAt ??
      input.productIndex?.generatedAt ??
      new Date(0).toISOString(),
    locale: input.locale,
    metrics: {
      aiPercent: calculateAiPercent(cards),
      githubCount: githubCards.length,
      productHuntCount: productCards.length,
    },
  };
}

export function mergeDates(
  productIndex?: TrendIndex | null,
  githubIndex?: TrendIndex | null,
) {
  return unique([...(productIndex?.dates ?? []), ...(githubIndex?.dates ?? [])])
    .filter(Boolean)
    .sort((left, right) => right.localeCompare(left));
}

export function buildCategoryCounts(cards: RadarCard[]) {
  const counts = new Map<string, number>();

  for (const card of cards) {
    const categories = new Set(card.categories);
    if (isAiCard(card)) {
      categories.add("AI");
    }
    for (const category of categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        categoryRank(left.label) - categoryRank(right.label) ||
        left.label.localeCompare(right.label, "zh-CN"),
    );
}

export function calculateAiPercent(cards: RadarCard[]) {
  if (cards.length === 0) {
    return 0;
  }

  const aiCount = cards.filter(isAiCard).length;
  return Math.round((aiCount / cards.length) * 100);
}

export function isAiCard(card: RadarCard) {
  const text = [
    card.name,
    card.owner,
    card.title,
    card.tagline,
    card.description,
    card.summary,
    card.language,
    ...card.keywords,
    ...card.categories,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return aiPatterns.some((pattern) => text.includes(pattern));
}

function sourceOrder(type: RadarCard["type"]) {
  return type === "producthunt" ? 0 : 1;
}

function unique<T>(values: T[]) {
  return [...new Set(values.filter(Boolean))];
}

function compactMetrics(metrics: Record<string, number | undefined>) {
  return Object.fromEntries(
    Object.entries(metrics).filter(([, value]) => value !== undefined),
  ) as RadarCard["metrics"];
}
