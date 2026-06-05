import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getCachedReadme } from "./readme.server";

export const readmeQuerySchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

export const getRepoReadme = createServerFn({ method: "GET" })
  .inputValidator(readmeQuerySchema)
  .handler(async ({ data }) => {
    return getCachedReadme(data.owner, data.repo);
  });
