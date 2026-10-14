import { redirect } from "next/navigation";

// ปิดรับสมัครผ่านหน้านี้ — ผู้ใช้ทุกคนไปหน้าเข้าสู่ระบบ
export default function RegisterPage() {
  redirect("/login");
}
