# 2026-06-11 Feishu Bugs

## 点开日期选择框，未定位到选择的日期

- Bug link: https://ccn53rwonxso.feishu.cn/record/BpBkrHoTIeJ01tcgXAecdK2VnDX
- Real record id: `recvmdVt7KVBvm`
- Cause: the date picker kept its `month` state from the first render. When the selected date later came from the URL or app state, opening the popover reused the stale month instead of anchoring to the selected date.
- Fix: anchor the calendar month to the selected date whenever the date popover opens, and add a loading shell so packaged pages render immediately while radar data loads in the content area.
- Verification:
  - `pnpm --filter @nextop-apps/daily-tech-radar test -- src/components/app-shell.test.tsx` passed.
  - `pnpm --filter @nextop-apps/daily-tech-radar typecheck` passed.
  - `pnpm --filter @nextop-apps/daily-tech-radar test` passed.
  - `pnpm --filter @nextop-apps/daily-tech-radar i18n:check` passed.
  - `pnpm package:nextop --app daily-tech-radar` passed.
  - Packaged Browser check at `http://127.0.0.1:3002/?date=2026-05-31&locale=zh-CN`: page rendered skeletons before data, then 23 cards; console had no errors or warnings; clicking the date button opened May 2026 with `2026-05-31` selected.
  - Mobile Browser check at 390x844: no horizontal overflow, 23 cards loaded, console had no errors or warnings.
- Fixed: yes.
- Commit hash: 待提交后回填。

## 点开日期选择框，未定位到选择的日期 - shadcn composition follow-up

- Bug link: https://ccn53rwonxso.feishu.cn/record/YZbnr6ilgemz8tc83dacfsmancf
- Real record id: `recvmdVt7KVBvm`
- Cause: the date picker used shadcn-style `Popover` and `Calendar` internally, but the trigger was a raw button and the app did not expose shadcn semantic color tokens such as `primary` to Tailwind. That made the component look and behave like a custom control, and previously left selected-day styling dependent on a local CSS fallback.
- Fix: use the shadcn `Button` with `variant="outline"` as the `PopoverTrigger` child, add app-level shadcn semantic color tokens via `@theme inline`, and move selected-day styling onto `--primary` / `--primary-foreground`.
- Verification:
  - `pnpm --filter @nextop-apps/daily-tech-radar test -- app-shell.test.tsx` passed.
  - `pnpm --filter @nextop-apps/daily-tech-radar typecheck` passed.
  - `pnpm --filter @nextop-apps/daily-tech-radar build` passed.
  - Browser check at `http://127.0.0.1:3002/?date=2026-05-31&locale=zh-CN&filter=all&query=&source=all&view=grid`: trigger rendered as `data-slot="popover-trigger"` with `data-variant="outline"` and shadcn button classes; opening the popover showed May 2026 with May 31 selected and highlighted.
- Fixed: yes.
- Commit hash: 待提交后回填。
