import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui";
import { fmt, type MacroSet } from "@/lib/recipes/macros";
import { colors, font, radius } from "@/lib/theme";

/** Per-100g nutrition card shown on the recipe detail screen. */
export function MacroGrid({ macros }: { macros: MacroSet }) {
  return (
    <Card>
      <Text style={styles.eyebrow}>Nutrition · per 100g</Text>
      <View style={styles.row}>
        <Macro value={fmt(macros.calories)} unit="kcal" />
        <Macro value={fmt(macros.protein, 1)} unit="Protein" />
        <Macro value={fmt(macros.carbs, 1)} unit="Carbs" />
        <Macro value={fmt(macros.fat, 1)} unit="Fat" />
      </View>
    </Card>
  );
}

function Macro({ value, unit }: { value: string; unit: string }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  macro: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.faint,
    borderRadius: radius.md,
    paddingVertical: 12,
    gap: 3,
  },
  value: {
    color: colors.text,
    fontFamily: font.displaySemibold,
    fontSize: 18,
  },
  unit: {
    color: colors.muted,
    fontFamily: font.medium,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
