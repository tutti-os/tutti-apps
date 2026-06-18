import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredFiles = [
  "public/app.js",
  "public/styles.css",
  "public/assets/apps-agent.mp4",
  "public/assets/apps-example.png",
  "public/assets/apps-overview.png",
  "public/assets/at-app.png",
  "public/assets/at-chat.png",
  "public/assets/at-file.png",
  "public/assets/at-task.png",
  "public/assets/bind-claude.png",
  "public/assets/bind-codex.png",
  "public/assets/control-overview.png",
  "public/assets/control-waiting.png",
  "public/assets/goal-breakdown.png",
  "public/assets/goal-run.png",
  "public/assets/goal-set.png",
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
