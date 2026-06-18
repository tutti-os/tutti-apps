# Getting Started Onboarding Package

This package is the installed Tutti runtime for the Getting Started onboarding
app.

- `bootstrap.sh` is the runtime entrypoint called by Tutti. It prefers
  `$TUTTI_APP_NODE`, `$TUTTI_APP_PACKAGE_DIR`, `$TUTTI_APP_HOST`,
  `$TUTTI_APP_PORT`, `$TUTTI_APP_RUNTIME_DIR`, and `$TUTTI_APP_DATA_DIR`.
- `server.mjs` serves packaged static assets and exposes `/healthz`.
- The app is read-only and stores no durable data. If storage is introduced
  later, write only under `$TUTTI_APP_DATA_DIR`.

Treat `TUTTI_APP_PACKAGE_DIR` as read-only after startup.
