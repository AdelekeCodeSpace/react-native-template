/**
 * DebugOverlay
 *
 * Floating, in-app inspector for HTTP traffic captured by the
 * axios interceptors in `config/axios.config.ts`. Rendered only on
 * dev and preview builds (gated by `isDebugOverlayEnabled` from
 * `lib/debug-store.ts`).
 *
 * UX:
 *   - Draggable FAB (snap-to-nearest-edge, vertical clamp inside
 *     the safe area). QA can park it anywhere it doesn't block UI.
 *   - Live badge that pulses each time a new request is captured.
 *   - Tap the FAB to open the log list.
 *   - Long-press the FAB to hide it for the rest of the session.
 *   - Detail view is a 3-tab inspector: Response / Request / Headers.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { debugStore, LogEntry, useDebugLogs } from "~/lib/debug-store";

// ---------------------------------------------------------------------------
// Tokens & helpers
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0F1115",
  surface: "#1A1D24",
  surfaceAlt: "#242833",
  border: "#2E3340",
  textPrimary: "#F4F5F7",
  textSecondary: "#A0A6B1",
  textMuted: "#6B7280",
  accent: "#7C9CFF",
  success: "#22C55E",
  warn: "#F59E0B",
  error: "#EF4444",
  errorDark: "#B91C1C",
};

const FAB_BOTTOM_OFFSET = 24;
const FAB_RIGHT_OFFSET = 16;
const EDGE_PADDING = 12;
const SPRING_CONFIG = { damping: 18, stiffness: 180 } as const;

const formatTime = (d: Date): string => {
  const pad = (n: number, len = 2) => n.toString().padStart(len, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds(),
  )}.${pad(d.getMilliseconds(), 3)}`;
};

const stringifyValue = (val: unknown): string => {
  if (val === undefined) return "—";
  if (val === null) return "null";
  if (typeof val === "string") return val;
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
};

const statusColor = (entry: LogEntry): string => {
  if (entry.error && entry.status === undefined) return COLORS.error;
  const status = entry.status ?? 0;
  if (status >= 500) return COLORS.errorDark;
  if (status >= 400) return COLORS.error;
  if (status >= 300) return COLORS.warn;
  if (status >= 200) return COLORS.success;
  return COLORS.textMuted;
};

const isErrorEntry = (entry: LogEntry): boolean =>
  !!entry.error || (entry.status ?? 0) >= 400;

type DetailTab = "response" | "request" | "headers";

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export const DebugOverlay = () => {
  const logs = useDebugLogs();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [filter, setFilter] = useState("");
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reanimated state for the floating button
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const fabW = useSharedValue(96);
  const fabH = useSharedValue(36);
  const pulseScale = useSharedValue(1);

  const errorCount = useMemo(
    () => logs.reduce((acc, l) => acc + (isErrorEntry(l) ? 1 : 0), 0),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    let items = logs;
    if (errorsOnly) items = items.filter(isErrorEntry);
    const q = filter.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (l) =>
          l.url.toLowerCase().includes(q) ||
          l.method.toLowerCase().includes(q) ||
          String(l.status ?? "").includes(q),
      );
    }
    return items;
  }, [logs, errorsOnly, filter]);

  const selected = useMemo(
    () => (selectedId ? (logs.find((l) => l.id === selectedId) ?? null) : null),
    [selectedId, logs],
  );

  // Pulse the badge whenever a NEW request lands. We compare against the
  // previous length so a Clear (which drops the count to 0) doesn't pulse.
  const prevCountRef = useRef(logs.length);
  useEffect(() => {
    if (logs.length > prevCountRef.current) {
      pulseScale.value = withSequence(
        withTiming(1.45, { duration: 140 }),
        withSpring(1, { damping: 8, stiffness: 220 }),
      );
    }
    prevCountRef.current = logs.length;
  }, [logs.length, pulseScale]);

  const onFabLayout = (e: LayoutChangeEvent) => {
    fabW.value = e.nativeEvent.layout.width;
    fabH.value = e.nativeEvent.layout.height;
  };

  // -------------------------------------------------------------------------
  // Gestures: drag (with snap+clamp), tap to open, long-press to hide
  // -------------------------------------------------------------------------

  const tapGesture = useMemo(
    () =>
      Gesture.Tap()
        .maxDistance(8)
        .onEnd((_e, success) => {
          "worklet";
          if (success) runOnJS(setOpen)(true);
        }),
    [],
  );

  const longPressGesture = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(700)
        .maxDistance(8)
        .onStart(() => {
          "worklet";
          runOnJS(setHidden)(true);
        }),
    [],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-8, 8])
        .activeOffsetY([-8, 8])
        .onChange((e) => {
          "worklet";
          tx.value += e.changeX;
          ty.value += e.changeY;
        })
        .onEnd(() => {
          "worklet";
          // Snap horizontally to the nearest edge.
          // baseRight = screenW - FAB_RIGHT_OFFSET - insets.right (FAB right edge at rest).
          const baseRight = screenW - FAB_RIGHT_OFFSET - insets.right;
          const fabLeft = baseRight - fabW.value + tx.value;
          const fabCenter = fabLeft + fabW.value / 2;
          const targetTx =
            fabCenter < screenW / 2
              ? // Snap to the left edge (with EDGE_PADDING from screen left).
                -(
                  screenW -
                  FAB_RIGHT_OFFSET -
                  insets.right -
                  insets.left -
                  EDGE_PADDING -
                  fabW.value
                )
              : 0;
          tx.value = withSpring(targetTx, SPRING_CONFIG);

          // Clamp vertically inside the safe area.
          const baseBottomY = screenH - FAB_BOTTOM_OFFSET - insets.bottom;
          const fabTop = baseBottomY - fabH.value + ty.value;
          const minTop = insets.top + EDGE_PADDING;
          const maxTop = screenH - insets.bottom - EDGE_PADDING - fabH.value;
          let targetTy = ty.value;
          if (fabTop < minTop) targetTy = ty.value + (minTop - fabTop);
          else if (fabTop > maxTop) targetTy = ty.value - (fabTop - maxTop);
          if (targetTy !== ty.value) {
            ty.value = withSpring(targetTy, SPRING_CONFIG);
          }
        }),
    [
      screenW,
      screenH,
      insets.top,
      insets.bottom,
      insets.left,
      insets.right,
      tx,
      ty,
      fabW,
      fabH,
    ],
  );

  const composedGesture = useMemo(
    () => Gesture.Race(longPressGesture, panGesture, tapGesture),
    [longPressGesture, panGesture, tapGesture],
  );

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const closeModal = () => {
    setOpen(false);
    setSelectedId(null);
  };

  if (hidden) return null;

  return (
    <>
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          accessibilityRole="button"
          accessibilityLabel="Open debug overlay"
          onLayout={onFabLayout}
          style={[
            styles.fab,
            {
              bottom: FAB_BOTTOM_OFFSET + insets.bottom,
              right: FAB_RIGHT_OFFSET + insets.right,
            },
            fabAnimStyle,
          ]}
        >
          <Text style={styles.fabLabel}>DEBUG</Text>
          {logs.length > 0 ? (
            <Animated.View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    errorCount > 0 ? COLORS.error : COLORS.accent,
                },
                badgeAnimStyle,
              ]}
            >
              <Text style={styles.badgeText}>
                {errorCount > 0 ? errorCount : logs.length}
              </Text>
            </Animated.View>
          ) : null}
        </Animated.View>
      </GestureDetector>

      <Modal
        visible={open}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View
          style={[
            styles.modalRoot,
            {
              paddingTop: insets.top || (Platform.OS === "android" ? 24 : 44),
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {selected ? (
            <DebugDetailView
              entry={selected}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <DebugListView
              total={logs.length}
              errorCount={errorCount}
              logs={filteredLogs}
              filter={filter}
              setFilter={setFilter}
              errorsOnly={errorsOnly}
              setErrorsOnly={setErrorsOnly}
              onSelect={(id) => setSelectedId(id)}
              onClose={closeModal}
              onClear={() => debugStore.clear()}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

// ---------------------------------------------------------------------------
// List view
// ---------------------------------------------------------------------------

type ListProps = {
  total: number;
  errorCount: number;
  logs: LogEntry[];
  filter: string;
  setFilter: (s: string) => void;
  errorsOnly: boolean;
  setErrorsOnly: (b: boolean) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
  onClear: () => void;
};

const DebugListView = ({
  total,
  errorCount,
  logs,
  filter,
  setFilter,
  errorsOnly,
  setErrorsOnly,
  onSelect,
  onClose,
  onClear,
}: ListProps) => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Network Logs</Text>
          <Text style={styles.headerSubtitle}>
            {total} captured · {errorCount} errors
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close debug overlay"
          onPress={onClose}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Close</Text>
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter by URL, method, or status"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={errorsOnly ? "Show all" : "Show only errors"}
          onPress={() => setErrorsOnly(!errorsOnly)}
          style={[
            styles.toolbarButton,
            errorsOnly ? styles.toolbarButtonActive : null,
          ]}
        >
          <Text
            style={[
              styles.toolbarButtonText,
              errorsOnly ? styles.toolbarButtonTextActive : null,
            ]}
          >
            Errors
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear logs"
          onPress={onClear}
          style={styles.toolbarButton}
        >
          <Text style={styles.toolbarButtonText}>Clear</Text>
        </Pressable>
      </View>

      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            {total === 0
              ? "No requests captured yet."
              : "No requests match the current filter."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <LogRow entry={item} onPress={() => onSelect(item.id)} />
          )}
        />
      )}
    </View>
  );
};

const LogRow = ({
  entry,
  onPress,
}: {
  entry: LogEntry;
  onPress: () => void;
}) => {
  const color = statusColor(entry);
  const isError = isErrorEntry(entry);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${entry.method} ${entry.url}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        isError ? styles.rowError : null,
        pressed ? { backgroundColor: COLORS.surfaceAlt } : null,
      ]}
    >
      <View style={styles.rowTopLine}>
        <View style={[styles.statusPill, { backgroundColor: color }]}>
          <Text style={styles.statusPillText}>
            {entry.error && entry.status === undefined
              ? "ERR"
              : (entry.status ?? "—")}
          </Text>
        </View>
        <Text style={styles.method}>{entry.method}</Text>
        <Text style={styles.duration}>
          {entry.duration !== undefined ? `${entry.duration} ms` : "—"}
        </Text>
        <Text style={styles.time}>{formatTime(entry.timestamp)}</Text>
      </View>
      <Text
        style={[styles.url, isError ? styles.urlError : null]}
        numberOfLines={2}
      >
        {entry.url || "(no url)"}
      </Text>
      {entry.error ? (
        <Text style={styles.errorText} numberOfLines={1}>
          {entry.error}
        </Text>
      ) : null}
    </Pressable>
  );
};

// ---------------------------------------------------------------------------
// Detail view (3 tabs)
// ---------------------------------------------------------------------------

const DebugDetailView = ({
  entry,
  onBack,
}: {
  entry: LogEntry;
  onBack: () => void;
}) => {
  const [tab, setTab] = useState<DetailTab>("response");

  const fullUrl =
    entry.baseURL && entry.url && !entry.url.startsWith("http")
      ? `${entry.baseURL.replace(/\/$/, "")}/${entry.url.replace(/^\//, "")}`
      : entry.url;

  const onShare = async () => {
    const payload = {
      timestamp: entry.timestamp.toISOString(),
      method: entry.method,
      url: fullUrl,
      status: entry.status,
      duration: entry.duration,
      source: entry.source,
      error: entry.error,
      requestHeaders: entry.requestHeaders,
      requestBody: entry.requestBody,
      responseHeaders: entry.responseHeaders,
      responseBody: entry.responseBody,
    };
    try {
      await Share.share({ message: JSON.stringify(payload, null, 2) });
    } catch {
      // Sharing is best-effort in debug mode.
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to log list"
          onPress={onBack}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>← Back</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share log entry"
          onPress={onShare}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Share</Text>
        </Pressable>
      </View>

      <View style={styles.detailTopMeta}>
        <View style={styles.detailSummary}>
          <View
            style={[styles.statusPill, { backgroundColor: statusColor(entry) }]}
          >
            <Text style={styles.statusPillText}>
              {entry.error && entry.status === undefined
                ? "ERR"
                : (entry.status ?? "—")}
            </Text>
          </View>
          <Text style={styles.detailMethod}>{entry.method}</Text>
          {entry.source ? (
            <Text style={styles.detailSource}>· {entry.source}</Text>
          ) : null}
        </View>
        <Text selectable style={styles.detailUrl}>
          {fullUrl}
        </Text>
        <View style={styles.metaRow}>
          <MetaPill label="Time" value={formatTime(entry.timestamp)} />
          <MetaPill
            label="Duration"
            value={entry.duration !== undefined ? `${entry.duration} ms` : "—"}
          />
        </View>
      </View>

      <View style={styles.tabRow}>
        {(
          [
            { id: "response", label: "Response" },
            { id: "request", label: "Request" },
            { id: "headers", label: "Headers" },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          return (
            <Pressable
              key={t.id}
              accessibilityRole="tab"
              accessibilityLabel={`${t.label} tab`}
              accessibilityState={{ selected: active }}
              onPress={() => setTab(t.id)}
              style={[styles.tab, active ? styles.tabActive : null]}
            >
              <Text
                style={[styles.tabText, active ? styles.tabTextActive : null]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.detailContent}
        keyboardShouldPersistTaps="handled"
      >
        {tab === "response" ? (
          <>
            {entry.error ? (
              <Section title="Error">
                <Text selectable style={styles.errorBlock}>
                  {entry.error}
                </Text>
              </Section>
            ) : null}
            <Section title="Body">
              <CodeBlock value={stringifyValue(entry.responseBody)} />
            </Section>
          </>
        ) : null}

        {tab === "request" ? (
          <Section title="Body">
            <CodeBlock value={stringifyValue(entry.requestBody)} />
          </Section>
        ) : null}

        {tab === "headers" ? (
          <>
            <Section title="Request Headers">
              <CodeBlock value={stringifyValue(entry.requestHeaders)} />
            </Section>
            <Section title="Response Headers">
              <CodeBlock value={stringifyValue(entry.responseHeaders)} />
            </Section>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const CodeBlock = ({ value }: { value: string }) => (
  <View style={styles.codeBlock}>
    <Text selectable style={styles.codeText}>
      {value}
    </Text>
  </View>
);

const MetaPill = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.metaPill}>
    <Text style={styles.metaPillLabel}>{label}</Text>
    <Text style={styles.metaPillValue}>{value}</Text>
  </View>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.accent,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    zIndex: 9999,
  },
  fabLabel: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  badge: {
    marginLeft: 8,
    minWidth: 22,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  modalRoot: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    color: COLORS.textPrimary,
    fontSize: 13,
  },
  toolbarButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toolbarButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  toolbarButtonText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  toolbarButtonTextActive: {
    color: "#0F1115",
  },
  listContent: {
    paddingVertical: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowError: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    minWidth: 44,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  method: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  duration: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: "auto",
  },
  time: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  url: {
    color: COLORS.textPrimary,
    fontSize: 13,
    marginTop: 4,
  },
  urlError: {
    color: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
  detailTopMeta: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  detailContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  detailSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailMethod: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  detailSource: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  detailUrl: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaPillLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaPillValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  tabText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#0F1115",
  },
  section: {
    marginTop: 4,
    gap: 6,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  codeBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  codeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  errorBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 12,
    color: COLORS.error,
    fontSize: 13,
  },
});
