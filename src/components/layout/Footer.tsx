import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 bg-card/30">
      <div className="container flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between">
        <div>
          <Link to="/" className="font-display text-3xl tracking-tight">
            Bite<span className="text-primary">Book</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Your recipes, beautifully kept. Cooked, weighed and remembered.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link to="/recipes" className="transition-colors hover:text-foreground">
            Recipes
          </Link>
          <Link to="/recipes/new" className="transition-colors hover:text-foreground">
            Add a recipe
          </Link>
        </div>
      </div>
      <div className="container flex items-center justify-between border-t border-border/40 py-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} BiteBook</span>
        <span>recipes.hxndev.com</span>
      </div>
    </footer>
  );
}
