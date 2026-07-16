import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Loader2, Pencil, Trash2 } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { PlaceholderPage } from "@/components/PlaceholderPage";
import { RecipeImage } from "@/components/recipe/RecipeImage";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useDeleteRecipe,
  useDuplicateRecipe,
  useRecipe,
} from "@/hooks/recipes";
import { fmt, per100g } from "@/lib/recipes/macros";
import { fadeUp, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipe, isLoading } = useRecipe(id);

  const duplicate = useDuplicateRecipe();
  const remove = useDeleteRecipe();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) {
    return (
      <Page>
        <div className="grid min-h-[60svh] place-items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  if (!recipe) {
    return (
      <Page>
        <PlaceholderPage
          eyebrow="404"
          title="Recipe not found."
          body="It may have been deleted, or the link is wrong."
          phase="Not found"
        />
      </Page>
    );
  }

  const p100 = per100g(recipe);

  return (
    <Page>
      {/* Hero */}
      <section className="relative h-[56svh] min-h-[380px] w-full overflow-hidden">
        <RecipeImage
          src={recipe.imageUrl}
          alt={recipe.title}
          seed={recipe.id}
          width={1600}
          className="scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10" />

        <div className="container relative flex h-full flex-col justify-end pb-10">
          <Link
            to="/recipes"
            className="absolute left-6 top-24 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-4 py-2 text-sm text-foreground backdrop-blur transition-colors hover:bg-card md:left-8"
          >
            <ArrowLeft className="size-4" /> All recipes
          </Link>

          <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="mb-4 flex flex-wrap gap-2">
              <Badge variant="primary">{recipe.category}</Badge>
              {recipe.tags.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="max-w-3xl font-display text-[clamp(2.2rem,6vw,4.5rem)] font-light leading-[1] tracking-tight"
            >
              {recipe.title}
            </motion.h1>
            {recipe.description && (
              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-xl text-muted-foreground"
              >
                {recipe.description}
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Action bar */}
      <div className="sticky top-20 z-30 border-y border-border/50 bg-background/80 backdrop-blur">
        <div className="container flex items-center gap-4 py-3">
          <Link
            to="/recipes"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border text-sm text-muted-foreground transition-colors hover:text-foreground size-10 justify-center sm:size-auto sm:px-4 sm:py-2"
            aria-label="Back to all recipes"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">All recipes</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() =>
                duplicate.mutate(recipe.id, {
                  onSuccess: (r) => navigate(`/recipes/${r.id}`),
                })
              }
              className="hidden size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground sm:grid"
              aria-label="Duplicate recipe"
            >
              <Copy className="size-4" />
            </button>
            <Link
              to={`/recipes/${recipe.id}/edit`}
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
            >
              <Pencil className="size-4" /> Edit
            </Link>
            <button
              onClick={() => setConfirmOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
              aria-label="Delete recipe"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="container grid gap-10 py-14 lg:grid-cols-[1fr_400px]">
        <div className="grid gap-12">
          {/* Ingredients */}
          <div>
            <h2 className="mb-6 font-display text-2xl">Ingredients</h2>
            <ul className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2">
              {recipe.ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-baseline justify-between gap-4 bg-background px-5 py-3.5"
                >
                  <span>{ing.name}</span>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {ing.quantity != null ? ing.quantity : ""}{" "}
                    {ing.unit !== "to taste" || ing.quantity == null
                      ? ing.unit
                      : ""}
                  </span>
                </li>
              ))}
              {recipe.ingredients.length === 0 && (
                <li className="bg-background px-5 py-4 text-sm text-muted-foreground">
                  No ingredients yet.
                </li>
              )}
            </ul>
          </div>

          {/* Method */}
          <div>
            <h2 className="mb-6 font-display text-2xl">Method</h2>
            <ol className="grid gap-5">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-primary">
                    {i + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-foreground/90">
                    {step}
                  </p>
                </li>
              ))}
              {recipe.instructions.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No method added yet.
                </li>
              )}
            </ol>
          </div>

          {recipe.notes && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <h3 className="mb-2 font-display text-lg">Notes</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {recipe.notes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="grid h-fit gap-6 lg:sticky lg:top-36">
          <div className="rounded-3xl border border-border/60 bg-card/30 p-6">
            <h3 className="mb-4 font-display text-lg">Nutrition</h3>
            {p100 ? (
              <MacroRow label="Per 100g" set={p100} />
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  No <span className="text-foreground">macros</span> added yet.
                </p>
                <Link
                  to={`/recipes/${recipe.id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "mt-4",
                  )}
                >
                  Add macros
                </Link>
              </div>
            )}
          </div>
        </aside>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this recipe?"
        description={`"${recipe.title}" will be permanently removed.`}
        confirmLabel="Delete"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          remove.mutate(recipe.id, { onSuccess: () => navigate("/recipes") })
        }
      />
    </Page>
  );
}

function MacroRow({
  label,
  set,
}: {
  label: string;
  set: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null } | null;
}) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      {set ? (
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat value={fmt(set.calories)} unit="kcal" />
          <Stat value={fmt(set.protein, 1)} unit="P" />
          <Stat value={fmt(set.carbs, 1)} unit="C" />
          <Stat value={fmt(set.fat, 1)} unit="F" />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No macros added yet.</p>
      )}
    </div>
  );
}

function Stat({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-background/50 py-2">
      <div className="font-display text-lg tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {unit}
      </div>
    </div>
  );
}
