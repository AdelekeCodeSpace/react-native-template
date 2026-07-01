import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { Platform } from "react-native";

function getAppVariant(): string {
  const extra =
    (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
    ((
      Constants as unknown as { manifest?: { extra?: Record<string, unknown> } }
    ).manifest?.extra as Record<string, unknown> | undefined);
  const variant = extra?.appVariant;
  if (typeof variant === "string" && variant.length > 0) return variant;
  return __DEV__ ? "development" : "production";
}

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const variant = getAppVariant();
  const shouldSend = variant === "preview" || variant === "production";

  // Only initialize for preview/production builds when a DSN is configured
  if (!dsn || !shouldSend || __DEV__) return;

  Sentry.init({
    dsn,
    environment: variant,
    initialScope: {
      tags: {
        platform: Platform.OS,
        appVariant: variant,
      },
    },
    // Privacy-safe defaults for a template. `sendDefaultPii` attaches the
    // user's IP and request data — enable it only if your privacy policy allows.
    sendDefaultPii: false,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      // Session replay masks all text/images by default so password fields,
      // tokens, and PII are never captured. Relax these per-app only for
      // screens you've confirmed contain no sensitive data.
      Sentry.mobileReplayIntegration({
        maskAllText: true,
        maskAllImages: true,
        maskAllVectors: false,
      }),
    ],
    debug: false,
  });
}
