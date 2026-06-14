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
    expect(
      buildItemData(board, { id: "producthunt:2", locale: "en-US" }),
    ).toMatchObject({
      card: {
        id: "producthunt:2",
        title: "Plan Day",
      },
      found: true,
    });
    expect(
      buildItemData(board, { id: "missing", locale: "en-US" }),
    ).toMatchObject({
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
        input: {
          locale: "zh-CN",
          source: "github",
        },
        schemaVersion: "tutti.app.cli.invoke.v1",
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
