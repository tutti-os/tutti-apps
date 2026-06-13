import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePublishTarget,
  resolvePublishTargets,
} from "../scripts/resolve-tutti-publish-target.mjs";

const config = {
  apps: {
    "daily-tech-radar": {
      packageCommand: "pnpm package:tutti --app daily-tech-radar",
      packageSourceDir: "apps/daily-tech-radar/tutti-package",
      packageDir: "build/tutti-app/daily-tech-radar/package",
      iconPath: "build/tutti-app/daily-tech-radar/package/icon.png",
    },
    "second-app": {
      packageCommand: "pnpm package:tutti --app second-app",
      packageSourceDir: "apps/second-app/tutti-package",
      packageDir: "build/tutti-app/second-app/package",
      iconPath: "build/tutti-app/second-app/package/icon.png",
    },
  },
  environments: {
    production: {
      defaultAppId: "daily-tech-radar",
      appIds: ["daily-tech-radar", "second-app"],
    },
  },
};

test("resolvePublishTarget returns reusable workflow inputs", () => {
  assert.deepEqual(
    resolvePublishTarget(config, { environment: "production" }),
    {
      app_id: "daily-tech-radar",
      package_command: "pnpm package:tutti --app daily-tech-radar",
      package_dir: "build/tutti-app/daily-tech-radar/package",
      icon_path: "build/tutti-app/daily-tech-radar/package/icon.png",
      version_manifest_path:
        "apps/daily-tech-radar/tutti-package/tutti.app.json",
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
      package_command: "pnpm package:tutti --app daily-tech-radar",
      package_dir: "build/tutti-app/daily-tech-radar/package",
      icon_path: "build/tutti-app/daily-tech-radar/package/icon.png",
      version_manifest_path:
        "apps/daily-tech-radar/tutti-package/tutti.app.json",
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

test("resolvePublishTargets expands all enabled apps for an environment", () => {
  assert.deepEqual(
    resolvePublishTargets(config, {
      appId: "all",
      environment: "production",
    }),
    [
      {
        app_id: "daily-tech-radar",
        package_command: "pnpm package:tutti --app daily-tech-radar",
        package_dir: "build/tutti-app/daily-tech-radar/package",
        icon_path: "build/tutti-app/daily-tech-radar/package/icon.png",
        version_manifest_path:
          "apps/daily-tech-radar/tutti-package/tutti.app.json",
      },
      {
        app_id: "second-app",
        package_command: "pnpm package:tutti --app second-app",
        package_dir: "build/tutti-app/second-app/package",
        icon_path: "build/tutti-app/second-app/package/icon.png",
        version_manifest_path: "apps/second-app/tutti-package/tutti.app.json",
      },
    ],
  );
});
