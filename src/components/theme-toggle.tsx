import { useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkColors, lightColors } from "~/lib/colors";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dark";

  const translateX = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [isDark, translateX]);

  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 18],
  });

  const trackColor = isDark
    ? darkColors["accent-foreground"]
    : lightColors.secondary;
  const iconColor = isDark ? darkColors.foreground : lightColors.foreground;
  const dimColor = isDark
    ? darkColors["muted-foreground"]
    : lightColors["muted-foreground"];

  return (
    <View className="flex-row items-center gap-2">
      {/* Sun */}
      <Ionicons
        name="sunny-outline"
        size={16}
        color={isDark ? dimColor : iconColor}
      />

      {/* Track */}
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: isDark }}
        accessibilityLabel={
          isDark ? "Switch to light theme" : "Switch to dark theme"
        }
        onPress={() => setTheme(isDark ? "light" : "dark")}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          backgroundColor: isDark ? darkColors.primary : lightColors.border,
          justifyContent: "center",
        }}
      >
        <Animated.View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: isDark
              ? darkColors["primary-foreground"]
              : lightColors["primary-foreground"],
            transform: [{ translateX: thumbTranslate }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1,
            elevation: 2,
          }}
        />
      </Pressable>

      {/* Moon */}
      <Ionicons
        name="moon-outline"
        size={16}
        color={isDark ? iconColor : dimColor}
      />
    </View>
  );
}
