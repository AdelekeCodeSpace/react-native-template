import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "~/components/ui/card";
import { useThemeColors } from "~/lib/colors";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 24,
        paddingHorizontal: 20,
        gap: 16,
      }}
    >
      <View className="gap-1">
        <Text className="text-2xl font-semibold text-foreground">Home</Text>
        <Text className="text-sm text-muted-foreground">
          This is your starting screen. Build your app from here.
        </Text>
      </View>

      <Card>
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <Ionicons name="rocket-outline" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              You're all set
            </Text>
            <Text className="text-xs text-muted-foreground">
              Auth, theming, networking, and the UI kit are ready to use.
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}
