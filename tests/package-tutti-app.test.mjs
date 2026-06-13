import assert from "node:assert/strict";
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertNoSymlinks,
  packageTuttiApp,
  readPublishConfig,
  resolveAppConfig,
  validatePackageRoot,
} from "../scripts/package-tutti-app.mjs";

async function makeTempPackageRoot() {
  return mkdtemp(path.join(os.tmpdir(), "tutti-apps-package-test-"));
}

test("publish config registers daily-tech-radar as the default app", async () => {
  const config = await readPublishConfig();
  const { appId, app } = resolveAppConfig(config, "");

  assert.equal(appId, "daily-tech-radar");
  assert.equal(app.packageSourceDir, "apps/daily-tech-radar/tutti-package");
  assert.equal(
    app.packageCommand,
    "pnpm package:tutti --app daily-tech-radar",
  );
  assert.equal(app.packageDir, "build/tutti-app/daily-tech-radar/package");
  assert.equal(
    app.iconPath,
    "build/tutti-app/daily-tech-radar/package/icon.png",
  );
  assert.deepEqual(config.environments.production.appIds, ["daily-tech-radar"]);
});

test("publish config registers daily-tech-radar as an explicit app", async () => {
  const config = await readPublishConfig();
  const { appId, app } = resolveAppConfig(config, "daily-tech-radar");

  assert.equal(appId, "daily-tech-radar");
  assert.equal(app.packageSourceDir, "apps/daily-tech-radar/tutti-package");
  assert.equal(
    app.packageCommand,
    "pnpm package:tutti --app daily-tech-radar",
  );
  assert.equal(app.packageDir, "build/tutti-app/daily-tech-radar/package");
  assert.equal(
    app.iconPath,
    "build/tutti-app/daily-tech-radar/package/icon.png",
  );
});

test("validatePackageRoot requires the files Tutti imports", async () => {
  const packageRoot = await makeTempPackageRoot();

  await assert.rejects(
    validatePackageRoot(packageRoot),
    /Missing required package file: tutti\.app\.json/,
  );

  await writeFile(
    path.join(packageRoot, "tutti.app.json"),
    `${JSON.stringify({
      schemaVersion: "tutti.app.manifest.v1",
      appId: "test-app",
      version: "1.2.3",
      runtime: { bootstrap: "bootstrap.sh" },
    })}\n`,
  );
  await writeFile(path.join(packageRoot, "AGENTS.md"), "Package guide\n");
  await writeFile(path.join(packageRoot, "bootstrap.sh"), "#!/bin/sh\n");
  await writeFile(path.join(packageRoot, "server.mjs"), "export {}\n");
  await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);

  await validatePackageRoot(packageRoot);
});

test("validatePackageRoot requires declared CLI manifest and docs", async () => {
  const packageRoot = await makeTempPackageRoot();

  await writeFile(
    path.join(packageRoot, "tutti.app.json"),
    `${JSON.stringify({
      schemaVersion: "tutti.app.manifest.v1",
      appId: "test-app",
      version: "1.2.3",
      runtime: { bootstrap: "bootstrap.sh" },
      cli: { manifest: "tutti.cli.json" },
    })}\n`,
  );
  await writeFile(path.join(packageRoot, "AGENTS.md"), "Package guide\n");
  await writeFile(path.join(packageRoot, "bootstrap.sh"), "#!/bin/sh\n");
  await writeFile(path.join(packageRoot, "server.mjs"), "export {}\n");
  await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);

  await assert.rejects(
    validatePackageRoot(packageRoot),
    /Missing declared CLI manifest: tutti\.cli\.json/,
  );

  await writeFile(
    path.join(packageRoot, "tutti.cli.json"),
    `${JSON.stringify({
      schemaVersion: "tutti.app.cli.v1",
      scope: "test",
      documentation: { file: "COMMANDS.md" },
      commands: [
        {
          path: ["run"],
          summary: "Run test command",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
          output: {
            defaultMode: "json",
            json: true,
          },
          handler: {
            kind: "http",
            method: "POST",
            path: "/tutti/cli/run",
          },
        },
      ],
    })}\n`,
  );

  await assert.rejects(
    validatePackageRoot(packageRoot),
    /Missing CLI documentation file: COMMANDS\.md/,
  );
});

test("assertNoSymlinks rejects symlink entries", async () => {
  const packageRoot = await makeTempPackageRoot();
  await mkdir(path.join(packageRoot, "dist"));
  await writeFile(path.join(packageRoot, "dist", "index.html"), "ok");
  await symlink("index.html", path.join(packageRoot, "dist", "linked.html"));

  await assert.rejects(
    assertNoSymlinks(packageRoot),
    /Package contains symlink/,
  );
});

test("packageTuttiApp creates a valid daily-tech-radar package", async () => {
  const zipPath = await packageTuttiApp({ appId: "daily-tech-radar" });
  const packageRoot = path.resolve("build/tutti-app/daily-tech-radar/package");
  const manifest = JSON.parse(
    await readFile(path.join(packageRoot, "tutti.app.json"), "utf8"),
  );
  const sourceManifest = JSON.parse(
    await readFile(
      path.join(
        "apps",
        "daily-tech-radar",
        "tutti-package",
        "tutti.app.json",
      ),
      "utf8",
    ),
  );
  const bootstrap = await readFile(
    path.join(packageRoot, "bootstrap.sh"),
    "utf8",
  );
  const agents = await readFile(path.join(packageRoot, "AGENTS.md"), "utf8");
  const cliManifest = JSON.parse(
    await readFile(path.join(packageRoot, "tutti.cli.json"), "utf8"),
  );
  const commandDocs = await readFile(
    path.join(packageRoot, "COMMANDS.md"),
    "utf8",
  );
  const wrapper = await readFile(path.join(packageRoot, "server.mjs"), "utf8");
  const server = await readFile(
    path.join(packageRoot, "server", "server.js"),
    "utf8",
  );
  await assert.rejects(
    access(path.join(packageRoot, "node_modules")),
    /ENOENT/,
  );
  const assetNames = await readdir(path.join(packageRoot, "dist", "assets"));
  const cssAsset = assetNames.find((assetName) => assetName.endsWith(".css"));
  assert.ok(cssAsset);
  const clientAssets = await readFile(
    path.join(packageRoot, "dist", "assets", cssAsset),
    "utf8",
  );

  assert.equal(manifest.appId, "daily-tech-radar");
  assert.equal(manifest.version, sourceManifest.version);
  assert.equal(manifest.name, "Daily Product Radar");
  assert.deepEqual(manifest.cli, {
    manifest: "tutti.cli.json",
  });
  assert.equal(manifest.runtime.kind, undefined);
  assert.equal(manifest.runtime.bootstrap, "bootstrap.sh");
  assert.deepEqual(manifest.localizationInfo, {
    defaultLocale: "en-US",
    additionalLocales: [
      {
        locale: "zh-CN",
        file: "locales/zh-CN/manifest.json",
      },
    ],
  });
  const manifestLocale = JSON.parse(
    await readFile(path.join(packageRoot, "locales", "zh-CN", "manifest.json")),
  );
  assert.equal(manifestLocale.name, "每日产品雷达");
  assert.match(bootstrap, /TUTTI_APP_PACKAGE_DIR/);
  assert.match(bootstrap, /TUTTI_APP_NODE/);
  assert.match(
    bootstrap,
    /app_node="\$\{TUTTI_APP_NODE:-\$\{NEXTOP_APP_NODE:-node\}\}"/,
  );
  assert.match(
    bootstrap,
    /app_host="\$\{TUTTI_APP_HOST:-\$\{NEXTOP_APP_HOST:-127\.0\.0\.1\}\}"/,
  );
  assert.match(
    bootstrap,
    /app_port="\$\{TUTTI_APP_PORT:-\$\{NEXTOP_APP_PORT:-3002\}\}"/,
  );
  assert.match(bootstrap, /exec "\$app_node" "\$app_package_dir\/server\.mjs"/);
  assert.doesNotMatch(bootstrap, /exec node /);
  assert.match(agents, /@nextop-os\/daily-tech-radar/);
  assert.equal(cliManifest.schemaVersion, "tutti.app.cli.v1");
  assert.equal(cliManifest.scope, "radar");
  assert.equal(cliManifest.documentation.file, "COMMANDS.md");
  assert.deepEqual(
    cliManifest.commands.map((command) => command.handler.path),
    ["/tutti/cli/board", "/tutti/cli/search", "/tutti/cli/item"],
  );
  assert.match(commandDocs, /tutti --json radar board/);
  assert.match(commandDocs, /tutti --json radar search/);
  assert.match(wrapper, /daily-tech-radar/);
  assert.match(wrapper, /server\/server\.js/);
  assert.match(server, /createServerEntry/);
  assert.doesNotMatch(server, /from "@tanstack\/react-router"/);
  assert.doesNotMatch(server, /from "react\/jsx-runtime"/);
  assert.match(clientAssets, /--ink/);
  assert.equal(
    path.basename(zipPath),
    `daily-tech-radar-${sourceManifest.version}.zip`,
  );
});
