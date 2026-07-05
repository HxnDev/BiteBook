import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, font, radius } from "@/lib/theme";

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.icon}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 6,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontFamily: font.displaySemibold,
    fontSize: 19,
  },
  text: {
    color: colors.muted,
    fontFamily: font.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
