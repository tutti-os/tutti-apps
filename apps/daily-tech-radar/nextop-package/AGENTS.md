# Daily Tech Radar Package

This package is the installed Nextop runtime for `daily-tech-radar`.

- `bootstrap.sh` is the runtime entrypoint called by Nextop. It prefers
  `$NEXTOP_APP_NODE`, `$NEXTOP_APP_PACKAGE_DIR`, `$NEXTOP_APP_HOST`,
  `$NEXTOP_APP_PORT`, `$NEXTOP_APP_RUNTIME_DIR`, and `$NEXTOP_APP_DATA_DIR`,
  but keeps local direct-start fallbacks for development.
- `server.mjs` serves packaged `dist/` assets, delegates requests to the
  TanStack Start server build, and exposes `/api/health`.
- The app reads trend data through `@nextop-os/daily-tech-radar`.
- `DAILY_TECH_RADAR_BASE_URL` may point to a private mirror; otherwise the SDK
  default CDN is used.
- v1 does not use SQLite or local GitHub/Product Hunt scraping.

Treat `NEXTOP_APP_PACKAGE_DIR` as read-only. Runtime data, if introduced later,
must live under `NEXTOP_APP_DATA_DIR`.

## CLI Surface

The package exposes Nextop CLI scope `radar` through `nextop.cli.json`.

Handlers are read-only HTTP `POST` routes served by the TanStack Start build:

- `/nextop/cli/board`
- `/nextop/cli/search`
- `/nextop/cli/item`

The CLI commands reuse the same SDK-backed board data as `/api/radar`. Do not
add CLI writes unless durable storage is first introduced under
`NEXTOP_APP_DATA_DIR`.
