# Architecture

This directory explains how `nextop-apps` is structured and where future agents
should look before changing module boundaries.

## Documents

- `project-structure.md`: workspace shape and ownership rules.
- `build-system.md`: why the root uses Turbo and how app-level builds work.

## Current Architecture Summary

`nextop-apps` is a pnpm workspace with Turbo task orchestration.

```txt
nextop-apps/
  apps/
    github-trending/
  packages/
  docs/
```

The root owns workspace-wide commands and conventions. Each app owns its
runtime, framework, product documentation, and UI implementation. Shared code
only moves to `packages/*` after more than one app needs the boundary.
