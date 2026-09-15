import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CookingPot,
  Copy,
  Flame,
  Heart,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  Alert,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IngredientList } from "@/components/recipe/ingredient-list";
import { sizedImage } from "@/lib/image";
import { MacroGrid } from "@/components/recipe/macro-grid";
import { MethodList } from "@/components/recipe/method-list";
import { Card, CategoryPill, Loading, SectionTitle } from "@/components/ui";
import {
  useDeleteRecipes,
  useDuplicateRecipe,
  useRecipe,
  useUpdateRecipe,
} from "@/hooks/use-recipes";
import { fmt, per100g } from "@/lib/recipes/macros";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, scheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { data: recipe, isLoading } = useRecipe(id);

  const duplicate = useDuplicateRecipe();
  const remove = useDeleteRecipes();
  const updateRecipe = useUpdateRecipe();
  const [section, setSection] = useState<
    "ingredients" | "instructions" | "nutrition" | "notes"
  >("ingredients");

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

  function toggleFavorite() {
    updateRecipe.mutate({
      id: recipe!.id,
      input: { ...recipe!, isFavorite: !recipe!.isFavorite },
    });
  }

  function shareRecipe() {
    void Share.share({
      title: recipe!.title,
      message: `${recipe!.title}\n\n${recipe!.description || "A recipe from BiteBook."}`,
    });
  }

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
        <ArrowLeft size={20} color="#F3EDE2" />
      </Pressable>
      <View style={[styles.heroActions, { top: insets.top + 8 }]}>
        <Pressable
          onPress={toggleFavorite}
          style={styles.heroButton}
          hitSlop={8}
        >
          <Heart
            size={21}
            color="#FFFFFF"
            fill={recipe.isFavorite ? "#FFFFFF" : "transparent"}
          />
        </Pressable>
        <Pressable onPress={shareRecipe} style={styles.heroButton} hitSlop={8}>
          <MoreHorizontal size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo hero */}
        <View style={styles.hero}>
          {recipe.imageUrl ? (
            <Image
              source={{ uri: sizedImage(recipe.imageUrl, 1280)! }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={250}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
              <CookingPot size={48} color={colors.primaryBorder} />
            </View>
          )}
          <LinearGradient
            colors={
              scheme === "dark"
                ? [
                    "rgba(17,12,9,0.25)",
                    "rgba(17,12,9,0)",
                    "rgba(17,12,9,0.45)",
                    "rgba(17,12,9,0.97)",
                  ]
                : [
                    "rgba(17,12,9,0.25)",
                    "rgba(17,12,9,0)",
                    "rgba(255,253,250,0.5)",
                    "rgba(255,253,250,0.99)",
                  ]
            }
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
            {macros?.calories != null && (
              <Animated.View
                entering={FadeInDown.duration(450).delay(140)}
                style={styles.heroMeta}
              >
                <Flame size={18} color={colors.primary} />
                <Text style={styles.heroMetaText}>
                  {fmt(macros.calories)} kcal per 100g
                </Text>
              </Animated.View>
            )}
          </View>
        </View>

        <View style={styles.content}>
          {/* Actions */}
          <Animated.View
            entering={FadeInDown.duration(450).delay(150)}
            style={styles.actions}
          >
            <ActionButton
              onPress={() =>
                router.push({
                  pathname: "/edit/[id]",
                  params: { id: recipe.id },
                })
              }
              icon={<Pencil size={18} color={colors.muted} />}
              label="Edit"
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
              onPress={shareRecipe}
              icon={<Share2 size={18} color={colors.muted} />}
              label="Share"
            />
            <ActionButton
              onPress={confirmDelete}
              icon={<Trash2 size={18} color={colors.destructive} />}
              label="Delete"
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(450).delay(280)}
            style={{ gap: 16 }}
          >
            <View style={styles.tabs}>
              <SectionTab
                label="Ingredients"
                active={section === "ingredients"}
                onPress={() => setSection("ingredients")}
              />
              <SectionTab
                label="Instructions"
                active={section === "instructions"}
                onPress={() => setSection("instructions")}
              />
              <SectionTab
                label="Nutrition"
                active={section === "nutrition"}
                onPress={() => setSection("nutrition")}
              />
              <SectionTab
                label="Notes"
                active={section === "notes"}
                onPress={() => setSection("notes")}
              />
            </View>
            {section === "ingredients" && (
              <>
                <SectionTitle>Ingredients</SectionTitle>
                <IngredientList ingredients={recipe.ingredients} />
              </>
            )}
            {section === "instructions" && (
              <>
                <SectionTitle>Instructions</SectionTitle>
                <MethodList steps={recipe.instructions} />
              </>
            )}
            {section === "nutrition" &&
              (macros ? (
                <MacroGrid macros={macros} />
              ) : (
                <Card>
                  <Text style={styles.notes}>
                    No nutrition information yet.
                  </Text>
                </Card>
              ))}
            {section === "notes" && (
              <>
                <SectionTitle>Notes</SectionTitle>
                <Card>
                  <Text style={styles.notes}>
                    {recipe.notes || "No notes yet."}
                  </Text>
                </Card>
              </>
            )}
            <Pressable
              onPress={() => setSection("instructions")}
              style={({ pressed }) => [
                styles.cookButton,
                pressed && { opacity: 0.9 },
              ]}
            >
              <CookingPot size={20} color={colors.onPrimary} />
              <Text style={styles.cookButtonText}>Start Cooking</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        pressed && { opacity: 0.75, transform: [{ scale: 0.97 }] },
      ]}
    >
      {icon}
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
    // Floats over the photo — dark scrim with light icon in both themes.
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
    heroActions: {
      position: "absolute",
      right: 16,
      zIndex: 10,
      flexDirection: "row",
      gap: 10,
    },
    heroButton: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: "rgba(11,16,14,0.58)",
      alignItems: "center",
      justifyContent: "center",
    },
    hero: {
      height: 430,
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
    // Tags sit over the photo, so they keep a dark scrim in both themes.
    tag: {
      borderWidth: 1,
      borderColor: "rgba(243,237,226,0.3)",
      borderRadius: radius.full,
      paddingHorizontal: 10,
      paddingVertical: 3,
      backgroundColor: "rgba(17,12,9,0.45)",
    },
    tagText: {
      color: "#E8DFD2",
      fontFamily: font.medium,
      fontSize: 11,
    },
    title: {
      color: colors.text,
      fontFamily: font.displayLight,
      fontSize: 38,
      lineHeight: 43,
    },
    description: {
      color: colors.textSecondary,
      fontFamily: font.regular,
      fontSize: 16,
      lineHeight: 23,
    },
    heroMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    heroMetaText: {
      color: colors.textSecondary,
      fontFamily: font.medium,
      fontSize: 14,
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
      paddingVertical: 14,
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
    tabs: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabActive: { borderBottomColor: colors.primary },
    tabText: { color: colors.muted, fontFamily: font.medium, fontSize: 12 },
    tabTextActive: { color: colors.primary, fontFamily: font.semibold },
    cookButton: {
      minHeight: 58,
      borderRadius: radius.lg,
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginTop: 8,
    },
    cookButtonText: {
      color: colors.onPrimary,
      fontFamily: font.bold,
      fontSize: 16,
    },
  });
