import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cn } from "~/lib/utils/helpers";
import { colors } from "~/lib/colors";

// ─── AccordionItem (self-contained) ──────────────────────────────────────────

interface AccordionItemProps {
  value: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccordionItem({
  trigger,
  children,
  defaultOpen = false,
  className,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  };

  return (
    <View className={cn("border-b border-border last:border-b-0", className)}>
      <Pressable
        onPress={toggle}
        className="flex-row items-center justify-between p-2 active:opacity-70"
      >
        <View className="flex-1">{trigger}</View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors["muted-foreground"]}
        />
      </Pressable>

      {isOpen && <View className="px-4 pb-4">{children}</View>}
    </View>
  );
}

// ─── Accordion (wrapper) ──────────────────────────────────────────────────────

interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return <View className={className}>{children}</View>;
}
