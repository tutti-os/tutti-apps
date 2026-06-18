import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const host = process.env.HOST || process.env.TUTTI_APP_HOST || "127.0.0.1";
const port = Number(process.env.PORT || process.env.TUTTI_APP_PORT || 0);
const packageDir = path.resolve(
  process.env.TUTTI_APP_PACKAGE_DIR || process.cwd(),
);
const publicDir = path.join(packageDir, "dist");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
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
  const resolvedPath = path.resolve(path.join(publicDir, normalized));
  const publicRoot = path.resolve(publicDir);

  if (!resolvedPath.startsWith(publicRoot)) {
    return null;
  }

  try {
    const fileStat = await stat(resolvedPath);
    return fileStat.isFile() ? resolvedPath : null;
  } catch {
    if (!path.extname(requestedPath)) {
      return resolveStaticPath("/index.html");
    }
    return null;
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(
    request.url || "/",
    `http://${request.headers.host || `${host}:${port}`}`,
  );

  if (request.method === "GET" && url.pathname === "/healthz") {
    response.writeHead(204);
    response.end();
    return;
  }

  const staticPath = await resolveStaticPath(url.pathname);
  if (!staticPath) {
    sendJson(response, 404, { error: "Not Found" });
    return;
  }

  response.writeHead(200, {
    "content-type":
      contentTypes.get(path.extname(staticPath)) || "application/octet-stream",
    "cache-control": url.pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "no-store",
  });
  createReadStream(staticPath).pipe(response);
});

server.listen(port, host, () => {
  const address = server.address();
  const resolvedPort =
    typeof address === "object" && address ? address.port : port;
  console.log(`tutti-onboarding listening on http://${host}:${resolvedPort}`);
});
