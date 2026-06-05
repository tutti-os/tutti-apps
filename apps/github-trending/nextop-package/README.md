# Nextop Package Source

This directory contains the source files used by the root `pnpm package:nextop`
command.

Files here are copied into `build/nextop-app/github-trending/package`.

The package command builds the TanStack Start app first, then copies:

- `apps/github-trending/dist/server` to package `server/`
- `apps/github-trending/dist/client` to package `dist/`
- production runtime dependencies to package `node_modules/`

`server.mjs` is a thin Nextop runtime wrapper. It serves static client assets
from `dist/`, delegates SSR and Server Functions to `server/server.js`, and
exposes `/api/health` for the Nextop runtime health check.
