import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredFiles = [
  "public/assets/应用-全景图.png",
  "public/assets/应用-示例.png",
  "public/assets/绑定agent-codex.png",
  "public/assets/绑定agent- Claude code.png",
  "public/assets/agent协作-@应用.png",
  "public/assets/应用-agent用-@应用.mp4",
  "tutti-package/tutti.app.json",
  "tutti-package/tutti.cli.json",
  "tutti-package/bootstrap.sh",
  "tutti-package/server.mjs",
];

await Promise.all(
  requiredFiles.map((file) => access(path.join(appRoot, file))),
);

console.log("tutti-onboarding assets are present");
