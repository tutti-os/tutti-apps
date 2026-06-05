import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getCachedCategoryBoard,
  refreshCategoryBoardSnapshot,
} from "./trending.server";

export const boardQuerySchema = z.object({
  language: z.string().default("All"),
  limit: z.number().min(1).max(10).default(5),
  since: z.enum(["daily", "weekly", "monthly"]).default("daily"),
});

export const getCategoryBoard = createServerFn({ method: "GET" })
  .inputValidator(boardQuerySchema)
  .handler(async ({ data }) => {
    return getCachedCategoryBoard(data);
  });

export const refreshCategoryBoard = createServerFn({ method: "POST" })
  .inputValidator(boardQuerySchema)
  .handler(async ({ data }) => {
    return refreshCategoryBoardSnapshot(data);
  });
