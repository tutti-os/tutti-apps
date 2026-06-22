# Tutti App Packaging

This repository can publish individual apps as Tutti workspace app packages.

## Source Layout

Each publishable app owns a `tutti-package/` directory:

```txt
apps/<app-id>/
  tutti-package/
    tutti.app.json
    AGENTS.md
    bootstrap.sh
    server.mjs
    icon.<ext>
```

Required files:

- `tutti.app.json`: source Tutti manifest. The packaging script writes the
  runtime version into the copied package manifest.
- `AGENTS.md`: package-level runtime guide for future agents inspecting the
  installed package.
- `bootstrap.sh`: executable entrypoint called by Tutti.
- `server.mjs`: optional package wrapper for frameworks that build request
  handlers instead of self-listening servers.
- Manifest icon asset: App Center icon referenced by `tutti.app.json`
  `icon.src`, commonly `icon.png`, `icon.webp`, or `icon.svg`.

Optional files:

- Framework build output can be copied from the app root into packaged `dist/`
  and `server/`.
- Production runtime dependencies can be copied into packaged `node_modules/`
  when the server build externalizes Node dependencies.
- `tutti.cli.json` can be included when `tutti.app.json` declares
  `cli.manifest`; each command must route to an app-owned
  `POST /tutti/cli/*` handler.
- `COMMANDS.md` or another package-local documentation file can be referenced
  by `tutti.cli.json` for CLI help output.

The app source, Vite config, and TanStack Start build belong at the app root.
Do not keep a hand-written app server in `tutti-package/server`; use a thin
wrapper such as `server.mjs` only to adapt the framework handler to the Tutti
host/port contract.

Expected TanStack Start package shape after implementation:

```txt
apps/<app-id>/
  src/
  app/
  vite.config.ts
  package.json
  tutti-package/
    tutti.app.json
    AGENTS.md
    bootstrap.sh
    icon.<ext>

build/tutti-app/<app-id>/package/
  tutti.app.json
  AGENTS.md
  bootstrap.sh
  server.mjs
  icon.<ext>
  dist/
  server/
    server.js
  node_modules/
```

For Daily Tech Radar, `bootstrap.sh` starts the Tutti wrapper:

```sh
exec node "$TUTTI_APP_PACKAGE_DIR/server.mjs"
```

The wrapper serves `dist/`, delegates SSR and Server Functions to
`server/server.js`, and exposes `/api/health`.

Daily Tech Radar also exposes the optional `radar` CLI scope:

```txt
tutti.cli.json
COMMANDS.md
```

The command handlers live in the TanStack Start server routes under
`/tutti/cli/*` and are packaged through the same server bundle as the UI.

## Publish Configuration

Root `tutti.publish.json` defines which apps are publishable and which apps are
enabled for each release environment.

```json
{
  "apps": {
    "daily-tech-radar": {
      "packageCommand": "pnpm package:tutti --app daily-tech-radar",
      "packageSourceDir": "apps/daily-tech-radar/tutti-package",
      "packageDir": "build/tutti-app/daily-tech-radar/package",
      "iconPath": "build/tutti-app/daily-tech-radar/package/icon.png"
    }
  },
  "environments": {
    "production": {
      "defaultAppId": "daily-tech-radar",
      "appIds": ["daily-tech-radar"]
    }
  }
}
```

Add a new app to this file before enabling it in release workflows.

When enabling a new publishable app, also add the app id to the manual
`app_id` choice list in both release workflows:

- `.github/workflows/publish-tutti-app.yml`
- `.github/workflows/publish-tutti-app-staging.yml`

Then validate both the explicit app id and `all` through
`scripts/resolve-tutti-publish-target.mjs` for production and staging.

## Local Packaging

```bash
pnpm package:tutti --app daily-tech-radar
```

Output:

```txt
build/tutti-app/<app-id>/package/
build/tutti-app/<app-id>/<app-id>-<version>.zip
```

The package directory is the input consumed by the reusable release workflow in
`tutti-os/tutti`.

## GitHub Actions

Production workflow:

- `.github/workflows/publish-tutti-app.yml`
- runs on production release tag pushes and manual dispatch
- defaults to the production default app in `tutti.publish.json`
- manual dispatch can select one configured app or `all`

Staging workflow:

- `.github/workflows/publish-tutti-app-staging.yml`
- runs only on manual dispatch
- publishes to the staging release prefix
- manual dispatch can select one configured app or `all`

Both workflows resolve the selected app, or expand `all` to every app enabled
for the selected environment, through `scripts/resolve-tutti-publish-target.mjs`.
They publish the resulting target matrix through:

```txt
tutti-os/tutti/.github/workflows/publish-tutti-app-release.yml@main
```

The resolver passes each target's `release_tag_prefix`. For the standard app
layout this is:

```txt
<app-id>-v
```

Production releases are workflow-driven. Manual dispatch passes `release_bump`
(`patch`, `minor`, or `major`) to the reusable workflow, which calculates the
next version from tags such as `daily-tech-radar-v1.2.3`, publishes the S3
release, verifies it, then creates the next annotated tag. Staging releases
leave `release_bump` empty and publish `manifest.version+<short git sha>` from
the packaged manifest.

Manual publishing has three catalog modes:

1. Release only: leave `publish_catalog` and `catalog_only` disabled. The
   workflow uploads the app release and updates `apps/<appId>/latest.json`; App
   Center sees it after a later catalog publish.
2. Release and catalog: enable `publish_catalog`. The workflow uploads the app
   release and then updates `catalog.json`.
3. Catalog only: enable `catalog_only`. The workflow skips packaging and app
   release upload, then publishes the existing `apps/<appId>/latest.json` into
   `catalog.json` without bumping a new version.

## Safety Rules

- Package roots must contain `tutti.app.json`, `AGENTS.md`, executable
  `bootstrap.sh`, and the runtime entrypoint referenced by the bootstrap script.
- Package application files must not contain symlinks. Packaged `node_modules`
  may keep package-manager-internal symlinks when required by the runtime.
- App packages should treat `TUTTI_APP_PACKAGE_DIR` as read-only.
- Durable runtime data belongs under `TUTTI_APP_DATA_DIR`.
