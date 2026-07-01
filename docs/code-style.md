# Code Style & Conventions

These conventions keep the codebase consistent. When in doubt, match the
surrounding code and avoid unrelated churn. Formatting and linting are enforced
by Prettier and ESLint (see [setup.md](./setup.md)).

## TypeScript

- **Strict mode is on** (`tsconfig.json` extends `expo/tsconfig.base` with
  `"strict": true`). Type service responses, DTOs, and hook return values; avoid
  `any`.
- **Use the `~/*` alias** for source imports (maps to `src/*`), configured in
  both `tsconfig.json` and `babel.config.js`:

  ```ts
  import { cn } from "~/lib/utils/helpers";
  import { QUERY_KEYS } from "~/lib/utils/query-keys";
  ```

## Project organization

- **Keep route screens in `src/app`.** Files there define the Expo Router
  navigation tree; keep them focused on screen composition and wiring.
- **Group domain logic in `src/features/<domain>`**, split by responsibility:
  - `api.ts` — service calls
  - `hooks.ts` — TanStack Query hooks
  - `types.ts` — API/domain types
  - `schemas.ts` — Zod validation schemas (where the feature has forms)
  - `constants.ts` — feature constants (where needed)

## Data & networking

- **Use `QUERY_KEYS`** from `src/lib/utils/query-keys.ts` for all query keys
  rather than inlining arrays, so caching and invalidation stay consistent.
- **Use the right Axios client** from `src/lib/config/axios.ts`:
  - `axiosInstance` (default export) for public/unauthenticated requests.
  - `axiosPrivate` for authenticated requests (injects the bearer token and
    handles 401 logout).
    Components and hooks should call feature `api.ts` services rather than Axios
    directly.
- **Use TanStack Query hooks** (in each feature's `hooks.ts`) for server state;
  let React Query own caching, loading, and invalidation. For mutations that
  should feel instant, follow [optimistic-updates.md](./optimistic-updates.md).

## Styling

- **Use NativeWind class names** (`className`) for styling.
- **Use `cn()`** from `src/lib/utils/helpers.ts` to merge conditional classes:

  ```tsx
  import { cn } from "~/lib/utils/helpers";

  <View className={cn("rounded-xl p-4", isActive && "bg-primary")} />;
  ```

- **Prefer existing `src/components/ui` primitives** before creating new UI, and
  wrap scrollable screens in `<Screen>` (`src/components/screen.tsx`) instead of
  re-implementing safe-area insets and padding.
- **Use theme colors via the theme system, not hardcoded hex.** Class-based
  colors resolve through the CSS variables in `tailwind.config.ts`. When a
  component needs a runtime color value (e.g. an icon `color` prop), use
  `useThemeColors()` from `src/lib/colors.ts`.

## Forms

Use **React Hook Form** with **Zod** (via `@hookform/resolvers`), defining
schemas in the feature's `schemas.ts`. Prefer the `FormField` component
(`src/components/forms/form-field.tsx`) over hand-writing a `Controller` +
`Input` for each field:

```tsx
<FormField control={control} name="email" type="email" label="Email" />
<FormField control={control} name="password" type="password" label="Password" />
```

`FormField` maps the `type` prop (`email`, `password`, `number`, `phone`, `url`,
`otp`, `text`) to sensible keyboard/autocomplete defaults, wires the field error
automatically, and renders a show/hide toggle for password fields.

## Platform-specific code

Keep platform differences explicit using React Native's `Platform` API rather
than implicit branching.

## Formatting & tooling

- **Prettier** formats the code (`.prettierrc`, with Tailwind class sorting via
  `prettier-plugin-tailwindcss`). Run `npm run format` or check with
  `npm run format:check`.
- **ESLint** uses the flat config in `eslint.config.js` (`eslint-config-expo`
  plus `eslint-config-prettier`). Run `npm run lint`.
- Both run in CI on every PR into `main` — keep them green.
