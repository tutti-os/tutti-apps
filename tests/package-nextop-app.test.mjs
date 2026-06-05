import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertNoSymlinks,
  packageNextopApp,
  readPublishConfig,
  resolveAppConfig,
  validatePackageRoot,
} from "../scripts/package-nextop-app.mjs";

async function makeTempPackageRoot() {
  return mkdtemp(path.join(os.tmpdir(), "nextop-apps-package-test-"));
}

test("publish config registers github-trending as the default app", async () => {
  const config = await readPublishConfig();
  const { appId, app } = resolveAppConfig(config, "");

  assert.equal(appId, "github-trending");
  assert.equal(app.packageSourceDir, "apps/github-trending/nextop-package");
  assert.equal(app.packageCommand, "pnpm package:nextop --app github-trending");
  assert.equal(app.packageDir, "build/nextop-app/github-trending/package");
  assert.equal(
    app.iconPath,
    "build/nextop-app/github-trending/package/icon.svg",
  );
});

test("validatePackageRoot requires the files Nextop imports", async () => {
  const packageRoot = await makeTempPackageRoot();

  await assert.rejects(
    validatePackageRoot(packageRoot),
    /Missing required package file: nextop\.app\.json/,
  );

  await writeFile(
    path.join(packageRoot, "nextop.app.json"),
    `${JSON.stringify({
      schemaVersion: "nextop.app.manifest.v1",
      appId: "test-app",
      version: "1.2.3",
      runtime: { bootstrap: "bootstrap.sh" },
    })}\n`,
  );
  await writeFile(path.join(packageRoot, "AGENTS.md"), "Package guide\n");
  await writeFile(path.join(packageRoot, "bootstrap.sh"), "#!/bin/sh\n");
  await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);

  await validatePackageRoot(packageRoot);
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

test("packageNextopApp creates a valid github-trending package", async () => {
  const zipPath = await packageNextopApp({ appId: "github-trending" });
  const packageRoot = path.resolve("build/nextop-app/github-trending/package");
  const manifest = JSON.parse(
    await readFile(path.join(packageRoot, "nextop.app.json"), "utf8"),
  );
  const bootstrap = await readFile(
    path.join(packageRoot, "bootstrap.sh"),
    "utf8",
  );
  const agents = await readFile(path.join(packageRoot, "AGENTS.md"), "utf8");
  const index = await readFile(
    path.join(packageRoot, "dist", "index.html"),
    "utf8",
  );

  assert.equal(manifest.appId, "github-trending");
  assert.equal(manifest.runtime.bootstrap, "bootstrap.sh");
  assert.match(bootstrap, /NEXTOP_APP_PACKAGE_DIR/);
  assert.match(
    bootstrap,
    /exec node "\$NEXTOP_APP_PACKAGE_DIR\/server\/server\.mjs"/,
  );
  assert.match(agents, /GitHub Trending Reader/);
  assert.match(index, /TanStack Start/);
  assert.match(zipPath, /github-trending-0\.0\.0\.zip$/);
});
