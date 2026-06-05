import { getSqlite } from "@/db/client.server";
import { fetchReadmeMarkdown } from "@/features/github/github.server";

import { getMockReadme } from "./mock-readmes.server";
import type { RepoReadme } from "./types";

type ReadmeRow = {
  readme_json: string;
};

export async function getCachedReadme(
  owner: string,
  repo: string,
): Promise<RepoReadme> {
  const db = getSqlite();
  const repoKey = `${owner}/${repo}`.toLowerCase();
  const row = db
    .prepare("SELECT readme_json FROM readme_cache WHERE repo_key = ?")
    .get(repoKey) as ReadmeRow | undefined;

  if (row) {
    return JSON.parse(row.readme_json) as RepoReadme;
  }

  const liveReadme = await fetchReadmeMarkdown(owner, repo).catch(() => null);
  const readme = liveReadme
    ? {
        cached: false,
        fetchedAt: new Date().toISOString(),
        headings: extractHeadings(liveReadme.markdown),
        markdown: liveReadme.markdown,
        repo: `${owner}/${repo}`,
        sha: liveReadme.sha,
      }
    : getMockReadme(owner, repo);
  db.prepare(`
    INSERT INTO readme_cache (
      repo_key,
      repo_id,
      fetched_at,
      headings_json,
      html,
      markdown,
      owner,
      readme_json,
      repo,
      sha
    )
    VALUES (
      @repoKey,
      @repoId,
      @fetchedAt,
      @headingsJson,
      @html,
      @markdown,
      @owner,
      @readmeJson,
      @repo,
      @sha
    )
    ON CONFLICT(repo_key) DO UPDATE SET
      fetched_at = excluded.fetched_at,
      headings_json = excluded.headings_json,
      markdown = excluded.markdown,
      readme_json = excluded.readme_json,
      sha = excluded.sha
  `).run({
    fetchedAt: readme.fetchedAt,
    headingsJson: JSON.stringify(readme.headings),
    html: null,
    markdown: readme.markdown,
    owner,
    repoId: `${owner}-${repo}`.replaceAll("/", "-"),
    readmeJson: JSON.stringify(readme),
    repo,
    repoKey,
    sha: readme.sha,
  });

  return readme;
}

function extractHeadings(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.match(/^(#{1,3})\s+(.+)$/))
    .filter(Boolean)
    .slice(0, 12)
    .map((match) => {
      const text = match?.[2]?.trim() ?? "README";
      return {
        depth: match?.[1]?.length ?? 1,
        slug: text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        text,
      };
    });
}
