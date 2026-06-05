import { queryOptions } from "@tanstack/react-query";

import { getRepoReadme } from "./readme.functions";

export const readmeQueryKeys = {
  byRepo: (input: { owner: string; repo: string }) => ["readme", input],
};

export function repoReadmeQueryOptions(input: { owner: string; repo: string }) {
  return queryOptions({
    queryFn: () => getRepoReadme({ data: input }),
    queryKey: readmeQueryKeys.byRepo(input),
    staleTime: 10 * 60_000,
  });
}
