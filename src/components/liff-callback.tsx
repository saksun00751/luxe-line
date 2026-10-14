"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLiff } from "@/components/liff-provider";

/**
 * หน้ารับ callback หลัง LINE Login: URL มี ?code=...&state=... ที่ LIFF SDK ต้องใช้แลก ID token
 * ห้าม redirect ทิ้งพารามิเตอร์พวกนี้ — รอ LiffProvider (liff.init) ประมวลผลเสร็จแล้วค่อยไปปลายทาง
 */
export function LiffCallback({ to }: { to: string }) {
  const { ready } = useLiff();
  const router = useRouter();
  useEffect(() => {
    if (ready) router.replace(to);
  }, [ready, to, router]);
  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> กำลังเข้าสู่ระบบ LINE…
    </div>
  );
}
