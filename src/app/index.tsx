import { useEffect, useState } from "react";
import { View, Text, StatusBar } from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { hasToken } from "~/lib/secure-storage";
import { darkColors, lightColors } from "~/lib/colors";
import { useThemeStore } from "~/lib/stores/theme-store";

export default function SplashIndex() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const palette = isDark ? darkColors : lightColors;

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(16);

  const [showGetStarted, setShowGetStarted] = useState(false);

  useEffect(() => {
    hasToken().then((authenticated) => {
      if (authenticated) {
        router.replace("/(tabs)");
      } else {
        setShowGetStarted(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!showGetStarted) return;
    contentOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
    contentTranslateY.value = withDelay(
      150,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.quad) }),
    );
  }, [showGetStarted]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={palette.background}
      />

      <Logo size="xl" />

      {showGetStarted && (
        <Animated.View
          style={[
            contentStyle,
            { position: "absolute", bottom: 0, left: 0, right: 0 },
          ]}
          className="gap-6 px-6 pb-24"
        >
          <View className="gap-2">
            <Text className="text-3xl font-medium text-foreground">
              Welcome
            </Text>
            <Text className="text-sm leading-relaxed text-muted-foreground">
              A starting point for your next React Native app.
            </Text>
          </View>

          <Button size="lg" onPress={() => router.replace("/(auth)/login")}>
            Get started
          </Button>
        </Animated.View>
      )}
    </View>
  );
}
