import { getSqlite } from "@/db/client.server";
import { fetchTrendingRepos } from "@/features/github/github.server";

import { mockCategoryBoard } from "./mock-data.server";
import type {
  CategoryBoard,
  CategorySummary,
  RepoSummary,
  TrendRange,
} from "./types";

type BoardInput = {
  language: string;
  limit: number;
  since: TrendRange;
};

type BoardRow = {
  board_json: string;
};

export async function getCachedCategoryBoard(input: BoardInput) {
  const db = getSqlite();
  seedRepoTables();

  const key = snapshotKey(input);
  const row = db
    .prepare("SELECT board_json FROM category_snapshots WHERE key = ?")
    .get(key) as BoardRow | undefined;

  if (row) {
    return JSON.parse(row.board_json) as CategoryBoard;
  }

  return refreshCategoryBoardSnapshot(input);
}

export async function refreshCategoryBoardSnapshot(input: BoardInput) {
  const db = getSqlite();
  seedRepoTables();

  const board = await buildBoard(input);
  db.prepare(`
    INSERT INTO category_snapshots (
      key,
      board_json,
      captured_at,
      language,
      limit_count,
      since
    )
    VALUES (@key, @boardJson, @capturedAt, @language, @limitCount, @since)
    ON CONFLICT(key) DO UPDATE SET
      board_json = excluded.board_json,
      captured_at = excluded.captured_at
  `).run({
    boardJson: JSON.stringify(board),
    capturedAt: board.capturedAt,
    key: snapshotKey(input),
    language: input.language,
    limitCount: input.limit,
    since: input.since,
  });

  return board;
}

async function buildBoard(input: BoardInput): Promise<CategoryBoard> {
  try {
    const repos = await fetchTrendingRepos(input);
    const categories = buildLiveCategories(repos, input.limit);

    if (categories.length > 0) {
      return {
        cacheStatus: "fresh",
        capturedAt: new Date().toISOString(),
        categories,
        language: input.language,
        since: input.since,
      };
    }
  } catch (error) {
    console.warn(
      "Falling back to seeded GitHub Trending data",
      error instanceof Error ? error.message : error,
    );
  }

  const categories = rankCategories(mockCategoryBoard.categories)
    .map((category) => ({
      ...category,
      topRepos: rankRepos(filterByLanguage(category, input.language)).slice(
        0,
        input.limit,
      ),
    }))
    .filter((category) => category.topRepos.length > 0);

  return {
    cacheStatus: "fallback",
    capturedAt: new Date().toISOString(),
    categories,
    language: input.language,
    since: input.since,
  };
}

function buildLiveCategories(repos: RepoSummary[], limit: number) {
  const groups = new Map<string, CategorySummary>();

  for (const repo of repos) {
    const category = classifyRepo(repo);
    const group = groups.get(category.id) ?? {
      delta: 0,
      icon: category.icon,
      id: category.id,
      label: category.label,
      momentum: 0,
      repoCount: 0,
      tone: "trending",
      topRepos: [],
    };

    group.delta += Math.max(repo.starsGained, 0);
    group.momentum += Math.round(repo.starsGained * repo.categoryConfidence);
    group.repoCount += 1;
    group.topRepos.push({ ...repo, categoryConfidence: category.confidence });
    groups.set(category.id, group);
  }

  return rankCategories([...groups.values()])
    .map((category) => ({
      ...category,
      delta: Math.min(category.delta, 999),
      momentum: Math.min(category.momentum, 99),
      tone: category.momentum > 70 ? ("hot" as const) : ("trending" as const),
      topRepos: rankRepos(category.topRepos).slice(0, limit),
    }))
    .filter((category) => category.topRepos.length > 0);
}

function classifyRepo(repo: RepoSummary) {
  const text = [
    repo.name,
    repo.description,
    repo.language,
    ...repo.topics,
    ...repo.reasons,
  ]
    .join(" ")
    .toLowerCase();

  if (matches(text, ["llm", "agent", "model", "ai", "inference", "rag"])) {
    return {
      confidence: 0.9,
      icon: "brain",
      id: "ai-infra",
      label: "AI Infra",
    } as const;
  }
  if (
    matches(text, [
      "security",
      "vulnerability",
      "scan",
      "secret",
      "auth",
      "policy",
    ])
  ) {
    return {
      confidence: 0.86,
      icon: "shield",
      id: "security",
      label: "Security",
    } as const;
  }
  if (
    matches(text, ["database", "postgres", "sqlite", "vector", "analytics"])
  ) {
    return {
      confidence: 0.84,
      icon: "database",
      id: "data",
      label: "Data",
    } as const;
  }
  if (
    matches(text, [
      "react",
      "css",
      "frontend",
      "ui",
      "component",
      "browser",
      "web",
    ])
  ) {
    return {
      confidence: 0.82,
      icon: "layout",
      id: "frontend",
      label: "Frontend",
    } as const;
  }

  return {
    confidence: 0.76,
    icon: "terminal",
    id: "devtools",
    label: "DevTools",
  } as const;
}

function matches(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

export function rankCategories(categories: CategorySummary[]) {
  return [...categories].sort(
    (left, right) =>
      right.momentum - left.momentum ||
      right.delta - left.delta ||
      right.repoCount - left.repoCount ||
      left.label.localeCompare(right.label),
  );
}

export function rankRepos(repos: CategorySummary["topRepos"]) {
  return [...repos].sort(
    (left, right) =>
      right.starsGained - left.starsGained ||
      right.categoryConfidence - left.categoryConfidence ||
      right.stars - left.stars ||
      left.fullName.localeCompare(right.fullName),
  );
}

function filterByLanguage(category: CategorySummary, language: string) {
  if (language === "All") {
    return category.topRepos;
  }

  return category.topRepos.filter((repo) => repo.language === language);
}

function seedRepoTables() {
  const db = getSqlite();
  const capturedAt = mockCategoryBoard.capturedAt;

  const insertRepo = db.prepare(`
    INSERT INTO repos (
      id,
      owner,
      name,
      full_name,
      url,
      description,
      homepage_url,
      language,
      topics_json,
      stars,
      forks,
      license,
      default_branch,
      created_at,
      pushed_at,
      updated_at,
      fetched_at
    )
    VALUES (
      @id,
      @owner,
      @name,
      @fullName,
      @url,
      @description,
      @homepageUrl,
      @language,
      @topicsJson,
      @stars,
      @forks,
      @license,
      @defaultBranch,
      @createdAt,
      @pushedAt,
      @updatedAt,
      @fetchedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      description = excluded.description,
      language = excluded.language,
      topics_json = excluded.topics_json,
      stars = excluded.stars,
      license = excluded.license,
      fetched_at = excluded.fetched_at
  `);
  const insertTrend = db.prepare(`
    INSERT OR IGNORE INTO trend_snapshots (
      id,
      captured_at,
      language,
      rank_raw,
      repo_id,
      since,
      stars_gained
    )
    VALUES (@id, @capturedAt, @language, @rankRaw, @repoId, @since, @starsGained)
  `);
  const insertScore = db.prepare(`
    INSERT OR IGNORE INTO category_scores (
      id,
      category_id,
      confidence,
      computed_at,
      reasons_json,
      repo_id,
      score
    )
    VALUES (
      @id,
      @categoryId,
      @confidence,
      @computedAt,
      @reasonsJson,
      @repoId,
      @score
    )
  `);
  const seed = db.transaction(() => {
    for (const category of mockCategoryBoard.categories) {
      category.topRepos.forEach((repo, index) => {
        insertRepo.run({
          description: repo.description,
          createdAt: capturedAt,
          defaultBranch: "main",
          fetchedAt: capturedAt,
          forks: 0,
          fullName: repo.fullName,
          homepageUrl: null,
          id: repo.id,
          language: repo.language,
          license: repo.license,
          name: repo.name,
          owner: repo.owner,
          pushedAt: capturedAt,
          stars: repo.stars,
          topicsJson: JSON.stringify(repo.topics),
          updatedAt: capturedAt,
          url: repo.url,
        });
        insertTrend.run({
          capturedAt,
          id: `${mockCategoryBoard.since}:${category.id}:${repo.id}`,
          language: mockCategoryBoard.language,
          rankRaw: index + 1,
          repoId: repo.id,
          since: mockCategoryBoard.since,
          starsGained: repo.starsGained,
        });
        insertScore.run({
          categoryId: category.id,
          computedAt: capturedAt,
          confidence: Math.round(repo.categoryConfidence * 100),
          id: `${category.id}:${repo.id}`,
          reasonsJson: JSON.stringify(repo.reasons),
          repoId: repo.id,
          score: repo.starsGained,
        });
      });
    }
  });

  seed();
}

function snapshotKey(input: BoardInput) {
  return `${input.since}:${input.language}:${input.limit}`;
}
