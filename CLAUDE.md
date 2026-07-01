# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Read this first

The full working agreement lives in **[AGENTS.md](AGENTS.md)** — conventions,
where code goes, the data/networking patterns, and the pre-finish checklist.
Everything there applies to Claude too. This file only adds Claude-specific
notes; when the two overlap, AGENTS.md is the source of truth.

## Quick orientation

Expo React Native template (Expo SDK 54 · Expo Router 6 · NativeWind · TanStack
Query · Axios · Zustand · RHF + Zod). It's a starter with auth, a tab shell, a
UI kit, and OTA/force-update handling — **no product domain**. Add reusable
scaffolding and patterns, not app-specific features.

## Common commands

```bash
npm run dev            # start dev server (development variant)
npm run lint           # ESLint
npm run format         # Prettier (format:check to verify)
npm run typecheck      # tsc --noEmit
npm run build          # expo export (what CI's build step runs)
```

Always finish a change with `format:check`, `lint`, `typecheck`, and `build`
green — that's the CI gate on PRs into `main`. Full setup, env vars, and EAS
scripts live in [docs/setup.md](docs/setup.md) (the canonical reference) — don't
duplicate them here.

## Claude-specific guidance

- **Prefer editing existing files** over adding new ones; reach for the existing
  primitives (`src/components/ui`, `Screen`, `FormField`, `QUERY_KEYS`,
  `useThemeColors`, `cn`) before writing new abstractions.
- **Use the `~/*` import alias**, never deep relative paths.
- **Don't run destructive git or EAS commands.** Merging into `main` deploys
  preview and merging into `prod` deploys production — don't push to those
  branches; open a PR.
- **Keep the template generic.** If a change only makes sense for a specific
  product, it probably doesn't belong here.
- When you change scripts, workflows, or the branch model, update
  [docs/dev.md](docs/dev.md) and the relevant docs in the same change.

## Key paths

- Routes: `src/app` (`(auth)` = login/forgot/reset, `(tabs)` = Home + More)
- Features: `src/features/<feature>` (`api.ts` / `hooks.ts` / `types.ts` / `schemas.ts`)
- Infra: `src/lib` (`config/axios.ts`, `config/sentry.ts`, `stores/`, `utils/`)
- Providers: `src/providers/tanstack-query.tsx`
- Docs: `docs/` (see [AGENTS.md](AGENTS.md) for the index)
