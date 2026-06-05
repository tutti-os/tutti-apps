export type RepoReadme = {
  cached: boolean;
  fetchedAt: string;
  headings: Array<{ depth: number; slug: string; text: string }>;
  markdown: string;
  repo: string;
  sha: string;
};
