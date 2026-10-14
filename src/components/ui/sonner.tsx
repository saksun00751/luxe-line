"use client";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useTheme } from "next-themes";

export function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "dark"}
      position="top-center"
      toastOptions={{
        style: { background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: 20, fontFamily: "var(--font-sans)" },
      }}
      {...props}
    />
  );
}
