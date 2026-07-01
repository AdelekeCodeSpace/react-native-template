import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as Updates from "expo-updates";
import { useUpdates } from "expo-updates";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";

/**
 * OTAUpdateHandler
 *
 * Silently downloads an available OTA update in the background.
 * Once the bundle is fully ready (`isUpdatePending`), shows a
 * floating bottom banner prompting the user to restart.
 *
 * Renders nothing in all other states.
 */
export function OTAUpdateHandler() {
  const { isUpdateAvailable, isUpdatePending } = useUpdates();
  const colors = useThemeColors();

  useEffect(() => {
    if (isUpdateAvailable) {
      Updates.fetchUpdateAsync().catch((err) => {
        console.error("[OTAUpdateHandler] Error fetching update:", err);
      });
    }
  }, [isUpdateAvailable]);

  if (!isUpdatePending) return null;

  return (
    <View className="absolute bottom-5 left-5 right-5 z-[9999]">
      <View className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3.5 shadow-lg">
        <View className="flex-1 flex-row items-center gap-3">
          <Ionicons
            name="cloud-download-outline"
            size={20}
            color={colors.primary}
          />
          <Text className="text-sm font-semibold text-card-foreground">
            New update ready!
          </Text>
        </View>

        <TouchableOpacity
          className="rounded-lg bg-primary px-3 py-2"
          activeOpacity={0.8}
          onPress={() => Updates.reloadAsync()}
        >
          <Text className="text-xs font-bold text-primary-foreground">
            Restart Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
