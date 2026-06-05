import { createFileRoute } from "@tanstack/react-router";

import { getCachedReadme } from "@/features/readme/readme.server";

export const Route = createFileRoute("/api/repos/$owner/$repo/readme")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const readme = await getCachedReadme(params.owner, params.repo);

        return Response.json(readme);
      },
    },
  },
});
