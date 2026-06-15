# 2026-06-16 Feishu Bugs

## 日历应该把年份放在前面显示

- Bug link: https://ccn53rwonxso.feishu.cn/record/ClrcrW7DUeZ7X5cztJYcfTJ9nRg
- Real record id: `recvmlqSsGk1ua`
- Cause: the date picker did not pass the app locale into `react-day-picker`, and the shared calendar left DayPicker's default month/year dropdown order in place. That made the year appear after the month in the date picker.
- Fix: map the app locale to DayPicker's date-fns locale for localized labels, and reorder the shared calendar dropdown navigation so the year control renders before the month control for every app locale.
- Verification:
  - `pnpm --filter @tutti-apps/daily-tech-radar test -- src/components/app-shell.test.tsx` passed.
  - `pnpm --filter @tutti-apps/daily-tech-radar typecheck` passed.
  - `pnpm --filter @tutti-apps/daily-tech-radar i18n:check` passed.
  - `pnpm exec biome check apps/daily-tech-radar/src/components/app-shell.tsx apps/daily-tech-radar/src/components/app-shell.test.tsx apps/daily-tech-radar/src/components/ui/calendar.tsx` passed.
  - Chrome check at `http://127.0.0.1:3003/?locale=zh-CN&date=2026-06-02`: page rendered in Chinese, opening the date picker showed `2026` before `6月`, and console had no warnings or errors.
  - Full `pnpm lint` was blocked by pre-existing formatting in `apps/daily-tech-radar/tutti-package/tutti.app.json`.
- Fixed: yes.
- Commit hash: 待提交后回填。
