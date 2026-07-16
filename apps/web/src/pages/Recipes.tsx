import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  Plus,
  Search,
  LayoutGrid,
  CalendarDays,
  CheckSquare,
  Trash2,
  X,
} from "lucide-react";
import { Page } from "@/components/layout/Page";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useDeleteRecipes, useRecipes } from "@/hooks/recipes";
import { per100g } from "@/lib/recipes/macros";
import { CATEGORIES } from "@/lib/recipes/types";
import type { Category, Recipe } from "@/lib/recipes/types";
import { stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Sort = "newest" | "oldest" | "protein" | "calories" | "az";

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "protein", label: "Highest protein" },
  { value: "calories", label: "Lowest calories" },
  { value: "az", label: "A–Z" },
];

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function Recipes() {
  const { data: recipes, isLoading } = useRecipes();
  const deleteRecipes = useDeleteRecipes();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<Sort>("newest");
  const [byMonth, setByMonth] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);

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

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt < b.createdAt ? -1 : 1;
        case "az":
          return a.title.localeCompare(b.title);
        case "protein":
          return (per100g(b)?.protein ?? -1) - (per100g(a)?.protein ?? -1);
        case "calories":
          return (per100g(a)?.calories ?? Infinity) - (per100g(b)?.calories ?? Infinity);
        default:
          return a.createdAt < b.createdAt ? 1 : -1;
      }
    });
    return sorted;
  }, [recipes, query, category, sort]);

  const grouped = useMemo(() => {
    if (!byMonth) return null;
    const map = new Map<string, Recipe[]>();
    for (const r of filtered) {
      const key = monthLabel(r.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries());
  }, [filtered, byMonth]);

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

  const allVisibleSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        for (const r of filtered) next.delete(r.id);
        return next;
      }
      const next = new Set(prev);
      for (const r of filtered) next.add(r.id);
      return next;
    });
  }

  async function confirmDelete() {
    await deleteRecipes.mutateAsync(Array.from(selected));
    setConfirmOpen(false);
    exitSelectMode();
  }

  // Leaving select mode (or no recipes) clears any stale selection.
  useEffect(() => {
    if (!selectMode && selected.size > 0) setSelected(new Set());
  }, [selectMode, selected.size]);

  return (
    <Page>
      <div className="container py-28 md:py-32">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary">
            The book
          </p>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-light leading-none">
            Your recipes
          </h1>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes, tags, ingredients…"
              className="pl-11"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-44"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
            <button
              onClick={() => setByMonth((v) => !v)}
              className={cn(
                "grid size-11 place-items-center rounded-xl border transition-colors",
                byMonth
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              aria-label="Toggle month grouping"
              title={byMonth ? "Grid view" : "Group by month"}
            >
              {byMonth ? (
                <LayoutGrid className="size-4" />
              ) : (
                <CalendarDays className="size-4" />
              )}
            </button>
            <button
              onClick={() =>
                selectMode ? exitSelectMode() : setSelectMode(true)
              }
              className={cn(
                "grid size-11 place-items-center rounded-xl border transition-colors",
                selectMode
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              aria-label="Select recipes"
              title={selectMode ? "Done selecting" : "Select to delete"}
            >
              {selectMode ? (
                <X className="size-4" />
              ) : (
                <CheckSquare className="size-4" />
              )}
            </button>
          </div>
        </div>

        {selectMode && filtered.length > 0 && (
          <div className="mb-6 flex items-center gap-3 text-sm text-muted-foreground">
            <button
              onClick={toggleSelectAll}
              className="rounded-full border border-border px-4 py-1.5 transition-colors hover:text-foreground"
            >
              {allVisibleSelected ? "Clear all" : "Select all"}
            </button>
            <span>
              {selected.size} selected — tap cards to choose, then delete below.
            </span>
          </div>
        )}

        {/* Category chips */}
        <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1">
          <Chip
            label="All"
            active={category === "All"}
            onClick={() => setCategory("All")}
          />
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid min-h-[40svh] place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasRecipes={(recipes?.length ?? 0) > 0} />
        ) : grouped ? (
          <div className="grid gap-12">
            {grouped.map(([month, items]) => (
              <div key={month}>
                <h2 className="mb-5 text-sm uppercase tracking-[0.2em] text-muted-foreground">
                  {month}
                </h2>
                <Grid
                  recipes={items}
                  selectable={selectMode}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                />
              </div>
            ))}
          </div>
        ) : (
          <Grid
            recipes={filtered}
            selectable={selectMode}
            selected={selected}
            onToggleSelect={toggleSelect}
          />
        )}
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectMode && selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4"
          >
            <div className="flex items-center gap-4 rounded-full border border-border/70 bg-card/95 py-2 pl-5 pr-2 shadow-2xl shadow-black/30 backdrop-blur">
              <span className="text-sm">
                <span className="font-semibold text-primary">
                  {selected.size}
                </span>{" "}
                selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={exitSelectMode}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                className="gap-2"
                onClick={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${selected.size} recipe${selected.size === 1 ? "" : "s"}?`}
        description="This permanently removes the selected recipes. This can't be undone."
        confirmLabel={deleteRecipes.isPending ? "Deleting…" : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </Page>
  );
}

function Grid({
  recipes,
  selectable,
  selected,
  onToggleSelect,
}: {
  recipes: Recipe[];
  selectable: boolean;
  selected: Set<string>;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <motion.div
      variants={stagger(0.06)}
      initial="hidden"
      animate="show"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {recipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          selectable={selectable}
          selected={selected.has(r.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </motion.div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
        active
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasRecipes }: { hasRecipes: boolean }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/20 py-24 text-center">
      <p className="font-display text-2xl">
        {hasRecipes ? "Nothing matches that." : "Your book is empty."}
      </p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasRecipes
          ? "Try a different search or filter."
          : "Add your first recipe to get started."}
      </p>
      {!hasRecipes && (
        <Link
          to="/recipes/new"
          className={cn(buttonVariants({ size: "md" }), "mt-6 gap-2")}
        >
          <Plus className="size-4" /> Add a recipe
        </Link>
      )}
    </div>
  );
}
