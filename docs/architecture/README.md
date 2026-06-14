# Architecture

This directory explains how `tutti-apps` is structured and where future agents
should look before changing module boundaries.

## Documents

- `project-structure.md`: workspace shape and ownership rules.
- `build-system.md`: why the root uses Turbo and how app-level builds work.
- `tutti-packaging.md`: package source layout, local packaging, and release workflows.

## Current Architecture Summary

`tutti-apps` is a pnpm workspace with Turbo task orchestration.

```txt
tutti-apps/
  apps/
    daily-tech-radar/
  packages/
  docs/
```

The root owns workspace-wide commands and conventions. Each app owns its
runtime, framework, product documentation, and UI implementation. Shared code
only moves to `packages/*` after more than one app needs the boundary.
