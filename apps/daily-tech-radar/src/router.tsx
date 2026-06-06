import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  queryClient: QueryClient;
};

export function getRouter(): ReturnType<typeof createRouter> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 10 * 60_000,
        staleTime: 60_000,
      },
    },
  });

  return createRouter({
    context: { queryClient } satisfies RouterContext,
    defaultPreload: "intent",
    routeTree,
    scrollRestoration: true,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
