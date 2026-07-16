/**
 * BiteBook design system.
 * Dark: ember & saffron on espresso. Light: crisp white + orange.
 */

export type Palette = {
  background: string;
  backgroundRaised: string;
  card: string;
  cardElevated: string;
  border: string;
  borderStrong: string;
  input: string;
  text: string;
  textSecondary: string;
  muted: string;
  faint: string;
  primary: string;
  primaryBright: string;
  onPrimary: string;
  primarySoft: string;
  primaryBorder: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  destructive: string;
  destructiveSoft: string;
};

export const palettes: { light: Palette; dark: Palette } = {
  dark: {
    background: "#110C09",
    backgroundRaised: "#161009",
    card: "#191310",
    cardElevated: "#201813",
    border: "#2F2822",
    borderStrong: "#403830",
    input: "#352D27",
    text: "#F3EDE2",
    textSecondary: "#CDBFAE",
    muted: "#B2A595",
    faint: "#29231F",
    primary: "#F0A542",
    primaryBright: "#F6C585",
    onPrimary: "#1D120C",
    primarySoft: "rgba(240,165,66,0.13)",
    primaryBorder: "rgba(240,165,66,0.40)",
    accent: "#D6613D",
    accentSoft: "rgba(214,97,61,0.14)",
    onAccent: "#FCF9F3",
    destructive: "#E0684A",
    destructiveSoft: "rgba(214,97,61,0.14)",
  },
  light: {
    background: "#FFFDFA",
    backgroundRaised: "#FFFFFF",
    card: "#FFFFFF",
    cardElevated: "#FFF4E8",
    border: "#F0E2D2",
    borderStrong: "#E3CFB8",
    input: "#FAF3EA",
    text: "#241708",
    textSecondary: "#5D4A36",
    muted: "#97846F",
    faint: "#F6EEE3",
    primary: "#F97316",
    primaryBright: "#FB923C",
    onPrimary: "#FFFFFF",
    primarySoft: "rgba(249,115,22,0.10)",
    primaryBorder: "rgba(249,115,22,0.35)",
    accent: "#E2542C",
    accentSoft: "rgba(226,84,44,0.12)",
    onAccent: "#FFFFFF",
    destructive: "#D6462E",
    destructiveSoft: "rgba(214,70,46,0.12)",
  },
};

export const font = {
  // Inter — body / UI
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  // Fraunces — display headings (the web app's serif identity)
  displayLight: "Fraunces_300Light",
  display: "Fraunces_400Regular",
  displaySemibold: "Fraunces_600SemiBold",
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 999,
};

/** Accent tints per category for chips and card badges. */
export const categoryColors: Record<string, string> = {
  Desi: "#E8912A",
  "High Protein": "#DB6B3D",
  "Low Calorie": "#7FA35E",
  "Meal Prep": "#5E89A3",
  Quick: "#D9A144",
  Dessert: "#C76E8D",
  Other: "#9C8A76",
};

export function tint(hex: string, alpha = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
