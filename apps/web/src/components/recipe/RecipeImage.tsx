import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-ember-700/50 to-espresso-950",
  "from-amber-600/40 to-espresso-950",
  "from-ember-500/40 to-espresso-950",
  "from-orange-700/40 to-espresso-950",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

export function RecipeImage({
  src,
  alt,
  seed,
  className,
}: {
  src: string | null;
  alt: string;
  seed: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        gradientFor(seed),
        className,
      )}
    >
      <UtensilsCrossed className="size-1/4 max-h-16 max-w-16 text-foreground/15" />
    </div>
  );
}
