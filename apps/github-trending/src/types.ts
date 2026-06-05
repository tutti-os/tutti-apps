export type TrendPeriod = "daily" | "weekly" | "monthly";

export type RepoCategoryId =
  | "ai-infra"
  | "devtools"
  | "frontend"
  | "data"
  | "security"
  | "infra-devops"
  | "cli"
  | "databases";

export type RepoSummary = {
  id: string;
  fullName: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stars: number;
  starsGained: number;
  readmePreviewUrl?: string;
};
