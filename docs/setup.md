# Setup & Local Development

This guide covers getting the app running locally and producing builds via EAS.
For the branching and deployment process, see [dev.md](./dev.md).

## Prerequisites

- **Node.js** (20+) and **npm**
- An **Expo / EAS account** — needed to run EAS builds/submits and to install
  development client builds. Run `eas init` to link a project.
- **EAS CLI** (`npm install -g eas-cli`, then `eas login`)
- **Xcode** (macOS) for iOS simulator builds and local iOS runs
- **Android Studio** (with an emulator/AVD) for Android runs

## Install dependencies

```bash
npm install
```

## Environment variables

This app uses Expo public env vars (the `EXPO_PUBLIC_` prefix inlines them into
the JS bundle at build time). Copy the example file and fill it in — never commit
secrets.

```bash
cp .env.example .env.local
```

| Variable                   | Required | Description                                                                                                        |
| -------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `EXPO_PUBLIC_API_BASE_URL` | Yes      | Base URL of your backend API. Used by the Axios clients in `src/lib/config/axios.ts`.                              |
| `EXPO_PUBLIC_SENTRY_DSN`   | No       | Sentry DSN read by `src/lib/config/sentry.ts`. Sentry only initializes for `preview`/`production` builds when set. |

> `APP_VARIANT` (separate from the `EXPO_PUBLIC_*` vars) selects the native app
> identity — bundle id, app name, and URL scheme — in `app.config.ts`. It is set
> per EAS profile in `eas.json` and by the `dev` script. It defaults to
> `production`.

## First-time customization

Search the codebase for `TODO` and set:

- `app.config.ts` — app name, bundle id, scheme, Sentry, EAS project, owner.
- `src/components/logo.tsx` — placeholder wordmark/icon.
- `src/features/auth/api.ts` — auth endpoints.
- `src/components/force-update-modal.tsx` — store URLs.

## Local development

| Command                | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm start`            | Starts the Expo dev server / Metro bundler.                             |
| `npm run dev`          | Starts Expo with `APP_VARIANT=development` (via `cross-env`).           |
| `npm run start:tunnel` | Starts the dev server over an Expo tunnel (use on a different network). |
| `npm run ios`          | Starts and opens the app in the iOS Simulator.                          |
| `npm run android`      | Starts and opens the app in the Android emulator.                       |
| `npm run web`          | Starts the app in a browser (React Native Web).                         |

### Use a development build, not Expo Go

This template uses native modules (`expo-secure-store`, `expo-updates`) and
config plugins, so day-to-day work should run on the **EAS development client**
(the `development` / `ios-simulator` profile builds), not Expo Go. Install a
`development` build from the EAS dashboard, then run `npm run dev` and open the
project in that client.

## Quality checks

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run lint`      | ESLint.                                          |
| `npm run format`    | Format with Prettier (`format:check` to verify). |
| `npm run typecheck` | `tsc --noEmit`.                                  |
| `npm run build`     | Export the JS bundle (`expo export`).            |

These four run in CI on every PR into `main` (`.github/workflows/ci.yml`).

## EAS builds

Build profiles are defined in `eas.json`. The `build:*` scripts wrap `eas build`:

| Command                      | Profile      | Platform |
| ---------------------------- | ------------ | -------- |
| `npm run build:android`      | `preview`    | Android  |
| `npm run build:ios`          | `preview`    | iOS      |
| `npm run build:prod:ios`     | `production` | iOS      |
| `npm run build:prod:android` | `production` | Android  |
| `npm run build:prod:all`     | `production` | all      |

To build a development client directly:

```bash
eas build --profile development --platform android
eas build --profile ios-simulator --platform ios
```

## EAS build profiles (`eas.json`)

| Profile         | Highlights                                                                |
| --------------- | ------------------------------------------------------------------------- |
| `development`   | Dev client, internal distribution, `development` channel.                 |
| `ios-simulator` | Extends `development` with `ios.simulator: true`.                         |
| `preview`       | Internal distribution, `preview` channel. Used by the preview workflow.   |
| `production`    | Auto-incrementing, `production` channel. Used by the production workflow. |

## Deployment

Branching, preview vs production distribution, and EAS Workflows are documented
in [dev.md](./dev.md). In short: merging into `main` runs the preview pipeline;
promoting to `prod` runs the production pipeline.
