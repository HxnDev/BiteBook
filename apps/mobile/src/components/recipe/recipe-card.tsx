import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Check,
  CookingPot,
  Flame,
  Heart,
  MoreHorizontal,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CategoryPill } from "@/components/ui";
import { sizedImage } from "@/lib/image";
import { per100g, fmt } from "@/lib/recipes/macros";
import type { Recipe } from "@/lib/recipes/types";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

/** Compact editorial card shared by the grid and list layouts. */
export function RecipeCard({
  recipe,
  selectable,
  selected,
  onToggleSelect,
  layout = "grid",
  onToggleFavorite,
}: {
  recipe: Recipe;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  layout?: "grid" | "list";
  onToggleFavorite?: (recipe: Recipe) => void;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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
        layout === "list" && styles.cardList,
        pressed && { opacity: 0.9, transform: [{ scale: 0.985 }] },
        selectable && selected && styles.cardSelected,
      ]}
    >
      <View
        style={[styles.imageWrap, layout === "list" && styles.imageWrapList]}
      >
        {recipe.imageUrl ? (
          <Image
            source={{ uri: sizedImage(recipe.imageUrl, 800)! }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
            <CookingPot size={38} color={colors.primaryBorder} />
          </View>
        )}
        <LinearGradient
          colors={["rgba(11,16,14,0.03)", "rgba(11,16,14,0.48)"]}
          style={StyleSheet.absoluteFill}
        />
        <CategoryPill category={recipe.category} small />
        {!selectable && (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite?.(recipe);
            }}
            hitSlop={8}
            style={styles.favoriteButton}
            accessibilityLabel={
              recipe.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              size={18}
              color="#FFFFFF"
              fill={recipe.isFavorite ? "#FFFFFF" : "transparent"}
            />
          </Pressable>
        )}
      </View>

      {selectable && (
        <View style={[styles.selectBadge, selected && styles.selectBadgeOn]}>
          {selected && (
            <Check size={14} color={colors.onPrimary} strokeWidth={3} />
          )}
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <View style={styles.metaRow}>
          {macros?.calories != null && (
            <View style={styles.meta}>
              <Flame size={12} color={colors.primaryBright} />
              <Text style={styles.metaText}>{fmt(macros.calories)} kcal</Text>
            </View>
          )}
          <MoreHorizontal
            size={17}
            color={colors.muted}
            style={styles.moreIcon}
          />
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      minHeight: 246,
      borderRadius: radius.lg,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    cardList: {
      minHeight: 126,
      flexDirection: "row",
    },
    imageWrap: {
      height: 164,
      overflow: "hidden",
      justifyContent: "flex-end",
      padding: 10,
    },
    imageWrapList: {
      width: 145,
      height: 124,
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
      flex: 1,
      padding: 12,
      gap: 8,
      justifyContent: "center",
    },
    title: {
      color: colors.text,
      fontFamily: font.displaySemibold,
      fontSize: 17,
      lineHeight: 21,
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
      color: colors.muted,
      fontFamily: font.medium,
      fontSize: 12,
    },
    favoriteButton: {
      position: "absolute",
      right: 10,
      top: 10,
      width: 34,
      height: 34,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(11,16,14,0.58)",
    },
    moreIcon: { marginLeft: "auto" },
  });
