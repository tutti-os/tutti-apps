import { createFileRoute } from "@tanstack/react-router";

import { getCachedCategoryBoard } from "@/features/trending/trending.server";

export const Route = createFileRoute("/api/trending")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get("limit") ?? "5");
        const sinceParam = url.searchParams.get("since");
        const since =
          sinceParam === "weekly" || sinceParam === "monthly"
            ? sinceParam
            : "daily";
        const board = await getCachedCategoryBoard({
          language: url.searchParams.get("language") ?? "All",
          limit: Number.isFinite(limit) ? limit : 5,
          since,
        });

        return Response.json(board);
      },
    },
  },
});
