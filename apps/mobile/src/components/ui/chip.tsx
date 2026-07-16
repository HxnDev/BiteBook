import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

export function Chip({
  label,
  active,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  icon?: ReactNode;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.active,
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon}
      <Text style={[styles.label, active && { color: colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.full,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.card,
    },
    active: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primaryBorder,
    },
    label: {
      color: colors.muted,
      fontFamily: font.semibold,
      fontSize: 13,
    },
  });
