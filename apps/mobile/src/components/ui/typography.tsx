import type { ReactNode } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import { font, type Palette } from "@/lib/theme";
import { useThemedStyles } from "@/lib/theme-context";

/** Fraunces serif section heading — the app's display voice. */
export function SectionTitle({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  return <Text style={[styles.sectionTitle, style]}>{children}</Text>;
}

/** Tiny uppercase tracked label, like the web app's eyebrow text. */
export function Eyebrow({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    sectionTitle: {
      color: colors.text,
      fontFamily: font.display,
      fontSize: 22,
      letterSpacing: 0.2,
    },
    eyebrow: {
      color: colors.primary,
      fontFamily: font.semibold,
      fontSize: 11,
      letterSpacing: 3,
      textTransform: "uppercase",
    },
  });
