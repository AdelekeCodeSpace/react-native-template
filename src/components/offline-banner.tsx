import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  if (isOnline) return null;

  return (
    <View className="absolute left-0 right-0 top-0 z-50 flex-row items-center justify-center gap-2 bg-destructive px-4 py-2">
      <Text className="text-sm font-medium text-destructive-foreground">
        No internet connection — some features may be unavailable
      </Text>
    </View>
  );
}
