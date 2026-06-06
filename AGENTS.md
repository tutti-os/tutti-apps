# AGENTS.md

## Directory Guide

This file is the repository-wide entry point for agents working in `nextop-apps`.
Read it first, then read the closest nested `AGENTS.md` before editing inside
`apps/` or `packages/`.

Keep this root file focused on cross-repository boundaries, commands, and
documentation entry points. App-specific and package-specific details belong in
the nearest directory-level `AGENTS.md`.

## Core Documentation Index

- Product and onboarding: `README.md`
- Repository architecture: `docs/architecture/README.md`
- Project structure: `docs/architecture/project-structure.md`
- Build system: `docs/architecture/build-system.md`
- Nextop app packaging: `docs/architecture/nextop-packaging.md`
- Agent workflow conventions: `docs/conventions/agent-workflow.md`
- Directory-level guidance: `apps/AGENTS.md`, `packages/AGENTS.md`

## Repository Shape

This is a pnpm + Turbo monorepo for multiple Nextop apps.

- `apps/*`: independently runnable applications.
- `packages/*`: shared libraries, contracts, config, and utilities.
- `docs/*`: durable repository architecture, conventions, and agent notes.

Rule of thumb:

- App-specific product behavior belongs in `apps/<app-id>`.
- Code moves into `packages/*` only when there is a real shared boundary.
- Documentation that teaches future agents how the repository works belongs in
  `docs/architecture` or `docs/conventions`.
- Publishable app package sources belong in `apps/<app-id>/nextop-package`.
- The root `nextop.publish.json` file controls which apps can be published and
  the default app for each release environment.

## Routing Guide

Read the closest `AGENTS.md` before editing files in that area:

- `apps/*` -> `apps/AGENTS.md`
- `packages/*` -> `packages/AGENTS.md`
- `docs/*` -> this root file plus the local docs index

Use this root file for repository-wide defaults only.

## Repository-Wide Rules

- Do not import one app's private source from another app.
- Move shared contracts or reusable logic into `packages/*`.
- Do not create vague shared packages such as `common`, `shared`, or `utils`.
  Prefer domain names such as `github`, `trend-classification`, or `app-config`.
- Package names use the npm scope `@nextop-apps/*`.
- Internal dependencies use `workspace:*`.
- Keep TypeScript strict and inherit from `tsconfig.base.json`.
- Use Tailwind CSS and shadcn/ui for app UI unless an app documents another
  design system.
- Keep root scripts generic and delegated through Turbo.
- When structural rules change, update the matching document under
  `docs/architecture` or `docs/conventions`.
- When Nextop app packaging behavior changes, update
  `docs/architecture/nextop-packaging.md`.
- When a fix resolves a recurring bug pattern or agent trap, add the durable
  note to `docs/conventions/agent-workflow.md`.

## Build Boundary

Turbo is the monorepo task orchestrator. It is not a replacement for app-level
framework build tools.

- Root `pnpm build` runs `turbo run build`.
- A TanStack Start app should run its own Vite/TanStack Start build inside its
  package script.
- A Next.js app should run `next build` inside its package script.
- The root should not directly call `vite`, `next`, or another app-specific
  build command.

## Validation Strategy

Use the narrowest meaningful checks first:

```bash
pnpm --filter <package> typecheck
pnpm --filter <package> test
```

Before marking broad work ready:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

For frontend changes, start the target app and verify the main screen in a
browser.

## Common Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm package:nextop --app daily-tech-radar
pnpm test
pnpm typecheck
pnpm lint
```

```bash
pnpm --filter @nextop-apps/daily-tech-radar dev
pnpm --filter @nextop-apps/daily-tech-radar typecheck
pnpm --filter @nextop-apps/daily-tech-radar test
```

## Git Commit Policy

Git commits must not include `Co-authored-by` trailers or other co-author
metadata.
