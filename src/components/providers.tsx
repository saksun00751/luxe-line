"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/loading-overlay";
import { LiffProvider } from "@/components/liff-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <LiffProvider>
        {children}
        <Toaster />
        <NavigationProgress />
      </LiffProvider>
    </ThemeProvider>
  );
}
