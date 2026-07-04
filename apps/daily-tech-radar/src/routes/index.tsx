import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import { AppShell, AppShellLoading } from "@/components/app-shell";
import { radarBoardQueryOptions } from "@/features/radar/radar.queries";
import type {
  Locale,
  RadarSource,
  RadarViewMode,
} from "@/features/radar/types";
import {
  defaultLocale,
  resolveAppLocale,
  useHostLocale,
} from "@/i18n/app-context";
import { reportUserActiveOnce } from "@/lib/tutti-activity";

const searchSchema = z.object({
  date: z.string().optional(),
  filter: z.string().catch("all"),
  locale: z.enum(["zh-CN", "en-US"]).optional().catch(undefined),
  query: z.string().catch(""),
  source: z.enum(["all", "producthunt", "github"]).catch("all"),
  view: z.enum(["grid", "compact"]).catch("grid"),
});

type IndexSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/")({
  component: IndexRoute,
  validateSearch: (search) => searchSchema.parse(search),
});

function IndexRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const hostLocale = useHostLocale();
  const locale = resolveAppLocale(search.locale, hostLocale);
  const { data: board } = useQuery(
    radarBoardQueryOptions({ date: search.date, locale }),
  );
  useEffect(() => {
    if (board) reportUserActiveOnce();
  }, [board]);
  const searchState = {
    category: search.filter,
    date: search.date ?? board?.date ?? "",
    locale,
    query: search.query,
    source: search.source,
    view: search.view,
  };

  function handleSearchStateChange(next: {
    category: string;
    date: string;
    locale?: Locale;
    query: string;
    source: RadarSource;
    view: RadarViewMode;
  }) {
    navigate({
      resetScroll: false,
      search: {
        date: next.date,
        filter: next.category,
        locale: next.locale as Locale,
        query: next.query,
        source: next.source as RadarSource,
        view: next.view as RadarViewMode,
      },
    });
  }

  if (!board) {
    return (
      <AppShellLoading
        locale={locale}
        searchState={searchState}
        onSearchStateChange={handleSearchStateChange}
      />
    );
  }

  return (
    <AppShell
      board={board}
      searchState={searchState}
      onSearchStateChange={handleSearchStateChange}
    />
  );
}
