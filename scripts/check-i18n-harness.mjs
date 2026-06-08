import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultExcludedFiles = [
  /\.test\.tsx$/,
  /(^|\/)routeTree\.gen\.ts$/,
  /(^|\/)src\/i18n\//,
];

const literalVisibleAttributes = new Set([
  "alt",
  "aria-label",
  "placeholder",
  "title",
]);

const ignoredAttributes = new Set([
  "className",
  "data-testid",
  "href",
  "id",
  "key",
  "rel",
  "src",
  "target",
  "type",
]);

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export async function checkI18nHarness({ app, cwd = repoRoot } = {}) {
  if (!app) {
    throw new Error("checkI18nHarness requires an app id");
  }

  const appDir = path.join(cwd, "apps", app);
  const config = await readJson(path.join(appDir, "i18n-harness.config.json"));
  const configuredAppDir = path.join(cwd, config.appPath ?? `apps/${app}`);
  const allowlist = new Set(config.allowlist ?? []);
  const locales = config.locales ?? ["zh-CN", "en-US"];
  const namespaces = config.namespaces ?? ["radar"];
  const errors = [];
  const resources = {};

  for (const locale of locales) {
    resources[locale] = {};
    for (const namespace of namespaces) {
      resources[locale][namespace] = await readJson(
        path.join(
          configuredAppDir,
          "src",
          "i18n",
          "locales",
          locale,
          `${namespace}.json`,
        ),
      );
    }
  }

  for (const namespace of namespaces) {
    const baselineLocale = locales[0];
    const baselineKeys = collectNestedKeys(
      resources[baselineLocale][namespace],
    );

    for (const locale of locales.slice(1)) {
      const localeKeys = collectNestedKeys(resources[locale][namespace]);
      const missing = [...baselineKeys].filter((key) => !localeKeys.has(key));
      const extra = [...localeKeys].filter((key) => !baselineKeys.has(key));

      for (const key of missing) {
        errors.push(`${locale}:${namespace} is missing key "${key}"`);
      }
      for (const key of extra) {
        errors.push(`${locale}:${namespace} has extra key "${key}"`);
      }
    }
  }

  const files = await collectSourceFiles({
    appDir: configuredAppDir,
    globs: config.sourceGlobs ?? ["src/**/*.tsx"],
  });

  for (const file of files) {
    const relativeFile = normalizePath(path.relative(configuredAppDir, file));

    if (shouldExclude(relativeFile)) {
      continue;
    }

    const source = await readFile(file, "utf8");
    checkTranslationKeys({
      errors,
      file: relativeFile,
      locales,
      namespaces,
      resources,
      source,
    });
    checkBareVisibleCopy({
      allowlist,
      errors,
      file: relativeFile,
      source,
    });
  }

  return {
    errors,
    ok: errors.length === 0,
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function collectNestedKeys(value, prefix = "") {
  const keys = new Set();

  if (Array.isArray(value) || value == null || typeof value !== "object") {
    if (prefix) {
      keys.add(prefix);
    }
    return keys;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPrefix = prefix ? `${prefix}.${key}` : key;
    for (const nestedKey of collectNestedKeys(child, childPrefix)) {
      keys.add(nestedKey);
    }
  }

  return keys;
}

async function collectSourceFiles({ appDir, globs }) {
  const files = new Set();

  for (const glob of globs) {
    const { baseDir, extension } = parseGlob(glob);
    const absoluteBaseDir = path.join(appDir, baseDir);

    for (const file of await walkFiles(absoluteBaseDir)) {
      if (file.endsWith(extension)) {
        files.add(file);
      }
    }
  }

  return [...files].sort();
}

function parseGlob(glob) {
  const normalized = normalizePath(glob);
  const recursiveIndex = normalized.indexOf("/**/");

  if (recursiveIndex >= 0) {
    return {
      baseDir: normalized.slice(0, recursiveIndex),
      extension: normalized.slice(normalized.lastIndexOf("*") + 1),
    };
  }

  return {
    baseDir: path.dirname(normalized),
    extension: path.extname(normalized),
  };
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    (error) => {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    },
  );
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath)));
    } else if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function shouldExclude(relativeFile) {
  return defaultExcludedFiles.some((pattern) => pattern.test(relativeFile));
}

function checkTranslationKeys({
  errors,
  file,
  locales,
  namespaces,
  resources,
  source,
}) {
  const tCallPattern = /(?:\bt|i18n\.t)\(\s*["']([^"']+)["']/g;
  let match = tCallPattern.exec(source);

  while (match) {
    const key = match[1];
    const namespacesToCheck = key.includes(":")
      ? [key.split(":")[0]]
      : namespaces;
    const normalizedKey = key.includes(":")
      ? key.split(":").slice(1).join(":")
      : key;

    for (const locale of locales) {
      for (const namespace of namespacesToCheck) {
        if (!hasNestedKey(resources[locale]?.[namespace], normalizedKey)) {
          errors.push(
            `${file} references missing i18n key "${key}" in ${locale}`,
          );
        }
      }
    }

    match = tCallPattern.exec(source);
  }
}

function hasNestedKey(resource, key) {
  if (!resource) {
    return false;
  }

  let current = resource;
  for (const segment of key.split(".")) {
    if (
      current == null ||
      typeof current !== "object" ||
      !(segment in current)
    ) {
      return false;
    }
    current = current[segment];
  }

  return true;
}

function checkBareVisibleCopy({ allowlist, errors, file, source }) {
  const jsxTextPattern = />\s*([^<>{}\n][^<>{}]*)\s*</g;
  let jsxMatch = jsxTextPattern.exec(source);

  while (jsxMatch) {
    if (!isLikelyJsxText(source, jsxMatch.index)) {
      jsxMatch = jsxTextPattern.exec(source);
      continue;
    }

    const value = normalizeVisibleText(jsxMatch[1]);
    if (isVisibleCopy(value, allowlist)) {
      errors.push(`${file} contains bare visible JSX text "${value}"`);
    }
    jsxMatch = jsxTextPattern.exec(source);
  }

  const attrPattern =
    /\b([A-Za-z][A-Za-z0-9:-]*)\s*=\s*(["'])([^"']*?[A-Za-z\u4e00-\u9fff][^"']*?)\2/g;
  let attrMatch = attrPattern.exec(source);

  while (attrMatch) {
    const [, attribute, , value] = attrMatch;
    if (
      ignoredAttributes.has(attribute) ||
      !literalVisibleAttributes.has(attribute)
    ) {
      attrMatch = attrPattern.exec(source);
      continue;
    }

    const normalizedValue = normalizeVisibleText(value);
    if (isVisibleCopy(normalizedValue, allowlist)) {
      errors.push(
        `${file} contains bare visible ${attribute} text "${normalizedValue}"`,
      );
    }

    attrMatch = attrPattern.exec(source);
  }
}

function isLikelyJsxText(source, greaterThanIndex) {
  const tagStart = source.lastIndexOf("<", greaterThanIndex);
  if (tagStart < 0) {
    return false;
  }

  const charBeforeTag = source[tagStart - 1] ?? "\n";
  const candidateTag = source.slice(tagStart, greaterThanIndex + 1);
  const tagPrefix = source.slice(tagStart, tagStart + 3);

  if (/[A-Za-z0-9_$]/.test(charBeforeTag)) {
    return false;
  }
  if (candidateTag.includes(";")) {
    return false;
  }

  return /^<\/?[A-Za-z]/.test(tagPrefix) || tagPrefix === "<>";
}

function normalizeVisibleText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function isVisibleCopy(value, allowlist) {
  if (!value || allowlist.has(value)) {
    return false;
  }

  if (/\)\s*:|\?\s*\(|=>|\b(?:const|return|function)\b/.test(value)) {
    return false;
  }

  const withoutAllowedTokens = [...allowlist].reduce(
    (current, token) => current.replaceAll(token, ""),
    value,
  );

  if (!/[A-Za-z\u4e00-\u9fff]/.test(withoutAllowedTokens)) {
    return false;
  }

  if (/^[A-Z0-9._/#:+-]+$/.test(withoutAllowedTokens)) {
    return false;
  }

  return true;
}

function normalizePath(file) {
  return file.split(path.sep).join("/");
}

async function main() {
  const appIndex = process.argv.indexOf("--app");
  const app = appIndex >= 0 ? process.argv[appIndex + 1] : undefined;
  const result = await checkI18nHarness({ app });

  if (!result.ok) {
    for (const error of result.errors) {
      console.error(error);
    }
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
