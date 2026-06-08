# Nextop App Packaging

This repository can publish individual apps as Nextop workspace app packages.

## Source Layout

Each publishable app owns a `nextop-package/` directory:

```txt
apps/<app-id>/
  nextop-package/
    nextop.app.json
    AGENTS.md
    bootstrap.sh
    server.mjs
    icon.png
```

Required files:

- `nextop.app.json`: source Nextop manifest. The packaging script writes the
  runtime version into the copied package manifest.
- `AGENTS.md`: package-level runtime guide for future agents inspecting the
  installed package.
- `bootstrap.sh`: executable entrypoint called by Nextop.
- `server.mjs`: optional package wrapper for frameworks that build request
  handlers instead of self-listening servers.
- `icon.png`: App Center icon.

Optional files:

- Framework build output can be copied from the app root into packaged `dist/`
  and `server/`.
- Production runtime dependencies can be copied into packaged `node_modules/`
  when the server build externalizes Node dependencies.

The app source, Vite config, and TanStack Start build belong at the app root.
Do not keep a hand-written app server in `nextop-package/server`; use a thin
wrapper such as `server.mjs` only to adapt the framework handler to the Nextop
host/port contract.

Expected TanStack Start package shape after implementation:

```txt
apps/<app-id>/
  src/
  app/
  vite.config.ts
  package.json
  nextop-package/
    nextop.app.json
    AGENTS.md
    bootstrap.sh
    icon.png

build/nextop-app/<app-id>/package/
  nextop.app.json
  AGENTS.md
  bootstrap.sh
  server.mjs
  icon.png
  dist/
  server/
    server.js
  node_modules/
```

For Daily Tech Radar, `bootstrap.sh` starts the Nextop wrapper:

```sh
exec node "$NEXTOP_APP_PACKAGE_DIR/server.mjs"
```

The wrapper serves `dist/`, delegates SSR and Server Functions to
`server/server.js`, and exposes `/api/health`.

## Publish Configuration

Root `nextop.publish.json` defines which apps are publishable and which apps are
enabled for each release environment.

```json
{
  "apps": {
    "daily-tech-radar": {
      "packageCommand": "pnpm package:nextop --app daily-tech-radar",
      "packageSourceDir": "apps/daily-tech-radar/nextop-package",
      "packageDir": "build/nextop-app/daily-tech-radar/package",
      "iconPath": "build/nextop-app/daily-tech-radar/package/icon.png"
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

## Local Packaging

```bash
pnpm package:nextop --app daily-tech-radar
```

Output:

```txt
build/nextop-app/<app-id>/package/
build/nextop-app/<app-id>/<app-id>-<version>.zip
```

The package directory is the input consumed by the reusable release workflow in
`nextop-os/nextop`.

## GitHub Actions

Production workflow:

- `.github/workflows/publish-nextop-app.yml`
- runs on `main` pushes and manual dispatch
- defaults to the production default app in `nextop.publish.json`

Staging workflow:

- `.github/workflows/publish-nextop-app-staging.yml`
- runs only on manual dispatch
- publishes to the staging release prefix

Both workflows resolve the selected app through
`scripts/resolve-nextop-publish-target.mjs`, then call:

```txt
nextop-os/nextop/.github/workflows/publish-nextop-app-release.yml@main
```

## Safety Rules

- Package roots must contain `nextop.app.json`, `AGENTS.md`, executable
  `bootstrap.sh`, and the runtime entrypoint referenced by the bootstrap script.
- Package application files must not contain symlinks. Packaged `node_modules`
  may keep package-manager-internal symlinks when required by the runtime.
- App packages should treat `NEXTOP_APP_PACKAGE_DIR` as read-only.
- Durable runtime data belongs under `NEXTOP_APP_DATA_DIR`.
