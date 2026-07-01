import { Stack } from "expo-router";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkColors, lightColors } from "~/lib/colors";

export default function MoreLayout() {
  const theme = useThemeStore((s) => s.theme);
  const palette = theme === "dark" ? darkColors : lightColors;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.foreground,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.background },
        headerTitleStyle: { fontFamily: "DMSans-SemiBold", fontSize: 17 },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}
