import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { Card } from "~/components/ui/card";
import { useThemeColors } from "~/lib/colors";

export default function HomeScreen() {
  const colors = useThemeColors();

  return (
    <Screen>
      <View className="gap-1">
        <Text className="text-2xl font-semibold text-foreground">Home</Text>
        <Text className="text-sm text-muted-foreground">
          This is your starting screen. Build your app from here.
        </Text>
      </View>

      <Card>
        <View className="flex-row items-center gap-3">
          <View className="bg-primary/15 h-10 w-10 items-center justify-center rounded-full">
            <Ionicons name="rocket-outline" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-foreground">
              You&apos;re all set
            </Text>
            <Text className="text-xs text-muted-foreground">
              Auth, theming, networking, and the UI kit are ready to use.
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
