import type { ReactNode } from "react";
import {
  ScrollView as RNScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "~/lib/utils/helpers";

type ScreenVariant = "screen" | "detail";

interface ScreenProps extends Omit<ScrollViewProps, "contentContainerStyle"> {
  children: ReactNode;
  /**
   * "screen" — a top-level screen with no navigation header; adds top safe-area
   * padding. "detail" — a screen rendered under a stack header; skips the top
   * inset since the header already offsets the content. Defaults to "screen".
   */
  variant?: ScreenVariant;
  /** Render a static (non-scrolling) container instead of a ScrollView. */
  scroll?: boolean;
  /** Apply the default horizontal padding + vertical gap. Defaults to true. */
  padded?: boolean;
  /** Class names for the outer container. */
  className?: string;
  /** Extra styles merged onto (and able to override) the default content styles. */
  contentContainerStyle?: StyleProp<ViewStyle>;
}

// Default spacing — tweak here once and every Screen updates.
const H_PADDING = 20;
const CONTENT_GAP = 16;
const SCREEN_TOP = 12;
const DETAIL_TOP = 16;
const BOTTOM = 24;

/**
 * A reusable scroll container with safe-area-aware defaults, so screens don't
 * re-implement insets/padding each time. Every default is overridable via
 * props (`padded`, `contentContainerStyle`, `className`, and any ScrollView
 * prop), and `scroll={false}` swaps in a static View.
 *
 * @example
 * // Top-level tab screen
 * <Screen>...</Screen>
 *
 * // Detail screen under a stack header, custom spacing
 * <Screen variant="detail" contentContainerStyle={{ gap: 24 }}>...</Screen>
 *
 * // Non-scrolling, edge-to-edge
 * <Screen scroll={false} padded={false}>...</Screen>
 */
export function Screen({
  children,
  variant = "screen",
  scroll = true,
  padded = true,
  className,
  contentContainerStyle,
  ...rest
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const defaultContentStyle: ViewStyle = {
    paddingTop: (variant === "detail"
      ? DETAIL_TOP
      : insets.top + SCREEN_TOP) as number,
    paddingBottom: insets.bottom + BOTTOM,
    ...(padded ? { paddingHorizontal: H_PADDING, gap: CONTENT_GAP } : {}),
  };

  if (!scroll) {
    return (
      <View
        className={cn("flex-1 bg-background", className)}
        style={[{ flex: 1 }, defaultContentStyle, contentContainerStyle]}
      >
        {children}
      </View>
    );
  }

  return (
    <RNScrollView
      className={cn("flex-1 bg-background", className)}
      contentContainerStyle={[defaultContentStyle, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {children}
    </RNScrollView>
  );
}
