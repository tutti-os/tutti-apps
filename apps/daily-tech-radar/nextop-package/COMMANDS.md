# Daily Product Radar CLI

The app exposes the `radar` CLI scope for read-only automation over Product Hunt and GitHub discovery cards.

## Commands

```bash
nextop --json radar board
nextop --json radar board --date 2026-06-05 --locale zh-CN
nextop --json radar board --include-cards false
nextop --json radar search --query agent
nextop --json radar search --source github --category 开发工具 --limit 10
nextop --json radar item --id github:123456 --locale en-US
```

## Inputs

- `date`: `YYYY-MM-DD`; omitted means latest available date.
- `locale`: `en-US` or `zh-CN`; defaults to `en-US`.
- `source`: `all`, `producthunt`, or `github`; defaults to `all`.
- `include-cards`: boolean used by `radar board`; defaults to `true`. Set it to `false` for metadata-only responses.
- `category`: category label, or `all`; defaults to `all` for `radar search`.
- `query`: search text matched against name, owner, title, tagline, description, summary, language, source label, keywords, and categories.
- `limit`: maximum cards to return; defaults to `10` for `radar search`, is optional for `radar board`, and is clamped to `1..50`.
- `id`: card id required by `radar item`, such as `github:123456` or `producthunt:abc`.

All commands return JSON in the Nextop `CliCommandOutput` envelope. Success responses use `{"kind":"json","value":{"ok":true,"data":...}}`; invalid input and runtime failures use `{"kind":"json","value":{"ok":false,"error":{"code":"...","message":"..."}}}`.
