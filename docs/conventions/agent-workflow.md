# Agent Workflow

## Entry Sequence

When entering the repository:

1. Read root `AGENTS.md`.
2. Read the nearest nested `AGENTS.md` for the target directory.
3. Read the relevant docs under `docs/architecture` or the target app's `docs`.
4. Inspect package scripts before running commands.

## Recording Decisions

Add durable notes when a decision affects future work.

Use:

- `docs/architecture/*` for module boundaries, framework decisions, build
  system choices, and app/package ownership.
- `docs/conventions/*` for recurring workflow rules, validation rules, and
  agent traps.
- `apps/<app-id>/docs/*` for app-specific product and technical plans.

Do not leave important architecture decisions only in chat.

## Editing Rules

- Keep changes scoped to the app/package being modified.
- Do not import from another app's private source tree.
- Promote shared code into `packages/*` only when the shared boundary is real.
- Update docs when changing structure, commands, or ownership.
- Prefer focused app/package checks before workspace-wide checks.

## Verification

For narrow changes:

```bash
pnpm --filter <package> typecheck
pnpm --filter <package> test
```

For repository-level changes:

```bash
pnpm lint
pnpm test
pnpm typecheck
```

For frontend changes, start the target app and verify the UI in a browser.

## Recurring Traps

- Publishable Tutti apps have more than one release entry point. When adding or
  enabling an app, do not stop after `tutti.publish.json`; also check the
  production and staging workflow `app_id` choice lists, then run the resolver
  for the explicit app id and `all`.
- External PR review gate refreshes use a low-privilege
  `pull_request_review` signal followed by a privileged `workflow_run`.
  Preserve that split for fork PRs, and pass the PR identity through an artifact;
  do not rely on `workflow_run.pull_requests` or commit-to-PR lookup for forked
  review events.
