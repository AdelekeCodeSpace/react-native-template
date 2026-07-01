import type { ReactNode } from "react";
import { Pressable, Text, ActivityIndicator, View } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils/helpers";
import { useThemeColors } from "~/lib/colors";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary",
        outline: "border border-border bg-transparent",
        ghost: "bg-transparent",
        destructive: "bg-destructive",
        secondary: "bg-secondary",
      },
      size: {
        default: "px-5 py-3 ",
        sm: "px-3 py-2 ",
        lg: "px-6 py-4 ",
        icon: "p-2 ",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("font-semibold", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-destructive-foreground",
      secondary: "text-secondary-foreground",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonProps extends ButtonVariantProps {
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  children: ReactNode;
  icon?: ReactNode;
}

// Maps each button variant to the palette key used for its text/icon color,
// so the ActivityIndicator spinner always matches the button label.
const VARIANT_COLOR_KEY = {
  default: "primary-foreground",
  outline: "foreground",
  ghost: "foreground",
  destructive: "destructive-foreground",
  secondary: "secondary-foreground",
} as const satisfies Record<
  NonNullable<ButtonVariantProps["variant"]>,
  keyof ReturnType<typeof useThemeColors>
>;

export function Button({
  onPress,
  disabled,
  loading,
  variant,
  size,
  className,
  textClassName,
  children,
  icon,
}: ButtonProps) {
  const colors = useThemeColors();
  const spinnerColor = colors[VARIANT_COLOR_KEY[variant ?? "default"]];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        buttonVariants({ variant, size }),
        (disabled || loading) && "opacity-50",
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon && <View>{icon}</View>}
          {typeof children === "string" ? (
            <Text
              className={cn(
                buttonTextVariants({ variant, size }),
                textClassName,
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </Pressable>
  );
}

export { buttonVariants, buttonTextVariants };
