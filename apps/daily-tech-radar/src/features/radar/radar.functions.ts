import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getRadarBoardData } from "./radar.server";

export const radarBoardSchema = z.object({
  date: z.string().optional(),
  locale: z.enum(["zh-CN", "en-US"]).default("en-US"),
});

export const getRadarBoard = createServerFn({ method: "GET" })
  .inputValidator(radarBoardSchema)
  .handler(async ({ data }) => getRadarBoardData(data));
