import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { RecipeForm } from "@/components/recipe/RecipeForm";
import { buttonVariants } from "@/components/ui/button";
import {
  useCreateRecipe,
  useRecipe,
  useUpdateRecipe,
} from "@/hooks/recipes";

export default function AddRecipe() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: recipe, isLoading } = useRecipe(id);
  const create = useCreateRecipe();
  const update = useUpdateRecipe();

  if (isEdit && isLoading) {
    return (
      <Page>
        <div className="grid min-h-[60svh] place-items-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  return (
    <Page className="bg-grain">
      <div className="container py-28 md:py-32">
        <Link
          to={isEdit && id ? `/recipes/${id}` : "/recipes"}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        <h1 className="mb-2 font-display text-[clamp(2rem,5vw,3.5rem)] font-light leading-tight">
          {isEdit ? "Edit recipe" : "New recipe"}
        </h1>
        <p className="mb-10 max-w-xl text-muted-foreground">
          {isEdit
            ? "Tweak the details — everything updates instantly."
            : "Capture it while it's hot. Only the title is required; fill in the rest whenever."}
        </p>

        <RecipeForm
          initial={recipe ?? undefined}
          submitting={create.isPending || update.isPending}
          onSubmit={(input) => {
            if (isEdit && id) {
              update.mutate(
                { id, input: { ...input, isFavorite: recipe?.isFavorite ?? false } },
                { onSuccess: (r) => navigate(`/recipes/${r.id}`) },
              );
            } else {
              create.mutate(input, {
                onSuccess: (r) => navigate(`/recipes/${r.id}`),
              });
            }
          }}
        />

        {!isEdit && (
          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/recipes" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Cancel
            </Link>
          </p>
        )}
      </div>
    </Page>
  );
}
