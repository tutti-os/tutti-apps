# Build System

## Why Turbo At The Root

Turbo is used at the repository root because this is a monorepo.

It handles:

- task orchestration across `apps/*` and `packages/*`
- dependency-aware execution
- caching
- parallelism
- one consistent command surface for agents and CI

Turbo is not an app bundler and does not replace Vite, TanStack Start, or
Next.js.

## App-Level Build Tools

Each app owns its real framework commands.

Examples:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build"
  }
}
```

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

```json
{
  "scripts": {
    "dev": "vinxi dev",
    "build": "vinxi build"
  }
}
```

Root commands call Turbo:

```bash
pnpm build
pnpm test
pnpm typecheck
```

App commands can be run directly with filters:

```bash
pnpm --filter @nextop-apps/github-trending dev
pnpm --filter @nextop-apps/github-trending build
```

## Framework Selection

Use this default decision rule:

- TanStack Start: dashboard/tool apps with typed server functions, loaders,
  route state, and TanStack Query.
- Next.js: content-heavy, SEO-heavy, or Vercel-first apps that benefit from the
  mature App Router ecosystem.
- Vite SPA: static prototypes or client-only apps that do not need a server
  runtime.

The GitHub Trending Reader is currently planned for TanStack Start because it is
a data-heavy tool with category filtering, README fetching, and typed
server/client data boundaries.
