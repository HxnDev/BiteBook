import { StyleSheet, Text, View } from "react-native";
import { categoryColors, colors, font, radius, tint } from "@/lib/theme";

export function CategoryPill({
  category,
  small,
}: {
  category: string;
  small?: boolean;
}) {
  const color = categoryColors[category] ?? colors.muted;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: tint(color, 0.16) },
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
