import { StyleSheet, Text, View } from "react-native";
import { categoryColors, font, radius, tint } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

export function CategoryPill({
  category,
  small,
}: {
  category: string;
  small?: boolean;
}) {
  const { colors, scheme } = useTheme();
  const color = categoryColors[category] ?? colors.muted;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: tint(color, scheme === "dark" ? 0.16 : 0.14) },
        small && styles.small,
      ]}
    >
      <Text style={[styles.label, { color }, small && { fontSize: 10 }]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  label: {
    fontFamily: font.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
