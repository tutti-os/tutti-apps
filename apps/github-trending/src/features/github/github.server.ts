import type { RepoSummary, TrendRange } from "@/features/trending/types";

const githubHeaders = {
  accept: "application/vnd.github+json",
  "user-agent": "nextop-github-trending-reader",
  ...(process.env.GITHUB_TOKEN
    ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

type TrendingCandidate = {
  description: string;
  language: string;
  name: string;
  owner: string;
  rankRaw: number;
  stars: number;
  starsGained: number;
};

type GitHubRepoResponse = {
  default_branch?: string;
  description?: string | null;
  forks_count?: number;
  homepage?: string | null;
  html_url?: string;
  license?: { spdx_id?: string | null } | null;
  pushed_at?: string | null;
  stargazers_count?: number;
  topics?: string[];
};

export async function fetchTrendingRepos(input: {
  language: string;
  limit: number;
  since: TrendRange;
}) {
  const candidates = await fetchTrendingCandidates(input);
  const enriched = await Promise.all(
    candidates.slice(0, Math.max(input.limit * 3, input.limit)).map(enrichRepo),
  );

  return enriched.filter(Boolean) as RepoSummary[];
}

export async function fetchReadmeMarkdown(owner: string, repo: string) {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    { headers: githubHeaders },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    content?: string;
    encoding?: string;
    sha?: string;
  };

  if (data.encoding !== "base64" || !data.content) {
    return null;
  }

  return {
    markdown: Buffer.from(data.content, "base64").toString("utf8"),
    sha: data.sha ?? "github-readme",
  };
}

async function fetchTrendingCandidates(input: {
  language: string;
  limit: number;
  since: TrendRange;
}) {
  const languagePath =
    input.language === "All" ? "" : `/${encodeURIComponent(input.language)}`;
  const url = `https://github.com/trending${languagePath}?since=${input.since}`;
  const response = await fetch(url, {
    headers: { "user-agent": "nextop-github-trending-reader" },
  });

  if (!response.ok) {
    throw new Error(`GitHub Trending request failed: ${response.status}`);
  }

  const html = await response.text();
  const candidates = parseTrendingHtml(html);

  if (candidates.length === 0) {
    throw new Error("GitHub Trending parser returned no repositories.");
  }

  return candidates.slice(0, Math.max(input.limit * 4, input.limit));
}

export function parseTrendingHtml(html: string): TrendingCandidate[] {
  const articles = html.match(/<article class="Box-row">[\s\S]*?<\/article>/g);

  if (!articles) {
    return [];
  }

  return articles
    .map((article, index) => parseTrendingArticle(article, index + 1))
    .filter(Boolean) as TrendingCandidate[];
}

function parseTrendingArticle(article: string, rankRaw: number) {
  const heading = article.match(/<h2\b[\s\S]*?<\/h2>/)?.[0] ?? "";
  const repoMatch = heading.match(/href="\/([^/"<>]+)\/([^/"<>]+)"/);

  if (!repoMatch?.[1] || !repoMatch[2]) {
    return null;
  }

  const owner = decodeHtml(repoMatch[1]).trim();
  const name = decodeHtml(repoMatch[2]).trim();

  return {
    description: textFromMatch(
      article.match(
        /<p class="col-9 color-fg-muted my-1 pr-4">([\s\S]*?)<\/p>/,
      ),
    ),
    language: textFromMatch(
      article.match(/<span itemprop="programmingLanguage">([\s\S]*?)<\/span>/),
    ),
    name,
    owner,
    rankRaw,
    stars: parseStargazers(article, owner, name),
    starsGained: parseNumber(
      textFromMatch(
        article.match(/([\d,]+)\s+stars\s+(today|this week|this month)/),
      ),
    ),
  };
}

function parseStargazers(article: string, owner: string, name: string) {
  for (const match of article.matchAll(
    /<a[^>]+href="\/([^/"<>]+)\/([^/"<>]+)\/stargazers"[\s\S]*?<\/a>/g,
  )) {
    const matchOwner = match[1];
    const matchName = match[2];

    if (!matchOwner || !matchName) {
      continue;
    }
    if (decodeHtml(matchOwner).trim() !== owner) {
      continue;
    }
    if (decodeHtml(matchName).trim() !== name) {
      continue;
    }
    return parseNumber(decodeHtml(stripTags(match[0])).replace(/\s+/g, " "));
  }

  return 0;
}

async function enrichRepo(candidate: TrendingCandidate) {
  const repo = await fetchRepoMetadata(candidate);
  const topics = repo?.topics?.length
    ? repo.topics
    : inferTopics(candidate.description, candidate.name);
  const language = repo?.description
    ? candidate.language || "Unknown"
    : candidate.language;

  return {
    categoryConfidence: 0.7,
    description:
      repo?.description ??
      candidate.description ??
      "Trending GitHub repository.",
    fullName: `${candidate.owner} / ${candidate.name}`,
    id: `${candidate.owner}-${candidate.name}`.replaceAll("/", "-"),
    language: language || "Unknown",
    languageColor: languageColor(language),
    license: repo?.license?.spdx_id ?? "NOASSERTION",
    name: candidate.name,
    owner: candidate.owner,
    readmePreview: {
      badges: topics.slice(0, 3),
      codePreview: `git clone https://github.com/${candidate.owner}/${candidate.name}`,
      headings: ["README", "Quick start", "Contributing"],
      title: candidate.name,
    },
    reasons: inferReasons(candidate.description, candidate.name, topics),
    stars: repo?.stargazers_count ?? candidate.stars,
    starsGained: candidate.starsGained || candidate.stars,
    topics,
    url:
      repo?.html_url ??
      `https://github.com/${candidate.owner}/${candidate.name}`,
  } satisfies RepoSummary;
}

async function fetchRepoMetadata(candidate: TrendingCandidate) {
  const response = await fetch(
    `https://api.github.com/repos/${candidate.owner}/${candidate.name}`,
    { headers: githubHeaders },
  );

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GitHubRepoResponse;
}

function inferTopics(description: string, name: string) {
  return `${name} ${description}`
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .filter((token) => token.length >= 3)
    .slice(0, 4);
}

function inferReasons(description: string, name: string, topics: string[]) {
  const reasons = topics.slice(0, 3).map((topic) => `topic:${topic}`);

  if (description) {
    reasons.push("description:trending");
  }
  if (name) {
    reasons.push("repo:name-signal");
  }

  return reasons.slice(0, 4);
}

function languageColor(language: string) {
  if (language === "Rust") {
    return "bg-chart-5";
  }
  if (language === "JavaScript") {
    return "bg-chart-4";
  }
  if (language === "Go") {
    return "bg-chart-2";
  }
  return "bg-chart-3";
}

function parseNumber(value: string) {
  return Number(value.replaceAll(",", "").match(/\d+/)?.[0] ?? 0);
}

function textFromMatch(match: RegExpMatchArray | null) {
  return decodeHtml(stripTags(match?.[1] ?? ""))
    .trim()
    .replace(/\s+/g, " ");
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
