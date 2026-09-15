import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui";
import type { Ingredient } from "@/lib/recipes/types";
import { font, type Palette } from "@/lib/theme";
import { useThemedStyles } from "@/lib/theme-context";

export function IngredientList({ ingredients }: { ingredients: Ingredient[] }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Card style={{ padding: 0 }}>
      {ingredients.length === 0 ? (
        <Text style={styles.empty}>No ingredients yet.</Text>
      ) : (
        ingredients.map((ing, i) => (
          <View key={ing.id} style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={styles.ingredientName}>
              <View style={styles.ingredientIcon}>
                {ing.imageUrl ? (
                  <Image
                    source={{ uri: ing.imageUrl }}
                    style={styles.ingredientImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                  />
                ) : (
                  <Text style={styles.ingredientEmoji}>
                    {ingredientEmoji(ing.name)}
                  </Text>
                )}
              </View>
              <Text style={styles.name}>{ing.name}</Text>
            </View>
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

function ingredientEmoji(name: string): string {
  const value = name.toLowerCase();
  if (value.includes("onion")) return "🧅";
  if (value.includes("garlic")) return "🧄";
  if (value.includes("tomato")) return "🍅";
  if (value.includes("potato")) return "🥔";
  if (value.includes("chicken")) return "🍗";
  if (value.includes("salt")) return "🧂";
  if (value.includes("chilli") || value.includes("chili")) return "🌶️";
  if (value.includes("egg")) return "🥚";
  if (value.includes("rice")) return "🍚";
  return "✦";
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
      paddingHorizontal: 14,
      paddingVertical: 10,
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
    ingredientName: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    ingredientIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.faint,
      overflow: "hidden",
    },
    ingredientImage: { width: "100%", height: "100%" },
    ingredientEmoji: { fontSize: 20 },
    qty: {
      color: colors.muted,
      fontFamily: font.medium,
      fontSize: 13,
    },
  });
