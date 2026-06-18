import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredFiles = [
  "public/app.js",
  "public/styles.css",
  "public/assets/apps-agent.mp4",
  "public/assets/apps-example.webp",
  "public/assets/apps-overview.webp",
  "public/assets/at-app.webp",
  "public/assets/at-chat.webp",
  "public/assets/at-file.webp",
  "public/assets/at-task.webp",
  "public/assets/bind-claude.webp",
  "public/assets/bind-codex.webp",
  "public/assets/control-overview.webp",
  "public/assets/control-waiting.webp",
  "public/assets/goal-breakdown.webp",
  "public/assets/goal-run.webp",
  "public/assets/goal-set.webp",
  "public/icon.png",
  "tutti-package/tutti.app.json",
  "tutti-package/bootstrap.sh",
  "tutti-package/icon.png",
  "tutti-package/server.mjs",
];

await Promise.all(
  requiredFiles.map((file) => access(path.join(appRoot, file))),
);

const indexHtml = await readFile(path.join(appRoot, "index.html"), "utf8");
if (!indexHtml.includes("Tutti · Getting Started")) {
  throw new Error("index.html must match the built-in onboarding entrypoint.");
}

const appJs = await readFile(path.join(appRoot, "public/app.js"), "utf8");
if (!appJs.includes("开始使用 Tutti 👋")) {
  throw new Error("public/app.js must include the source onboarding copy.");
}
const translations = readTranslations(appJs);
assertLocaleKeys(translations);
assertReferencedTranslationKeys(indexHtml, translations);

const manifest = JSON.parse(
  await readFile(path.join(appRoot, "tutti-package/tutti.app.json"), "utf8"),
);
if (
  manifest.name !== "Getting Started" ||
  manifest.runtime?.healthcheckPath !== "/healthz"
) {
  throw new Error(
    "tutti.app.json must match the built-in onboarding manifest.",
  );
}

console.log("tutti-onboarding assets are present");

function readTranslations(source) {
  const match = source.match(/const T = (\{[\s\S]*?\n\});\n\nlet lang/);
  if (!match) {
    throw new Error(
      "public/app.js must define the onboarding translation map.",
    );
  }
  const translations = vm.runInNewContext(`(${match[1]})`);
  for (const locale of ["zh", "en"]) {
    if (!translations[locale] || typeof translations[locale] !== "object") {
      throw new Error(`public/app.js must define ${locale} translations.`);
    }
  }
  return translations;
}

function assertLocaleKeys(translations) {
  const zhKeys = Object.keys(translations.zh).sort();
  const enKeys = Object.keys(translations.en).sort();
  const missingInEn = zhKeys.filter((key) => !enKeys.includes(key));
  const missingInZh = enKeys.filter((key) => !zhKeys.includes(key));
  if (missingInEn.length || missingInZh.length) {
    throw new Error(
      [
        "zh/en translation keys must match.",
        missingInEn.length ? `Missing in en: ${missingInEn.join(", ")}` : "",
        missingInZh.length ? `Missing in zh: ${missingInZh.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  }
}

function assertReferencedTranslationKeys(html, translations) {
  const referencedKeys = new Set(["t_doc_title", "t_soon"]);
  for (const match of html.matchAll(/id="(t_[^"]+)"/g)) {
    referencedKeys.add(match[1]);
  }
  for (const match of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const entry of match[1].split(/\s+/)) {
      const [, key] = entry.split(":");
      if (key) referencedKeys.add(key);
    }
  }
  for (const locale of ["zh", "en"]) {
    const missing = [...referencedKeys].filter(
      (key) => !(key in translations[locale]),
    );
    if (missing.length) {
      throw new Error(
        `${locale} translations are missing referenced keys: ${missing.join(", ")}`,
      );
    }
  }
}
