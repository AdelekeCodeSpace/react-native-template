import { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { useGetAppVersionConfig } from "~/features/app-version/hooks";

// ─── Store URLs ───────────────────────────────────────────────────────────────
// TODO: Replace with your real store links once the app is published.
const APP_STORE_URL = "https://apps.apple.com/app/id000000000";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.example.app";

// TODO: Replace with your app's display name.
const APP_NAME = "the app";

const STORAGE_KEY = "FORCE_UPDATE_DISMISS_COUNT";
const MAX_DISMISSALS = 3;

/** Returns true if version `a` is strictly older than version `b`. */
function isVersionOlder(a: string, b: string): boolean {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] ?? 0;
    const numB = partsB[i] ?? 0;
    if (numA < numB) return true;
    if (numA > numB) return false;
  }
  return false;
}

/**
 * ForceUpdateModal
 *
 * Checks the backend for the minimum required app version and shows a
 * modal when the installed version is behind.
 *
 * Dismissal behaviour:
 *   - The user can tap "Later" up to 3 times across launches.
 *   - After 3 dismissals the modal becomes non-dismissable (force-update).
 *   - The dismiss count resets automatically once the user is on the
 *     latest version.
 *
 * Backend contract:
 *   GET /get-app-version  →  { version: "1.2.3" }
 *
 * The version check fails open (see features/app-version), so this modal
 * simply never appears until the endpoint is wired up.
 */
export function ForceUpdateModal() {
  const colors = useThemeColors();
  const { data: appVersionConfig, isLoading } = useGetAppVersionConfig();

  const currentVersion = Constants.expoConfig?.version ?? "0.0.0";
  const latestVersion = appVersionConfig?.version ?? currentVersion;
  const needsUpdate = !isLoading && isVersionOlder(currentVersion, latestVersion);

  const [visible, setVisible] = useState(false);
  const [canDismiss, setCanDismiss] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    (async () => {
      try {
        if (!needsUpdate) {
          // Back on the latest version — reset the count so future updates
          // start with the full dismissal budget again.
          await AsyncStorage.setItem(STORAGE_KEY, "0");
          return;
        }

        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const count = raw ? parseInt(raw, 10) : 0;

        if (count >= MAX_DISMISSALS) {
          setCanDismiss(false);
        }
        setVisible(true);
      } catch {
        // Fail-open: show a dismissable modal even if storage is unavailable.
        if (needsUpdate) setVisible(true);
      }
    })();
  }, [needsUpdate, isLoading]);

  const handleDismiss = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const count = raw ? parseInt(raw, 10) : 0;
      await AsyncStorage.setItem(STORAGE_KEY, String(count + 1));
    } catch {
      // Ignore storage write failures.
    }
    setVisible(false);
  };

  const handleUpdate = () => {
    const url = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    Linking.openURL(url).catch(() => {});
  };

  if (!needsUpdate || !visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={canDismiss ? handleDismiss : undefined}
    >
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-sm rounded-2xl border border-border bg-card p-7">
          {/* Icon */}
          <View className="mb-5 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Ionicons
                name="rocket-outline"
                size={32}
                color={colors.primary}
              />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-xl font-bold text-foreground">
            New Update Available
          </Text>

          {/* Body */}
          <Text className="mb-7 text-center text-sm leading-5 text-muted-foreground">
            A new version of {APP_NAME} is available on the{" "}
            {Platform.OS === "ios" ? "App Store" : "Play Store"}. Please update
            to enjoy the latest features and improvements.
          </Text>

          {/* Update Now */}
          <TouchableOpacity
            onPress={handleUpdate}
            activeOpacity={0.85}
            className="mb-3 w-full items-center rounded-xl bg-primary py-3.5"
          >
            <Text className="text-sm font-bold text-primary-foreground">
              Update Now
            </Text>
          </TouchableOpacity>

          {/* Later (hidden once dismiss budget is exhausted) */}
          {canDismiss && (
            <TouchableOpacity
              onPress={handleDismiss}
              activeOpacity={0.7}
              className="w-full items-center rounded-xl border border-border py-3.5"
            >
              <Text className="text-sm font-semibold text-muted-foreground">
                Later
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
