import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { Readable } from "node:stream";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 0);
const packageDir = process.env.NEXTOP_APP_PACKAGE_DIR || process.cwd();
const publicDir = path.join(packageDir, "dist");
const startServer = await import(path.join(packageDir, "server/server.js"));

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

async function resolveStaticPath(urlPath) {
  const normalized = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(publicDir, normalized);
  const publicRoot = path.resolve(publicDir);
  const resolvedPath = path.resolve(absolutePath);

  if (!resolvedPath.startsWith(publicRoot)) {
    return null;
  }

  try {
    const fileStat = await stat(resolvedPath);
    return fileStat.isFile() ? resolvedPath : null;
  } catch {
    return null;
  }
}

function toWebRequest(request, url) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item);
      }
      continue;
    }
    if (value) {
      headers.set(key, value);
    }
  }

  const hasBody = !["GET", "HEAD"].includes(request.method || "GET");
  return new Request(url, {
    body: hasBody ? request : undefined,
    duplex: hasBody ? "half" : undefined,
    headers,
    method: request.method,
  });
}

async function writeWebResponse(nodeResponse, webResponse) {
  nodeResponse.writeHead(
    webResponse.status,
    Object.fromEntries(webResponse.headers.entries()),
  );

  if (!webResponse.body) {
    nodeResponse.end();
    return;
  }

  Readable.fromWeb(webResponse.body).pipe(nodeResponse);
}

const server = createServer(async (request, response) => {
  const url = new URL(
    request.url || "/",
    `http://${request.headers.host || `${host}:${port}`}`,
  );

  if (url.pathname === "/api/health") {
    sendJson(response, 200, { app: "daily-tech-radar", ok: true });
    return;
  }

  const staticPath = await resolveStaticPath(url.pathname);
  if (staticPath) {
    response.writeHead(200, {
      "content-type":
        contentTypes.get(path.extname(staticPath)) ||
        "application/octet-stream",
    });
    createReadStream(staticPath).pipe(response);
    return;
  }

  try {
    const webRequest = toWebRequest(request, url.href);
    const webResponse = await startServer.default.fetch(webRequest);
    await writeWebResponse(response, webResponse);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Internal Server Error" });
  }
});

server.listen(port, host, () => {
  const address = server.address();
  const resolvedPort =
    typeof address === "object" && address ? address.port : port;
  console.log(`daily-tech-radar listening on http://${host}:${resolvedPort}`);
});
