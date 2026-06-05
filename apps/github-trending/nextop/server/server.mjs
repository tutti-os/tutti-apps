import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 0);
const publicDir =
  process.env.GITHUB_TRENDING_PUBLIC_DIR || path.join(process.cwd(), "dist");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function resolveStaticPath(urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const normalized = path
    .normalize(requestedPath)
    .replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(publicDir, normalized);
  const publicRoot = path.resolve(publicDir);
  const resolvedPath = path.resolve(absolutePath);

  if (!resolvedPath.startsWith(publicRoot)) {
    return null;
  }

  try {
    const fileStat = await stat(resolvedPath);
    if (fileStat.isFile()) {
      return resolvedPath;
    }
  } catch {
    return path.join(publicDir, "index.html");
  }

  return path.join(publicDir, "index.html");
}

const server = createServer(async (request, response) => {
  const url = new URL(
    request.url || "/",
    `http://${request.headers.host || "localhost"}`,
  );

  if (url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true, app: "github-trending" });
    return;
  }

  const filePath = await resolveStaticPath(url.pathname);
  if (!filePath) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  response.writeHead(200, {
    "content-type":
      contentTypes.get(path.extname(filePath)) || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  const address = server.address();
  const resolvedPort =
    typeof address === "object" && address ? address.port : port;
  console.log(`github-trending listening on http://${host}:${resolvedPort}`);
});
