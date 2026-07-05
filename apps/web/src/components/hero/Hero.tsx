import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChefHat } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Magnetic } from "@/components/Magnetic";
import { cn } from "@/lib/utils";
import { stagger, lineReveal, fadeUp } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const HeroCanvas = lazy(() => import("./HeroCanvas"));

const TITLE_LINES = ["Every recipe", "you cook,", "beautifully kept."];

export function Hero() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Animated backdrop */}
      <div className="absolute inset-0 -z-10">
        {reduced ? (
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_10%,#b94428_0%,#1a1310_45%,#0e0a08_100%)]" />
        ) : (
          <Suspense
            fallback={
              <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_70%_10%,#b94428_0%,#1a1310_45%,#0e0a08_100%)]" />
            }
          >
            <HeroCanvas />
          </Suspense>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-40" />
      </div>

      <div className="container relative">
        <motion.div
          variants={stagger(0.12, 0.1)}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <ChefHat className="size-3.5 text-primary" />
              Your personal recipe book
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(2.6rem,8vw,6.2rem)] font-light leading-[0.98] tracking-tight">
            {TITLE_LINES.map((line, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  variants={lineReveal}
                  className={
                    i === TITLE_LINES.length - 1
                      ? "block text-gradient"
                      : "block"
                  }
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground"
          >
            BiteBook turns your scattered notes into a living cookbook — photos,
            ingredients and macros per 100g, all in one place you'll actually
            cook from.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
            <Magnetic>
              <Link
                to="/recipes"
                className={cn(buttonVariants({ size: "lg" }), "group")}
              >
                Open the book
                <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                to="/recipes/new"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Add a recipe
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
