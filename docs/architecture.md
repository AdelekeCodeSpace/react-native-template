# Architecture

This template is an Expo React Native app (Expo SDK 54, Expo Router 6, React 19,
React Native 0.81) written in TypeScript. The new architecture is enabled
(`newArchEnabled: true`) and the React Compiler experiment is on. UI is styled
with NativeWind (Tailwind for React Native), server state is handled with
TanStack Query, HTTP with Axios, light client state with Zustand, and forms with
React Hook Form + Zod. Crash/perf reporting uses Sentry and over-the-air updates
use Expo Updates.

## Routing

Routing is file-based via **Expo Router 6** (`main: "expo-router/entry"`).
Screens live under `src/app`, and typed routes are enabled
(`experiments.typedRoutes`).

- `src/app/index.tsx` — splash/landing screen; redirects to `(tabs)` when a
  token is present, otherwise shows a "Get started" CTA into `(auth)/login`.
- `src/app/(auth)/` — unauthenticated screens: `login`, `forgot-password`,
  `reset-password`, with their own `_layout.tsx`.
- `src/app/(tabs)/` — authenticated tab navigator (`_layout.tsx`) with two tabs:
  - `index` — Home
  - `more/` — nested stack: `index`, `settings`

Add your own tabs and nested stacks here as the app grows.

## Root layout (`src/app/_layout.tsx`)

The root layout is the app's composition root. It:

- Imports the global NativeWind stylesheet (`./global.css`).
- Initializes Sentry (`initSentry()`) at module load.
- Calls `SplashScreen.preventAutoHideAsync()` and loads the **DM Sans** fonts
  via `useFonts`; once fonts are ready (or error), it hides the splash screen.
- Wraps the tree in `SafeAreaProvider`, then `GestureHandlerRootView`, then
  `TanstackQueryProvider`.
- Hydrates the persisted theme (`useThemeStore`) and applies the theme's CSS
  variables to a root `View` (`darkThemeVars` / `lightThemeVars`).
- Renders the router `<Slot />` alongside cross-cutting UI: `OfflineBanner`,
  `ForceUpdateModal`, `OTAUpdateHandler`, and the `DebugOverlay` (when enabled).

## State & data architecture

The app follows a consistent per-feature pattern:

- **TanStack Query provider** — `src/providers/tanstack-query.tsx` creates the
  shared `queryClient` (default `staleTime` 5 min, `retry: 1`,
  `refetchOnWindowFocus: false`). It wires a global `QueryCache`/`MutationCache`
  `onError` that reports to Sentry (non-dev) and routes through `handleApiError`,
  skipping `401/403/404` and anything flagged with `meta.suppressGlobalError`.
- **Query keys** — centralized in `src/lib/utils/query-keys.ts` as `QUERY_KEYS`,
  built from a `createQueryKeys` helper (`all`, `table`, `byId`) plus
  feature-specific keys. Always reference these instead of inlining arrays.
- **API services** — each feature exposes a service in
  `src/features/<feature>/api.ts` that wraps the Axios clients and returns typed
  data. This is the only layer that talks HTTP.
- **Hooks** — `src/features/<feature>/hooks.ts` wraps the services in
  `useQuery`/`useMutation`, keyed by `QUERY_KEYS`. Optimistic mutations are
  documented in [optimistic-updates.md](./optimistic-updates.md).

## Networking (`src/lib/config/axios.ts`)

Two Axios instances are created from the same base config (`baseURL` =
`EXPO_PUBLIC_API_BASE_URL`, 45s timeout):

- **`axiosInstance`** (default export) — public/unauthenticated requests.
- **`axiosPrivate`** — authenticated requests.

Behavior:

- **Token injection** — `axiosPrivate`'s request interceptor attaches
  `Authorization: Bearer <token>`, reading the token asynchronously from
  `expo-secure-store` via `getToken()`.
- **401 logout** — on a `401` whose message indicates an invalid/blacklisted
  token, it deletes the stored token and redirects to `/(auth)/login`.
- **Retry** — both instances use `axios-retry` with `retries: 2` and exponential
  backoff, retrying network errors and `5xx`. `axiosPrivate` never retries `401`
  or other `4xx`.
- **Debug overlay logging** — when the debug overlay is enabled, an extra
  interceptor records each request/response into the in-app `debugStore` that
  powers `DebugOverlay`.

## Auth & token storage

- **Secure storage** — `src/lib/secure-storage.ts` wraps `expo-secure-store`
  with `saveToken` / `getToken` / `deleteToken` / `hasToken` under the
  `app_auth_token` key. This encrypted store is the source of truth used by the
  Axios interceptor.
- **Auth store** — `src/hooks/use-auth-store.ts` is a lightweight Zustand store
  holding the in-memory token with `setAuthToken` / `clearAuthToken` /
  `isAuthenticated`. Server/profile data stays in TanStack Query.
- **Endpoints** — `src/features/auth/api.ts` defines `login`, `logout`,
  `forgotPassword`, `resetPassword`, and `getProfile`. Point these at your
  backend (they're marked with a `TODO`).

## Theming

Because React Native has no CSS engine, theming bridges JS color tokens and
NativeWind CSS variables:

- `src/lib/colors.ts` — the single source of truth for `darkColors` /
  `lightColors` hex palettes, plus the `useThemeColors()` hook for components
  that need runtime color values.
- `src/lib/theme-vars.ts` — converts those palettes into NativeWind `vars()`,
  applied on the root `View` in the root layout.
- `tailwind.config.ts` — maps Tailwind color names (`background`, `primary`,
  `card`, …) to the corresponding `var(--…)` CSS variables.
- `src/lib/stores/theme-store.ts` — Zustand store that persists the chosen theme
  to AsyncStorage (`app_theme`), updates `Appearance`, and exposes `hydrate()`.

Prefer NativeWind class names for styling; use `useThemeColors()` only when a
component needs a runtime color value (e.g. an icon `color` prop).

## Release & runtime services

- **Sentry** — `src/lib/config/sentry.ts` initializes only for `preview` /
  `production` variants when `EXPO_PUBLIC_SENTRY_DSN` is set (skipped in dev).
  Configure the Expo config plugin in `app.config.ts` (commented out with a
  `TODO`).
- **Expo Updates (OTA)** — `OTAUpdateHandler` silently fetches an available
  update and shows a "Restart Now" banner once a bundle is pending. Set
  `updates.url` and `runtimeVersion` in `app.config.ts`; channels are set per
  profile in `eas.json`.
- **Force update / version checks** — `ForceUpdateModal` compares the installed
  version against config fetched via the `app-version` feature and prompts the
  user to update. The check **fails open**, so the modal never appears until you
  wire up the `/get-app-version` endpoint and set your store URLs.
- **Offline banner** — `OfflineBanner` surfaces connectivity loss via
  `@react-native-community/netinfo`.

See [folder-structure.md](./folder-structure.md) for the full layout,
[code-style.md](./code-style.md) for conventions, and [dev.md](./dev.md) for the
branch/deployment model.
