import { findMockRepo } from "../trending/mock-data.server";
import type { RepoReadme } from "./types";

export function getMockReadme(owner: string, repo: string): RepoReadme {
  const selectedRepo = findMockRepo(`${owner}-${repo}`);
  const title = selectedRepo?.readmePreview.title ?? repo;
  const fullName = `${owner}/${repo}`;

  return {
    cached: true,
    fetchedAt: "2026-06-05T08:45:00Z",
    headings: [
      { depth: 1, slug: slug(title), text: title },
      { depth: 2, slug: "key-features", text: "Key features" },
      { depth: 2, slug: "quick-start", text: "Quick start" },
    ],
    markdown: `# ${title}

Production-ready project currently trending in its category.

## Key features

- Clear setup path for developers evaluating the project.
- README includes install notes, examples, and project scope.
- Category score is based on topics, description, and README signals.

## Quick start

\`\`\`bash
${selectedRepo?.readmePreview.codePreview ?? `git clone https://github.com/${fullName}`}
\`\`\`

## Why it is grouped here

${selectedRepo?.reasons.map((reason) => `- ${reason}`).join("\n") ?? "- README and repository metadata matched this category."}
`,
    repo: fullName,
    sha: "mock-readme-sha",
  };
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
