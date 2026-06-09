import { createFileRoute } from "@tanstack/react-router";

import {
  type CliItemInput,
  buildItemData,
  parseCliItemInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "@/features/radar/radar.cli";
import { getRadarBoardData } from "@/features/radar/radar.server";

export const Route = createFileRoute("/nextop/cli/item")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input: CliItemInput;
        try {
          input = parseCliItemInput(await readCliInput(request));
        } catch (error) {
          return Response.json(toCliError("invalid-input", error));
        }

        try {
          const board = await getRadarBoardData({
            date: input.date,
            locale: input.locale,
          });
          return Response.json(toCliSuccess(buildItemData(board, input)));
        } catch (error) {
          return Response.json(toCliError("radar-unavailable", error));
        }
      },
    },
  },
});
