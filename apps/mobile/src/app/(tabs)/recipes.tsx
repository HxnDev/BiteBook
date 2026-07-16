import {
  CheckSquare,
  CookingPot,
  Search,
  Trash2,
  X,
} from "lucide-react-native";
import { useMemo, useState } from "react";
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
import { useDeleteRecipes, useRecipes } from "@/hooks/use-recipes";
import { per100g } from "@/lib/recipes/macros";
import { CATEGORIES, type Category, type Recipe } from "@/lib/recipes/types";
import { colors, font, radius } from "@/lib/theme";

type Sort = "newest" | "oldest" | "protein" | "calories" | "cooked" | "az";

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "protein", label: "Protein" },
  { value: "calories", label: "Calories" },
  { value: "cooked", label: "Most cooked" },
  { value: "az", label: "A–Z" },
];

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const {
    data: recipes,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useRecipes();
  const deleteRecipes = useDeleteRecipes();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = recipes ?? [];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          r.ingredients.some((i) => i.name.toLowerCase().includes(q)),
      );
    }
    if (category !== "All") list = list.filter((r) => r.category === category);

    return [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt < b.createdAt ? -1 : 1;
        case "az":
          return a.title.localeCompare(b.title);
        case "cooked":
          return b.timesCooked - a.timesCooked;
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

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your recipes</Text>
        <Pressable
          onPress={() => (selectMode ? exitSelectMode() : setSelectMode(true))}
          style={[styles.iconButton, selectMode && styles.iconButtonActive]}
        >
          {selectMode ? (
            <X size={18} color={colors.primary} />
          ) : (
            <CheckSquare size={18} color={colors.muted} />
          )}
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search recipes, tags, ingredients…"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <X size={16} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Category + sort chips */}
      <View>
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
        </ScrollView>
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
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ gap: 14, paddingTop: 4 }}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} />
          ))}
        </View>
      ) : error ? (
        <View style={{ paddingTop: 4 }}>
          <EmptyState
            icon={<CookingPot size={30} color={colors.destructive} />}
            title="Couldn't load recipes"
            text={error.message}
          />
          <Button label="Try again" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(r: Recipe) => r.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
              entering={FadeInDown.duration(400).delay(
                Math.min(index, 6) * 60,
              )}
            >
              <RecipeCard
                recipe={item}
                selectable={selectMode}
                selected={selected.has(item.id)}
                onToggleSelect={toggleSelect}
              />
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
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
                  : "Add your first recipe from the Add tab."
              }
            />
          }
        />
      )}

      {/* Bulk delete bar */}
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontFamily: font.displaySemibold,
    fontSize: 28,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonActive: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: font.regular,
    fontSize: 15,
    paddingVertical: 12,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 10,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 32,
    flexGrow: 1,
  },
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
  bulkText: {
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 14,
  },
});
