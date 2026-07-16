import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { useCreateRecipe } from "@/hooks/use-recipes";

export default function AddScreen() {
  const router = useRouter();
  const create = useCreateRecipe();

  return (
    <RecipeForm
      busy={create.isPending}
      submitLabel="Save recipe"
      onSubmit={(input) =>
        create.mutate(input, {
          onSuccess: (r) =>
            router.replace({ pathname: "/recipe/[id]", params: { id: r.id } }),
          onError: (err) =>
            Alert.alert("Couldn't save", err.message ?? "Please try again."),
        })
      }
    />
  );
}
