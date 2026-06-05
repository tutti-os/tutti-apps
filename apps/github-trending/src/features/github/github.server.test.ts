import { describe, expect, it } from "vitest";

import { parseTrendingHtml } from "./github.server";

describe("parseTrendingHtml", () => {
  it("uses the repository heading instead of action links in the card", () => {
    const board = parseTrendingHtml(`
      <article class="Box-row">
        <a href="/login?return_to=%2Fowner%2Frepo">Star</a>
        <a href="/sponsors/example">Sponsor</a>
        <h2 class="h3 lh-condensed">
          <a href="/owner/repo">
            <span class="text-normal">owner /</span>
            repo
          </a>
        </h2>
        <p class="col-9 color-fg-muted my-1 pr-4">A useful tool.</p>
        <span itemprop="programmingLanguage">TypeScript</span>
        <a href="/owner/repo/stargazers">1,234</a>
        <span>56 stars today</span>
      </article>
    `);

    expect(board).toMatchObject([
      {
        description: "A useful tool.",
        language: "TypeScript",
        name: "repo",
        owner: "owner",
        stars: 1234,
        starsGained: 56,
      },
    ]);
  });
});
