import type { Metadata, Viewport } from "next";
import "@fontsource/kanit/300.css";
import "@fontsource/kanit/400.css";
import "@fontsource/kanit/500.css";
import "@fontsource/kanit/600.css";
import "@fontsource/kanit/700.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DEFAULT_PRESET } from "@/config/themes";
import { getBranding } from "@/lib/branding";

export async function generateMetadata(): Promise<Metadata> {
  const b = await getBranding();
  return {
    title: { default: b.title, template: `%s · ${b.name}` },
    description: b.description,
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0A08",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const preset = DEFAULT_PRESET; // ธีมกำหนดจาก NEXT_PUBLIC_DEFAULT_THEME เท่านั้น (ผู้ใช้เปลี่ยนเองไม่ได้)
  return (
    <html lang="th" data-theme={preset} className="dark" suppressHydrationWarning>
      <head>
        {/* build ของ OpenNext (esbuild keepNames) ฝัง __name() ลงในสคริปต์ของ next-themes ที่ถูก stringify → ต้องมีตัวนิยามก่อนรัน */}
        <script dangerouslySetInnerHTML={{ __html: "window.__name=window.__name||function(f){return f}" }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
