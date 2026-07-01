/**
 * Feature flags driven by public env vars (`EXPO_PUBLIC_*`), inlined into the
 * bundle at build time. Keep these here so gating logic lives in one place.
 */

/**
 * Whether the light/dark theme switch (`ThemeToggle`) is shown.
 *
 * Visible by default; set `EXPO_PUBLIC_ENABLE_THEME_SWITCH="false"` to hide it —
 * e.g. to lock the app to a single theme.
 */
export const isThemeSwitchEnabled =
  process.env.EXPO_PUBLIC_ENABLE_THEME_SWITCH !== "false";
