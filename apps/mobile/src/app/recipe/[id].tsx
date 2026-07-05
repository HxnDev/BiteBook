import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CookingPot,
  Copy,
  Heart,
  Pencil,
  Trash2,
  Utensils,
} from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IngredientList } from "@/components/recipe/ingredient-list";
import { MacroGrid } from "@/components/recipe/macro-grid";
import { MethodList } from "@/components/recipe/method-list";
import { Card, CategoryPill, Loading, SectionTitle } from "@/components/ui";
import {
  useDeleteRecipes,
  useDuplicateRecipe,
  usePatchRecipe,
  useRecipe,
} from "@/hooks/use-recipes";
import { per100g } from "@/lib/recipes/macros";
import { colors, font, radius } from "@/lib/theme";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: recipe, isLoading } = useRecipe(id);

  const patch = usePatchRecipe();
  const duplicate = useDuplicateRecipe();
  const remove = useDeleteRecipes();

  if (isLoading || !recipe) {
    return (
      <View style={styles.screen}>
        <Stack.Screen options={{ headerTransparent: false, title: "" }} />
        {isLoading ? (
          <Loading />
        ) : (
          <Text style={styles.missing}>
            Recipe not found. It may have been deleted.
          </Text>
        )}
      </View>
    );
  }

  const macros = per100g(recipe);

  function confirmDelete() {
    Alert.alert(
      "Delete this recipe?",
      `"${recipe!.title}" will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            remove.mutate([recipe!.id], { onSuccess: () => router.back() }),
        },
      ],
    );
  }

  return (
    <View style={styles.screen}>
      {/* Floating back button over the photo instead of a solid header bar. */}
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 8 }]}
        hitSlop={8}
      >
        <ArrowLeft size={20} color={colors.text} />
      </Pressable>
      <Pressable
        onPress={() =>
          router.push({ pathname: "/edit/[id]", params: { id: recipe.id } })
        }
        style={[styles.editButton, { top: insets.top + 8 }]}
        hitSlop={8}
      >
        <Pencil size={18} color={colors.text} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo hero */}
        <View style={styles.hero}>
          {recipe.imageUrl ? (
            <Image
              source={{ uri: recipe.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
              <CookingPot size={48} color={colors.primaryBorder} />
            </View>
          )}
          <LinearGradient
            colors={[
              "rgba(17,12,9,0.25)",
              "rgba(17,12,9,0)",
              "rgba(17,12,9,0.45)",
              "rgba(17,12,9,0.97)",
            ]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroBody}>
            <Animated.View
              entering={FadeInDown.duration(450)}
              style={styles.tagRow}
            >
              <CategoryPill category={recipe.category} />
              {recipe.tags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </Animated.View>
            <Animated.Text
              entering={FadeInDown.duration(450).delay(60)}
              style={styles.title}
            >
              {recipe.title}
            </Animated.Text>
            {recipe.description ? (
              <Animated.Text
                entering={FadeInDown.duration(450).delay(120)}
                style={styles.description}
              >
                {recipe.description}
              </Animated.Text>
            ) : null}
          </View>
        </View>

        <View style={styles.content}>
          {/* Actions */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(150)}
            style={styles.actions}
          >
            <ActionButton
              active={recipe.isFavorite}
              onPress={() =>
                patch.mutate({
                  id: recipe.id,
                  patch: { isFavorite: !recipe.isFavorite },
                })
              }
              icon={
                <Heart
                  size={18}
                  color={recipe.isFavorite ? colors.accent : colors.muted}
                  fill={recipe.isFavorite ? colors.accent : "transparent"}
                />
              }
              label="Favourite"
            />
            <ActionButton
              onPress={() =>
                patch.mutate({
                  id: recipe.id,
                  patch: {
                    timesCooked: recipe.timesCooked + 1,
                    lastCookedAt: new Date().toISOString(),
                  },
                })
              }
              icon={<Utensils size={18} color={colors.muted} />}
              label={
                recipe.timesCooked > 0
                  ? `Cooked ${recipe.timesCooked}×`
                  : "Cooked"
              }
            />
            <ActionButton
              onPress={() =>
                duplicate.mutate(recipe, {
                  onSuccess: (r) =>
                    router.replace({
                      pathname: "/recipe/[id]",
                      params: { id: r.id },
                    }),
                })
              }
              icon={<Copy size={18} color={colors.muted} />}
              label="Duplicate"
            />
            <ActionButton
              onPress={confirmDelete}
              icon={<Trash2 size={18} color={colors.destructive} />}
              label="Delete"
            />
          </Animated.View>

          {macros && (
            <Animated.View entering={FadeInDown.duration(450).delay(220)}>
              <MacroGrid macros={macros} />
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.duration(450).delay(280)}
            style={{ gap: 16 }}
          >
            <SectionTitle>Ingredients</SectionTitle>
            <IngredientList ingredients={recipe.ingredients} />

            <SectionTitle>Method</SectionTitle>
            <MethodList steps={recipe.instructions} />

            {recipe.notes ? (
              <>
                <SectionTitle>Notes</SectionTitle>
                <Card>
                  <Text style={styles.notes}>{recipe.notes}</Text>
                </Card>
              </>
            ) : null}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        active && {
          borderColor: colors.accent,
          backgroundColor: colors.accentSoft,
        },
        pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      {icon}
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  missing: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 15,
    textAlign: "center",
    marginTop: 64,
    paddingHorizontal: 32,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(17,12,9,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(17,12,9,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    height: 340,
    justifyContent: "flex-end",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardElevated,
  },
  heroBody: {
    padding: 20,
    gap: 10,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "rgba(17,12,9,0.35)",
  },
  tagText: {
    color: colors.textSecondary,
    fontFamily: font.medium,
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontFamily: font.displayLight,
    fontSize: 34,
    lineHeight: 38,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  action: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  actionLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
  },
  notes: {
    color: colors.textSecondary,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
