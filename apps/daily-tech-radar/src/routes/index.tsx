import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { radarBoardQueryOptions } from "@/features/radar/radar.queries";
import type { RadarSource, RadarViewMode } from "@/features/radar/types";

const searchSchema = z.object({
  date: z.string().optional(),
  filter: z.string().catch("all"),
  query: z.string().catch(""),
  source: z.enum(["all", "producthunt", "github"]).catch("all"),
  view: z.enum(["grid", "compact"]).catch("grid"),
});

type IndexSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/")({
  component: IndexRoute,
  loader: async ({ context, deps }) => {
    const { date } = deps as IndexSearch;
    await context.queryClient.ensureQueryData(
      radarBoardQueryOptions({ date, locale: "zh-CN" }),
    );
  },
  loaderDeps: ({ search }) => search as IndexSearch,
  validateSearch: (search) => searchSchema.parse(search),
});

function IndexRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const { data: board } = useSuspenseQuery(
    radarBoardQueryOptions({ date: search.date, locale: "zh-CN" }),
  );

  return (
    <AppShell
      board={board}
      searchState={{
        category: search.filter,
        date: search.date ?? board.date,
        query: search.query,
        source: search.source,
        view: search.view,
      }}
      onSearchStateChange={(next) => {
        navigate({
          resetScroll: false,
          search: {
            date: next.date,
            filter: next.category,
            query: next.query,
            source: next.source as RadarSource,
            view: next.view as RadarViewMode,
          },
        });
      }}
    />
  );
}
