import { View, Text } from "react-native";
import { useThemeStore } from "~/lib/stores/theme-store";
import { cn } from "~/lib/utils/helpers";

type BadgeVariant =
  "default" | "success" | "destructive" | "warning" | "outline";

type VariantStyle = { container: string; text: string; dot: string };

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
  textClassName?: string;
  dot?: boolean;
}

/** Dark UI: softer fills read well on deep backgrounds. */
const variantStylesDark: Record<BadgeVariant, VariantStyle> = {
  default: {
    container: "bg-primary/20 border border-primary/30",
    text: "text-primary",
    dot: "bg-primary",
  },
  success: {
    container: "bg-success/10 border border-success/20",
    text: "text-success",
    dot: "bg-success",
  },
  destructive: {
    container: "bg-destructive/10 border border-destructive/20",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  warning: {
    container: "bg-warning/10 border border-warning/20",
    text: "text-warning",
    dot: "bg-warning",
  },
  outline: {
    container: "border border-border",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

/** Light UI: slightly richer fills + stronger borders so chips stay legible on pale surfaces. */
const variantStylesLight: Record<BadgeVariant, VariantStyle> = {
  default: {
    container: "border border-primary/40 bg-primary/12",
    text: "text-primary",
    dot: "bg-primary",
  },
  success: {
    container: "border border-success/35 bg-success/15",
    text: "text-success",
    dot: "bg-success",
  },
  destructive: {
    container: "border border-destructive/35 bg-destructive/15",
    text: "text-destructive",
    dot: "bg-destructive",
  },
  warning: {
    container: "border border-warning/35 bg-warning/15",
    text: "text-warning",
    dot: "bg-warning",
  },
  outline: {
    container: "border border-border bg-card",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};

export function Badge({
  label,
  variant = "default",
  className,
  textClassName,
  dot,
}: BadgeProps) {
  const theme = useThemeStore((s) => s.theme);
  const styles =
    theme === "light"
      ? variantStylesLight[variant]
      : variantStylesDark[variant];

  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
        styles.container,
        className,
      )}
    >
      {dot && <View className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />}
      <Text className={cn("text-xs font-medium", styles.text, textClassName)}>
        {label}
      </Text>
    </View>
  );
}
