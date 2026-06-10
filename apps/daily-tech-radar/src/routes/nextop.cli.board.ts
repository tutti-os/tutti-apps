import { createFileRoute } from "@tanstack/react-router";

import {
  type CliBoardInput,
  buildBoardData,
  parseCliBoardInput,
  readCliInput,
  toCliError,
  toCliSuccess,
} from "@/features/radar/radar.cli";
import { getRadarBoardData } from "@/features/radar/radar.server";

export const Route = createFileRoute("/nextop/cli/board")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let input: CliBoardInput;
        try {
          input = parseCliBoardInput(await readCliInput(request));
        } catch (error) {
          return Response.json(toCliError("invalid-input", error));
        }

        try {
          const board = await getRadarBoardData({
            date: input.date,
            locale: input.locale,
          });
          return Response.json(toCliSuccess(buildBoardData(board, input)));
        } catch (error) {
          return Response.json(toCliError("radar-unavailable", error));
        }
      },
    },
  },
});
