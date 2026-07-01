import { View, Text, Image } from "react-native";
import { cn } from "~/lib/utils/helpers";
import { getInitials } from "~/lib/utils/helpers";

type AvatarSize = "sm" | "default" | "lg";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<
  AvatarSize,
  { container: string; text: string; px: number }
> = {
  sm: { container: "h-8 w-8", text: "text-xs", px: 32 },
  default: { container: "h-10 w-10", text: "text-sm", px: 40 },
  lg: { container: "h-14 w-14", text: "text-base", px: 56 },
};

export function Avatar({
  src,
  name,
  size = "default",
  className,
}: AvatarProps) {
  const { container, text, px } = sizeStyles[size];
  const initials = getInitials(name);

  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-accent",
        container,
        className,
      )}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={{ width: px, height: px }}
          resizeMode="cover"
        />
      ) : (
        <Text className={cn("font-semibold text-accent-foreground", text)}>
          {initials}
        </Text>
      )}
    </View>
  );
}
