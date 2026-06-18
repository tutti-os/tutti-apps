import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const requiredFiles = [
  "public/assets/应用-全景图.webp",
  "public/assets/应用-示例.webp",
  "public/assets/绑定agent-codex.webp",
  "public/assets/绑定agent- Claude code.webp",
  "public/assets/agent协作-任务拆解.webp",
  "public/assets/agent协作-任务执行.webp",
  "public/assets/agent协作-@应用.webp",
  "public/assets/agent协作-@文件.webp",
  "public/assets/agent协作-@任务.webp",
  "public/assets/agent协作-需要用户处理.webp",
  "public/assets/应用-agent用-@应用.mp4",
  "public/icon.png",
  "tutti-package/tutti.app.json",
  "tutti-package/tutti.cli.json",
  "tutti-package/bootstrap.sh",
  "tutti-package/icon.png",
  "tutti-package/server.mjs",
];

await Promise.all(
  requiredFiles.map((file) => access(path.join(appRoot, file))),
);

console.log("tutti-onboarding assets are present");
