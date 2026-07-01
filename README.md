# React Native Template

An opinionated Expo React Native starter template. It ships the scaffolding an
app needs on day one — authentication flow, tab navigation, a themed UI kit,
networking, and production update handling — with zero domain code.

Built with **Expo SDK 54 · Expo Router 6 · React Native · NativeWind · TanStack
Query · Axios · Zustand · EAS · Sentry**.

## What's included

- **Auth flow** — sign-in, forgot-password, and reset-password screens wired
  through Axios + React Hook Form + Zod. Point the endpoints in
  `src/features/auth/api.ts` at your backend.
- **App shell** — animated splash/redirect, an authenticated bottom-tab layout
  (Home + More), and a settings screen with a theme toggle and sign-out.
- **UI kit** — Button, Card, Input, Badge, Avatar, Accordion, Checkbox, Select,
  SegmentedControl, Skeleton, plus a date-time form field.
- **Theming** — light/dark palettes exposed as CSS variables to NativeWind and
  persisted with Zustand + AsyncStorage.
- **Networking** — Axios instances (public + authenticated) with retry, token
  injection, global error handling, and an in-app debug overlay.
- **Production update handling** — OTA update banner (`expo-updates`) and a
  force-update modal driven by a `/get-app-version` endpoint (fails open until
  wired up).
- **Tooling** — ESLint (expo config), Prettier (with Tailwind class sorting),
  TypeScript strict mode, and a GitHub Actions CI workflow.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in EXPO_PUBLIC_API_BASE_URL
npm run dev
```

Day-to-day development runs on the **EAS development client**, not Expo Go
(the template uses native modules like `expo-secure-store` and `expo-updates`).

Next: rename the app and wire up your backend (`app.config.ts`,
`src/features/auth/api.ts`, `src/components/logo.tsx`, store URLs) — the full
checklist, env vars, and npm scripts are in
[docs/setup.md](docs/setup.md#first-time-customization).

## Project structure

```
src/
  app/            Expo Router routes ((auth), (tabs), _layout, index)
  components/     UI kit (ui/), forms, and shared components
  features/       Feature modules (api / hooks / types / schemas)
  hooks/          Shared hooks (auth store)
  lib/            config (axios, sentry), stores, utils, theming
  providers/      App-wide providers (TanStack Query)
  types/          Shared TypeScript types
```

## Documentation

Full docs live in [`docs/`](docs/):

- [Setup & Local Development](docs/setup.md) — env vars, scripts, EAS builds/profiles (the canonical setup reference)
- [Architecture](docs/architecture.md) — routing, data flow, theming, services
- [Folder Structure](docs/folder-structure.md) — where everything lives
- [Code Style](docs/code-style.md) — conventions
- [Optimistic Updates](docs/optimistic-updates.md) — TanStack mutation pattern
- [Dev → Deployment](docs/dev.md) — branch model and EAS workflows

Contributing with an AI agent? See [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md).
