import assert from "node:assert/strict";
import test from "node:test";

import { resolvePublishTarget } from "../scripts/resolve-nextop-publish-target.mjs";

const config = {
  apps: {
    "daily-tech-radar": {
      packageCommand: "pnpm package:nextop --app daily-tech-radar",
      packageDir: "build/nextop-app/daily-tech-radar/package",
      iconPath: "build/nextop-app/daily-tech-radar/package/icon.png",
    },
  },
  environments: {
    production: {
      defaultAppId: "daily-tech-radar",
      appIds: ["daily-tech-radar"],
    },
  },
};

test("resolvePublishTarget returns reusable workflow inputs", () => {
  assert.deepEqual(
    resolvePublishTarget(config, { environment: "production" }),
    {
      app_id: "daily-tech-radar",
      package_command: "pnpm package:nextop --app daily-tech-radar",
      package_dir: "build/nextop-app/daily-tech-radar/package",
      icon_path: "build/nextop-app/daily-tech-radar/package/icon.png",
    },
  );
});

test("resolvePublishTarget returns daily-tech-radar when explicitly requested", () => {
  assert.deepEqual(
    resolvePublishTarget(config, {
      appId: "daily-tech-radar",
      environment: "production",
    }),
    {
      app_id: "daily-tech-radar",
      package_command: "pnpm package:nextop --app daily-tech-radar",
      package_dir: "build/nextop-app/daily-tech-radar/package",
      icon_path: "build/nextop-app/daily-tech-radar/package/icon.png",
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
