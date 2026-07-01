import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "~/lib/stores/theme-store";
import { darkColors, lightColors } from "~/lib/colors";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconName;
  iconFocused: IoniconName;
}

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Home",
    icon: "home-outline",
    iconFocused: "home",
  },
  {
    name: "more",
    title: "More",
    icon: "ellipsis-horizontal-outline",
    iconFocused: "ellipsis-horizontal",
  },
];

export default function TabLayout() {
  const theme = useThemeStore((s) => s.theme);
  const palette = theme === "dark" ? darkColors : lightColors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: palette.background },
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor: palette.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette["muted-foreground"],
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "DMSans-Medium",
        },
      }}
    >
      {TABS.map(({ name, title, icon, iconFocused }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? iconFocused : icon}
                size={size ?? 22}
                color={color}
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              // Always navigate to the root screen of the tab, clearing
              // any deep stack.
              if (name === "index") {
                navigation.navigate("index");
              } else {
                navigation.navigate(name, { screen: "index" });
              }
            },
          })}
        />
      ))}
    </Tabs>
  );
}
