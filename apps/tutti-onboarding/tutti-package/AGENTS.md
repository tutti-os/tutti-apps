# Tutti Onboarding Package

This package is the installed Tutti runtime for `tutti-onboarding`.

- `bootstrap.sh` is the runtime entrypoint called by Tutti. It prefers
  `$TUTTI_APP_NODE`, `$TUTTI_APP_PACKAGE_DIR`, `$TUTTI_APP_HOST`,
  `$TUTTI_APP_PORT`, `$TUTTI_APP_RUNTIME_DIR`, and `$TUTTI_APP_DATA_DIR`.
- `server.mjs` serves packaged static assets, exposes `/api/health`, and handles
  the read-only `/tutti/cli/status` command.
- The app is read-only and stores no durable data. If storage is introduced
  later, write only under `$TUTTI_APP_DATA_DIR`.

Treat `TUTTI_APP_PACKAGE_DIR` as read-only after startup.

## CLI Surface

The package exposes Tutti CLI scope `onboarding` through `tutti.cli.json`.

Handlers:

- `/tutti/cli/status`
