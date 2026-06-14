import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const rootDir = path.resolve(import.meta.dirname, "..");
const skippedDirs = new Set([
  ".git",
  ".next",
  ".turbo",
  ".worktrees",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const skippedExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".lock",
  ".png",
  ".webp",
  ".zip",
]);
const deprecatedBrandPattern = new RegExp(
  ["@nex" + "top", "nex" + "top(?:[-_.\\\\/]|\\\\b)", "NEX" + "TOP_"].join("|"),
  "i",
);

async function listTextFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!skippedDirs.has(entry.name)) {
        files.push(...(await listTextFiles(path.join(directory, entry.name))));
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    if (!skippedExtensions.has(path.extname(filePath))) {
      files.push(filePath);
    }
  }

  return files;
}

test("repository-facing source uses Tutti branding", async () => {
  const files = await listTextFiles(rootDir);
  const offenders = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    if (deprecatedBrandPattern.test(content)) {
      offenders.push(path.relative(rootDir, filePath));
    }
  }

  assert.deepEqual(offenders.sort(), []);
});
