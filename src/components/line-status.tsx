"use client";

import { useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { lineLoginAction } from "@/app/actions/auth";
import { useLiff } from "@/components/liff-provider";
import { Button } from "@/components/ui/button";

const FLAG = "luxe_register_line_connect";

/**
 * หน้าสมัครต้องให้ผู้ใช้กด "เชื่อม LINE" เองทุกครั้งที่เข้าหน้า — แม้ LIFF จะล็อกอินค้างอยู่ก็ไม่ถือว่าเชื่อมแล้ว
 * - ยังไม่ล็อกอิน LINE → login แล้วกลับมา (จำด้วย sessionStorage ว่าเพิ่งกดเชื่อม)
 * - ล็อกอินค้างอยู่ในเบราว์เซอร์ปกติ → logout แล้ว login ใหม่ (เลือกบัญชี LINE ใหม่ได้)
 * - เปิดในแอป LINE (ล็อกอินอยู่เสมอ) → ยืนยันใช้บัญชีนี้ทันที
 */
export function useLineConnect() {
  const { ready, loggedIn, inClient, idToken, liff, login } = useLiff();
  const [connected, setConnected] = useState(false);
  // ผลตรวจว่า LINE นี้มีบัญชีสมาชิกอยู่แล้วหรือยัง (ตรวจทันทีที่เชื่อม)
  const [check, setCheck] = useState<{ token: string; status: "checking" | "exists" | "new" | "error"; message?: string }>();

  useEffect(() => {
    if (!ready || !loggedIn) return;
    try {
      if (sessionStorage.getItem(FLAG)) {
        sessionStorage.removeItem(FLAG);
        setConnected(true);
      }
    } catch {
      /* ไม่มี sessionStorage → ผู้ใช้กดเชื่อมใหม่เอง */
    }
  }, [ready, loggedIn]);

  const token = connected && loggedIn ? idToken : null;
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setCheck({ token, status: "checking" });
    lineLoginAction(token).then(
      (r) => {
        if (cancelled) return;
        if (r.result === "AUTHENTICATED") setCheck({ token, status: "exists" });
        else if (r.result === "LINK_REQUIRED") setCheck({ token, status: "new" });
        else setCheck({ token, status: "error", message: r.message });
      },
      () => !cancelled && setCheck({ token, status: "error", message: "ตรวจสอบบัญชี LINE ไม่สำเร็จ กรุณาลองใหม่" })
    );
    return () => {
      cancelled = true;
    };
  }, [token]);
  const status = token && check?.token === token ? check.status : token ? "checking" : undefined;

  const connect = () => {
    if (loggedIn && inClient) return setConnected(true);
    try {
      sessionStorage.setItem(FLAG, "1");
    } catch {
      /* ignore */
    }
    if (loggedIn) liff?.logout();
    login();
  };

  // เปลี่ยนบัญชี: ล้าง LIFF แล้ว login ใหม่ (ในแอป LINE เปลี่ยนจากโค้ดไม่ได้ จึงไม่แสดงปุ่ม)
  const canSwitch = !inClient;
  return {
    connected: connected && loggedIn, connect, canSwitch, idToken: token,
    /** exists = LINE นี้มีบัญชีแล้ว (ห้ามสมัครซ้ำ) · ready = ตรวจแล้วว่าสมัครได้ */
    accountExists: status === "exists",
    checking: status === "checking",
    checkError: status === "error" ? check?.message : undefined,
    ready: status === "new",
  };
}

/** แสดงสถานะการเชื่อม LINE บนหน้าสมัคร + ส่ง idToken ไปกับฟอร์ม (เฉพาะเมื่อผู้ใช้กดเชื่อมแล้ว) */
export function LineStatus({
  connected, idToken, onConnect, canSwitch,
}: { connected: boolean; idToken: string | null; onConnect: () => void; canSwitch: boolean }) {
  const { ready, enabled, profile } = useLiff();
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
      <input type="hidden" name="idToken" value={idToken ?? ""} />
      {connected && profile?.pictureUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.pictureUrl} alt="" className="size-10 shrink-0 rounded-full" />
      ) : (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-line text-white">
          <MessageCircle className="size-[22px] fill-current" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        {!ready ? (
          <div className="text-sm text-muted-foreground">กำลังเชื่อมต่อ LINE…</div>
        ) : connected ? (
          <>
            <div className="text-sm font-semibold">เชื่อมต่อ LINE แล้ว</div>
            <div className="truncate text-xs text-muted-foreground">{profile?.displayName} · ส่งผลการสมัครเข้าแชทอัตโนมัติ</div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold">ยังไม่ได้เชื่อม LINE</div>
            <div className="text-xs text-muted-foreground">{enabled ? "กดเชื่อม LINE เพื่อรับข้อมูลการสมัครทางแชท" : "เปิดผ่าน Rich Menu ใน LINE เพื่อรับข้อมูลทางแชท"}</div>
          </>
        )}
      </div>
      {ready && connected && (
        canSwitch ? (
          <Button type="button" variant="outline" size="sm" onClick={onConnect}>
            เปลี่ยนบัญชี
          </Button>
        ) : (
          <Check className="size-5 text-line" />
        )
      )}
      {ready && enabled && !connected && (
        <Button type="button" variant="line" size="sm" onClick={onConnect}>
          เชื่อม LINE
        </Button>
      )}
    </div>
  );
}
