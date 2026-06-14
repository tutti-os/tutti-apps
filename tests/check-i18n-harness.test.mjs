import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { checkI18nHarness } from "../scripts/check-i18n-harness.mjs";

async function makeFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "tutti-i18n-harness-"));
  const appDir = path.join(root, "apps", "daily-tech-radar");
  await mkdir(path.join(appDir, "src", "components"), { recursive: true });
  await mkdir(path.join(appDir, "src", "i18n", "locales", "zh-CN"), {
    recursive: true,
  });
  await mkdir(path.join(appDir, "src", "i18n", "locales", "en-US"), {
    recursive: true,
  });
  await writeFile(
    path.join(appDir, "i18n-harness.config.json"),
    `${JSON.stringify(
      {
        appPath: "apps/daily-tech-radar",
        allowlist: ["GitHub", "Product Hunt", "AI", "EN"],
        locales: ["zh-CN", "en-US"],
        namespaces: ["radar"],
        sourceGlobs: ["src/components/**/*.tsx"],
      },
      null,
      2,
    )}\n`,
  );

  return { appDir, root };
}

async function writeRadarResources(appDir, zh, en) {
  await writeFile(
    path.join(appDir, "src", "i18n", "locales", "zh-CN", "radar.json"),
    `${JSON.stringify(zh, null, 2)}\n`,
  );
  await writeFile(
    path.join(appDir, "src", "i18n", "locales", "en-US", "radar.json"),
    `${JSON.stringify(en, null, 2)}\n`,
  );
}

test("i18n harness rejects visible TSX copy that is not translated", async () => {
  const { appDir, root } = await makeFixture();
  await writeRadarResources(
    appDir,
    { hero: { title: "标题" } },
    { hero: { title: "Title" } },
  );
  await writeFile(
    path.join(appDir, "src", "components", "fixture.tsx"),
    'export function Fixture() { return <button aria-label="保存">保存</button>; }\n',
  );

  const result = await checkI18nHarness({
    app: "daily-tech-radar",
    cwd: root,
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /保存/);
});

test("i18n harness rejects translation keys missing from any locale", async () => {
  const { appDir, root } = await makeFixture();
  await writeRadarResources(
    appDir,
    { hero: { title: "标题" } },
    { hero: { title: "Title" } },
  );
  await writeFile(
    path.join(appDir, "src", "components", "fixture.tsx"),
    'export function Fixture({ t }) { return <h1>{t("hero.subtitle")}</h1>; }\n',
  );

  const result = await checkI18nHarness({
    app: "daily-tech-radar",
    cwd: root,
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /hero\.subtitle/);
});

test("i18n harness accepts translated copy and allowlisted brand tokens", async () => {
  const { appDir, root } = await makeFixture();
  await writeRadarResources(
    appDir,
    {
      hero: { title: "标题" },
      source: { github: "GitHub" },
    },
    {
      hero: { title: "Title" },
      source: { github: "GitHub" },
    },
  );
  await writeFile(
    path.join(appDir, "src", "components", "fixture.tsx"),
    [
      "export function Fixture({ t }) {",
      '  return <section aria-label={t("hero.title")}><span>GitHub</span>{t("source.github")}</section>;',
      "}",
      "",
    ].join("\n"),
  );

  const result = await checkI18nHarness({
    app: "daily-tech-radar",
    cwd: root,
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});
