import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkColors, lightColors } from "~/lib/colors";

interface MenuItemProps {
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  iconBg: string;
  onPress: () => void;
}

function MenuItem({
  label,
  description,
  icon,
  iconColor,
  iconBg,
  onPress,
}: MenuItemProps) {
  const theme = useThemeStore((s) => s.theme);
  const palette = theme === "dark" ? darkColors : lightColors;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4 active:opacity-70"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-xs text-muted-foreground">{description}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={palette["muted-foreground"]}
      />
    </Pressable>
  );
}

export default function MoreMenuScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 20,
        gap: 12,
      }}
    >
      <Text className="mb-2 text-2xl font-semibold text-foreground">More</Text>

      <MenuItem
        label="Settings"
        description="Profile, theme, and account"
        icon="settings-outline"
        iconColor="#60A5FA"
        iconBg="rgba(96,165,250,0.12)"
        onPress={() => router.push("/(tabs)/more/settings")}
      />
    </ScrollView>
  );
}
