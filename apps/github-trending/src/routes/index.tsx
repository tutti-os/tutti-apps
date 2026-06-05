import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { repoReadmeQueryOptions } from "@/features/readme/readme.queries";
import { refreshCategoryBoard } from "@/features/trending/trending.functions";
import { categoryBoardQueryOptions } from "@/features/trending/trending.queries";
import type { TrendRange } from "@/features/trending/types";

const searchSchema = z.object({
  language: z.string().catch("All"),
  repo: z.string().optional(),
  since: z.enum(["daily", "weekly", "monthly"]).catch("daily"),
});

type IndexSearch = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/")({
  component: IndexRoute,
  loader: async ({ context, deps }) => {
    const { language, since } = deps as IndexSearch;

    await context.queryClient.ensureQueryData(
      categoryBoardQueryOptions({
        language,
        limit: 5,
        since,
      }),
    );
  },
  loaderDeps: ({ search }) => search as IndexSearch,
  validateSearch: (search) => searchSchema.parse(search),
});

function IndexRoute() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const boardQuery = categoryBoardQueryOptions({
    language: search.language,
    limit: 5,
    since: search.since,
  });
  const { data: board } = useSuspenseQuery(boardQuery);
  const repos = board.categories.flatMap((category) => category.topRepos);
  const selectedRepo =
    repos.find((repo) => repo.id === search.repo) ?? repos[0] ?? null;
  const { data: readme } = useSuspenseQuery(
    repoReadmeQueryOptions({
      owner: selectedRepo?.owner ?? "run-llama",
      repo: selectedRepo?.name ?? "llama-stack",
    }),
  );

  if (!selectedRepo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        README unavailable.
      </main>
    );
  }

  return (
    <AppShell
      board={board}
      language={search.language}
      onLanguageChange={(language) => {
        navigate({
          search: { ...search, language },
        });
      }}
      onRefresh={async () => {
        setRefreshing(true);
        await refreshCategoryBoard({
          data: {
            language: search.language,
            limit: 5,
            since: search.since,
          },
        });
        await queryClient.invalidateQueries({
          queryKey: boardQuery.queryKey,
        });
        setRefreshing(false);
      }}
      onRepoSelect={(repo) => {
        navigate({
          search: { ...search, repo },
        });
      }}
      onSinceChange={(since: TrendRange) => {
        navigate({
          search: { ...search, since },
        });
      }}
      readme={readme}
      refreshing={refreshing}
      selectedRepo={selectedRepo}
      since={search.since}
    />
  );
}
