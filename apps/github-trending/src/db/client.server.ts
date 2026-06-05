import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { getDatabasePath } from "@/lib/env.server";

import { schema } from "./schema";

let connection: Database.Database | null = null;

export function getSqlite() {
  if (!connection) {
    connection = new Database(getDatabasePath());
    connection.pragma("journal_mode = WAL");
    connection.pragma("foreign_keys = ON");
    migrate(connection);
  }

  return connection;
}

export function getDb() {
  return drizzle(getSqlite(), { schema });
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS repos (
      id TEXT PRIMARY KEY,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      homepage_url TEXT,
      language TEXT,
      topics_json TEXT NOT NULL,
      stars INTEGER NOT NULL,
      forks INTEGER NOT NULL DEFAULT 0,
      license TEXT,
      default_branch TEXT,
      created_at TEXT,
      pushed_at TEXT,
      updated_at TEXT,
      fetched_at TEXT
    );

    CREATE TABLE IF NOT EXISTS trend_snapshots (
      id TEXT PRIMARY KEY,
      captured_at TEXT NOT NULL,
      language TEXT NOT NULL,
      rank_raw INTEGER NOT NULL,
      repo_id TEXT NOT NULL,
      since TEXT NOT NULL,
      stars_gained INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS category_scores (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      computed_at TEXT NOT NULL,
      reasons_json TEXT NOT NULL,
      repo_id TEXT NOT NULL,
      score INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS category_snapshots (
      key TEXT PRIMARY KEY,
      board_json TEXT NOT NULL,
      captured_at TEXT NOT NULL,
      language TEXT NOT NULL,
      limit_count INTEGER NOT NULL,
      since TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS readme_cache (
      repo_key TEXT PRIMARY KEY,
      repo_id TEXT,
      fetched_at TEXT NOT NULL,
      headings_json TEXT,
      html TEXT,
      markdown TEXT,
      owner TEXT NOT NULL,
      readme_json TEXT NOT NULL,
      repo TEXT NOT NULL,
      sha TEXT NOT NULL
    );
  `);

  ensureColumn(db, "repos", "homepage_url", "TEXT");
  ensureColumn(db, "repos", "default_branch", "TEXT");
  ensureColumn(db, "repos", "created_at", "TEXT");
  ensureColumn(db, "repos", "pushed_at", "TEXT");
  ensureColumn(db, "repos", "fetched_at", "TEXT");
  ensureColumn(db, "readme_cache", "repo_id", "TEXT");
  ensureColumn(db, "readme_cache", "headings_json", "TEXT");
  ensureColumn(db, "readme_cache", "html", "TEXT");
  ensureColumn(db, "readme_cache", "markdown", "TEXT");
}

function ensureColumn(
  db: Database.Database,
  tableName: string,
  columnName: string,
  columnType: string,
) {
  const columns = db.pragma(`table_info(${tableName})`) as Array<{
    name: string;
  }>;
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
  }
}
