import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), "..");
const publishConfigPath = path.join(rootDir, "nextop.publish.json");

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    appId: "",
    environment: "production",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--app") {
      args.appId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--app=")) {
      args.appId = arg.slice("--app=".length);
      continue;
    }
    if (arg === "--environment") {
      args.environment = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--environment=")) {
      args.environment = arg.slice("--environment=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function readPublishConfig() {
  return JSON.parse(await readFile(publishConfigPath, "utf8"));
}

export function resolvePublishTarget(
  config,
  { appId = "", environment = "production" } = {},
) {
  const envConfig = config.environments?.[environment];
  if (!envConfig) {
    throw new Error(`Unknown publish environment: ${environment}`);
  }

  const resolvedAppId = appId || envConfig.defaultAppId;
  if (!resolvedAppId) {
    throw new Error(
      `No app id provided and no default app configured for ${environment}.`,
    );
  }

  if (!envConfig.appIds?.includes(resolvedAppId)) {
    throw new Error(
      `App ${resolvedAppId} is not enabled for ${environment} publishing.`,
    );
  }

  const app = config.apps?.[resolvedAppId];
  if (!app) {
    throw new Error(`Unknown Nextop app id: ${resolvedAppId}`);
  }

  return {
    app_id: resolvedAppId,
    package_command: app.packageCommand,
    package_dir: app.packageDir,
    icon_path: app.iconPath,
  };
}

async function writeGithubOutputs(
  target,
  outputPath = process.env.GITHUB_OUTPUT,
) {
  if (!outputPath) {
    return;
  }
  const lines = Object.entries(target).map(([key, value]) => `${key}=${value}`);
  await appendFile(outputPath, `${lines.join("\n")}\n`);
}

if (process.argv[1] === scriptPath) {
  const args = parseArgs();
  const config = await readPublishConfig();
  const target = resolvePublishTarget(config, {
    appId: args.appId,
    environment: args.environment,
  });

  console.log(JSON.stringify(target, null, 2));
  await writeGithubOutputs(target);
}
