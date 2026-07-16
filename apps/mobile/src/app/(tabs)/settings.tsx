import * as Linking from "expo-linking";
import {
  BookOpen,
  ExternalLink,
  Globe,
  Info,
  Monitor,
  Moon,
  Sun,
} from "lucide-react-native";
import type { ComponentType, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card, SectionTitle } from "@/components/ui";
import { font, radius, type Palette } from "@/lib/theme";
import {
  useTheme,
  useThemedStyles,
  type ThemeMode,
} from "@/lib/theme-context";

const WEB_URL = "https://bitebook.hxndev.com";

const MODES: {
  value: ThemeMode;
  label: string;
  icon: ComponentType<{ size: number; color: string }>;
}[] = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.aboutCard}>
        <View style={styles.iconBadge}>
          <BookOpen size={24} color={colors.primary} />
        </View>
        <Text style={styles.appName}>BiteBook</Text>
        <Text style={styles.appTag}>
          The family recipe book — shared, no accounts, macros per 100g.
        </Text>
      </Card>

      <SectionTitle>Appearance</SectionTitle>
      <Card style={{ padding: 6 }}>
        <View style={styles.modeRow}>
          {MODES.map((m) => {
            const active = mode === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                style={[styles.modeButton, active && styles.modeButtonActive]}
              >
                <m.icon
                  size={17}
                  color={active ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.modeLabel,
                    active && { color: colors.primary },
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <SectionTitle>More</SectionTitle>

      <Card style={{ padding: 0 }}>
        <Row
          icon={<Globe size={18} color={colors.primary} />}
          label="Open the website"
          detail="bitebook.hxndev.com"
          onPress={() => Linking.openURL(WEB_URL)}
          trailing={<ExternalLink size={16} color={colors.muted} />}
        />
        <View style={styles.divider} />
        <Row
          icon={<Info size={18} color={colors.primary} />}
          label="Version"
          detail="1.0.0"
        />
      </Card>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  detail,
  onPress,
  trailing,
}: {
  icon: ReactNode;
  label: string;
  detail?: string;
  onPress?: () => void;
  trailing?: ReactNode;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, pressed && onPress && { opacity: 0.7 }]}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      gap: 14,
    },
    aboutCard: {
      alignItems: "center",
      gap: 8,
      paddingVertical: 28,
    },
    iconBadge: {
      width: 60,
      height: 60,
      borderRadius: radius.xl,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    appName: {
      color: colors.text,
      fontFamily: font.displaySemibold,
      fontSize: 24,
    },
    appTag: {
      color: colors.muted,
      fontFamily: font.regular,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 19,
      maxWidth: 260,
    },
    modeRow: {
      flexDirection: "row",
      gap: 6,
    },
    modeButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingVertical: 12,
      borderRadius: radius.md - 4,
    },
    modeButtonActive: {
      backgroundColor: colors.primarySoft,
    },
    modeLabel: {
      color: colors.muted,
      fontFamily: font.semibold,
      fontSize: 13,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    rowLabel: {
      color: colors.text,
      fontFamily: font.medium,
      fontSize: 15,
    },
    rowDetail: {
      color: colors.muted,
      fontFamily: font.regular,
      fontSize: 12,
      marginTop: 1,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: 48,
    },
  });
