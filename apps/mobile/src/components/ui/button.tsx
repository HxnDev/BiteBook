import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { font, radius, type Palette } from "@/lib/theme";
import { useTheme, useThemedStyles } from "@/lib/theme-context";

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "destructive";
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && { backgroundColor: colors.primary },
        variant === "outline" && styles.outline,
        variant === "destructive" && { backgroundColor: colors.destructiveSoft },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        loading && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.onPrimary : colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              variant === "primary" && { color: colors.onPrimary },
              variant === "outline" && { color: colors.text },
              variant === "destructive" && { color: colors.destructive },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: radius.md,
      paddingVertical: 14,
      paddingHorizontal: 18,
    },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    label: {
      fontFamily: font.bold,
      fontSize: 15,
    },
  });
