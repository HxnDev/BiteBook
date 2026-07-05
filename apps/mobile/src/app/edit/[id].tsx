import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert } from "react-native";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { Loading } from "@/components/ui";
import { useRecipe, useUpdateRecipe } from "@/hooks/use-recipes";

export default function EditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading } = useRecipe(id);
  const update = useUpdateRecipe();

  if (isLoading || !recipe) return <Loading />;

  return (
    <RecipeForm
      recipe={recipe}
      busy={update.isPending}
      submitLabel="Save changes"
      onSubmit={(input) =>
        update.mutate(
          { id: recipe.id, input },
          {
            onSuccess: () => router.back(),
            onError: (err) =>
              Alert.alert("Couldn't save", err.message ?? "Please try again."),
          },
        )
      }
    />
  );
}
