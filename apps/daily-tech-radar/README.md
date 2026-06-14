# 每日产品雷达

Daily Product Radar for Tutti.

The app reads Product Hunt and GitHub daily trend packages through
`@tutti-os/daily-tech-radar` and renders the card-based prototype experience
from `.codex-artifacts/tech-radar-card-prototype/index.html`.

```bash
pnpm --filter @tutti-apps/daily-tech-radar dev
pnpm --filter @tutti-apps/daily-tech-radar test
pnpm --filter @tutti-apps/daily-tech-radar typecheck
pnpm package:tutti --app daily-tech-radar
```
