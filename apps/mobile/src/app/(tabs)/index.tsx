import { useRouter } from "expo-router";
import {
  Beef,
  BookOpen,
  CheckSquare,
  ChevronDown,
  CookingPot,
  Grid2X2,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { Button, Chip, EmptyState, Skeleton } from "@/components/ui";
import {
  useDeleteRecipes,
  useRecipes,
  useUpdateRecipe,
} from "@/hooks/use-recipes";
import { per100g } from "@/lib/recipes/macros";
import { CATEGORIES, type Category, type Recipe } from "@/lib/recipes/types";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

type Sort = "newest" | "oldest" | "protein" | "calories" | "az";
type Layout = "grid" | "list";

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "protein", label: "Protein" },
  { value: "calories", label: "Calories" },
  { value: "az", label: "A–Z" },
];

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const {
    data: recipes,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRecipes();
  const deleteRecipes = useDeleteRecipes();
  const updateRecipe = useUpdateRecipe();
  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [layout, setLayout] = useState<Layout>("grid");
  const [showSorts, setShowSorts] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const stats = useMemo(() => {
    const list = recipes ?? [];
    return {
      total: list.length,
      highProtein: list.filter((r) => (per100g(r)?.protein ?? 0) >= 15).length,
    };
  }, [recipes]);

  const filtered = useMemo(() => {
    let list = recipes ?? [];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
      );
    if (category !== "All") list = list.filter((r) => r.category === category);
    return [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt < b.createdAt ? -1 : 1;
        case "az":
          return a.title.localeCompare(b.title);
        case "protein":
          return (per100g(b)?.protein ?? -1) - (per100g(a)?.protein ?? -1);
        case "calories":
          return (
            (per100g(a)?.calories ?? Infinity) -
            (per100g(b)?.calories ?? Infinity)
          );
        default:
          return a.createdAt < b.createdAt ? 1 : -1;
      }
    });
  }, [recipes, query, category, sort]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }
  function toggleFavorite(recipe: Recipe) {
    updateRecipe.mutate({
      id: recipe.id,
      input: { ...recipe, isFavorite: !recipe.isFavorite },
    });
  }
  function confirmDelete() {
    const n = selected.size;
    Alert.alert(
      `Delete ${n} recipe${n === 1 ? "" : "s"}?`,
      "This permanently removes the selected recipes. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteRecipes.mutate(Array.from(selected), {
              onSuccess: exitSelectMode,
            }),
        },
      ],
    );
  }

  const sortLabel =
    SORTS.find((item) => item.value === sort)?.label ?? "Newest";
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 14 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Bite<Text style={styles.titleAccent}>Book</Text>
          </Text>
          <Text style={styles.subtitle}>Good food. A better you.</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => searchRef.current?.focus()}
            style={styles.roundButton}
          >
            <Search size={23} color={colors.muted} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/add")}
            style={[styles.roundButton, styles.addButton]}
          >
            <Plus size={27} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>
      {!isLoading && (
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <BookOpen size={18} color={colors.primary} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>recipes</Text>
          </View>
          <View style={styles.statPill}>
            <Beef size={18} color={colors.primary} />
            <Text style={styles.statValue}>{stats.highProtein}</Text>
            <Text style={styles.statLabel}>high protein</Text>
          </View>
        </View>
      )}
      <View style={styles.searchBox}>
        <Search size={21} color={colors.muted} />
        <TextInput
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          placeholder="Search recipes, tags, ingredients…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <X size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Chip
          label="All"
          active={category === "All"}
          onPress={() => setCategory("All")}
        />
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
        <Pressable
          onPress={() => setShowSorts((value) => !value)}
          style={[styles.filterButton, showSorts && styles.activeControl]}
        >
          <SlidersHorizontal
            size={18}
            color={showSorts ? colors.primary : colors.muted}
          />
        </Pressable>
      </ScrollView>
      {showSorts && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.sortStrip}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {SORTS.map((s) => (
              <Chip
                key={s.value}
                label={s.label}
                active={sort === s.value}
                onPress={() => setSort(s.value)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      )}
      <View style={styles.libraryBar}>
        <Pressable
          onPress={() => setShowSorts((value) => !value)}
          style={styles.sortButton}
        >
          <Text style={styles.sortText}>{sortLabel}</Text>
          <ChevronDown size={16} color={colors.muted} />
        </Pressable>
        <View style={styles.layoutToggle}>
          <Pressable
            onPress={() => setLayout("grid")}
            style={[
              styles.layoutButton,
              layout === "grid" && styles.layoutButtonActive,
            ]}
          >
            <Grid2X2
              size={19}
              color={layout === "grid" ? colors.primary : colors.muted}
            />
          </Pressable>
          <Pressable
            onPress={() => setLayout("list")}
            style={[
              styles.layoutButton,
              layout === "list" && styles.layoutButtonActive,
            ]}
          >
            <List
              size={21}
              color={layout === "list" ? colors.primary : colors.muted}
            />
          </Pressable>
          <Pressable
            onPress={() =>
              selectMode ? exitSelectMode() : setSelectMode(true)
            }
            style={[
              styles.layoutButton,
              selectMode && styles.layoutButtonActive,
            ]}
          >
            {selectMode ? (
              <X size={19} color={colors.primary} />
            ) : (
              <CheckSquare size={19} color={colors.muted} />
            )}
          </Pressable>
        </View>
      </View>
      {isLoading ? (
        <View style={styles.loadingGrid}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.loadingCell}>
              <Skeleton />
            </View>
          ))}
        </View>
      ) : error && !recipes ? (
        <View style={styles.errorWrap}>
          <EmptyState
            icon={<CookingPot size={30} color={colors.destructive} />}
            title="Couldn't load recipes"
            text={error.message}
          />
          <Button label="Try again" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          key={layout}
          data={filtered}
          numColumns={layout === "grid" ? 2 : 1}
          columnWrapperStyle={layout === "grid" ? styles.columns : undefined}
          keyExtractor={(r: Recipe) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={8}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.card}
            />
          }
          renderItem={({ item, index }) => (
            <Animated.View
              entering={FadeInDown.duration(350).delay(Math.min(index, 6) * 45)}
              style={layout === "grid" ? styles.gridItem : styles.listItem}
            >
              <RecipeCard
                recipe={item}
                layout={layout}
                selectable={selectMode}
                selected={selected.has(item.id)}
                onToggleSelect={toggleSelect}
                onToggleFavorite={toggleFavorite}
              />
            </Animated.View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<CookingPot size={30} color={colors.primary} />}
              title={
                (recipes?.length ?? 0) > 0
                  ? "Nothing matches that."
                  : "Your book is empty."
              }
              text={
                (recipes?.length ?? 0) > 0
                  ? "Try a different search or filter."
                  : "Tap + to add your first recipe."
              }
            />
          }
        />
      )}
      {selectMode && selected.size > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[styles.bulkBar, { bottom: insets.bottom + 12 }]}
        >
          <Text style={styles.bulkText}>
            <Text style={{ color: colors.primary, fontFamily: font.bold }}>
              {selected.size}
            </Text>{" "}
            selected
          </Text>
          <Button
            label="Delete"
            variant="destructive"
            loading={deleteRecipes.isPending}
            onPress={confirmDelete}
            icon={<Trash2 size={16} color={colors.destructive} />}
            style={{ paddingVertical: 10 }}
          />
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 18,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: {
      color: colors.text,
      fontFamily: font.displaySemibold,
      fontSize: 34,
      lineHeight: 38,
    },
    titleAccent: { color: colors.primary },
    subtitle: {
      color: colors.muted,
      fontFamily: font.regular,
      fontSize: 14,
      marginTop: 2,
    },
    headerActions: { flexDirection: "row", gap: 10 },
    roundButton: {
      width: 48,
      height: 48,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    addButton: { backgroundColor: colors.primary, borderColor: colors.primary },
    statsRow: { flexDirection: "row", gap: 9, marginBottom: 16 },
    statPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      borderRadius: radius.full,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    statValue: { color: colors.text, fontFamily: font.bold, fontSize: 14 },
    statLabel: { color: colors.muted, fontFamily: font.medium, fontSize: 13 },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      backgroundColor: colors.input,
      borderRadius: radius.xl,
      paddingHorizontal: 16,
      marginBottom: 14,
      minHeight: 54,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontFamily: font.regular,
      fontSize: 15,
      paddingVertical: 14,
    },
    chipRow: { gap: 8, paddingBottom: 10, alignItems: "center" },
    filterButton: {
      width: 42,
      height: 42,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
    },
    activeControl: {
      borderColor: colors.primaryBorder,
      backgroundColor: colors.primarySoft,
    },
    sortStrip: { marginTop: -2 },
    libraryBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
    },
    sortText: {
      color: colors.textSecondary,
      fontFamily: font.semibold,
      fontSize: 14,
    },
    layoutToggle: {
      flexDirection: "row",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      overflow: "hidden",
    },
    layoutButton: {
      width: 40,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    layoutButtonActive: { backgroundColor: colors.primarySoft },
    list: { paddingBottom: 28, flexGrow: 1 },
    columns: { gap: 12 },
    gridItem: { flex: 1, maxWidth: "50%", marginBottom: 12 },
    listItem: { marginBottom: 12 },
    loadingGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    loadingCell: { width: "47%" },
    errorWrap: { gap: 14, paddingTop: 8 },
    bulkBar: {
      position: "absolute",
      left: 20,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: radius.xl,
      paddingVertical: 8,
      paddingLeft: 18,
      paddingRight: 8,
    },
    bulkText: { color: colors.text, fontFamily: font.medium, fontSize: 14 },
  });
