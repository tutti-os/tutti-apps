#!/usr/bin/env node
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { validateRelease } from "@nextop-os/app-release-tools/build-nextop-app-release";

async function verifyNextopAppReleaseArtifacts(options) {
  const releaseFiles = normalizeFiles(options.releaseFiles);
  const verifyArtifacts = options.verifyArtifacts !== false;

  if (releaseFiles.length === 0) {
    throw new Error("at least one --release-file is required");
  }

  const checkedArtifactUrls = new Set();
  for (const releaseFile of releaseFiles) {
    const release = JSON.parse(await readFile(releaseFile, "utf8"));
    validateRelease(release);

    if (!verifyArtifacts) {
      continue;
    }

    const digest = await digestArtifact(release.artifactUrl);
    checkedArtifactUrls.add(release.artifactUrl);
    if (digest.sha256 !== release.artifactSha256.toLowerCase()) {
      throw new Error(
        `release ${release.appId} artifact sha256 mismatch: want ${release.artifactSha256} got ${digest.sha256}`,
      );
    }
    if (
      Number.isSafeInteger(release.artifactSizeBytes) &&
      digest.size !== release.artifactSizeBytes
    ) {
      throw new Error(
        `release ${release.appId} artifact size mismatch: want ${release.artifactSizeBytes} got ${digest.size}`,
      );
    }
  }

  return {
    releaseFiles,
    checkedArtifactCount: checkedArtifactUrls.size,
  };
}

async function digestArtifact(artifactUrl) {
  const url = String(artifactUrl).trim();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return digestHTTPArtifact(url);
  }
  if (url.startsWith("file://")) {
    return digestFileArtifact(fileURLToPath(url));
  }
  return digestFileArtifact(path.resolve(url));
}

async function digestHTTPArtifact(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await digestHTTPArtifactOnce(url);
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await delay(1000 * attempt);
      }
    }
  }
  throw lastError;
}

async function digestHTTPArtifactOnce(url) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(
      `download artifact failed: ${url}: HTTP ${response.status}`,
    );
  }
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of response.body) {
    const buffer = Buffer.from(chunk);
    hash.update(buffer);
    size += buffer.length;
  }
  return {
    sha256: hash.digest("hex"),
    size,
  };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function digestFileArtifact(filePath) {
  const hash = createHash("sha256");
  let size = 0;
  await new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on("data", (chunk) => {
      hash.update(chunk);
      size += chunk.length;
    });
    stream.on("error", reject);
    stream.on("end", resolve);
  });
  return {
    sha256: hash.digest("hex"),
    size,
  };
}

function normalizeFiles(value) {
  const files = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(/[\n,]/)
        .map((file) => file.trim())
        .filter(Boolean);
  return files.map((file) => path.resolve(file));
}

function parseArgs(argv) {
  const result = {
    releaseFiles: [],
    verifyArtifacts: true,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--release-file") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("missing value for --release-file");
      }
      result.releaseFiles.push(value);
      index += 1;
      continue;
    }
    if (arg === "--skip-artifact-download") {
      result.verifyArtifacts = false;
      continue;
    }
    throw new Error(`unexpected argument: ${arg}`);
  }
  return result;
}

async function main() {
  const result = await verifyNextopAppReleaseArtifacts(
    parseArgs(process.argv.slice(2)),
  );
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
