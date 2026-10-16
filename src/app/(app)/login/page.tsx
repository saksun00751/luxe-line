import type { Metadata } from "next";
import { BrandEmblem } from "@/components/brand-logo";
import { redirect } from "next/navigation";
import { getBranding } from "@/lib/branding";
import { isAuthed } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; loggedout?: string }> }) {
  const { next, loggedout } = await searchParams;
  if (await isAuthed()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/play"); // ล็อกอินอยู่แล้ว
  const { title } = await getBranding();
  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <BrandEmblem />
        <p className="text-center text-sm text-muted-foreground">{title}</p>
      </div>
      <LoginForm next={next} loggedOut={!!loggedout} />
    </div>
  );
}
