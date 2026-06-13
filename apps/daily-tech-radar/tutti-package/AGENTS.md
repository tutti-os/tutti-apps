# Daily Tech Radar Package

This package is the installed Tutti runtime for `daily-tech-radar`.

- `bootstrap.sh` is the runtime entrypoint called by Tutti. It prefers
  `$TUTTI_APP_NODE`, `$TUTTI_APP_PACKAGE_DIR`, `$TUTTI_APP_HOST`,
  `$TUTTI_APP_PORT`, `$TUTTI_APP_RUNTIME_DIR`, and `$TUTTI_APP_DATA_DIR`,
  but keeps local direct-start fallbacks for development.
- `server.mjs` serves packaged `dist/` assets, delegates requests to the
  TanStack Start server build, and exposes `/api/health`.
- The app reads trend data through `@nextop-os/daily-tech-radar`.
- `DAILY_TECH_RADAR_BASE_URL` may point to a private mirror; otherwise the SDK
  default CDN is used.
- v1 does not use SQLite or local GitHub/Product Hunt scraping.

Treat `TUTTI_APP_PACKAGE_DIR` as read-only. Runtime data, if introduced later,
must live under `TUTTI_APP_DATA_DIR`.

## CLI Surface

The package exposes Tutti CLI scope `radar` through `tutti.cli.json`.

Handlers are read-only HTTP `POST` routes served by the TanStack Start build:

- `/tutti/cli/board`
- `/tutti/cli/search`
- `/tutti/cli/item`

The CLI commands reuse the same SDK-backed board data as `/api/radar`. Do not
add CLI writes unless durable storage is first introduced under
`TUTTI_APP_DATA_DIR`.
