import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GripVertical, Plus, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/recipe/ImageUpload";
import { CATEGORIES, UNITS } from "@/lib/recipes/types";
import type { Recipe, RecipeInput } from "@/lib/recipes/types";

const numStr = z
  .string()
  .refine((v) => v.trim() === "" || !Number.isNaN(Number(v)), "Must be a number");

const schema = z.object({
  title: z.string().min(1, "Give it a name"),
  description: z.string(),
  category: z.enum(CATEGORIES),
  tagsText: z.string(),
  imageUrl: z.string().nullable(),
  ingredients: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      quantity: numStr,
      unit: z.enum(UNITS),
      notes: z.string(),
    }),
  ),
  instructions: z.array(z.object({ value: z.string() })),
  notes: z.string(),
  calories: numStr,
  protein: numStr,
  carbs: numStr,
  fat: numStr,
});

type FormValues = z.infer<typeof schema>;

const num = (s: string): number | null => {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isNaN(n) ? null : n;
};

function recipeToForm(r?: Recipe): FormValues {
  return {
    title: r?.title ?? "",
    description: r?.description ?? "",
    category: r?.category ?? "Desi",
    tagsText: r?.tags.join(", ") ?? "",
    imageUrl: r?.imageUrl ?? null,
    ingredients:
      r?.ingredients.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity?.toString() ?? "",
        unit: i.unit,
        notes: i.notes,
      })) ?? [
        { id: crypto.randomUUID(), name: "", quantity: "", unit: "g", notes: "" },
      ],
    instructions:
      r?.instructions.map((value) => ({ value })) ?? [{ value: "" }],
    notes: r?.notes ?? "",
    calories: r?.calories?.toString() ?? "",
    protein: r?.protein?.toString() ?? "",
    carbs: r?.carbs?.toString() ?? "",
    fat: r?.fat?.toString() ?? "",
  };
}

function formToInput(v: FormValues): RecipeInput {
  return {
    title: v.title.trim(),
    description: v.description.trim(),
    category: v.category,
    tags: v.tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    imageUrl: v.imageUrl,
    ingredients: v.ingredients
      .filter((i) => i.name.trim() !== "")
      .map((i) => ({
        id: i.id,
        name: i.name.trim(),
        quantity: num(i.quantity),
        unit: i.unit,
        notes: i.notes,
      })),
    instructions: v.instructions
      .map((s) => s.value.trim())
      .filter((s) => s !== ""),
    notes: v.notes.trim(),
    calories: num(v.calories),
    protein: num(v.protein),
    carbs: num(v.carbs),
    fat: num(v.fat),
    isFavorite: false,
  };
}

const sectionCls =
  "rounded-2xl border border-border/60 bg-card/30 p-6 md:p-8";

export function RecipeForm({
  initial,
  submitting,
  onSubmit,
}: {
  initial?: Recipe;
  submitting?: boolean;
  onSubmit: (input: RecipeInput) => void;
}) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: recipeToForm(initial),
  });

  const ingredients = useFieldArray({ control, name: "ingredients" });
  const steps = useFieldArray({ control, name: "instructions" });
  const imageUrl = watch("imageUrl");

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(formToInput(v)))}
      className="grid gap-6 lg:grid-cols-[1fr_340px]"
    >
      <div className="order-2 grid gap-6 lg:order-1">
        {/* Basics */}
        <section className={sectionCls}>
          <h2 className="mb-6 font-display text-xl">The basics</h2>
          <div className="grid gap-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Chicken Pulao"
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-accent">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" {...register("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="biryani, high protein"
                  {...register("tagsText")}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Short description</Label>
              <Textarea
                id="description"
                placeholder="A line about this dish…"
                className="min-h-[72px]"
                {...register("description")}
              />
            </div>
          </div>
        </section>

        {/* Ingredients */}
        <section className={sectionCls}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl">Ingredients</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                ingredients.append({
                  id: crypto.randomUUID(),
                  name: "",
                  quantity: "",
                  unit: "g",
                  notes: "",
                })
              }
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <div className="grid gap-3">
            {ingredients.fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
                <Input
                  placeholder="Ingredient"
                  className="flex-1"
                  {...register(`ingredients.${i}.name`)}
                />
                <Input
                  placeholder="Qty"
                  inputMode="decimal"
                  className="w-20"
                  {...register(`ingredients.${i}.quantity`)}
                />
                <Select className="w-28" {...register(`ingredients.${i}.unit`)}>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => ingredients.remove(i)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                  aria-label="Remove ingredient"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Method */}
        <section className={sectionCls}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl">Method</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => steps.append({ value: "" })}
            >
              <Plus className="size-4" /> Add step
            </Button>
          </div>
          <div className="grid gap-3">
            {steps.fields.map((field, i) => (
              <div key={field.id} className="flex items-start gap-3">
                <span className="mt-2.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm text-primary">
                  {i + 1}
                </span>
                <Textarea
                  placeholder={`Step ${i + 1}…`}
                  className="min-h-[60px] flex-1"
                  {...register(`instructions.${i}.value`)}
                />
                <button
                  type="button"
                  onClick={() => steps.remove(i)}
                  className="mt-1.5 grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                  aria-label="Remove step"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className={sectionCls}>
          <h2 className="mb-6 font-display text-xl">Notes</h2>
          <Textarea
            placeholder="Tips, substitutions, what to serve it with…"
            {...register("notes")}
          />
        </section>
      </div>

      {/* Sidebar */}
      <aside className="order-1 grid h-fit gap-6 lg:sticky lg:top-24 lg:order-2">
        <section className={sectionCls}>
          <Label>Photo</Label>
          <ImageUpload
            value={imageUrl}
            onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })}
          />
        </section>

        <section className={sectionCls}>
          <h2 className="mb-2 font-display text-xl">Macros (per 100g)</h2>
          <p className="mb-5 text-xs text-muted-foreground">
            Optional. Leave blank if you don't track them.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cal">Calories</Label>
              <Input id="cal" inputMode="decimal" {...register("calories")} />
            </div>
            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input id="protein" inputMode="decimal" {...register("protein")} />
            </div>
            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input id="carbs" inputMode="decimal" {...register("carbs")} />
            </div>
            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input id="fat" inputMode="decimal" {...register("fat")} />
            </div>
          </div>
        </section>

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {initial ? "Save changes" : "Save recipe"}
        </Button>
      </aside>
    </form>
  );
}
