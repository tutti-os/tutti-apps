import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { RadarBoard, RadarCard } from "@/features/radar/types";
import {
  AppShell,
  AppShellLoading,
  DetailDrawer,
  formatDateChipLabel,
  getDatePickerAnchorMonth,
  getDatePickerCalendarLocale,
  getGalleryImageLoadState,
} from "./app-shell";
import { Calendar } from "./ui/calendar";

const card: RadarCard = {
  categories: ["开发工具", "安全隐私"],
  date: "2026-06-05",
  description: "A local context tool for Claude.",
  id: "producthunt:minimi",
  keywords: ["AI上下文", "macOS工具"],
  media: [],
  metrics: { comments: 92, votes: 371 },
  name: "Minimi",
  rank: 2,
  sourceLabel: "Product Hunt · #2",
  sourceUrl: "https://www.producthunt.com/products/minimi",
  title: "Minimi",
  type: "producthunt",
};

const githubCard: RadarCard = {
  categories: ["AI", "AI代理"],
  date: "2026-06-05",
  description: "Self-improving AI agent with a built-in learning loop.",
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
};

describe("DetailDrawer", () => {
  it("places the source action before the detail body copy", () => {
    const html = renderToStaticMarkup(
      <DetailDrawer card={card} onClose={vi.fn()} />,
    );

    expect(html).toContain("打开来源");
    expect(html).not.toContain("加入收藏");
    expect(html).not.toContain("已收藏");
    expect(html.indexOf("打开来源")).toBeLessThan(
      html.indexOf(card.description),
    );
  });

  it("does not show visible loading for an image that has already loaded", () => {
    const loadedImageSrcs = new Set(["https://example.com/loaded.avif"]);

    expect(
      getGalleryImageLoadState(
        "https://example.com/loaded.avif",
        loadedImageSrcs,
      ),
    ).toEqual({
      imageIsLoaded: true,
      shouldPreload: false,
    });
  });

  it("preloads uncached images before allowing the loading indicator", () => {
    const loadedImageSrcs = new Set<string>();

    expect(
      getGalleryImageLoadState(
        "https://example.com/slow.avif",
        loadedImageSrcs,
      ),
    ).toEqual({
      imageIsLoaded: false,
      shouldPreload: true,
    });
    expect(
      getGalleryImageLoadState(
        "https://example.com/from-browser-cache.avif",
        loadedImageSrcs,
        { complete: true, naturalWidth: 1200 },
      ),
    ).toEqual({
      imageIsLoaded: true,
      shouldPreload: false,
    });
  });
});

describe("AppShell", () => {
  it("formats date labels without repeating the day-before-yesterday label", () => {
    expect(formatDateChipLabel("2026-06-08", "2026-06-08")).toBe("今天");
    expect(formatDateChipLabel("2026-06-07", "2026-06-08")).toBe("昨天");
    expect(formatDateChipLabel("2026-06-06", "2026-06-08")).toBe("前天");
    expect(formatDateChipLabel("2026-06-05", "2026-06-08")).toBe("3 天前");
    expect(formatDateChipLabel("2026-06-08", "2026-06-08", "en-US")).toBe(
      "Today",
    );
    expect(formatDateChipLabel("2026-06-07", "2026-06-08", "en-US")).toBe(
      "Yesterday",
    );
    expect(formatDateChipLabel("2026-06-06", "2026-06-08", "en-US")).toBe(
      "2 days ago",
    );
  });

  it("anchors the date picker month to the selected date", () => {
    const month = getDatePickerAnchorMonth("2026-05-31", [
      "2026-11-30",
      "2026-05-31",
    ]);

    expect(month?.getFullYear()).toBe(2026);
    expect(month?.getMonth()).toBe(4);
    expect(month?.getDate()).toBe(31);
  });

  it("styles the selected date picker day", () => {
    const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

    expect(css).toContain("--color-primary: var(--primary)");
    expect(css).toContain('[data-selected-single="true"]');
    expect(css).toContain("background: var(--primary)");
  });

  it("uses the shadcn button composition for the date picker trigger", () => {
    const board: RadarBoard = {
      availableDates: ["2026-06-06", "2026-06-05"],
      cards: [card],
      categories: [{ count: 1, label: "开发工具" }],
      date: "2026-06-06",
      generatedAt: "2026-06-06T00:00:00.000Z",
      locale: "zh-CN",
      metrics: {
        aiPercent: 100,
        githubCount: 0,
        productHuntCount: 1,
      },
    };

    const html = renderToStaticMarkup(
      <AppShell
        board={board}
        searchState={{
          category: "all",
          date: "2026-06-05",
          query: "",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).toContain("radar-date-trigger");
    expect(html).toContain('data-slot="popover-trigger"');
    expect(html).toContain('data-variant="outline"');
    expect(html).toContain("inline-flex shrink-0 items-center");
  });

  it("uses shadcn select composition for calendar month and year controls", () => {
    const html = renderToStaticMarkup(
      <Calendar
        captionLayout="dropdown"
        endMonth={new Date(2026, 11, 31)}
        month={new Date(2026, 4, 1)}
        startMonth={new Date(2026, 0, 1)}
      />,
    );

    expect(html).toContain('data-slot="select-trigger"');
    expect(html).toContain('data-slot="select-value"');
    expect(html).toContain('<select aria-hidden="true"');
  });

  it("places the year before the month in every date picker caption locale", () => {
    for (const locale of ["zh-CN", "en-US"] as const) {
      const html = renderToStaticMarkup(
        <Calendar
          captionLayout="dropdown"
          endMonth={new Date(2026, 11, 31)}
          locale={getDatePickerCalendarLocale(locale)}
          month={new Date(2026, 4, 1)}
          startMonth={new Date(2026, 0, 1)}
        />,
      );

      const yearIndex = html.indexOf("rdp-years_dropdown");
      const monthIndex = html.indexOf("rdp-months_dropdown");

      expect(yearIndex).toBeGreaterThan(-1);
      expect(monthIndex).toBeGreaterThan(-1);
      expect(yearIndex).toBeLessThan(monthIndex);
    }
  });

  it("renders a loading shell before radar data is available", () => {
    const html = renderToStaticMarkup(
      <AppShellLoading
        locale="zh-CN"
        searchState={{
          category: "all",
          date: "",
          query: "",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).toContain("每日产品雷达");
    expect(html).toContain("radar-card-skeleton");
  });

  it("does not advertise favorites while the favorite action is hidden", () => {
    const board: RadarBoard = {
      availableDates: ["2026-06-05"],
      cards: [card],
      categories: [{ count: 1, label: "开发工具" }],
      date: "2026-06-05",
      generatedAt: "2026-06-06T00:00:00.000Z",
      locale: "zh-CN",
      metrics: {
        aiPercent: 100,
        githubCount: 0,
        productHuntCount: 1,
      },
    };

    const html = renderToStaticMarkup(
      <AppShell
        board={board}
        searchState={{
          category: "all",
          date: "2026-06-05",
          query: "",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).not.toContain("可收藏");
    expect(html).toContain("371 票");
    expect(html).toContain("92 评论");
    expect(html).not.toContain("371 votes");
    expect(html).not.toContain("92 comments");
  });

  it("updates category chips for the current query while keeping signal metrics global", () => {
    const board: RadarBoard = {
      availableDates: ["2026-06-05"],
      cards: [card, githubCard],
      categories: [
        { count: 1, label: "AI" },
        { count: 1, label: "AI代理" },
        { count: 1, label: "开发工具" },
        { count: 1, label: "安全隐私" },
      ],
      date: "2026-06-05",
      generatedAt: "2026-06-06T00:00:00.000Z",
      locale: "zh-CN",
      metrics: {
        aiPercent: 92,
        githubCount: 16,
        productHuntCount: 20,
      },
    };

    const html = renderToStaticMarkup(
      <AppShell
        board={board}
        searchState={{
          category: "all",
          date: "2026-06-05",
          query: "not-a-real-card",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).toContain("没有匹配的卡片");
    expect(html).toContain("<b>20</b><span>新品发布</span>");
    expect(html).toContain("<b>16</b><span>GitHub 仓库</span>");
    expect(html).toContain("<b>92%</b><span>AI 相关</span>");
    expect(html).not.toContain("开发工具 1");
    expect(html).not.toContain("安全隐私 1");
    expect(html).not.toContain("AI代理 1");
  });

  it("renders the shell chrome in English while preserving raw category filters", () => {
    const board: RadarBoard = {
      availableDates: ["2026-06-05"],
      cards: [card],
      categories: [{ count: 1, label: "开发工具" }],
      date: "2026-06-05",
      generatedAt: "2026-06-06T00:00:00.000Z",
      locale: "en-US",
      metrics: {
        aiPercent: 100,
        githubCount: 0,
        productHuntCount: 1,
      },
    };

    const html = renderToStaticMarkup(
      <AppShell
        board={board}
        searchState={{
          category: "all",
          date: "2026-06-05",
          locale: "en-US",
          query: "",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).toContain("Daily Product Radar");
    expect(html).toContain("Discover new products");
    expect(html).toContain("Developer Tools 1");
    expect(html).toContain("Open Minimi");
    expect(html).not.toContain("每日产品雷达");
    expect(html).not.toContain("开发工具 1");
  });

  it("does not render the current scope sidebar card", () => {
    const board: RadarBoard = {
      availableDates: ["2026-06-05"],
      cards: [card],
      categories: [{ count: 1, label: "开发工具" }],
      date: "2026-06-05",
      generatedAt: "2026-06-06T00:00:00.000Z",
      locale: "zh-CN",
      metrics: {
        aiPercent: 100,
        githubCount: 0,
        productHuntCount: 1,
      },
    };

    const html = renderToStaticMarkup(
      <AppShell
        board={board}
        searchState={{
          category: "all",
          date: "2026-06-05",
          query: "",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).not.toContain("当前范围");
    expect(html).not.toContain("正在查看");
  });

  it("limits quick dates to the latest five entries", () => {
    const board: RadarBoard = {
      availableDates: [
        "2026-06-06",
        "2026-06-05",
        "2026-06-04",
        "2026-06-03",
        "2026-06-02",
        "2026-06-01",
      ],
      cards: [card],
      categories: [{ count: 1, label: "开发工具" }],
      date: "2026-06-06",
      generatedAt: "2026-06-06T00:00:00.000Z",
      locale: "zh-CN",
      metrics: {
        aiPercent: 100,
        githubCount: 0,
        productHuntCount: 1,
      },
    };

    const html = renderToStaticMarkup(
      <AppShell
        board={board}
        searchState={{
          category: "all",
          date: "2026-06-02",
          query: "",
          source: "all",
          view: "grid",
        }}
        onSearchStateChange={vi.fn()}
      />,
    );

    expect(html).toContain("更多日期");
    expect(html).toContain("06-02");
    expect(html).not.toContain("06-01");
  });
});
