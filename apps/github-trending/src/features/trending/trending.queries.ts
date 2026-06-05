import { queryOptions } from "@tanstack/react-query";

import { getCategoryBoard } from "./trending.functions";
import type { TrendRange } from "./types";

export const trendingQueryKeys = {
  board: (input: { language: string; limit: number; since: TrendRange }) => [
    "category-board",
    input,
  ],
};

export function categoryBoardQueryOptions(input: {
  language: string;
  limit: number;
  since: TrendRange;
}) {
  return queryOptions({
    queryFn: () => getCategoryBoard({ data: input }),
    queryKey: trendingQueryKeys.board(input),
    staleTime: 60_000,
  });
}
