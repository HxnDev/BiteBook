import { useRouter } from "expo-router";
import {
  Beef,
  BookOpen,
  CheckSquare,
  CookingPot,
  Plus,
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
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipeCard } from "@/components/recipe/recipe-card";
import { Button, Chip, EmptyState, Skeleton } from "@/components/ui";
import { useDeleteRecipes, useRecipes } from "@/hooks/use-recipes";
import { per100g } from "@/lib/recipes/macros";
import { CATEGORIES, type Category, type Recipe } from "@/lib/recipes/types";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

type Sort = "newest" | "oldest" | "protein" | "calories" | "az";

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

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");
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

      {/* At a glance */}
      {!isLoading && stats.total > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <BookOpen size={14} color={colors.primary} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>recipes</Text>
          </View>
          <View style={styles.statPill}>
            <Beef size={14} color={colors.primary} />
            <Text style={styles.statValue}>{stats.highProtein}</Text>
            <Text style={styles.statLabel}>high protein</Text>
          </View>
        </View>
      )}

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
      ) : error && !recipes ? (
        <View style={{ paddingTop: 4, gap: 14 }}>
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
          initialNumToRender={6}
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
                  : "Tap + to add your first recipe."
              }
            />
          }
        />
      )}

      {/* Floating add button */}
      {!selectMode && (
        <Pressable
          onPress={() => router.push("/add")}
          style={({ pressed }) => [
            styles.fab,
            { bottom: insets.bottom + 20 },
            pressed && { transform: [{ scale: 0.94 }], opacity: 0.9 },
          ]}
        >
          <Plus size={26} color={colors.onPrimary} strokeWidth={2.5} />
        </Pressable>
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

const createStyles = (colors: Palette) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statValue: {
    color: colors.text,
    fontFamily: font.bold,
    fontSize: 13,
  },
  statLabel: {
    color: colors.muted,
    fontFamily: font.medium,
    fontSize: 13,
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
    paddingBottom: 96,
    flexGrow: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 58,
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
