import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImagePlus, Plus, Trash2, X } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Chip } from "@/components/ui";
import {
  CATEGORIES,
  UNITS,
  type Category,
  type Recipe,
  type RecipeInput,
  type Unit,
} from "@/lib/recipes/types";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

/** Local id for dynamic rows (crypto.randomUUID isn't available on Hermes). */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

interface IngredientDraft {
  id: string;
  name: string;
  quantity: string;
  unit: Unit;
  notes: string;
}

function emptyIngredient(): IngredientDraft {
  return { id: uid(), name: "", quantity: "", unit: "g", notes: "" };
}

const parseNumber = (raw: string): number | null => {
  if (!raw.trim()) return null;
  const parsed = Number(raw.replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
};

/** One form for both add and edit — pass `recipe` to pre-fill. */
export function RecipeForm({
  recipe,
  busy,
  submitLabel,
  onSubmit,
}: {
  recipe?: Recipe;
  busy: boolean;
  submitLabel: string;
  onSubmit: (input: RecipeInput) => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [title, setTitle] = useState(recipe?.title ?? "");
  const [description, setDescription] = useState(recipe?.description ?? "");
  const [category, setCategory] = useState<Category>(
    recipe?.category ?? "Desi",
  );
  const [tagsText, setTagsText] = useState(recipe?.tags.join(", ") ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    recipe?.imageUrl ?? null,
  );
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(
    recipe?.ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity != null ? String(i.quantity) : "",
      unit: i.unit,
      notes: i.notes,
    })) ?? [emptyIngredient()],
  );
  const [steps, setSteps] = useState<string[]>(
    recipe?.instructions.length ? [...recipe.instructions] : [""],
  );
  const [notes, setNotes] = useState(recipe?.notes ?? "");
  const [calories, setCalories] = useState(
    recipe?.calories != null ? String(recipe.calories) : "",
  );
  const [protein, setProtein] = useState(
    recipe?.protein != null ? String(recipe.protein) : "",
  );
  const [carbs, setCarbs] = useState(
    recipe?.carbs != null ? String(recipe.carbs) : "",
  );
  const [fat, setFat] = useState(recipe?.fat != null ? String(recipe.fat) : "");
  /** Ingredient id whose unit picker is open. */
  const [unitPickerFor, setUnitPickerFor] = useState<string | null>(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera blocked", "Allow camera access in system settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  function updateIngredient(id: string, patch: Partial<IngredientDraft>) {
    setIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }

  function updateStep(index: number, value: string) {
    setSteps((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  function submit() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Give the recipe a name.");
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      imageUrl,
      ingredients: ingredients
        .filter((i) => i.name.trim() !== "")
        .map((i) => ({
          id: i.id,
          name: i.name.trim(),
          quantity: parseNumber(i.quantity),
          unit: i.unit,
          notes: i.notes,
        })),
      instructions: steps.map((s) => s.trim()).filter((s) => s !== ""),
      notes: notes.trim(),
      calories: parseNumber(calories),
      protein: parseNumber(protein),
      carbs: parseNumber(carbs),
      fat: parseNumber(fat),
      isFavorite: recipe?.isFavorite ?? false,
      timesCooked: recipe?.timesCooked,
      lastCookedAt: recipe?.lastCookedAt,
    });
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Photo */}
      <Text style={styles.label}>Photo</Text>
      <View style={styles.photoRow}>
        {imageUrl ? (
          <View>
            <Image
              source={{ uri: imageUrl }}
              style={styles.photoPreview}
              contentFit="cover"
            />
            <Pressable
              style={styles.photoRemove}
              onPress={() => setImageUrl(null)}
            >
              <X size={12} color={colors.text} strokeWidth={3} />
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable style={styles.photoAdd} onPress={takePhoto}>
              <Camera size={20} color={colors.primary} />
              <Text style={styles.photoAddText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.photoAdd} onPress={pickPhoto}>
              <ImagePlus size={20} color={colors.primary} />
              <Text style={styles.photoAddText}>Gallery</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Basics */}
      <Field label="Title *">
        <TextInput
          style={styles.input}
          placeholder="e.g. Chicken Pulao"
          placeholderTextColor={colors.muted}
          value={title}
          onChangeText={setTitle}
        />
      </Field>
      <Field label="Short description">
        <TextInput
          style={styles.input}
          placeholder="A line about this dish…"
          placeholderTextColor={colors.muted}
          value={description}
          onChangeText={setDescription}
        />
      </Field>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chipWrap}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            onPress={() => setCategory(c)}
          />
        ))}
      </View>

      <Field label="Tags (comma separated)">
        <TextInput
          style={styles.input}
          placeholder="biryani, high protein"
          placeholderTextColor={colors.muted}
          value={tagsText}
          onChangeText={setTagsText}
          autoCapitalize="none"
        />
      </Field>

      {/* Ingredients */}
      <SectionHeader
        title="Ingredients"
        onAdd={() => setIngredients((prev) => [...prev, emptyIngredient()])}
      />
      <View style={{ gap: 10 }}>
        {ingredients.map((ing) => (
          <View key={ing.id} style={styles.ingredientRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ingredient"
              placeholderTextColor={colors.muted}
              value={ing.name}
              onChangeText={(text) => updateIngredient(ing.id, { name: text })}
            />
            <TextInput
              style={[styles.input, styles.qtyInput]}
              placeholder="Qty"
              placeholderTextColor={colors.muted}
              value={ing.quantity}
              onChangeText={(text) =>
                updateIngredient(ing.id, { quantity: text })
              }
              keyboardType="decimal-pad"
            />
            <Pressable
              style={styles.unitButton}
              onPress={() => setUnitPickerFor(ing.id)}
            >
              <Text style={styles.unitText}>{ing.unit}</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                setIngredients((prev) =>
                  prev.length > 1 ? prev.filter((i) => i.id !== ing.id) : prev,
                )
              }
              style={styles.removeButton}
              hitSlop={6}
            >
              <Trash2 size={16} color={colors.muted} />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Method */}
      <SectionHeader
        title="Method"
        onAdd={() => setSteps((prev) => [...prev, ""])}
      />
      <View style={{ gap: 10 }}>
        {steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              placeholder={`Step ${i + 1}…`}
              placeholderTextColor={colors.muted}
              value={step}
              onChangeText={(text) => updateStep(i, text)}
              multiline
            />
            <Pressable
              onPress={() =>
                setSteps((prev) =>
                  prev.length > 1 ? prev.filter((_, j) => j !== i) : prev,
                )
              }
              style={[styles.removeButton, { marginTop: 12 }]}
              hitSlop={6}
            >
              <Trash2 size={16} color={colors.muted} />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Macros */}
      <Text style={[styles.label, { marginTop: 4 }]}>Macros (per 100g)</Text>
      <Text style={styles.hint}>
        Optional. Leave blank if you don&apos;t track them.
      </Text>
      <View style={styles.rowSplit}>
        <Field label="Calories" style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.muted}
            value={calories}
            onChangeText={setCalories}
            keyboardType="decimal-pad"
          />
        </Field>
        <Field label="Protein (g)" style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.muted}
            value={protein}
            onChangeText={setProtein}
            keyboardType="decimal-pad"
          />
        </Field>
      </View>
      <View style={styles.rowSplit}>
        <Field label="Carbs (g)" style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.muted}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="decimal-pad"
          />
        </Field>
        <Field label="Fat (g)" style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholderTextColor={colors.muted}
            value={fat}
            onChangeText={setFat}
            keyboardType="decimal-pad"
          />
        </Field>
      </View>

      <Field label="Notes">
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Tips, substitutions, what to serve it with…"
          placeholderTextColor={colors.muted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Field>

      <Pressable
        style={[styles.saveButton, busy && { opacity: 0.6 }]}
        onPress={submit}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={styles.saveText}>{submitLabel}</Text>
        )}
      </Pressable>

      {/* Unit picker */}
      <Modal
        visible={unitPickerFor !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setUnitPickerFor(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setUnitPickerFor(null)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Unit</Text>
            <View style={styles.chipWrap}>
              {UNITS.map((u) => (
                <Chip
                  key={u}
                  label={u}
                  active={
                    ingredients.find((i) => i.id === unitPickerFor)?.unit === u
                  }
                  onPress={() => {
                    if (unitPickerFor) {
                      updateIngredient(unitPickerFor, { unit: u });
                    }
                    setUnitPickerFor(null);
                  }}
                />
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onAdd} style={styles.addButton} hitSlop={6}>
        <Plus size={14} color={colors.primary} strokeWidth={3} />
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const createStyles = (colors: Palette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 14, paddingBottom: 56 },
  label: {
    color: colors.textSecondary,
    fontFamily: font.semibold,
    fontSize: 13,
    marginBottom: 6,
  },
  hint: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 12,
    marginTop: -10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    backgroundColor: colors.input,
    fontFamily: font.medium,
    fontSize: 15,
  },
  notesInput: { height: 96, textAlignVertical: "top" },
  rowSplit: { flexDirection: "row", gap: 10 },
  photoRow: { flexDirection: "row", gap: 10 },
  photoPreview: {
    width: 160,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.card,
  },
  photoRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.destructive,
    alignItems: "center",
    justifyContent: "center",
  },
  photoAdd: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoAddText: {
    color: colors.primary,
    fontFamily: font.semibold,
    fontSize: 11,
  },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: font.display,
    fontSize: 20,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
  },
  addButtonText: {
    color: colors.primary,
    fontFamily: font.bold,
    fontSize: 12,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyInput: {
    width: 64,
    paddingHorizontal: 10,
    textAlign: "center",
  },
  unitButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 12,
    minWidth: 58,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  unitText: {
    color: colors.primary,
    fontFamily: font.semibold,
    fontSize: 13,
  },
  removeButton: {
    padding: 4,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.faint,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  stepNumber: {
    color: colors.primary,
    fontFamily: font.displaySemibold,
    fontSize: 14,
  },
  stepInput: {
    flex: 1,
    minHeight: 48,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  saveText: {
    color: colors.onPrimary,
    fontFamily: font.bold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.cardElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
  },
  modalTitle: {
    color: colors.text,
    fontFamily: font.displaySemibold,
    fontSize: 18,
  },
});
