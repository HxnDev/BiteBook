import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/lib/theme-context";

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
});
