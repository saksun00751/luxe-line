"use client";

import { useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { useLiff } from "@/components/liff-provider";
import { LOGGED_OUT_KEY } from "@/app/(app)/login/login-form";
import { RICHMENU_SYNC_KEY } from "@/components/richmenu-sync";
import { LoadingOverlay } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";

/**
 * ออกจากระบบทั้งฝั่งเซิร์ฟเวอร์และ LIFF แล้วโหลดหน้าใหม่ทั้งหน้า
 * (LiffProvider เก็บ state ไว้ใน layout — ถ้า navigate แบบ client หน้าสมัครจะยังเห็น LINE เดิม)
 */
export function LogoutButton() {
  const { liff } = useLiff();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const onConfirm = () => {
    setConfirming(false);
    start(async () => {
      let idToken: string | undefined;
      try {
        idToken = liff?.getIDToken() ?? undefined; // ต้องอ่านก่อน logout เพื่อใช้ unlink rich menu
        if (liff?.isLoggedIn()) liff.logout(); // ล้าง token ในเบราว์เซอร์ ไม่ redirect
      } catch {
        /* ไม่ให้การออกจากระบบล้มเพราะ LIFF */
      }
      try {
        sessionStorage.removeItem(RICHMENU_SYNC_KEY);
        localStorage.setItem(LOGGED_OUT_KEY, "1");
      } catch {}
      await logoutAction(idToken);
      window.location.href = "/login?loggedout=1"; // กันหน้า login ล็อกอินกลับอัตโนมัติ
    });
  };
  return (
    <>
      {pending && <LoadingOverlay label="กำลังออกจากระบบ" />}
      <Button type="button" variant="outline" size="lg" disabled={pending} onClick={() => setConfirming(true)}>
        <LogOut /> ออกจากระบบ
      </Button>
      <Sheet open={confirming} onOpenChange={setConfirming}>
        <SheetContent title="ออกจากระบบ?">
          <p className="-mt-2 text-sm text-muted-foreground">คุณต้องเข้าสู่ระบบด้วย LINE อีกครั้งเมื่อจะกลับมาใช้งาน</p>
          <div className="grid grid-cols-2 gap-3 pb-4">
            <SheetClose asChild>
              <Button type="button" variant="outline" size="lg">ยกเลิก</Button>
            </SheetClose>
            <Button type="button" size="lg" onClick={onConfirm}>ออกจากระบบ</Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
