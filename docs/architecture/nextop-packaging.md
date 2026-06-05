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
    icon.svg
    static/
    server/
```

Required files:

- `nextop.app.json`: source Nextop manifest. The packaging script writes the
  runtime version into the copied package manifest.
- `AGENTS.md`: package-level runtime guide for future agents inspecting the
  installed package.
- `bootstrap.sh`: executable entrypoint called by Nextop.
- `icon.svg`: App Center icon.

Optional files:

- `static/`: copied to packaged `dist/`.
- `server/`: copied to packaged `server/`.

## Publish Configuration

Root `nextop.publish.json` defines which apps are publishable and which apps are
enabled for each release environment.

```json
{
  "apps": {
    "github-trending": {
      "packageCommand": "pnpm package:nextop --app github-trending",
      "packageSourceDir": "apps/github-trending/nextop-package",
      "packageDir": "build/nextop-app/github-trending/package",
      "iconPath": "build/nextop-app/github-trending/package/icon.svg"
    }
  },
  "environments": {
    "production": {
      "defaultAppId": "github-trending",
      "appIds": ["github-trending"]
    }
  }
}
```

Add a new app to this file before enabling it in release workflows.

## Local Packaging

```bash
pnpm package:nextop --app github-trending
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

- Package roots must contain `nextop.app.json`, `AGENTS.md`, and executable
  `bootstrap.sh`.
- Package roots must not contain symlinks.
- App packages should treat `NEXTOP_APP_PACKAGE_DIR` as read-only.
- Durable runtime data belongs under `NEXTOP_APP_DATA_DIR`.
