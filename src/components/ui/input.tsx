import { cva, type VariantProps } from "class-variance-authority";
import {
  Platform,
  TextInput,
  View,
  Text,
  type TextInputProps,
} from "react-native";
import { cn } from "~/lib/utils/helpers";
import { colors } from "~/lib/colors";

/** Box styles shared with non-Input rows (e.g. SwitchRow). */
export const inputVariants = cva(
  "rounded-3xl px-5 py-3 text-base text-foreground placeholder:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "border border-border bg-input",
        ghost: "border border-transparent bg-muted/30",
        underline:
          "rounded-none border-0 border-b border-border bg-transparent px-0 py-3",
        auth: "border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const inputContainerVariants = cva("flex-row rounded-3xl border px-5", {
  variants: {
    variant: {
      default: "border-border bg-input",
      ghost: "border-transparent bg-muted/30",
      underline:
        "rounded-none border-0 border-b border-border bg-transparent px-0",
      auth: "border-zinc-200 bg-white",
    },
    multiline: {
      true: "items-start py-3",
      false: "min-h-12 items-center",
    },
  },
  defaultVariants: {
    variant: "default",
    multiline: false,
  },
});

const inputTextVariants = cva("flex-1 py-0 text-base text-foreground", {
  variants: {
    variant: {
      default: "placeholder:text-muted-foreground",
      ghost: "placeholder:text-muted-foreground",
      underline: "px-0 placeholder:text-muted-foreground",
      auth: "text-zinc-900 placeholder:text-zinc-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type InputVariantProps = VariantProps<typeof inputVariants>;

interface InputProps extends TextInputProps, InputVariantProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  /** Optional element rendered inside the input on the right (e.g. a show/hide password button). */
  endAdornment?: React.ReactNode;
}

const INPUT_FONT_SIZE = 16;
const INPUT_LINE_HEIGHT = 20;

export function Input({
  label,
  hint,
  error,
  variant,
  className,
  containerClassName,
  placeholderTextColor,
  endAdornment,
  multiline,
  style,
  ...props
}: InputProps) {
  const defaultPlaceholder =
    variant === "auth" ? "#ced1db" : colors["muted-foreground"];

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}
      <View
        className={cn(
          inputContainerVariants({ variant, multiline: Boolean(multiline) }),
          error &&
            (variant === "underline"
              ? "border-b-destructive"
              : "border-destructive"),
          endAdornment && "gap-2",
        )}
      >
        <TextInput
          multiline={multiline}
          className={cn(inputTextVariants({ variant }), className)}
          style={[
            {
              fontSize: INPUT_FONT_SIZE,
              ...(Platform.OS === "ios"
                ? { lineHeight: INPUT_LINE_HEIGHT }
                : {}),
              ...(Platform.OS === "android"
                ? { textAlignVertical: multiline ? "top" : "center" }
                : {}),
            },
            style,
          ]}
          placeholderTextColor={placeholderTextColor ?? defaultPlaceholder}
          {...props}
        />
        {endAdornment}
      </View>
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      ) : null}
    </View>
  );
}
