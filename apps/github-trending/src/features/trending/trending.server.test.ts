import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/features/github/github.server", () => ({
  fetchReadmeMarkdown: vi.fn(),
  fetchTrendingRepos: vi.fn(),
}));

import { formatUtcTime } from "@/lib/format";

import { fetchTrendingRepos } from "../github/github.server";
import { getMockReadme } from "../readme/mock-readmes.server";
import {
  getCachedCategoryBoard,
  rankCategories,
  rankRepos,
  refreshCategoryBoardSnapshot,
} from "./trending.server";
import type { CategorySummary, RepoSummary } from "./types";

function repo(input: Partial<RepoSummary> & Pick<RepoSummary, "id">) {
  return {
    categoryConfidence: 0.5,
    description: "Repository",
    fullName: input.id,
    language: "TypeScript",
    languageColor: "bg-chart-3",
    license: "MIT",
    name: input.id,
    owner: "test",
    readmePreview: {
      badges: [],
      codePreview: "pnpm install",
      headings: [],
      title: input.id,
    },
    reasons: [],
    stars: 100,
    starsGained: 10,
    topics: [],
    url: `https://github.com/test/${input.id}`,
    ...input,
  } satisfies RepoSummary;
}

function category(
  input: Partial<CategorySummary> & Pick<CategorySummary, "id" | "label">,
) {
  return {
    delta: 1,
    icon: "terminal",
    momentum: 1,
    repoCount: 1,
    tone: "trending",
    topRepos: [],
    ...input,
  } satisfies CategorySummary;
}

describe("trending ranking", () => {
  it("sorts categories by momentum before repository count", () => {
    const categories = rankCategories([
      category({ id: "large", label: "Large", momentum: 20, repoCount: 900 }),
      category({ id: "hot", label: "Hot", momentum: 90, repoCount: 10 }),
    ]);

    expect(categories.map((item) => item.id)).toEqual(["hot", "large"]);
  });

  it("sorts repositories by growth, confidence, and total stars", () => {
    const repos = rankRepos([
      repo({ id: "steady", categoryConfidence: 0.99, stars: 10_000 }),
      repo({ id: "fast", categoryConfidence: 0.5, starsGained: 200 }),
      repo({ id: "confident", categoryConfidence: 0.95, starsGained: 200 }),
    ]);

    expect(repos.map((item) => item.id)).toEqual([
      "confident",
      "fast",
      "steady",
    ]);
  });
});

describe("formatUtcTime", () => {
  it("formats server and browser safe UTC display text", () => {
    expect(formatUtcTime("2026-06-05T08:05:00.000Z")).toBe("08:05 UTC");
  });
});

describe("category board fallback", () => {
  beforeAll(() => {
    process.env.GITHUB_TRENDING_DATA_DIR = mkdtempSync(
      path.join(tmpdir(), "trendreader-test-"),
    );
  });

  it("persists and reuses fallback snapshots when GitHub Trending fails", async () => {
    vi.mocked(fetchTrendingRepos).mockRejectedValueOnce(
      new Error("GitHub parser failed"),
    );

    const input = { language: "All", limit: 2, since: "daily" as const };
    const refreshed = await refreshCategoryBoardSnapshot(input);
    const cached = await getCachedCategoryBoard(input);

    expect(refreshed.cacheStatus).toBe("fallback");
    expect(refreshed.categories.length).toBeGreaterThan(0);
    expect(cached).toEqual(refreshed);
  });
});

describe("mock README fallback", () => {
  it("does not borrow another repository title when the repo is unknown", () => {
    const readme = getMockReadme("unknown-owner", "unknown-repo");

    expect(readme.repo).toBe("unknown-owner/unknown-repo");
    expect(readme.markdown).toContain("# unknown-repo");
    expect(readme.markdown).toContain(
      "git clone https://github.com/unknown-owner/unknown-repo",
    );
  });
});
