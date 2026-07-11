import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const rootDir = path.resolve(import.meta.dirname, "..");
const scanRoots = [
  path.join(rootDir, "apps", "daily-tech-radar"),
  path.join(rootDir, "scripts"),
];
const sourceExtensions = new Set([".cjs", ".js", ".json", ".mjs", ".sh", ".ts", ".tsx"]);
const forbidden = [
  ["agent-acp-kit dependency", /@tutti-os\/agent-acp-kit/],
  ["workspace-app Agent preferences route", /\/preferences\/agent/],
  ["workspace-app Agent status route", /\/agent-providers\/status/],
  ["workspace-app Agent composer route", /\/agent-providers\/[^/]+\/composer-options/],
  ["consumer package patch", /patch-agent-acp-kit/],
  ["raw Tutti Agent provider CLI", /(?:\bagent\s+providers\b|["']agent["']\s*,\s*["']providers["'])/],
];

test("daily-tech-radar remains a no-Agent app without platform integration copies", async () => {
  const violations = [];
  for (const root of scanRoots) {
    for (const file of await sourceFiles(root)) {
      const relative = path.relative(rootDir, file);
      const content = await readFile(file, "utf8");
      for (const [label, pattern] of forbidden) {
        if (pattern.test(content)) violations.push(`${relative}: ${label}`);
      }
      if (path.basename(file).startsWith("patch-agent-acp-kit")) {
        violations.push(`${relative}: consumer package patch filename`);
      }
    }
  }

  assert.deepEqual(violations, []);
});

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["build", "dist", "node_modules"].includes(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(fullPath));
    else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) files.push(fullPath);
  }
  return files;
}
