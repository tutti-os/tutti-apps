import { queryOptions } from "@tanstack/react-query";

import { getRadarBoard } from "./radar.functions";
import type { Locale } from "./types";

export const radarQueryKeys = {
  board: (input: { date?: string | undefined; locale: Locale }) => [
    "radar-board",
    input,
  ],
};

export function radarBoardQueryOptions(input: {
  date?: string | undefined;
  locale: Locale;
}) {
  return queryOptions({
    queryFn: () => getRadarBoard({ data: input }),
    queryKey: radarQueryKeys.board(input),
    staleTime: 5 * 60_000,
  });
}
