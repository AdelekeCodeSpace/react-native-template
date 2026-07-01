import { create } from "zustand";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark";

const THEME_KEY = "app_theme";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    Appearance.setColorScheme(theme);
    AsyncStorage.setItem(THEME_KEY, theme);
  },
  hydrate: async () => {
    const stored = await AsyncStorage.getItem(THEME_KEY);
    const theme: Theme = stored === "dark" ? "dark" : "light";
    Appearance.setColorScheme(theme);
    set({ theme });
  },
}));
