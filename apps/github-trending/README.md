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

## Tech Direction

- TanStack Start
- Tailwind CSS
- shadcn/ui
- TanStack Query
- GitHub REST API
- README markdown rendering with sanitization

See `docs/technical-plan.md` for the full product and architecture plan.
