import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getAppVariant(): string {
  const extra =
    (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
    ((Constants as unknown as { manifest?: { extra?: Record<string, unknown> } })
      .manifest?.extra as Record<string, unknown> | undefined);
  const variant = extra?.appVariant;
  if (typeof variant === 'string' && variant.length > 0) return variant;
  return __DEV__ ? 'development' : 'production';
}

export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  const variant = getAppVariant();
  const shouldSend = variant === 'preview' || variant === 'production';

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
    sendDefaultPii: true,
    enableLogs: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration({
        maskAllText: false,
        maskAllImages: false,
        maskAllVectors: false,
      }),
    ],
    debug: false,
  });
}
