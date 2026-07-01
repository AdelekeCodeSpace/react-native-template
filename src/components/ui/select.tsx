import { cva, type VariantProps } from "class-variance-authority";
import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  type LayoutRectangle,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "~/lib/utils/helpers";
import { colors } from "~/lib/colors";

export interface SelectOption {
  label: string;
  value: string;
}

const selectTriggerVariants = cva(
  "flex-row items-center justify-between rounded-3xl border px-5 py-3",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        auth: "border-zinc-200 bg-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const selectValueTextVariants = cva("flex-1 text-sm", {
  variants: {
    variant: {
      default: "",
      auth: "text-zinc-900",
    },
    tone: {
      selected: "",
      placeholder: "text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
    tone: "placeholder",
  },
});

const selectDropdownVariants = cva("overflow-hidden rounded-3xl border", {
  variants: {
    variant: {
      default: "border-border bg-background",
      auth: "border-zinc-200 bg-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type SelectVariantProps = VariantProps<typeof selectTriggerVariants>;

interface SelectProps extends SelectVariantProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const DROPDOWN_MAX_HEIGHT = 260;
const ITEM_HEIGHT = 44;
const SCREEN_PADDING = 16;

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  variant,
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState<
    (LayoutRectangle & { pageY: number; pageX: number }) | null
  >(null);
  const triggerRef = useRef<View>(null);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const selected = options.find((o) => o.value === value);

  const openDropdown = () => {
    if (disabled) return;
    triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      setLayout({ x: pageX, y: pageY, width, height, pageX, pageY });
      setOpen(true);
    });
  };

  const dropdownHeight = Math.min(
    options.length * ITEM_HEIGHT,
    DROPDOWN_MAX_HEIGHT,
  );
  const spaceBelow = layout
    ? screenHeight - layout.pageY - layout.height - SCREEN_PADDING
    : 0;
  const spaceAbove = layout ? layout.pageY - SCREEN_PADDING : 0;
  const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

  const dropdownTop = layout
    ? openUpward
      ? layout.pageY - dropdownHeight - 4
      : layout.pageY + layout.height - 12
    : 0;

  const dropdownLeft = layout
    ? Math.min(layout.pageX, screenWidth - layout.width - SCREEN_PADDING)
    : 0;

  return (
    <>
      <View className={cn("gap-1.5", className)}>
        {label && (
          <Text className="text-sm font-medium text-foreground">{label}</Text>
        )}
        <View ref={triggerRef} collapsable={false}>
          <Pressable
            onPress={openDropdown}
            className={cn(
              selectTriggerVariants({ variant }),
              disabled && "opacity-50",
              open && "border-primary",
              error && "border-destructive",
            )}
          >
            <Text
              className={cn(
                selectValueTextVariants({
                  variant,
                  tone: selected ? "selected" : "placeholder",
                }),
                selected &&
                  (variant === "auth" ? "text-zinc-900" : "text-foreground"),
              )}
            >
              {selected?.label ?? placeholder}
            </Text>
            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors["muted-foreground"]}
            />
          </Pressable>
        </View>
        {error && <Text className="text-xs text-destructive">{error}</Text>}
      </View>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        {/* Full-screen dismiss layer */}
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          {/* Dropdown card — stop propagation so tapping inside doesn't close */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={selectDropdownVariants({ variant })}
            style={{
              position: "absolute",
              top: dropdownTop,
              left: dropdownLeft,
              width: layout?.width ?? 200,
              maxHeight: DROPDOWN_MAX_HEIGHT,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                    style={{ height: ITEM_HEIGHT }}
                    className="active:bg-muted/30 flex-row items-center justify-between px-3"
                  >
                    <Text
                      className={cn(
                        "flex-1 text-sm",
                        isSelected
                          ? "font-semibold text-primary"
                          : "text-foreground",
                      )}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={15}
                        color={colors.primary}
                      />
                    )}
                  </Pressable>
                );
              }}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.border,
                    opacity: 0.5,
                    marginHorizontal: 8,
                  }}
                />
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
