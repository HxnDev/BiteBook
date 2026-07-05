import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius } from "@/lib/theme";

export function MethodList({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return <Text style={styles.empty}>No method added yet.</Text>;
  }
  return (
    <View style={{ gap: 14 }}>
      {steps.map((step, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.number}>{i + 1}</Text>
          </View>
          <Text style={styles.text}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.faint,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    color: colors.primary,
    fontFamily: font.displaySemibold,
    fontSize: 14,
  },
  text: {
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 23,
    flex: 1,
    paddingTop: 3,
  },
});
