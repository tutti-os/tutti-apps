# Daily Tech Radar Package

This package is the installed Nextop runtime for `daily-tech-radar`.

- `bootstrap.sh` is the runtime entrypoint called by Nextop and must launch
  Node through `$NEXTOP_APP_NODE`.
- `server.mjs` serves packaged `dist/` assets, delegates requests to the
  TanStack Start server build, and exposes `/api/health`.
- The app reads trend data through `@nextop-os/daily-tech-radar`.
- `DAILY_TECH_RADAR_BASE_URL` may point to a private mirror; otherwise the SDK
  default CDN is used.
- v1 does not use SQLite or local GitHub/Product Hunt scraping.

Treat `NEXTOP_APP_PACKAGE_DIR` as read-only. Runtime data, if introduced later,
must live under `NEXTOP_APP_DATA_DIR`.
