import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import type { RadarBoard, RadarCard } from "@/features/radar/types";
import { AppShell, DetailDrawer, formatDateChipLabel } from "./app-shell";

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
});

describe("AppShell", () => {
  it("formats date labels without repeating the day-before-yesterday label", () => {
    expect(formatDateChipLabel("2026-06-08", "2026-06-08")).toBe("今天");
    expect(formatDateChipLabel("2026-06-07", "2026-06-08")).toBe("昨天");
    expect(formatDateChipLabel("2026-06-06", "2026-06-08")).toBe("前天");
    expect(formatDateChipLabel("2026-06-05", "2026-06-08")).toBe("3 天前");
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
