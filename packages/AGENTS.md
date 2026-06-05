# AGENTS.md

## Packages Boundary

`packages/*` contains shared libraries, contracts, config, and utilities.

Create a package only when there is a real shared boundary. Do not create vague
packages named `shared`, `common`, or `utils`.

## Rules

- Packages must not depend on app-private source code.
- Keep package APIs narrow and documented.
- Use `@nextop-apps/<package-id>` package names.
- Prefer pure TypeScript for reusable contracts and logic.
- Keep browser-only, server-only, and cross-runtime code separated.

## Candidate Packages

Likely future packages:

- `packages/github`: GitHub REST client and normalized GitHub types.
- `packages/trend-classification`: taxonomy, category scoring, and ranking.
- `packages/config`: shared TS/Tailwind/Biome config if repetition appears.

Do not promote code out of `apps/github-trending` until a second app or a clear
app-independent boundary needs it.

## Validation

```bash
pnpm --filter @nextop-apps/<package-id> typecheck
pnpm --filter @nextop-apps/<package-id> test
```
