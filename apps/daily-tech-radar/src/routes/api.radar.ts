import { createFileRoute } from "@tanstack/react-router";

import { getRadarBoardData } from "@/features/radar/radar.server";
import type { Locale } from "@/features/radar/types";

const defaultLocale = "en-US" as const;

export const Route = createFileRoute("/api/radar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const localeParam = url.searchParams.get("locale");
        const locale: Locale =
          localeParam === "zh-CN" ? "zh-CN" : defaultLocale;
        const date = url.searchParams.get("date") || undefined;
        const board = await getRadarBoardData({ date, locale });

        return Response.json(board);
      },
    },
  },
});
