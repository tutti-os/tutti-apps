export type TrendRange = "daily" | "weekly" | "monthly";

export type BoardCacheStatus = "fresh" | "stale" | "fallback";

export type ReadmePreview = {
  title: string;
  badges: string[];
  headings: string[];
  codePreview: string;
};

export type RepoSummary = {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string;
  language: string;
  languageColor: string;
  topics: string[];
  stars: number;
  starsGained: number;
  license: string;
  categoryConfidence: number;
  reasons: string[];
  readmePreview: ReadmePreview;
};

export type CategorySummary = {
  id: string;
  label: string;
  icon: "brain" | "terminal" | "layout" | "database" | "shield" | "box";
  repoCount: number;
  momentum: number;
  delta: number;
  tone: "hot" | "trending" | "steady";
  topRepos: RepoSummary[];
};

export type CategoryBoard = {
  capturedAt: string;
  since: TrendRange;
  language: string;
  cacheStatus: BoardCacheStatus;
  categories: CategorySummary[];
};
