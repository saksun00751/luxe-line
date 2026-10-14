import type { Metadata } from "next";
import { BrandEmblem } from "@/components/brand-logo";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; loggedout?: string }> }) {
  const { next, loggedout } = await searchParams;
  if (await isAuthed()) redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : "/play"); // ล็อกอินอยู่แล้ว
  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <BrandEmblem />
        <p className="text-center text-sm text-muted-foreground">ยินดีต้อนรับกลับ เข้าสู่ระบบด้วย LINE เพื่อเริ่มเล่น</p>
      </div>
      <LoginForm next={next} loggedOut={!!loggedout} />
    </div>
  );
}
