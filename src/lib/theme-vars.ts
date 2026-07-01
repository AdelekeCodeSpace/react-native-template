import { vars } from "nativewind";
import { darkColors, lightColors } from "./colors";

type ColorKey = keyof typeof darkColors;

function buildVars(palette: typeof darkColors | typeof lightColors) {
  const entries = Object.entries(palette) as [ColorKey, string][];
  return vars(
    Object.fromEntries(
      entries.map(([key, value]) => [`--${key}`, value]),
    ) as Record<string, string>,
  );
}

export const darkThemeVars = buildVars(darkColors);
export const lightThemeVars = buildVars(lightColors);
