import {
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as FileSystem from "expo-file-system/legacy";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { font } from "@/lib/theme";
import { ThemeProvider, useTheme } from "@/lib/theme-context";

SplashScreen.preventAutoHideAsync();

const CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 30 days

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      // Keep queries alive long enough to be persisted for offline use.
      gcTime: CACHE_MAX_AGE,
    },
  },
});

/**
 * Offline mode: the query cache (recipe list + details) is persisted to a
 * file, so the app opens with the last-synced data and refreshes when online.
 * Photos are already cached on disk by expo-image.
 */
const persister = createAsyncStoragePersister({
  storage: {
    getItem: (key: string) =>
      FileSystem.readAsStringAsync(
        `${FileSystem.documentDirectory}${key}.json`,
      ).catch(() => null),
    setItem: (key: string, value: string) =>
      FileSystem.writeAsStringAsync(
        `${FileSystem.documentDirectory}${key}.json`,
        value,
      ),
    removeItem: (key: string) =>
      FileSystem.deleteAsync(`${FileSystem.documentDirectory}${key}.json`, {
        idempotent: true,
      }).catch(() => {}),
  },
  key: "bitebook-query-cache",
  throttleTime: 2_000,
});

function ThemedApp() {
  const { colors, scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: font.displaySemibold, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="recipe/[id]" options={{ title: "" }} />
        <Stack.Screen
          name="add"
          options={{ presentation: "modal", title: "New recipe" }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{ presentation: "modal", title: "Edit recipe" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Fraunces_300Light,
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: CACHE_MAX_AGE }}
    >
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
