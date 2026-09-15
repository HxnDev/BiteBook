/**
 * BiteBook design system.
 * Dark: warm gold on an herb-black canvas. Light: warm parchment and ink.
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
    background: "#0B100E",
    backgroundRaised: "#0F1512",
    card: "#151B18",
    cardElevated: "#1A211D",
    border: "#303834",
    borderStrong: "#48524D",
    input: "#202724",
    text: "#F7F1E8",
    textSecondary: "#C9C7C1",
    muted: "#A2A7A3",
    faint: "#202723",
    primary: "#F2C777",
    primaryBright: "#FFD995",
    onPrimary: "#161711",
    primarySoft: "rgba(242,199,119,0.14)",
    primaryBorder: "rgba(242,199,119,0.48)",
    accent: "#D6613D",
    accentSoft: "rgba(214,97,61,0.14)",
    onAccent: "#FCF9F3",
    destructive: "#E0684A",
    destructiveSoft: "rgba(214,97,61,0.14)",
  },
  light: {
    background: "#FAF8F2",
    backgroundRaised: "#FFFDF8",
    card: "#FFFFFF",
    cardElevated: "#F4F1E8",
    border: "#DEDCD3",
    borderStrong: "#C8C4B7",
    input: "#EFEDE6",
    text: "#18201C",
    textSecondary: "#4F5752",
    muted: "#7B827E",
    faint: "#EEECE5",
    primary: "#D9A94F",
    primaryBright: "#E5B967",
    onPrimary: "#171914",
    primarySoft: "rgba(217,169,79,0.13)",
    primaryBorder: "rgba(217,169,79,0.42)",
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
