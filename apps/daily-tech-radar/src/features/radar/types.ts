export type {
  DailyTechRadarClientOptions,
  DailyTrendFeed,
  DailyTrendFeedItem,
  DailyTrendPackage,
  GitHubTrendRepo,
  Locale,
  TrendIndex,
} from "@nextop-os/daily-tech-radar";

export type RadarSource = "all" | "producthunt" | "github";
export type RadarViewMode = "grid" | "compact";

export type RadarCard = {
  categories: string[];
  coverStyle?: "image" | "semantic";
  coverUrl?: string | null;
  date: string;
  description: string;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  id: string;
  keywords: string[];
  language?: string;
  media: Array<{
    type: string;
    url: string;
    videoUrl?: string | null;
  }>;
  metrics: {
    comments?: number;
    forks?: number;
    score?: number;
    stars?: number;
    starsGained?: number;
    votes?: number;
  };
  name: string;
  owner?: string;
  rank: number;
  sourceLabel: string;
  sourceUrl: string;
  summary?: string;
  tagline?: string;
  title: string;
  type: "producthunt" | "github";
};

export type RadarBoard = {
  availableDates: string[];
  cards: RadarCard[];
  categories: Array<{ count: number; label: string }>;
  date: string;
  generatedAt: string;
  locale: "zh-CN" | "en-US";
  metrics: {
    aiPercent: number;
    githubCount: number;
    productHuntCount: number;
  };
};
