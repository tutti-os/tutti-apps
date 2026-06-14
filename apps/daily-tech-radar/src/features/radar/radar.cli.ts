import { z } from "zod";

import { filterRadarCards } from "./filtering";
import type { RadarBoard, RadarCard } from "./types";

type CliCommandOutput = {
  kind: "json";
  value:
    | {
        data: unknown;
        ok: true;
      }
    | {
        error: {
          code: string;
          message: string;
        };
        ok: false;
      };
};

const localeSchema = z.enum(["zh-CN", "en-US"]).default("en-US");
const sourceSchema = z.enum(["all", "producthunt", "github"]).default("all");
const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional();
const optionalBoardLimitSchema = z
  .number()
  .int()
  .optional()
  .transform((limit) =>
    typeof limit === "number" ? Math.min(Math.max(limit, 1), 50) : undefined,
  );
const requiredLimitSchema = z
  .number()
  .int()
  .default(10)
  .transform((limit) => Math.min(Math.max(limit, 1), 50));

export type CliBoardInput = {
  date?: string;
  includeCards: boolean;
  limit?: number;
  locale: "zh-CN" | "en-US";
  source: "all" | "producthunt" | "github";
};

export type CliSearchInput = {
  category: string;
  date?: string;
  limit: number;
  locale: "zh-CN" | "en-US";
  query: string;
  source: "all" | "producthunt" | "github";
};

export type CliItemInput = {
  date?: string;
  id: string;
  locale: "zh-CN" | "en-US";
};

const cliBoardInputRawSchema = z.object({
  "include-cards": z.boolean().default(true),
  date: optionalDateSchema,
  limit: optionalBoardLimitSchema,
  locale: localeSchema,
  source: sourceSchema,
});

export const cliBoardInputSchema = cliBoardInputRawSchema.transform(
  (input): CliBoardInput => ({
    ...(input.date ? { date: input.date } : {}),
    includeCards: input["include-cards"],
    ...(typeof input.limit === "number" ? { limit: input.limit } : {}),
    locale: input.locale,
    source: input.source,
  }),
);

export const cliSearchInputSchema = z.object({
  category: z.string().default("all"),
  date: optionalDateSchema,
  limit: requiredLimitSchema,
  locale: localeSchema,
  query: z.string().default(""),
  source: sourceSchema,
});

export const cliItemInputSchema = z.object({
  date: optionalDateSchema,
  id: z.string().min(1),
  locale: localeSchema,
});

export function parseCliBoardInput(input: unknown) {
  return cliBoardInputSchema.parse(input ?? {});
}

export function parseCliSearchInput(input: unknown): CliSearchInput {
  const parsed = cliSearchInputSchema.parse(input ?? {});
  return {
    category: parsed.category,
    ...(parsed.date ? { date: parsed.date } : {}),
    limit: parsed.limit,
    locale: parsed.locale,
    query: parsed.query,
    source: parsed.source,
  };
}

export function parseCliItemInput(input: unknown): CliItemInput {
  const parsed = cliItemInputSchema.parse(input ?? {});
  return {
    ...(parsed.date ? { date: parsed.date } : {}),
    id: parsed.id,
    locale: parsed.locale,
  };
}

export async function readCliInput(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (
    isRecord(body) &&
    body.schemaVersion === "tutti.app.cli.invoke.v1" &&
    isRecord(body.input)
  ) {
    return body.input;
  }
  return isRecord(body) ? body : {};
}

export function buildBoardData(board: RadarBoard, input: CliBoardInput) {
  const sourceCards = filterRadarCards(board.cards, {
    category: "all",
    query: "",
    source: input.source,
  });
  const cards = input.includeCards
    ? typeof input.limit === "number"
      ? sourceCards.slice(0, input.limit)
      : sourceCards
    : [];

  return {
    availableDates: board.availableDates,
    cards,
    categories: board.categories,
    date: board.date,
    generatedAt: board.generatedAt,
    locale: board.locale,
    metrics: board.metrics,
    query: {
      ...(input.date ? { date: input.date } : {}),
      includeCards: input.includeCards,
      ...(typeof input.limit === "number" ? { limit: input.limit } : {}),
      locale: input.locale,
      source: input.source,
    },
  };
}

export function buildSearchData(board: RadarBoard, input: CliSearchInput) {
  const matches = filterRadarCards(board.cards, {
    category: input.category,
    query: input.query,
    source: input.source,
  });
  const cards = matches.slice(0, input.limit);

  return {
    cards: cards.map(toCardSummary),
    date: board.date,
    generatedAt: board.generatedAt,
    hasMore: matches.length > cards.length,
    locale: board.locale,
    query: {
      category: input.category,
      ...(input.date ? { date: input.date } : {}),
      limit: input.limit,
      locale: input.locale,
      source: input.source,
      text: input.query,
    },
    returnedCount: cards.length,
    totalCount: matches.length,
  };
}

export function buildItemData(board: RadarBoard, input: CliItemInput) {
  const card = board.cards.find((candidate) => candidate.id === input.id);

  return {
    card: card ?? null,
    date: board.date,
    found: Boolean(card),
    generatedAt: board.generatedAt,
    id: input.id,
    locale: board.locale,
  };
}

export function toCliSuccess(data: unknown): CliCommandOutput {
  return {
    kind: "json",
    value: {
      data,
      ok: true,
    },
  };
}

export function toCliError(code: string, error: unknown): CliCommandOutput {
  return {
    kind: "json",
    value: {
      error: {
        code,
        message: error instanceof Error ? error.message : "Unknown CLI error",
      },
      ok: false,
    },
  };
}

function toCardSummary(card: RadarCard) {
  return {
    categories: card.categories,
    description: card.description,
    homepageUrl: card.homepageUrl ?? null,
    id: card.id,
    language: card.language,
    metrics: card.metrics,
    name: card.name,
    owner: card.owner,
    rank: card.rank,
    sourceLabel: card.sourceLabel,
    sourceUrl: card.sourceUrl,
    title: card.title,
    type: card.type,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
