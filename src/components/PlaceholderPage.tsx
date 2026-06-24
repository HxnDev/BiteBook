import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { buttonVariants } from "@/components/ui/button";

export function PlaceholderPage({
  eyebrow,
  title,
  body,
  phase,
}: {
  eyebrow: string;
  title: string;
  body: string;
  phase: string;
}) {
  return (
    <div className="container flex min-h-[100svh] flex-col justify-center py-32">
      <Reveal>
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </p>
      </Reveal>
      <Reveal>
        <h1 className="max-w-3xl font-display text-[clamp(2.4rem,7vw,5rem)] font-light leading-[1] tracking-tight">
          {title}
        </h1>
      </Reveal>
      <Reveal>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">{body}</p>
      </Reveal>
      <Reveal className="mt-10">
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4" />
            Back home
          </Link>
          <span className="rounded-full border border-border/60 bg-card/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {phase}
          </span>
        </div>
      </Reveal>
    </div>
  );
}
