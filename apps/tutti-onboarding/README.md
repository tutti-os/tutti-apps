# Getting Started Onboarding

This package mirrors the Tutti built-in Getting Started onboarding app from
`services/tuttid/builtin-apps/onboarding`.

## Development

```bash
pnpm --filter @tutti-apps/tutti-onboarding dev
```

Then open:

```txt
http://127.0.0.1:3003
```

## Package

```bash
pnpm package:tutti --app tutti-onboarding
```

The generated package includes the mirrored static assets, the Tutti manifest,
and a local runtime server.
