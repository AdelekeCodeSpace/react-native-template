import "./global.css";

import { useEffect } from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import TanstackQueryProvider from "~/providers/tanstack-query";
import { initSentry } from "~/lib/config/sentry";
import { DebugOverlay } from "~/components/debug-overlay";
import { OfflineBanner } from "~/components/offline-banner";
import { OTAUpdateHandler } from "~/components/ota-update-handler";
import { ForceUpdateModal } from "~/components/force-update-modal";
import { isDebugOverlayEnabled } from "~/lib/debug-store";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkThemeVars, lightThemeVars } from "~/lib/theme-vars";

SplashScreen.preventAutoHideAsync();
initSentry();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "DMSans-Regular": DMSans_400Regular,
    "DMSans-Medium": DMSans_500Medium,
    "DMSans-Bold": DMSans_700Bold,
  });

  const { theme, hydrate } = useThemeStore();

  const ready = fontsLoaded || fontError != null;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TanstackQueryProvider>
          <View
            style={[
              { flex: 1 },
              theme === "dark" ? darkThemeVars : lightThemeVars,
            ]}
          >
            <OfflineBanner />
            <ForceUpdateModal />
            <Slot />
            <OTAUpdateHandler />
            {isDebugOverlayEnabled ? <DebugOverlay /> : null}
          </View>
        </TanstackQueryProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
