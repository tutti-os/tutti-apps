import { buildRadarBoard, mergeDates } from "./radar.normalize";
import { createRadarClient } from "./radar.sdk.server";
import type {
  DailyTrendFeed,
  DailyTrendPackage,
  Locale,
  TrendIndex,
} from "./types";

type RadarBoardInput = {
  date?: string | undefined;
  locale: Locale;
};

export async function getRadarBoardData(input: RadarBoardInput) {
  const client = createRadarClient();
  const [productIndex, githubIndex] = await Promise.all([
    optional(() => client.productHunt.index(input.locale)),
    optional(() => client.github.index(input.locale)),
  ]);
  const date = input.date || latestDate(productIndex, githubIndex);
  const [productFeed, githubPackage] = await Promise.all([
    date
      ? optional(() => client.productHunt.byDate(date, input.locale))
      : optional(() => client.productHunt.latest(input.locale)),
    date
      ? optional(() => client.github.byDate(date, input.locale))
      : optional(() => client.github.latest(input.locale)),
  ]);
  const resolvedDate =
    date ||
    productFeed?.date ||
    githubPackage?.packageId.match(/\d{4}-\d{2}-\d{2}/)?.[0] ||
    "";

  return buildRadarBoard({
    date: resolvedDate,
    githubIndex,
    githubPackage,
    locale: input.locale,
    productFeed,
    productIndex,
  });
}

function latestDate(
  productIndex: TrendIndex | null,
  githubIndex: TrendIndex | null,
) {
  return (
    mergeDates(productIndex, githubIndex)[0] ??
    productIndex?.latestDate ??
    githubIndex?.latestDate ??
    ""
  );
}

async function optional<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (error) {
    console.warn(
      "Daily Tech Radar source unavailable",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
