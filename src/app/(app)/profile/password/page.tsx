import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/session";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "เปลี่ยนรหัสผ่าน" };

export default async function PasswordPage() {
  if (!(await isAuthed())) redirect("/login?next=/profile/password"); // ไม่ต้องดึงข้อมูลสมาชิก ให้หน้าเปิดไว
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/profile" aria-label="ย้อนกลับ" className="flex size-10 items-center justify-center rounded-full border border-border bg-card"><ChevronLeft className="size-5" /></Link>
        <h1 className="text-[22px] font-semibold">เปลี่ยนรหัสผ่าน</h1>
      </div>
      <PasswordForm />
    </div>
  );
}
