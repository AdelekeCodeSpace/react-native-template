import { useState } from "react";
import { parseISO, format } from "date-fns";
import { Platform } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "~/lib/colors";
import { useThemeStore } from "~/lib/stores/theme-store";

export default function DateTimeField({
  label,
  value,
  onChange,
  error,
  hint,
  minimumDate,
}: {
  label: string;
  value: string; // "YYYY-MM-DD HH:mm" or ""
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  minimumDate?: Date;
}) {
  const colors = useThemeColors();
  const { theme } = useThemeStore();
  const [show, setShow] = useState(false);
  const [mode, setMode] = useState<"date" | "time">("date");
  // Temp holds the date portion between the two picker steps on Android.
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const currentDate = value
    ? (() => {
        try {
          return parseISO(value.replace(" ", "T"));
        } catch {
          return new Date();
        }
      })()
    : new Date();

  const openPicker = () => {
    setMode("date");
    setTempDate(null);
    setShow(true);
  };

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) {
      setShow(false);
      return;
    }
    if (Platform.OS === "android") {
      if (mode === "date") {
        // On Android: first step is date, then open time picker
        setTempDate(selected);
        setMode("time");
        // Keep show=true to reopen for time
        setShow(false);
        // Small timeout so the dialog dismisses before reopening
        setTimeout(() => setShow(true), 50);
      } else {
        // Second step: merge saved date with selected time
        setShow(false);
        const base = tempDate ?? selected;
        const merged = new Date(
          base.getFullYear(),
          base.getMonth(),
          base.getDate(),
          selected.getHours(),
          selected.getMinutes(),
        );
        onChange(format(merged, "yyyy-MM-dd HH:mm"));
      }
    } else {
      // iOS: single picker handles both date and time with mode="datetime"
      setShow(false);
      onChange(format(selected, "yyyy-MM-dd HH:mm"));
    }
  };

  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-foreground">{label}</Text>
      <Pressable onPress={openPicker}>
        <View
          pointerEvents="none"
          className={`h-12 flex-row items-center rounded-3xl border px-5 ${
            error ? "border-destructive" : "border-border"
          } bg-input`}
        >
          {value ? (
            <Text className="flex-1 text-base text-foreground">{value}</Text>
          ) : (
            <Text className="flex-1 text-base text-muted-foreground">
              Tap to select
            </Text>
          )}
          <Ionicons
            name="calendar-outline"
            size={18}
            color={colors["muted-foreground"]}
          />
        </View>
      </Pressable>
      {error ? (
        <Text className="text-xs text-destructive">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      ) : null}
      {show && (
        <DateTimePicker
          value={mode === "time" && tempDate ? tempDate : currentDate}
          mode={Platform.OS === "ios" ? "datetime" : mode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
          minimumDate={minimumDate}
          themeVariant={theme === "dark" ? "dark" : "light"}
        />
      )}
    </View>
  );
}
