import { createFileRoute } from "@tanstack/react-router";

import { getRadarBoardData } from "@/features/radar/radar.server";
import type { Locale } from "@/features/radar/types";

export const Route = createFileRoute("/api/radar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const localeParam = url.searchParams.get("locale");
        const locale: Locale = localeParam === "en-US" ? "en-US" : "zh-CN";
        const date = url.searchParams.get("date") || undefined;
        const board = await getRadarBoardData({ date, locale });

        return Response.json(board);
      },
    },
  },
});
