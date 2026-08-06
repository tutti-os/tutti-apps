import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
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
const invocation =
  process.platform === "win32"
    ? {
        command: process.env.TUTTI_APP_TEST_SHELL?.trim() || "bash",
        args: [bootstrap],
      }
    : { command: bootstrap, args: [] };
const child = spawn(invocation.command, invocation.args, {
  cwd: runtimeDir,
  env: {
    ...process.env,
    TUTTI_APP_DATA_DIR: dataDir,
    TUTTI_APP_HOST: "127.0.0.1",
    TUTTI_APP_NODE: process.execPath,
    TUTTI_APP_PACKAGE_DIR: packageRoot,
    TUTTI_APP_PORT: String(port),
    TUTTI_APP_RUNTIME_DIR: runtimeDir,
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let stderr = "";
child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  stderr += chunk;
});
const childExit = new Promise((_, reject) => {
  child.once("exit", (code, signal) => {
    reject(
      new Error(
        `Package runtime exited before health check (code=${code}, signal=${signal}): ${stderr}`,
      ),
    );
  });
});
const childTermination = new Promise((resolve) => child.once("exit", resolve));

try {
  const response = await Promise.race([waitForHealth(port), childExit]);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    app: "daily-tech-radar",
    ok: true,
  });
} finally {
  if (process.platform === "win32" && child.pid) {
    await new Promise((resolve) => {
      execFile(
        "taskkill",
        ["/pid", String(child.pid), "/T", "/F"],
        () => resolve(),
      );
    });
  } else {
    child.kill("SIGTERM");
  }
  await Promise.race([
    childTermination,
    new Promise((resolve) => setTimeout(resolve, 2_000)),
  ]);
  await rm(scratch, { recursive: true, force: true });
}

if (process.platform !== "win32" && child.exitCode && child.exitCode !== 0) {
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
