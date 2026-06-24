import { radarCategories } from "./taxonomy";
import type { RadarCard, RadarSource } from "./types";

type FilterInput = {
  category: string;
  query: string;
  source: RadarSource;
};

type CategoryVisibilityInput = {
  query?: string;
  source: RadarSource;
};

export function filterRadarCards(cards: RadarCard[], input: FilterInput) {
  const query = input.query.trim().toLowerCase();

  return cards.filter((card) => {
    const sourceOk = input.source === "all" || card.type === input.source;
    const categoryOk =
      input.category === "all" || card.categories.includes(input.category);
    const queryOk = !query || searchableText(card).includes(query);
    return sourceOk && categoryOk && queryOk;
  });
}

export function getVisibleCategories(
  cards: RadarCard[],
  input: CategoryVisibilityInput,
): Array<{ count: number; label: string }> {
  const query = input.query?.trim().toLowerCase() ?? "";
  const counts = new Map<string, number>();

  for (const card of cards) {
    if (input.source !== "all" && card.type !== input.source) {
      continue;
    }
    if (query && !searchableText(card).includes(query)) {
      continue;
    }
    for (const category of new Set(card.categories)) {
      if (
        radarCategories.includes(category as (typeof radarCategories)[number])
      ) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    }
  }

  return radarCategories
    .filter((label) => counts.has(label))
    .map((label) => ({ count: counts.get(label) ?? 0, label }));
}

function searchableText(card: RadarCard) {
  return [
    card.name,
    card.owner,
    card.title,
    card.tagline,
    card.description,
    card.summary,
    card.language,
    card.sourceLabel,
    ...card.keywords,
    ...card.categories,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
