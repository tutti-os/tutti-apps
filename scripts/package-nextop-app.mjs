import { spawn } from "node:child_process";
import {
  access,
  chmod,
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), "..");
const publishConfigPath = path.join(rootDir, "nextop.publish.json");

const REQUIRED_PACKAGE_FILES = ["nextop.app.json", "AGENTS.md", "bootstrap.sh"];

function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    appId: "",
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
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function readPublishConfig() {
  return readJson(publishConfigPath);
}

export function resolveAppConfig(config, appId) {
  const resolvedAppId = appId || config.environments?.production?.defaultAppId;
  if (!resolvedAppId) {
    throw new Error(
      "No app id provided and no production default app is configured.",
    );
  }

  const app = config.apps?.[resolvedAppId];
  if (!app) {
    throw new Error(`Unknown Nextop app id: ${resolvedAppId}`);
  }

  return {
    appId: resolvedAppId,
    app,
  };
}

export async function assertNoSymlinks(root) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    const entryStat = await lstat(entryPath);
    if (entryStat.isSymbolicLink()) {
      throw new Error(
        `Package contains symlink: ${path.relative(root, entryPath)}`,
      );
    }
    if (entry.isDirectory()) {
      await assertNoSymlinks(entryPath);
    }
  }
}

export async function validatePackageRoot(packageRoot) {
  for (const relativePath of REQUIRED_PACKAGE_FILES) {
    const absolutePath = path.join(packageRoot, relativePath);
    try {
      await access(absolutePath);
    } catch {
      throw new Error(`Missing required package file: ${relativePath}`);
    }
  }

  const manifest = await readJson(path.join(packageRoot, "nextop.app.json"));
  if (manifest.schemaVersion !== "nextop.app.manifest.v1") {
    throw new Error(
      "nextop.app.json must use schemaVersion nextop.app.manifest.v1.",
    );
  }
  if (!manifest.appId || !manifest.version || !manifest.runtime?.bootstrap) {
    throw new Error(
      "nextop.app.json must define appId, version, and runtime.bootstrap.",
    );
  }

  const agents = await readFile(path.join(packageRoot, "AGENTS.md"), "utf8");
  if (agents.trim().length === 0) {
    throw new Error("AGENTS.md must be non-empty.");
  }

  const bootstrapStat = await stat(path.join(packageRoot, "bootstrap.sh"));
  if ((bootstrapStat.mode & 0o111) === 0) {
    throw new Error("bootstrap.sh must be executable.");
  }

  await assertNoSymlinks(packageRoot);
}

async function run(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(`${command} ${args.join(" ")} exited with code ${code}`),
      );
    });
  });
}

async function readAppPackage(appConfig) {
  return readJson(path.join(rootDir, appConfig.sourceDir, "package.json"));
}

async function copyIfExists(from, to) {
  try {
    await access(from);
  } catch {
    return false;
  }
  await cp(from, to, { recursive: true });
  return true;
}

async function writeManifest({ nextopDir, packageRoot, version }) {
  const manifest = await readJson(path.join(nextopDir, "nextop.app.json"));
  manifest.version = version;
  await writeFile(
    path.join(packageRoot, "nextop.app.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

async function writePackageFiles({ appConfig, version }) {
  const nextopDir = path.join(rootDir, appConfig.nextopDir);
  const packageRoot = path.join(rootDir, appConfig.packageDir);

  await rm(packageRoot, { force: true, recursive: true });
  await mkdir(packageRoot, { recursive: true });

  const manifest = await writeManifest({ nextopDir, packageRoot, version });

  await cp(
    path.join(nextopDir, "AGENTS.md"),
    path.join(packageRoot, "AGENTS.md"),
  );
  await cp(
    path.join(nextopDir, "bootstrap.sh"),
    path.join(packageRoot, "bootstrap.sh"),
  );
  await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);
  await cp(
    path.join(nextopDir, "icon.svg"),
    path.join(packageRoot, "icon.svg"),
  );

  await copyIfExists(
    path.join(nextopDir, "server"),
    path.join(packageRoot, "server"),
  );
  await copyIfExists(
    path.join(nextopDir, "static"),
    path.join(packageRoot, "dist"),
  );
  await copyIfExists(
    path.join(nextopDir, "README.md"),
    path.join(packageRoot, "README.md"),
  );

  return {
    manifest,
    packageRoot,
  };
}

async function createZip({ appId, packageRoot, version, buildRoot }) {
  const appBuildRoot = path.join(rootDir, buildRoot, appId);
  const zipPath = path.join(appBuildRoot, `${appId}-${version}.zip`);
  await rm(zipPath, { force: true });
  await run("zip", ["-qry", zipPath, "."], { cwd: packageRoot });
  return zipPath;
}

export async function packageNextopApp({ appId = "" } = {}) {
  const config = await readPublishConfig();
  const { appId: resolvedAppId, app } = resolveAppConfig(config, appId);
  const appPackage = await readAppPackage(app);
  const version = appPackage.version ?? "0.0.0";

  const { packageRoot } = await writePackageFiles({ appConfig: app, version });
  await validatePackageRoot(packageRoot);

  const zipPath = await createZip({
    appId: resolvedAppId,
    packageRoot,
    version,
    buildRoot: config.buildRoot,
  });

  console.log(`Created ${zipPath}`);
  return zipPath;
}

if (process.argv[1] === scriptPath) {
  const args = parseArgs();
  packageNextopApp({ appId: args.appId }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
