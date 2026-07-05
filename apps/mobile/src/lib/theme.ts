/**
 * BiteBook design system — ember & saffron on espresso.
 * Hex values converted from the web app's dark-theme HSL variables
 * (apps/web/src/index.css).
 */

export const colors = {
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
  destructive: "#D6613D",
  destructiveSoft: "rgba(214,97,61,0.14)",
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
  Desi: "#F0A542",
  "High Protein": "#E37C51",
  "Low Calorie": "#9FBF7E",
  "Meal Prep": "#7EA8BF",
  Quick: "#F6C585",
  Dessert: "#D98BA6",
  Other: "#B2A595",
};

export function tint(hex: string, alpha = 0.15): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
