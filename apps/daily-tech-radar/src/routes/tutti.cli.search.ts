import { createFileRoute } from "@tanstack/react-router";

import {
  type CliSearchInput,
  buildSearchData,
  parseCliSearchInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "@/features/radar/radar.cli";
import { getRadarBoardData } from "@/features/radar/radar.server";

export const Route = createFileRoute("/tutti/cli/search")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input: CliSearchInput;
        try {
          input = parseCliSearchInput(await readCliInput(request));
        } catch (error) {
          return Response.json(toCliError("invalid-input", error));
        }

        try {
          const board = await getRadarBoardData({
            date: input.date,
            locale: input.locale,
          });
          return Response.json(toCliSuccess(buildSearchData(board, input)));
        } catch (error) {
          return Response.json(toCliError("radar-unavailable", error));
        }
      },
    },
  },
});
