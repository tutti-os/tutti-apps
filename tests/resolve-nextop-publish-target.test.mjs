import assert from "node:assert/strict";
import test from "node:test";

import { resolvePublishTarget } from "../scripts/resolve-nextop-publish-target.mjs";

const config = {
  apps: {
    "github-trending": {
      packageCommand: "pnpm package:nextop --app github-trending",
      packageDir: "build/nextop-app/github-trending/package",
      iconPath: "build/nextop-app/github-trending/package/icon.svg",
    },
  },
  environments: {
    production: {
      defaultAppId: "github-trending",
      appIds: ["github-trending"],
    },
  },
};

test("resolvePublishTarget returns reusable workflow inputs", () => {
  assert.deepEqual(
    resolvePublishTarget(config, { environment: "production" }),
    {
      app_id: "github-trending",
      package_command: "pnpm package:nextop --app github-trending",
      package_dir: "build/nextop-app/github-trending/package",
      icon_path: "build/nextop-app/github-trending/package/icon.svg",
    },
  );
});

test("resolvePublishTarget rejects apps disabled for an environment", () => {
  assert.throws(
    () =>
      resolvePublishTarget(config, {
        appId: "other-app",
        environment: "production",
      }),
    /not enabled for production publishing/,
  );
});
