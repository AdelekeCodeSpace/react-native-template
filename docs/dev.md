# Development to Deployment

This document is the standard for how the app is built and shipped: branching,
local development, EAS builds/updates, and preview vs production distribution.

It matches the EAS Workflows in `.eas/workflows/` and the build profiles in
`eas.json`. When process or automation changes, update this file in the same
change.

## Use a development build (not Expo Go)

Day-to-day feature work, bugfixes, and integration testing must run on the **EAS
development client** (`development` / `ios-simulator` profiles), not Expo Go. The
dev client is compiled for this project's native modules, config plugins, and
EAS Update channel semantics, so you catch real build issues early. Expo Go
ships a fixed native runtime and is not the target for work merged into this
repo.

## Branch model

| Branch           | Role                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| Feature branches | Short-lived branches for a ticket (`feature/…`, `fix/…`). Branch from `main`, PR back into `main`.      |
| **`main`**       | Integration + **preview** line. Merging here runs the **preview** pipeline. Protected — changes via PR. |
| **`prod`**       | **Production** line. Promoting here runs the **production** pipeline. Protected — changes via PR.       |

`main` and `prod` stay protected so release history stays reviewable and
deployments stay predictable.

## End-to-end workflow

1. **Branch from `main`** — sync `main`, then create a feature branch.
2. **Develop and test locally** — run `npm run dev` and use the development
   client (not Expo Go).
3. **Open a PR into `main`** — GitHub Actions CI (`.github/workflows/ci.yml`)
   runs format check, lint, type-check, and build. Get review + green CI, then
   merge.
   - **What else runs:** the merge (a push to `main`) triggers the EAS Workflow
     **Deploy to preview** (`.eas/workflows/publish-preview-update.yml`). It
     fingerprints the project, reuses an existing native build when the
     fingerprint matches, otherwise builds with the **`preview`** profile, and
     publishes an OTA update to the **`preview`** branch when a matching build
     exists.
4. **Promote to production** — when preview is validated, open a PR from `main` →
   **`prod`** and merge after review.
   - **What runs:** the push to `prod` triggers **Deploy to production**
     (`.eas/workflows/deploy-to-production.yml`). Same fingerprint /
     get-build / build-or-update pattern using the **`production`** profile, OTA
     updates on the **`production`** channel, plus Android/iOS **submit** steps
     for new native builds (TestFlight / Play internal testing per `eas.json`).

## How "PR vs merge" relates to EAS

The EAS workflow files trigger on **`push`** to `main` or `prod`, not on "PR
opened":

- **Merging a PR** into `main` or `prod` updates the branch tip → Git sends a
  **push** event → the matching EAS workflow runs.
- **Opening a PR** alone does not deploy; it only runs the GitHub Actions CI
  checks.

So the operational rule is: **merging into `main` runs preview; merging into
`prod` runs production.**

## Distribution notes

- **Preview (`main`)** — internal distribution on the `preview` channel; no store
  submission. Good for internal QA and stakeholder OTA previews.
- **Production (`prod`)** — new native builds are submitted to the stores
  (TestFlight for iOS, Play internal testing for Android per
  `submit.production` in `eas.json`); otherwise an OTA update ships on the
  `production` channel.

## Secrets

Do not commit API keys, keystores, or provider tokens. Use EAS **environment
secrets** (referenced as `${{ env.SECRET_NAME }}` in workflows), GitHub
**Actions secrets**, and local env files that stay out of git.

## Where to look in the repo

- `.eas/workflows/publish-preview-update.yml` — preview pipeline (push to `main`).
- `.eas/workflows/deploy-to-production.yml` — production pipeline (push to `prod`).
- `.github/workflows/ci.yml` — PR checks (format, lint, typecheck, build).
- `eas.json` — build/submit profile names and channels referenced by the
  workflows.

For Expo's docs, see [EAS Workflows](https://docs.expo.dev/eas/workflows/get-started/)
and [Development builds](https://docs.expo.dev/develop/development-builds/introduction/).
