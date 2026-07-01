import { useThemeStore } from "~/lib/stores/theme-store";

// Dark mode palette — matches the web's .dark CSS vars (oklch → hex)
export const darkColors = {
  background: "#0B0F14",
  foreground: "#F8FAFC",
  authBackground: "#1A2230",
  card: "#03060880",
  "card-foreground": "#F8FAFC",
  popover: "#1E293B",
  "popover-foreground": "#F8FAFC",
  primary: "#6ECAFF",
  "primary-foreground": "#0F172A",
  secondary: "#334155",
  "secondary-foreground": "#F8FAFC",
  muted: "#1E293B",
  "muted-foreground": "#CED1DB",
  accent: "#1E3A5F",
  "accent-foreground": "#60A5FA",
  destructive: "#EF4444",
  "destructive-foreground": "#F8FAFC",
  border: "#1E293B",
  input: "#0B0F1480",
  ring: "#60A5FA",
  success: "#22C55E",
  warning: "#F59E0B",
} as const;

// Light mode palette — derived from the web frontend's :root CSS vars (oklch → hex)
// oklch(0.985 0.004 248) → #F8FAFC  |  oklch(37% 0.013 285) → #334155
// oklch(0.52 0.12 235)  → #2F7DC4  |  oklch(0.91 0.015 248) → #CBD5E1
export const lightColors = {
  background: "#F8FAFC",
  foreground: "#334155",
  authBackground: "#EEF2F7",
  card: "#FFFFFF",
  "card-foreground": "#334155",
  popover: "#FFFFFF",
  "popover-foreground": "#334155",
  primary: "#2F7DC4",
  "primary-foreground": "#F8FAFC",
  secondary: "#EEF2F7",
  "secondary-foreground": "#334155",
  muted: "#EEF2F7",
  "muted-foreground": "#64748B",
  accent: "#EEF2F7",
  "accent-foreground": "#1E293B",
  destructive: "#DC2626",
  "destructive-foreground": "#FFFFFF",
  border: "#CBD5E1",
  input: "#CBD5E1",
  ring: "#2F7DC4",
  success: "#16A34A",
  warning: "#D97706",
} as const;

// Default export kept for any direct usages outside Tailwind/NativeWind vars
export const colors = darkColors;

// React hook — returns the correct palette for the active theme.
// theme-store does not import from colors.ts, so there is no circular dep.
export function useThemeColors() {
  const theme = useThemeStore((s) => s.theme);
  return theme === "light" ? lightColors : darkColors;
}
