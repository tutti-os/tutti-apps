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
const publishConfigPath = path.join(rootDir, "tutti.publish.json");

const REQUIRED_PACKAGE_FILES = [
  "tutti.app.json",
  "AGENTS.md",
  "bootstrap.sh",
  "server.mjs",
];
const CLI_SEGMENT_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const PNPM_FALLBACK_COMMANDS = [
  "/opt/homebrew/bin/pnpm",
  "/usr/local/bin/pnpm",
];

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
    throw new Error(`Unknown Tutti app id: ${resolvedAppId}`);
  }

  return {
    appId: resolvedAppId,
    app,
  };
}

export async function assertNoSymlinks(root) {
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules") {
      continue;
    }

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

function validatePackageRelativePath(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`tutti.cli.json ${label} is required.`);
  }
  if (path.isAbsolute(value) || value.startsWith("\\")) {
    throw new Error(`tutti.cli.json ${label} must be a relative package path.`);
  }
  for (const part of value.split(/[\\/]/)) {
    if (part === "..") {
      throw new Error(
        `tutti.cli.json ${label} must not contain parent path segments.`,
      );
    }
  }
}

function validateCliSegment(value, label) {
  if (typeof value !== "string" || !CLI_SEGMENT_PATTERN.test(value.trim())) {
    throw new Error(
      `tutti.cli.json ${label} must contain lowercase letters, numbers, and hyphen only.`,
    );
  }
}

function validateCliInputSchema(schema, label) {
  if (!schema) {
    return;
  }
  if (schema.type !== "object") {
    throw new Error(`tutti.cli.json ${label}.type must be object.`);
  }
  if (!schema.properties || typeof schema.properties !== "object") {
    throw new Error(`tutti.cli.json ${label}.properties is required.`);
  }
  for (const [name, property] of Object.entries(schema.properties)) {
    validateCliSegment(name, `${label}.properties`);
    if (!property || typeof property !== "object") {
      throw new Error(
        `tutti.cli.json ${label}.properties.${name} must be an object.`,
      );
    }
    if (!["string", "boolean", "integer"].includes(property.type)) {
      throw new Error(
        `tutti.cli.json ${label}.properties.${name}.type must be string, boolean, or integer.`,
      );
    }
    for (const key of Object.keys(property)) {
      if (!["type", "description"].includes(key)) {
        throw new Error(
          `tutti.cli.json ${label}.properties.${name} has unsupported key ${key}.`,
        );
      }
    }
  }
  if (Object.hasOwn(schema, "required") && !Array.isArray(schema.required)) {
    throw new Error(`tutti.cli.json ${label}.required must be an array.`);
  }
  for (const required of schema.required ?? []) {
    if (typeof required !== "string") {
      throw new Error(
        `tutti.cli.json ${label}.required entries must be strings.`,
      );
    }
    if (!Object.hasOwn(schema.properties, required)) {
      throw new Error(
        `tutti.cli.json ${label}.required contains unknown property ${required}.`,
      );
    }
  }
  for (const key of Object.keys(schema)) {
    if (!["type", "properties", "required"].includes(key)) {
      throw new Error(`tutti.cli.json ${label} has unsupported key ${key}.`);
    }
  }
}

function validateCliOutput(output, label) {
  if (!output || !["json", "table"].includes(output.defaultMode)) {
    throw new Error(
      `tutti.cli.json ${label}.defaultMode must be json or table.`,
    );
  }
  if (output.defaultMode === "json" && output.json !== true) {
    throw new Error(
      `tutti.cli.json ${label}.json must be true when defaultMode is json.`,
    );
  }
  if (
    output.defaultMode === "table" &&
    (!output.table ||
      !Array.isArray(output.table.columns) ||
      output.table.columns.length === 0)
  ) {
    throw new Error(
      `tutti.cli.json ${label}.table.columns is required when defaultMode is table.`,
    );
  }
  if (output.table?.columns) {
    const seenColumnKeys = new Set();
    for (const [index, column] of output.table.columns.entries()) {
      validateCliSegment(column.key, `${label}.table.columns[${index}].key`);
      if (typeof column.label !== "string" || column.label.trim() === "") {
        throw new Error(
          `tutti.cli.json ${label}.table.columns[${index}].label is required.`,
        );
      }
      if (seenColumnKeys.has(column.key)) {
        throw new Error(
          `tutti.cli.json ${label}.table.columns key ${column.key} is duplicated.`,
        );
      }
      seenColumnKeys.add(column.key);
    }
  }
}

function validateCliHandler(handler, label) {
  if (handler?.kind !== "http") {
    throw new Error(`tutti.cli.json ${label}.kind must be http.`);
  }
  if (handler.method !== "POST") {
    throw new Error(`tutti.cli.json ${label}.method must be POST.`);
  }
  if (
    typeof handler.path !== "string" ||
    !handler.path.startsWith("/tutti/cli/")
  ) {
    throw new Error(
      `tutti.cli.json ${label}.path must start with /tutti/cli/.`,
    );
  }
  if (
    handler.timeoutMs !== undefined &&
    (!Number.isInteger(handler.timeoutMs) ||
      handler.timeoutMs < 1000 ||
      handler.timeoutMs > 300000)
  ) {
    throw new Error(
      `tutti.cli.json ${label}.timeoutMs must be between 1000 and 300000.`,
    );
  }
}

function validateCliManifest(cliManifest) {
  if (cliManifest.schemaVersion !== "tutti.app.cli.v1") {
    throw new Error("tutti.cli.json must use schemaVersion tutti.app.cli.v1.");
  }
  validateCliSegment(cliManifest.scope, "scope");
  if (
    !Array.isArray(cliManifest.commands) ||
    cliManifest.commands.length === 0
  ) {
    throw new Error("tutti.cli.json commands must be a non-empty array.");
  }

  const seenPaths = new Set();
  for (const [index, command] of cliManifest.commands.entries()) {
    const label = `commands[${index}]`;
    if (!Array.isArray(command.path) || command.path.length === 0) {
      throw new Error(`tutti.cli.json ${label}.path is required.`);
    }
    if (command.path[0] === cliManifest.scope) {
      throw new Error(`tutti.cli.json ${label}.path must not repeat scope.`);
    }
    for (const [segmentIndex, segment] of command.path.entries()) {
      validateCliSegment(segment, `${label}.path[${segmentIndex}]`);
    }
    const pathKey = command.path.join(".");
    if (seenPaths.has(pathKey)) {
      throw new Error(`tutti.cli.json command path ${pathKey} is duplicated.`);
    }
    seenPaths.add(pathKey);
    if (typeof command.summary !== "string" || command.summary.trim() === "") {
      throw new Error(`tutti.cli.json ${label}.summary is required.`);
    }
    validateCliInputSchema(command.inputSchema, `${label}.inputSchema`);
    validateCliOutput(command.output, `${label}.output`);
    validateCliHandler(command.handler, `${label}.handler`);
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

  const manifest = await readJson(path.join(packageRoot, "tutti.app.json"));
  if (manifest.schemaVersion !== "tutti.app.manifest.v1") {
    throw new Error(
      "tutti.app.json must use schemaVersion tutti.app.manifest.v1.",
    );
  }
  if (!manifest.appId || !manifest.version || !manifest.runtime?.bootstrap) {
    throw new Error(
      "tutti.app.json must define appId, version, and runtime.bootstrap.",
    );
  }
  if (manifest.cli?.manifest) {
    validatePackageRelativePath(manifest.cli.manifest, "cli.manifest");
    const cliManifestPath = path.join(packageRoot, manifest.cli.manifest);
    let cliManifest;
    try {
      cliManifest = await readJson(cliManifestPath);
    } catch {
      throw new Error(
        `Missing declared CLI manifest: ${manifest.cli.manifest}`,
      );
    }

    validateCliManifest(cliManifest);

    const documentationFile = cliManifest.documentation?.file;
    if (documentationFile) {
      validatePackageRelativePath(documentationFile, "documentation.file");
      try {
        await access(path.join(packageRoot, documentationFile));
      } catch {
        throw new Error(`Missing CLI documentation file: ${documentationFile}`);
      }
    }
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

async function run(command, args, options = {}, fallbackCommands = []) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      shell: false,
      ...options,
    });
    child.on("error", (error) => {
      if (error?.code === "ENOENT" && fallbackCommands.length > 0) {
        const [fallbackCommand, ...remainingFallbacks] = fallbackCommands;
        run(fallbackCommand, args, options, remainingFallbacks)
          .then(resolve)
          .catch(reject);
        return;
      }
      reject(error);
    });
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

async function runPnpm(args, options = {}) {
  return run("pnpm", args, options, PNPM_FALLBACK_COMMANDS);
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

async function readPackageSourceManifest(appConfig) {
  return readJson(
    path.join(rootDir, appConfig.packageSourceDir, "tutti.app.json"),
  );
}

async function writeManifest({ manifest, packageRoot }) {
  await writeFile(
    path.join(packageRoot, "tutti.app.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  return manifest;
}

async function copyManifestIcon({ manifest, packageSourceDir, packageRoot }) {
  const iconSrc = manifest.icon?.src;
  if (!iconSrc) {
    return;
  }

  await cp(
    path.join(packageSourceDir, iconSrc),
    path.join(packageRoot, iconSrc),
  );
}

async function copyManifestLocalizations({
  manifest,
  packageSourceDir,
  packageRoot,
}) {
  for (const locale of manifest.localizationInfo?.additionalLocales ?? []) {
    if (!locale.file) {
      continue;
    }

    await cp(
      path.join(packageSourceDir, locale.file),
      path.join(packageRoot, locale.file),
    );
  }
}

async function copyCliManifest({ manifest, packageSourceDir, packageRoot }) {
  const cliManifestPath = manifest.cli?.manifest;
  if (!cliManifestPath) {
    return;
  }
  validatePackageRelativePath(cliManifestPath, "cli.manifest");

  const sourcePath = path.join(packageSourceDir, cliManifestPath);
  const targetPath = path.join(packageRoot, cliManifestPath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath);

  const cliManifest = await readJson(sourcePath);
  const documentationFile = cliManifest.documentation?.file;
  if (documentationFile) {
    validatePackageRelativePath(documentationFile, "documentation.file");
    const documentationTarget = path.join(packageRoot, documentationFile);
    await mkdir(path.dirname(documentationTarget), { recursive: true });
    await cp(
      path.join(packageSourceDir, documentationFile),
      documentationTarget,
    );
  }
}

async function writeRuntimePackageJson({ packageRoot }) {
  const runtimePackage = {
    private: true,
    type: "module",
  };

  await writeFile(
    path.join(packageRoot, "package.json"),
    `${JSON.stringify(runtimePackage, null, 2)}\n`,
  );
}

async function bundleServer({ appConfig, appSourceDir, packageRoot }) {
  await mkdir(path.join(packageRoot, "server"), { recursive: true });
  await runPnpm([
    "--filter",
    appConfig.packageName,
    "exec",
    "esbuild",
    path.join(appSourceDir, "dist", "server", "server.js"),
    "--bundle",
    "--platform=node",
    "--format=esm",
    "--target=node22",
    "--banner:js=import { createRequire as __tuttiCreateRequire } from 'node:module'; const require = __tuttiCreateRequire(import.meta.url);",
    `--outfile=${path.join(packageRoot, "server", "server.js")}`,
  ]);
}

async function writePackageFiles({ appConfig, manifest }) {
  const packageSourceDir = path.join(rootDir, appConfig.packageSourceDir);
  const packageRoot = path.join(rootDir, appConfig.packageDir);
  const appSourceDir = path.join(rootDir, appConfig.sourceDir);

  await rm(packageRoot, { force: true, recursive: true });
  await mkdir(packageRoot, { recursive: true });

  await writeManifest({
    manifest,
    packageRoot,
  });

  await cp(
    path.join(packageSourceDir, "AGENTS.md"),
    path.join(packageRoot, "AGENTS.md"),
  );
  await cp(
    path.join(packageSourceDir, "bootstrap.sh"),
    path.join(packageRoot, "bootstrap.sh"),
  );
  await chmod(path.join(packageRoot, "bootstrap.sh"), 0o755);
  await cp(
    path.join(packageSourceDir, "server.mjs"),
    path.join(packageRoot, "server.mjs"),
  );
  await copyManifestIcon({ manifest, packageSourceDir, packageRoot });
  await copyManifestLocalizations({ manifest, packageSourceDir, packageRoot });
  await copyCliManifest({ manifest, packageSourceDir, packageRoot });
  await cp(
    path.join(appSourceDir, "dist", "client"),
    path.join(packageRoot, "dist"),
    { recursive: true },
  );
  await bundleServer({ appConfig, appSourceDir, packageRoot });
  await writeRuntimePackageJson({ packageRoot });

  await copyIfExists(
    path.join(packageSourceDir, "README.md"),
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

export async function packageTuttiApp({ appId = "" } = {}) {
  const config = await readPublishConfig();
  const { appId: resolvedAppId, app } = resolveAppConfig(config, appId);
  const manifest = await readPackageSourceManifest(app);
  const version = manifest.version ?? "0.0.0";

  await runPnpm(["--filter", app.packageName, "build"]);

  const { packageRoot } = await writePackageFiles({
    appConfig: app,
    manifest,
  });
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
  packageTuttiApp({ appId: args.appId }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
