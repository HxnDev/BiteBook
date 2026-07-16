import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Beef,
  Tags,
  Loader2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Hero } from "@/components/hero/Hero";
import { Reveal } from "@/components/Reveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { RecipeCard } from "@/components/recipe/RecipeCard";
import { buttonVariants } from "@/components/ui/button";
import { useRecipes } from "@/hooks/recipes";
import { per100g } from "@/lib/recipes/macros";
import { stagger, fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

export default function Home() {
  const { data: recipes, isLoading } = useRecipes();

  const stats = useMemo(() => {
    const list = recipes ?? [];
    const highProtein = list.filter(
      (r) => (per100g(r)?.protein ?? 0) >= 15,
    ).length;
    const categories = new Set(list.map((r) => r.category)).size;
    return { total: list.length, highProtein, categories };
  }, [recipes]);

  const recent = (recipes ?? []).slice(0, 6);

  const cards = [
    { icon: BookOpen, label: "Recipes", value: stats.total },
    { icon: Beef, label: "High protein", value: stats.highProtein },
    { icon: Tags, label: "Categories", value: stats.categories },
  ];

  return (
    <Page>
      <Hero />

      <section className="container py-24 md:py-28">
        {isLoading ? (
          <div className="grid min-h-[30svh] place-items-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* At a glance */}
            <Reveal>
              <p className="mb-3 text-xs uppercase tracking-[0.3em] text-primary">
                At a glance
              </p>
              <h2 className="font-display text-[clamp(1.8rem,4.5vw,3rem)] font-light leading-tight">
                Your kitchen, in numbers.
              </h2>
            </Reveal>

            <motion.div
              variants={stagger(0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-10 grid gap-4 sm:grid-cols-3"
            >
              {cards.map((c) => (
                <motion.div
                  key={c.label}
                  variants={fadeUp}
                  className="rounded-2xl border border-border/60 bg-card/40 p-6"
                >
                  <c.icon className="mb-6 size-5 text-primary" />
                  <div className="font-display text-5xl font-light tabular-nums">
                    <AnimatedCounter value={c.value} />
                  </div>
                  <p className="mt-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                    {c.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Recently added */}
            <div className="mt-20">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl">Recently added</h2>
                {recent.length > 0 && (
                  <Link
                    to="/recipes"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    View all <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>

              {recent.length > 0 ? (
                <motion.div
                  variants={stagger(0.06)}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {recent.map((r) => (
                    <RecipeCard key={r.id} recipe={r} />
                  ))}
                </motion.div>
              ) : (
                <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/20 py-20 text-center">
                  <p className="font-display text-2xl">Your book is empty.</p>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    Add your first recipe to get started.
                  </p>
                  <Link
                    to="/recipes/new"
                    className={cn(buttonVariants({ size: "md" }), "mt-6 gap-2")}
                  >
                    <Plus className="size-4" /> Add a recipe
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </Page>
  );
}
