import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Check, CookingPot, Flame, Heart } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CategoryPill } from "@/components/ui";
import { per100g, fmt } from "@/lib/recipes/macros";
import type { Recipe } from "@/lib/recipes/types";
import { colors, font, radius } from "@/lib/theme";

/** Showcase card: photo with gradient overlay, like the web app's grid. */
export function RecipeCard({
  recipe,
  selectable,
  selected,
  onToggleSelect,
}: {
  recipe: Recipe;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const router = useRouter();
  const macros = per100g(recipe);

  return (
    <Pressable
      onPress={() =>
        selectable
          ? onToggleSelect?.(recipe.id)
          : router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })
      }
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
        selectable && selected && styles.cardSelected,
      ]}
    >
      {recipe.imageUrl ? (
        <Image
          source={{ uri: recipe.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <CookingPot size={38} color={colors.primaryBorder} />
        </View>
      )}
      <LinearGradient
        colors={["rgba(17,12,9,0)", "rgba(17,12,9,0.55)", "rgba(17,12,9,0.92)"]}
        style={StyleSheet.absoluteFill}
      />

      {recipe.isFavorite && !selectable && (
        <View style={styles.favBadge}>
          <Heart size={13} color={colors.accent} fill={colors.accent} />
        </View>
      )}
      {selectable && (
        <View style={[styles.selectBadge, selected && styles.selectBadgeOn]}>
          {selected && (
            <Check size={14} color={colors.onPrimary} strokeWidth={3} />
          )}
        </View>
      )}

      <View style={styles.body}>
        <CategoryPill category={recipe.category} small />
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.metaRow}>
          {macros?.calories != null && (
            <View style={styles.meta}>
              <Flame size={12} color={colors.primary} />
              <Text style={styles.metaText}>
                {fmt(macros.calories)} kcal/100g
              </Text>
            </View>
          )}
          {macros?.protein != null && (
            <Text style={styles.metaText}>
              {fmt(macros.protein, 1)}g protein
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 190,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: "flex-end",
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardElevated,
  },
  favBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(17,12,9,0.72)",
    borderRadius: radius.full,
    padding: 7,
  },
  selectBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: "rgba(243,237,226,0.8)",
    backgroundColor: "rgba(17,12,9,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectBadgeOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  body: {
    padding: 14,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontFamily: font.displaySemibold,
    fontSize: 19,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontFamily: font.medium,
    fontSize: 12,
  },
});
