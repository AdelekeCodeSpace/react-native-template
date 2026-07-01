import { Stack } from "expo-router";
import { ThemeToggle } from "~/components/theme-toggle";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkColors, lightColors } from "~/lib/colors";

export default function AuthLayout() {
  const theme = useThemeStore((s) => s.theme);
  const palette = theme === "dark" ? darkColors : lightColors;

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: palette.authBackground },
        headerShadowVisible: false,
        headerTitle: () => null,
        headerRight: () => <ThemeToggle />,
        contentStyle: { backgroundColor: palette.authBackground },
        animation: "slide_from_right",
      }}
    />
  );
}
