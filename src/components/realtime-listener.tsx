"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RealtimeConfig } from "@/lib/api/types";

/**
 * เชื่อม Reverb (Pusher protocol) ของสมาชิกที่ล็อกอินอยู่ — เมื่อมี event (ยอดเงิน/ธุรกรรมเปลี่ยน)
 * สั่ง router.refresh() ให้หน้าดึงข้อมูลใหม่ ล้มเหลวเงียบ ๆ (หน้ายังใช้ได้ด้วยการรีเฟรชเอง)
 */
export function RealtimeListener() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    (async () => {
      try {
        const res = await fetch("/api/realtime/config", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const { config } = (await res.json()) as { config: RealtimeConfig };
        const { default: Pusher } = await import("pusher-js");
        if (cancelled) return;
        const pusher = new Pusher(config.key, {
          cluster: "mt1", // ไม่ใช้จริงเมื่อระบุ wsHost แต่ pusher-js ต้องการค่านี้
          wsHost: config.wsHost,
          wsPort: config.wsPort,
          wssPort: config.wsPort,
          forceTLS: config.forceTls,
          enabledTransports: ["ws", "wss"],
          channelAuthorization: { endpoint: "/api/realtime/auth", transport: "ajax" },
        });
        const channel = pusher.subscribe(config.channel);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const onEvent = (name: string) => {
          if (name.startsWith("pusher:") || name.startsWith("pusher_internal:")) return;
          if (config.event && name !== config.event && name !== `.${config.event}`) return;
          clearTimeout(timer);
          timer = setTimeout(() => router.refresh(), 400); // รวม event ที่มาติดกัน
        };
        channel.bind_global(onEvent);
        cleanup = () => {
          clearTimeout(timer);
          channel.unbind_global(onEvent);
          pusher.disconnect();
        };
      } catch {
        /* realtime ไม่พร้อม — ข้าม */
      }
    })();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [router]);

  return null;
}
