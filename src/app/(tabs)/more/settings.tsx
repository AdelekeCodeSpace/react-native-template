import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "~/components/screen";
import { useGetProfile, useLogout } from "~/features/auth/hooks";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { ThemeToggle } from "~/components/theme-toggle";
import { isThemeSwitchEnabled } from "~/lib/config/features";
import { useThemeColors } from "~/lib/colors";

function ProfileCard() {
  const { data: profile, isLoading } = useGetProfile();
  const colors = useThemeColors();

  return (
    <Card>
      <View className="mb-4 flex-row items-center gap-3 border-b border-border pb-4">
        <View className="bg-primary/15 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons name="person-outline" size={18} color={colors.primary} />
        </View>
        <Text className="text-sm font-semibold text-foreground">
          Personal information
        </Text>
      </View>

      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-6 rounded-lg" />
          <Skeleton className="h-6 rounded-lg" />
        </View>
      ) : (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Name</Text>
            <Text className="text-sm font-medium text-foreground">
              {profile?.full_name ?? "—"}
            </Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Email</Text>
            <Text className="text-sm font-medium text-foreground">
              {profile?.email ?? "—"}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
}

function AppearanceCard() {
  const colors = useThemeColors();

  // No appearance controls to show when the theme switch is disabled.
  if (!isThemeSwitchEnabled) return null;

  return (
    <Card>
      <View className="mb-4 flex-row items-center gap-3 border-b border-border pb-4">
        <View className="bg-primary/15 h-9 w-9 items-center justify-center rounded-full">
          <Ionicons
            name="color-palette-outline"
            size={18}
            color={colors.primary}
          />
        </View>
        <Text className="text-sm font-semibold text-foreground">
          Appearance
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-muted-foreground">Theme</Text>
        <ThemeToggle />
      </View>
    </Card>
  );
}

export default function SettingsScreen() {
  const { mutate: logout, isPending } = useLogout();

  return (
    <Screen variant="detail">
      <ProfileCard />
      <AppearanceCard />

      <Button
        variant="destructive"
        onPress={() => logout()}
        loading={isPending}
      >
        Sign out
      </Button>
    </Screen>
  );
}
