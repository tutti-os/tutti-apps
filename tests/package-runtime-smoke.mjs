import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const packageRoot = path.join(
  root,
  "build",
  "tutti-app",
  "daily-tech-radar",
  "package",
);
const scratch = await mkdtemp(path.join(os.tmpdir(), "daily-radar-runtime-"));
const runtimeDir = path.join(scratch, "runtime");
const dataDir = path.join(scratch, "data");
await Promise.all([
  mkdir(runtimeDir, { recursive: true }),
  mkdir(dataDir, { recursive: true }),
]);

const port = await reservePort();
const bootstrap = path.join(packageRoot, "bootstrap.sh");
const shellPath = (value) =>
  process.platform === "win32" ? value.replaceAll("\\", "/") : value;
const invocation =
  process.platform === "win32"
    ? {
        command: process.env.TUTTI_APP_TEST_SHELL?.trim() || "bash",
        args: [shellPath(bootstrap)],
      }
    : { command: bootstrap, args: [] };
const child = spawn(invocation.command, invocation.args, {
  cwd: runtimeDir,
  env: {
    ...process.env,
    TUTTI_APP_DATA_DIR: shellPath(dataDir),
    TUTTI_APP_HOST: "127.0.0.1",
    TUTTI_APP_NODE: shellPath(process.execPath),
    TUTTI_APP_PACKAGE_DIR: shellPath(packageRoot),
    TUTTI_APP_PORT: String(port),
    TUTTI_APP_RUNTIME_DIR: shellPath(runtimeDir),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});

try {
  const response = await waitForHealth(port);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    app: "daily-tech-radar",
    ok: true,
  });
} finally {
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  await rm(scratch, { recursive: true, force: true });
}

if (child.exitCode && child.exitCode !== 0) {
  throw new Error(`Package runtime exited with ${child.exitCode}: ${stderr}`);
}

async function reservePort() {
  const server = http.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address === "object");
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return address.port;
}

async function waitForHealth(port) {
  let lastError;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      return await fetch(`http://127.0.0.1:${port}/api/health`);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw lastError ?? new Error("Timed out waiting for package runtime");
}
