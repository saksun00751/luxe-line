"use client";

import { useEffect } from "react";
import { syncRichMenuAction } from "@/app/actions/auth";
import { useLiff } from "@/components/liff-provider";

export const RICHMENU_SYNC_KEY = "richmenu-synced";

/** สมาชิกที่ session ค้างอยู่ไม่ผ่านขั้น login → ผูก rich menu สมาชิกให้ครั้งเดียวต่อแท็บ */
export function RichMenuSync() {
  const { ready, loggedIn, idToken } = useLiff();
  useEffect(() => {
    if (!ready || !loggedIn || !idToken) return;
    try {
      if (sessionStorage.getItem(RICHMENU_SYNC_KEY)) return;
      sessionStorage.setItem(RICHMENU_SYNC_KEY, "1");
    } catch {
      /* ไม่มี sessionStorage ก็ซิงก์ทุกครั้ง */
    }
    void syncRichMenuAction(idToken).catch(() => {});
  }, [ready, loggedIn, idToken]);
  return null;
}
