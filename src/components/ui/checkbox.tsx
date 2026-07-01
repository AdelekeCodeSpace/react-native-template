import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "~/lib/utils/helpers";
import { colors } from "~/lib/colors";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
}: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className={cn(
        "h-5 w-5 items-center justify-center rounded-md border",
        checked ? "border-primary bg-primary" : "border-border bg-white",
        className,
      )}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={12}
          color={colors["primary-foreground"]}
        />
      )}
    </Pressable>
  );
}
