import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";

export function Loading() {
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
