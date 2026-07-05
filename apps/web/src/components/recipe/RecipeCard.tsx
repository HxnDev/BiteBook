import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Flame, Beef, Check } from "lucide-react";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { Badge } from "@/components/ui/badge";
import { fmt, per100g } from "@/lib/recipes/macros";
import { fadeUp } from "@/lib/motion";
import type { Recipe } from "@/lib/recipes/types";
import { cn } from "@/lib/utils";

export function RecipeCard({
  recipe,
  selectable = false,
  selected = false,
  onToggleSelect,
}: {
  recipe: Recipe;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}) {
  const p100 = per100g(recipe);

  const inner = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
          <RecipeImage src={recipe.imageUrl} alt={recipe.title} seed={recipe.id} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {recipe.isFavorite && !selectable && (
          <div className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-accent/90 text-accent-foreground">
            <Heart className="size-4 fill-current" />
          </div>
        )}
        {selectable && (
          <div
            className={cn(
              "absolute right-3 top-3 grid size-8 place-items-center rounded-full border-2 transition-all",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-white/70 bg-black/30 text-transparent backdrop-blur",
            )}
          >
            <Check className="size-4" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <Badge variant="primary" className="backdrop-blur">
            {recipe.category}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-xl leading-tight transition-colors group-hover:text-primary">
          {recipe.title}
        </h3>

        {p100 ? (
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Flame className="size-3.5 text-primary" />
              {fmt(p100.calories)} <span className="text-xs">kcal/100g</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Beef className="size-3.5 text-primary" />
              {fmt(p100.protein, 1)}
              <span className="text-xs">g P</span>
            </span>
          </div>
        ) : (
          <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">
            {recipe.description || "No macros yet"}
          </p>
        )}
      </div>
    </>
  );

  const shell =
    "group block overflow-hidden rounded-2xl border bg-card/30 transition-all duration-500";

  if (selectable) {
    return (
      <motion.div variants={fadeUp}>
        <button
          type="button"
          onClick={() => onToggleSelect?.(recipe.id)}
          className={cn(
            shell,
            "w-full text-left",
            selected
              ? "border-primary/70 shadow-xl shadow-black/20"
              : "border-border/60 hover:border-primary/40",
          )}
        >
          {inner}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/recipes/${recipe.id}`}
        className={cn(
          shell,
          "border-border/60 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-black/20",
        )}
      >
        {inner}
      </Link>
    </motion.div>
  );
}
