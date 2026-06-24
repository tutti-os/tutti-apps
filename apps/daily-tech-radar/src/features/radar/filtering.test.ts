import { describe, expect, it } from "vitest";

import { filterRadarCards, getVisibleCategories } from "./filtering";
import type { RadarCard } from "./types";

const cards: RadarCard[] = [
  {
    categories: ["AI代理", "电商自动化"],
    date: "2026-06-05",
    description: "AI agent storefront automation.",
    id: "producthunt:ph-1",
    keywords: ["AI代理", "电商自动化"],
    media: [],
    metrics: { comments: 12, votes: 345 },
    name: "SellerClaw",
    rank: 1,
    sourceLabel: "Product Hunt · #1",
    sourceUrl: "https://producthunt.com/products/seller",
    title: "SellerClaw",
    type: "producthunt",
  },
  {
    categories: ["AI代理", "开发工具", "AI"],
    date: "2026-06-05",
    description: "The agent that grows with you",
    id: "github:nousresearch-hermes-agent",
    keywords: ["agent", "quick install"],
    language: "Python",
    media: [],
    metrics: { forks: 31423, score: 118, stars: 183193 },
    name: "hermes-agent",
    owner: "NousResearch",
    rank: 1,
    sourceLabel: "GitHub · #1 · Python",
    sourceUrl: "https://github.com/NousResearch/hermes-agent",
    summary: "Self-improving AI agent with a built-in learning loop.",
    title: "NousResearch / hermes-agent",
    type: "github",
  },
];

describe("radar filtering", () => {
  it("filters by source, category, and query using prototype fields", () => {
    expect(
      filterRadarCards(cards, {
        category: "AI代理",
        query: "learning loop",
        source: "github",
      }).map((card) => card.id),
    ).toEqual(["github:nousresearch-hermes-agent"]);

    expect(
      filterRadarCards(cards, {
        category: "all",
        query: "sellerclaw",
        source: "all",
      }).map((card) => card.id),
    ).toEqual(["producthunt:ph-1"]);
  });

  it("derives category chips from currently selected source cards", () => {
    expect(getVisibleCategories(cards, { source: "github" })).toEqual([
      { count: 1, label: "AI" },
      { count: 1, label: "AI代理" },
      { count: 1, label: "开发工具" },
    ]);
  });

  it("derives category chips from cards matching the current query", () => {
    expect(
      getVisibleCategories(cards, {
        query: "sellerclaw",
        source: "all",
      }),
    ).toEqual([
      { count: 1, label: "AI代理" },
      { count: 1, label: "电商自动化" },
    ]);
  });
});
