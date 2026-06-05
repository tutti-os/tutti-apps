# GitHub Trending Reader Nextop Package

This package runs GitHub Trending Reader as a Nextop workspace app.

## Package Layout

- `nextop.app.json`: Nextop manifest.
- `bootstrap.sh`: executable runtime entrypoint.
- `dist/`: packaged static UI assets.
- `server/server.mjs`: package-local Node HTTP server.
- `icon.svg`: App Center icon.

## Runtime

Nextop executes `bootstrap.sh` with no arguments. The bootstrap script binds the
server to `NEXTOP_APP_HOST:NEXTOP_APP_PORT` and stores durable data under
`NEXTOP_APP_DATA_DIR`.

Treat `NEXTOP_APP_PACKAGE_DIR` as read-only. Use `NEXTOP_APP_DATA_DIR` for
durable data, `NEXTOP_APP_RUNTIME_DIR` for scratch files, and
`NEXTOP_APP_LOG_DIR` for additional logs.
