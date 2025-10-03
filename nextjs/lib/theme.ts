import { type StorefrontConfig } from "@/lib/types";
export function getThemeFromConfig(config: StorefrontConfig | null) {
  const palette = config?.theme?.palette ?? {};
  const radius = config?.theme?.radius ?? "2xl";
  return {
    radius,
    background: palette.bg ?? "#fbfbfb",
    wrapper: "min-h-screen",
    card: `rounded-${radius} bg-[${palette.surface ?? "#ffffff"}] shadow-sm border border-black/5`,
    text: palette.text ?? "#141414",
    muted: palette.muted ?? "#6b7280",
    accent: palette.accent ?? "#0ea5e9",
    button: `rounded-${radius} px-4 py-2 shadow-sm border border-black/5 hover:shadow transition` ,
    chip: `rounded-full bg-black/5 px-3 py-1 text-sm`,
  } as const;
}
