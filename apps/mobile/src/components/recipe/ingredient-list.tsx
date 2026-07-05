import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui";
import type { Ingredient } from "@/lib/recipes/types";
import { colors, font } from "@/lib/theme";

export function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  return (
    <Card style={{ padding: 0 }}>
      {ingredients.length === 0 ? (
        <Text style={styles.empty}>No ingredients yet.</Text>
      ) : (
        ingredients.map((ing, i) => (
          <View key={ing.id} style={[styles.row, i > 0 && styles.rowBorder]}>
            <Text style={styles.name}>{ing.name}</Text>
            <Text style={styles.qty}>
              {ing.quantity != null ? `${ing.quantity} ` : ""}
              {ing.unit !== "to taste" || ing.quantity == null ? ing.unit : ""}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 14,
    padding: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  name: {
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 15,
    flex: 1,
  },
  qty: {
    color: colors.muted,
    fontFamily: font.medium,
    fontSize: 13,
  },
});
