import { Tabs } from "expo-router";
import { BookOpen, Settings } from "lucide-react-native";
import { font } from "@/lib/theme";
import { useTheme } from "@/lib/theme-context";

export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: font.displaySemibold, fontSize: 24 },
        headerTitleAlign: "left",
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.backgroundRaised,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: font.semibold, fontSize: 11 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Recipes",
          headerShown: false,
          tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
