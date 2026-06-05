# Nextop Package Source

This directory contains the source files used by the root `pnpm package:nextop`
command.

Files here are copied into `build/nextop-app/github-trending/package`.

The app implementation is still planned. Until the TanStack Start app exists,
the package serves a static placeholder page that documents the intended
product boundary.

The current `server/` and `static/` folders are placeholder-only assets. After
the TanStack Start app is implemented, the package command should copy the app's
build output into `.output/`, and `bootstrap.sh` should launch:

```sh
node "$NEXTOP_APP_PACKAGE_DIR/.output/server/index.mjs"
```

At that point remove `server/` and `static/` from this package source directory.
