# CLAUDE.md

This file guides Claude Code (claude.ai/code) when working in this repository.

## Read this first

The full working agreement lives in **[AGENTS.md](AGENTS.md)** — project
overview, conventions, where code goes, the data/networking patterns, key paths,
and the pre-finish command checklist. Everything there applies to Claude; this
file only adds Claude-specific notes and does not repeat it. When the two
overlap, AGENTS.md wins. For setup, env vars, and scripts see
[docs/setup.md](docs/setup.md).

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
