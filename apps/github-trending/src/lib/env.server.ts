import { mkdirSync } from "node:fs";
import path from "node:path";

export function getDataDir() {
  const dataDir =
    process.env.NEXTOP_APP_DATA_DIR ??
    process.env.GITHUB_TRENDING_DATA_DIR ??
    path.join(process.cwd(), "data");

  mkdirSync(dataDir, { recursive: true });
  return dataDir;
}

export function getDatabasePath() {
  return path.join(getDataDir(), "trendreader.sqlite");
}
