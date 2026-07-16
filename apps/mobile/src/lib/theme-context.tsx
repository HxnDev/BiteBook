import * as FileSystem from "expo-file-system/legacy";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { palettes, type Palette } from "@/lib/theme";

export type ThemeMode = "system" | "light" | "dark";

const PREF_FILE = `${FileSystem.documentDirectory}theme-mode.txt`;

type ThemeContextValue = {
  /** Resolved scheme after applying the mode ("system" follows the OS). */
  scheme: "light" | "dark";
  colors: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  scheme: "dark",
  colors: palettes.dark,
  mode: "system",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const rawScheme = useColorScheme();
  const systemScheme: "light" | "dark" = rawScheme === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    FileSystem.readAsStringAsync(PREF_FILE)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {}); // no saved preference yet
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    FileSystem.writeAsStringAsync(PREF_FILE, next).catch(() => {});
  }, []);

  const scheme = mode === "system" ? systemScheme : mode;

  const value = useMemo(
    () => ({ scheme, colors: palettes[scheme], mode, setMode }),
    [scheme, mode, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Memoized themed StyleSheet: `const styles = useThemedStyles(createStyles)`. */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
