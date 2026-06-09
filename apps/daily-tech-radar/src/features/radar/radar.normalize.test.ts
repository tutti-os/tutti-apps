import { describe, expect, it } from "vitest";

import {
  buildRadarBoard,
  normalizeGitHubRepo,
  normalizeProductHuntItem,
} from "./radar.normalize";
import type { DailyTrendFeed, DailyTrendPackage, TrendIndex } from "./types";

const productIndex: TrendIndex = {
  dates: ["2026-06-05", "2026-06-04"],
  generatedAt: "2026-06-06T01:00:00.000Z",
  latestDate: "2026-06-05",
  locale: "zh-CN",
  schemaVersion: "daily-tech-radar.index.v1",
  source: "producthunt",
};

const githubIndex: TrendIndex = {
  dates: ["2026-06-05", "2026-06-03"],
  generatedAt: "2026-06-06T01:30:00.000Z",
  latestDate: "2026-06-05",
  locale: "zh-CN",
  schemaVersion: "daily-tech-radar.index.v1",
  source: "github",
};

const productFeed: DailyTrendFeed = {
  date: "2026-06-05",
  generatedAt: "2026-06-06T01:00:00.000Z",
  items: [
    {
      assets: {
        icon: "https://example.com/icon.png",
        media: [{ type: "image", url: "https://example.com/media.png" }],
        thumbnail: null,
      },
      description: "AI agent storefront automation.",
      id: "ph-1",
      keywords: ["AI代理", "电商自动化"],
      links: {
        homepage: "https://seller.example.com",
        source: "https://producthunt.com/products/seller",
      },
      metrics: { comments: 12, votes: 345 },
      name: "SellerClaw",
      rank: 1,
      raw: {},
      tagline: "一支运行您跨渠道商店的AI代理团队",
    },
  ],
  locale: "zh-CN",
  schemaVersion: "daily-tech-radar.v1",
  source: "producthunt",
  sourceTimezone: "America/Los_Angeles",
};

const githubPackage: DailyTrendPackage = {
  expiresAt: "2026-06-07T01:00:00.000Z",
  generatedAt: "2026-06-06T01:30:00.000Z",
  locale: "zh-CN",
  packageId: "github-daily-All-2026-06-05",
  repos: [
    {
      avatarUrl: "https://github.com/NousResearch.png",
      classification: {
        confidence: 0.7,
        method: "rules",
        primaryCategoryId: "ai",
        reasons: ["Matched agent"],
        secondaryCategoryIds: ["tools"],
        signals: ["agent"],
      },
      homepageUrl: null,
      id: "nousresearch-hermes-agent",
      metadata: {
        defaultBranch: "main",
        description: "The agent that grows with you",
        forks: 31423,
        language: "Python",
        license: null,
        pushedAt: null,
        stars: 183193,
        topLanguages: ["Python"],
        topics: ["agent"],
      },
      name: "hermes-agent",
      owner: "NousResearch",
      rank: {
        categoryRank: 1,
        globalRank: 1,
        score: 118,
      },
      readmeRef: {
        rawUrl:
          "https://raw.githubusercontent.com/NousResearch/hermes-agent/main/README.md",
        status: "available",
      },
      readmeSignals: {
        commands: ["pip install hermes"],
        headings: ["Hermes Agent"],
        keywords: ["agent", "quick install"],
        score: 100,
        summary: "Self-improving AI agent with a built-in learning loop.",
        title: "Hermes Agent",
      },
      source: {
        primary: "github_trending_html",
        sourceRank: 1,
        starsGained: 1845,
      },
      url: "https://github.com/NousResearch/hermes-agent",
      visual: {
        alt: "Hermes Agent",
        kind: "readme_image",
        sourceUrl: "https://example.com/banner.png",
        thumbUrl: "https://example.com/banner-thumb.png",
        url: "https://example.com/banner.png",
      },
    },
  ],
  schemaVersion: "trendreader.daily.v1",
  sourceWindow: {
    language: "All",
    since: "daily",
    spokenLanguageCode: null,
  },
  sources: [],
  taxonomy: {
    categories: [
      {
        icon: "bot",
        id: "ai",
        label: "AI",
        order: 10,
      },
      {
        icon: "wrench",
        id: "tools",
        label: "工具",
        order: 20,
      },
    ],
    generatedAt: "2026-06-06T01:30:00.000Z",
    version: "test",
  },
};

describe("radar normalization", () => {
  it("maps Product Hunt feed items into prototype cards", () => {
    const [item] = productFeed.items;
    expect(item).toBeDefined();
    const card = normalizeProductHuntItem(
      item as NonNullable<typeof item>,
      productFeed,
    );

    expect(card).toMatchObject({
      categories: ["AI代理", "电商自动化", "AI"],
      coverUrl: "https://example.com/media.png",
      description: "AI agent storefront automation.",
      iconUrl: "https://example.com/icon.png",
      id: "producthunt:ph-1",
      media: [{ type: "image", url: "https://example.com/media.png" }],
      metrics: { comments: 12, votes: 345 },
      name: "SellerClaw",
      rank: 1,
      sourceLabel: "Product Hunt · #1",
      sourceUrl: "https://producthunt.com/products/seller",
      tagline: "一支运行您跨渠道商店的AI代理团队",
      title: "SellerClaw",
      type: "producthunt",
    });
  });

  it("maps GitHub repos into prototype cards", () => {
    const [repo] = githubPackage.repos;
    expect(repo).toBeDefined();
    const card = normalizeGitHubRepo(
      repo as NonNullable<typeof repo>,
      githubPackage,
    );

    expect(card).toMatchObject({
      categories: ["AI代理", "开发工具", "AI"],
      coverStyle: "semantic",
      coverUrl: null,
      description: "Self-improving AI agent with a built-in learning loop.",
      iconUrl: "https://github.com/NousResearch.png",
      id: "github:nousresearch-hermes-agent",
      language: "Python",
      media: [],
      metrics: { forks: 31423, score: 118, stars: 183193, starsGained: 1845 },
      name: "hermes-agent",
      owner: "NousResearch",
      rank: 1,
      sourceLabel: "GitHub · #1 · Python",
      sourceUrl: "https://github.com/NousResearch/hermes-agent",
      summary: "The agent that grows with you",
      title: "NousResearch / hermes-agent",
      type: "github",
    });
  });

  it("keeps generated GitHub product covers when the data package provides one", () => {
    const [baseRepo] = githubPackage.repos;
    expect(baseRepo).toBeDefined();
    const repo = {
      ...(baseRepo as NonNullable<typeof baseRepo>),
      visual: {
        alt: "Generated product cover for Hermes Agent",
        kind: "agnes_generated" as const,
        sourceUrl: null,
        thumbUrl:
          "https://storage.googleapis.com/agnes-aigc-test/images/text-to-image/cover.png",
        url: "https://storage.googleapis.com/agnes-aigc-test/images/text-to-image/cover.png",
      },
    };

    const card = normalizeGitHubRepo(repo, githubPackage);

    expect(card).toMatchObject({
      coverStyle: "image",
      coverUrl:
        "https://storage.googleapis.com/agnes-aigc-test/images/text-to-image/cover.png",
      media: [
        {
          type: "image",
          url: "https://storage.googleapis.com/agnes-aigc-test/images/text-to-image/cover.png",
        },
      ],
    });
  });

  it("builds a board with merged dates, category counts, and AI share", () => {
    const board = buildRadarBoard({
      date: "2026-06-05",
      githubIndex,
      githubPackage,
      locale: "zh-CN",
      productFeed,
      productIndex,
    });

    expect(board.availableDates).toEqual([
      "2026-06-05",
      "2026-06-04",
      "2026-06-03",
    ]);
    expect(board.metrics).toEqual({
      aiPercent: 100,
      githubCount: 1,
      productHuntCount: 1,
    });
    expect(board.categories).toEqual([
      { count: 2, label: "AI" },
      { count: 2, label: "AI代理" },
      { count: 1, label: "开发工具" },
      { count: 1, label: "电商自动化" },
    ]);
  });
});
