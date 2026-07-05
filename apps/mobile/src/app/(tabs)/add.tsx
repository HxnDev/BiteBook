import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { RecipeForm } from "@/components/recipe/recipe-form";
import { useCreateRecipe } from "@/hooks/use-recipes";

export default function AddScreen() {
  const router = useRouter();
  const create = useCreateRecipe();
  // Bumped after a successful save to remount the form blank.
  const [formKey, setFormKey] = useState(0);

  return (
    <RecipeForm
      key={formKey}
      busy={create.isPending}
      submitLabel="Save recipe"
      onSubmit={(input) =>
        create.mutate(input, {
          onSuccess: (r) => {
            setFormKey((k) => k + 1);
            router.push({ pathname: "/recipe/[id]", params: { id: r.id } });
          },
          onError: (err) =>
            Alert.alert("Couldn't save", err.message ?? "Please try again."),
        })
      }
    />
  );
}
