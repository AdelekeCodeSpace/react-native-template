import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "~/lib/utils/helpers";
import { useThemeColors } from "~/lib/colors";

export type LogoSize = "xs" | "sm" | "default" | "lg" | "xl";
export type LogoVariant = "default" | "icon";

interface LogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  className?: string;
  textClassName?: string;
}

// TODO: Replace the placeholder icon + wordmark below with your app's brand.
const APP_NAME = "App";

const sizes: Record<LogoSize, { icon: number; text: string }> = {
  xs: { icon: 16, text: "text-base" },
  sm: { icon: 24, text: "text-lg" },
  default: { icon: 32, text: "text-2xl" },
  lg: { icon: 48, text: "text-3xl" },
  xl: { icon: 64, text: "text-4xl" },
};

export function Logo({
  size = "default",
  variant = "default",
  className,
  textClassName,
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];
  const isIconOnly = variant === "icon";
  const colors = useThemeColors();

  return (
    <View
      className={cn("flex-col items-center gap-2", className)}
      accessible
      accessibilityLabel={`${APP_NAME} logo`}
      accessibilityRole="image"
    >
      <Ionicons name="cube" size={iconSize} color={colors.primary} />
      {!isIconOnly && (
        <Text
          className={cn(
            "font-bold text-black dark:text-white",
            textSize,
            textClassName,
          )}
          accessibilityElementsHidden
        >
          {APP_NAME}
        </Text>
      )}
    </View>
  );
}
