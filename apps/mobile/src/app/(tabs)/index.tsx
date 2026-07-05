import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  ArrowRight,
  Beef,
  BookOpen,
  Flame,
  Heart,
  Plus,
} from "lucide-react-native";
import { useMemo, type ComponentType } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RecipeCard } from "@/components/recipe/recipe-card";
import {
  Card,
  EmptyState,
  Eyebrow,
  SectionTitle,
  Skeleton,
} from "@/components/ui";
import { useRecipes } from "@/hooks/use-recipes";
import { per100g } from "@/lib/recipes/macros";
import { colors, font } from "@/lib/theme";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: recipes, isLoading, refetch, isRefetching } = useRecipes();

  const stats = useMemo(() => {
    const list = recipes ?? [];
    return {
      total: list.length,
      highProtein: list.filter((r) => (per100g(r)?.protein ?? 0) >= 15).length,
      favorites: list.filter((r) => r.isFavorite).length,
      cooked: list.reduce((sum, r) => sum + r.timesCooked, 0),
    };
  }, [recipes]);

  const recent = (recipes ?? []).slice(0, 4);

  const statCards: {
    icon: ComponentType<{ size: number; color: string }>;
    label: string;
    value: number;
  }[] = [
    { icon: BookOpen, label: "Recipes", value: stats.total },
    { icon: Beef, label: "High protein", value: stats.highProtein },
    { icon: Heart, label: "Favourites", value: stats.favorites },
    { icon: Flame, label: "Times cooked", value: stats.cooked },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.card}
        />
      }
    >
      {/* Hero header */}
      <LinearGradient
        colors={[colors.cardElevated, colors.background]}
        style={[styles.hero, { paddingTop: insets.top + 24 }]}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Eyebrow>The family recipe book</Eyebrow>
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.duration(500).delay(80)}
          style={styles.heroTitle}
        >
          {greeting()}.
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.duration(500).delay(160)}
          style={styles.heroSub}
        >
          Every dish the family loves — in one place, with macros per 100g.
        </Animated.Text>
      </LinearGradient>

      <View style={styles.content}>
        {isLoading ? (
          <>
            <View style={styles.statsGrid}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={110} style={styles.statCard} />
              ))}
            </View>
            <Skeleton height={190} style={{ marginTop: 14 }} />
          </>
        ) : (
          <>
            {/* At a glance */}
            <View style={styles.statsGrid}>
              {statCards.map((c, i) => (
                <Animated.View
                  key={c.label}
                  entering={FadeInDown.duration(450).delay(i * 70)}
                  style={styles.statCard}
                >
                  <Card style={styles.statCardInner}>
                    <c.icon size={18} color={colors.primary} />
                    <Text style={styles.statValue}>{c.value}</Text>
                    <Text style={styles.statLabel}>{c.label}</Text>
                  </Card>
                </Animated.View>
              ))}
            </View>

            {/* Recently added */}
            <View style={styles.sectionHead}>
              <SectionTitle>Recently added</SectionTitle>
              {recent.length > 0 && (
                <Link href="/recipes" style={styles.viewAll}>
                  <View style={styles.viewAllInner}>
                    <Text style={styles.viewAllText}>View all</Text>
                    <ArrowRight size={14} color={colors.muted} />
                  </View>
                </Link>
              )}
            </View>

            {recent.length > 0 ? (
              <View style={{ gap: 14 }}>
                {recent.map((r, i) => (
                  <Animated.View
                    key={r.id}
                    entering={FadeInDown.duration(450).delay(200 + i * 80)}
                  >
                    <RecipeCard recipe={r} />
                  </Animated.View>
                ))}
              </View>
            ) : (
              <EmptyState
                icon={<Plus size={30} color={colors.primary} />}
                title="Your book is empty."
                text="Add your first recipe from the Add tab to get started."
              />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  heroTitle: {
    color: colors.text,
    fontFamily: font.displayLight,
    fontSize: 40,
    lineHeight: 44,
  },
  heroSub: {
    color: colors.textSecondary,
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 300,
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  statCardInner: {
    gap: 8,
  },
  statValue: {
    color: colors.text,
    fontFamily: font.displayLight,
    fontSize: 34,
    lineHeight: 38,
  },
  statLabel: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },
  viewAll: {
    padding: 4,
  },
  viewAllInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  viewAllText: {
    color: colors.muted,
    fontFamily: font.semibold,
    fontSize: 13,
  },
});
