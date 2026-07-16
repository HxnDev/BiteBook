import * as Linking from "expo-linking";
import * as Updates from "expo-updates";
import {
  BookOpen,
  ExternalLink,
  Globe,
  Info,
  RefreshCw,
} from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Card, SectionTitle } from "@/components/ui";
import { colors, font, radius } from "@/lib/theme";

const WEB_URL = "https://bitebook.hxndev.com";

const updateInfo = Updates.isEmbeddedLaunch
  ? "Built-in bundle (no OTA update applied)"
  : `Update ${Updates.updateId?.slice(0, 8) ?? "?"} · ${
      Updates.createdAt?.toLocaleString() ?? ""
    }`;

async function checkForUpdate() {
  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      Alert.alert("Up to date", "You're already on the latest version.");
      return;
    }
    await Updates.fetchUpdateAsync();
    Alert.alert("Update ready", "Restart now to apply it?", [
      { text: "Later", style: "cancel" },
      { text: "Restart", onPress: () => Updates.reloadAsync() },
    ]);
  } catch (err) {
    Alert.alert("Update check failed", String(err));
  }
}

export default function SettingsScreen() {
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
          detail={`1.0.0 · ${updateInfo}`}
        />
        <View style={styles.divider} />
        <Row
          icon={<RefreshCw size={18} color={colors.primary} />}
          label="Check for updates"
          detail="Fetch the latest version now"
          onPress={checkForUpdate}
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

const styles = StyleSheet.create({
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
