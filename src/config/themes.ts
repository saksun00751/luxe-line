export const THEME_PRESETS = [
  { id: "gold", name: "ทอง-ดำ", swatch: "linear-gradient(135deg,#FBE7A1,#E2B84A 45%,#A67C1E)", base: "#0B0A08" },
  { id: "emerald", name: "มรกต", swatch: "linear-gradient(135deg,#A6F5D3,#2FC487 50%,#0E7A50)", base: "#05110C" },
  { id: "ocean", name: "ท้องทะเล", swatch: "linear-gradient(135deg,#B3F6FF,#35C3EE 50%,#1867D1)", base: "#04111F" },
  { id: "ruby", name: "แดงมงคล", swatch: "linear-gradient(135deg,#FFD39A,#FF6A5A 45%,#C8102E)", base: "#130509" },
  { id: "violet", name: "ม่วงกาแล็กซี่", swatch: "linear-gradient(135deg,#FBC8FF,#C29BFF 50%,#8B5CF6)", base: "#0B0716" },
  { id: "platinum", name: "แพลทินัม", swatch: "linear-gradient(135deg,#FFFFFF,#CDD5DF 50%,#8C96A5)", base: "#0A0B0D" },
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]["id"];
export const isPreset = (v: unknown): v is ThemePresetId => THEME_PRESETS.some((t) => t.id === v);
export const DEFAULT_PRESET: ThemePresetId = isPreset(process.env.NEXT_PUBLIC_DEFAULT_THEME)
  ? process.env.NEXT_PUBLIC_DEFAULT_THEME
  : "gold";

