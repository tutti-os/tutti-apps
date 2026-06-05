# GitHub Trending Reader

Category-first GitHub Trending reader with README previews.

## Product Direction

The app should help developers scan what is trending by product category, not by a single global rank.

MVP layout:

- Left sidebar: category navigation.
- Center board: grouped category sections with compact repo rows.
- Repo row: metadata plus README thumbnail preview.
- Right panel: selected repo README only.

The right panel intentionally excludes issues, pull requests, discussions, related repos, release cards, and AI summary cards in the first version.

## Nextop Packaging

The app's Nextop package source lives in `nextop/`.

```bash
pnpm package:nextop --app github-trending
```

Package output:

```txt
build/nextop-app/github-trending/package/
build/nextop-app/github-trending/github-trending-<version>.zip
```

Root `nextop.publish.json` controls which environments can publish this app.

## Tech Direction

- TanStack Start
- Tailwind CSS
- shadcn/ui
- TanStack Query
- GitHub REST API
- README markdown rendering with sanitization

See `docs/technical-plan.md` for the full product and architecture plan.
