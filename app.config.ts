import { ConfigContext, ExpoConfig } from "expo/config";

const APP_VARIANT = process.env.APP_VARIANT ?? "production";
const IS_DEV = APP_VARIANT === "development";
const IS_PREVIEW = APP_VARIANT === "preview";

// TODO: Rename these identifiers for your app.
const BUNDLE_ID = "com.example.app";
const BASE_APP_NAME = "React Native Template";
const BASE_SCHEME = "rntemplate";

const getUniqueIdentifier = () => {
  if (IS_DEV) return `${BUNDLE_ID}.dev`;
  if (IS_PREVIEW) return `${BUNDLE_ID}.preview`;
  return BUNDLE_ID;
};

const getAppName = () => {
  if (IS_DEV) return `${BASE_APP_NAME} (Dev)`;
  if (IS_PREVIEW) return `${BASE_APP_NAME} (Preview)`;
  return BASE_APP_NAME;
};

const getAppScheme = () => {
  if (IS_DEV) return `${BASE_SCHEME}-dev`;
  if (IS_PREVIEW) return `${BASE_SCHEME}-preview`;
  return BASE_SCHEME;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "react-native-template",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  scheme: getAppScheme(),
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    infoPlist: {
      CFBundleDisplayName: getAppName(),
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    // TODO: add an adaptiveIcon once you have brand assets.
    package: getUniqueIdentifier(),
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.0",
          newArchEnabled: true,
        },
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          newArchEnabled: true,
        },
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0F172A",
        resizeMode: "contain",
      },
    ],
    "expo-asset",
    // TODO: Configure Sentry with your own org/project, then re-enable.
    // [
    //   "@sentry/react-native/expo",
    //   {
    //     url: "https://sentry.io/",
    //     project: "your-project",
    //     organization: "your-org",
    //     ...(IS_DEV ? { enableSourceMaps: false, upload: false } : {}),
    //   },
    // ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    appVariant: APP_VARIANT,
    // TODO: Add your EAS projectId after running `eas init`.
    // eas: { projectId: "" },
  },
  // TODO: Point updates.url at your own EAS project once configured.
  // updates: { url: "https://u.expo.dev/<your-project-id>" },
  runtimeVersion: {
    policy: "appVersion",
  },
  // TODO: Set your Expo account/organization owner.
  // owner: "your-expo-account",
});
