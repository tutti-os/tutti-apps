# Tutti Onboarding

Tutti Onboarding is a packageable workspace app that introduces the Tutti app
and agent collaboration flow. It turns the existing onboarding screenshots and
video into a local guide that can be opened from the Tutti workspace runtime.

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

The generated package includes static assets, the Tutti manifest, a local
runtime server, and the `onboarding status` CLI command.
