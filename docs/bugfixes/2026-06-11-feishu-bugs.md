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
