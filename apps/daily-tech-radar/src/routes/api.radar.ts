import { createFileRoute } from "@tanstack/react-router";

import { getRadarBoardData } from "@/features/radar/radar.server";

const defaultLocale = "en-US" as const;

export const Route = createFileRoute("/api/radar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") || undefined;
        const board = await getRadarBoardData({ date, locale: defaultLocale });

        return Response.json(board);
      },
    },
  },
});
