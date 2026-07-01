# AGENTS.md

Guidance for AI coding agents working in this repository. Human contributors
should read [docs/](docs/) — this file summarizes the same conventions in a
form that's quick to act on.

## What this is

An Expo React Native starter template: **Expo SDK 54 · Expo Router 6 · React 19
· NativeWind · TanStack Query · Axios · Zustand · React Hook Form + Zod · Sentry
· EAS**. It ships auth, a tab shell, a themed UI kit, networking, and OTA/force
update handling — with no business domain. Keep it that way: add scaffolding and
patterns, not product-specific features.

## Golden rules

1. **Match the surrounding code.** Follow existing file structure, naming, and
   idioms. Avoid unrelated churn and broad reformatting.
2. **Use the `~/*` alias** for all `src` imports (`~/lib/...`, `~/components/...`).
3. **Type everything.** Strict mode is on; avoid `any`. Type API responses,
   DTOs, and hook returns.
4. **Keep the layers separate:** screens in `src/app` (composition/wiring only),
   domain logic in `src/features/<feature>` (`api.ts`, `hooks.ts`, `types.ts`,
   `schemas.ts`), infra in `src/lib`.
5. **Don't hardcode secrets or colors.** Use `EXPO_PUBLIC_*` env vars and the
   theme system.

## Where things go

| You want to…              | Do this                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Add a screen              | Create a route file under `src/app` (respect `(auth)` / `(tabs)` groups)                                               |
| Call an API               | Add a method to `src/features/<feature>/api.ts` (use `axiosPrivate` for auth'd, `axiosInstance` for public)            |
| Fetch/mutate server state | Wrap the service in a hook in `src/features/<feature>/hooks.ts` using `QUERY_KEYS`                                     |
| Add a query key           | Extend `QUERY_KEYS` in `src/lib/utils/query-keys.ts` — never inline arrays                                             |
| Build a form              | React Hook Form + Zod schema in the feature's `schemas.ts`; use `FormField` from `src/components/forms/form-field.tsx` |
| A scrollable screen       | Wrap content in `<Screen>` (`src/components/screen.tsx`), don't re-implement insets                                    |
| Style something           | NativeWind `className` + `cn()`; runtime colors via `useThemeColors()`                                                 |
| New shared UI primitive   | Add to `src/components/ui`, following the existing `cva` variant pattern                                               |

## Data & networking

- Global query/mutation error handling lives in
  `src/providers/tanstack-query.tsx` (Sentry + `handleApiError`). Set
  `meta: { suppressGlobalError: true }` when a hook handles its own errors.
- For instant-feeling mutations, follow
  [docs/optimistic-updates.md](docs/optimistic-updates.md)
  (`onMutate` → `cancelQueries` → snapshot → `setQueryData` → rollback in
  `onError` → invalidate in `onSettled`).
- Auth token is stored encrypted via `src/lib/secure-storage.ts` and injected by
  the `axiosPrivate` interceptor. A `401` with an invalid-token message triggers
  logout to `/(auth)/login`.

## Before you finish

Run and keep green:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

These are exactly what CI runs on PRs into `main`
(`.github/workflows/ci.yml`). If you add a `package.json` script or change the
workflows/branch model, update [docs/dev.md](docs/dev.md) in the same change.

## Commits

- **Do not add AI attribution to commits or PRs.** Never include a
  `Co-Authored-By: Claude` (or any AI/agent) trailer, and do not append
  "Generated with …" lines to commit messages or PR bodies. Commits are authored
  solely by the human contributor.
- Write clear, imperative commit subjects describing what changed and why.

## Deployment (don't trigger by accident)

- Merging into **`main`** runs the **preview** EAS Workflow.
- Merging into **`prod`** runs the **production** EAS Workflow (store submits).
- Both branches are protected; land changes via PR. See
  [docs/dev.md](docs/dev.md).

## More detail

- [docs/architecture.md](docs/architecture.md) — routing, data flow, theming, services
- [docs/code-style.md](docs/code-style.md) — conventions
- [docs/folder-structure.md](docs/folder-structure.md) — where everything lives
- [docs/setup.md](docs/setup.md) — env vars, scripts, EAS
- [docs/optimistic-updates.md](docs/optimistic-updates.md) — mutation pattern
