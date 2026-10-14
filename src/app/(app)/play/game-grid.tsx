"use client";

import { useTransition } from "react";
import { Gamepad2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { launchGameAction } from "@/app/actions/wallet";
import { useLiff } from "@/components/liff-provider";
import { LoadingOverlay } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";

/**
 * เปิดเกมในเบราว์เซอร์ภายนอก (ไม่ใช่เบราว์เซอร์ในแอป LINE)
 *  - Android → Chrome ผ่าน intent URL (ถ้าไม่มี Chrome จะ fallback เปิด URL เดิมในเบราว์เซอร์เริ่มต้น)
 *  - iOS → Safari: ใน LINE ใช้ liff.openWindow({ external: true }) ซึ่งเปิดเบราว์เซอร์เริ่มต้นของเครื่อง (iOS บังคับเฉพาะ Safari ไม่ได้)
 *  - อื่นๆ (เดสก์ท็อป) → เปิดในหน้าเดิม
 * URL มี token — ห้าม log หรือเก็บไว้
 */
function openExternal(url: string, liff: ReturnType<typeof useLiff>["liff"]) {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isAndroid) {
    const u = new URL(url);
    const scheme = u.protocol.replace(":", "");
    window.location.href = `intent://${u.host}${u.pathname}${u.search}${u.hash}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
  } else if (isIOS && liff?.isInClient()) {
    liff.openWindow({ url, external: true });
  } else {
    window.location.href = url;
  }
}

/** เข้าเกม UFA (เกมเดียว): backend ออก URL เข้าเกมให้จากบัญชีที่ผูกกับสมาชิก ไม่มีรายการเกมให้เลือก */
export function GameLauncher() {
  const [pending, start] = useTransition();
  const { liff } = useLiff();
  const launch = () =>
    start(async () => {
      const r = await launchGameAction();
      if (r.url) openExternal(r.url, liff);
      else toast.error(r.message ?? "ไม่สามารถเข้าเกมได้");
    });
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-[18px]">
      {pending && <LoadingOverlay label="กำลังเข้าเกม" />}
      <div className="flex items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-brand text-primary-foreground"><Gamepad2 className="size-6" /></span>
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-semibold">UFA</div>
          <div className="text-xs text-muted-foreground">เข้าเล่นด้วยบัญชีที่ผูกกับ LINE ของคุณ</div>
        </div>
      </div>
      <Button size="lg" onClick={launch} disabled={pending} aria-busy={pending}>
        {pending ? <><Loader2 className="animate-spin" /> กำลังเข้าเกม…</> : "เข้าเล่นเลย"}
      </Button>
    </section>
  );
}
