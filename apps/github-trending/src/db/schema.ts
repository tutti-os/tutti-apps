import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const repos = sqliteTable("repos", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  homepageUrl: text("homepage_url"),
  language: text("language"),
  topicsJson: text("topics_json").notNull(),
  stars: integer("stars").notNull(),
  forks: integer("forks").notNull().default(0),
  license: text("license"),
  defaultBranch: text("default_branch"),
  createdAt: text("created_at"),
  pushedAt: text("pushed_at"),
  updatedAt: text("updated_at"),
  fetchedAt: text("fetched_at"),
});

export const trendSnapshots = sqliteTable("trend_snapshots", {
  id: text("id").primaryKey(),
  capturedAt: text("captured_at").notNull(),
  language: text("language").notNull(),
  rankRaw: integer("rank_raw").notNull(),
  repoId: text("repo_id").notNull(),
  since: text("since").notNull(),
  starsGained: integer("stars_gained").notNull(),
});

export const categoryScores = sqliteTable("category_scores", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull(),
  confidence: integer("confidence").notNull(),
  computedAt: text("computed_at").notNull(),
  reasonsJson: text("reasons_json").notNull(),
  repoId: text("repo_id").notNull(),
  score: integer("score").notNull(),
});

export const categorySnapshots = sqliteTable("category_snapshots", {
  key: text("key").primaryKey(),
  boardJson: text("board_json").notNull(),
  capturedAt: text("captured_at").notNull(),
  language: text("language").notNull(),
  limitCount: integer("limit_count").notNull(),
  since: text("since").notNull(),
});

export const readmeCache = sqliteTable("readme_cache", {
  repoKey: text("repo_key").primaryKey(),
  repoId: text("repo_id"),
  fetchedAt: text("fetched_at").notNull(),
  headingsJson: text("headings_json"),
  html: text("html"),
  markdown: text("markdown"),
  owner: text("owner").notNull(),
  readmeJson: text("readme_json").notNull(),
  repo: text("repo").notNull(),
  sha: text("sha").notNull(),
});

export const schema = {
  categoryScores,
  categorySnapshots,
  readmeCache,
  repos,
  trendSnapshots,
};
