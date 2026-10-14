"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** ฉากบังเต็มจอพร้อมวงล้อหมุน — ใช้ตอนเปลี่ยนหน้าและตอนส่งฟอร์ม */
export function LoadingOverlay({ label = "กำลังโหลด" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-label={label} className="fixed inset-0 z-[60] flex items-center justify-center bg-background/65 backdrop-blur-[2px]">
      <div className="flex size-[72px] items-center justify-center rounded-full border border-border bg-card shadow-glow">
        <span className="size-9 animate-spin rounded-full border-[3px] border-border border-t-primary" />
      </div>
    </div>
  );
}

const MIN_MS = 450; // แสดงอย่างน้อยเท่านี้ แม้หน้าใหม่ไม่ต้องโหลดข้อมูล — ให้รู้ว่ากดโดนและไม่สลับกระตุก
const MAX_MS = 15_000; // กันค้างถ้าการนำทางไม่เกิดขึ้นจริง

function NavigationOverlay() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [show, setShow] = useState(false);
  const timers = useRef<{ done?: ReturnType<typeof setTimeout>; max?: ReturnType<typeof setTimeout> }>({});
  const startedAt = useRef(0);

  const stop = () => {
    clearTimeout(timers.current.done);
    clearTimeout(timers.current.max);
    setShow(false);
  };

  // path/query เปลี่ยน = หน้าใหม่ commit แล้ว (loading.tsx ของหน้านั้นรับช่วงแสดง overlay ต่อจนข้อมูลมาครบ) → ปิดอันนี้
  const current = useRef("");
  useEffect(() => {
    current.current = pathname + (search ? "?" + search : "");
    if (!startedAt.current) return;
    // หน้าใหม่พร้อมแล้ว แต่ถ้าเพิ่งเริ่มโหลดไม่ถึง MIN_MS ให้ค้าง overlay ไว้ให้ครบก่อน
    clearTimeout(timers.current.done);
    timers.current.done = setTimeout(() => {
      startedAt.current = 0;
      stop();
    }, Math.max(0, MIN_MS - (Date.now() - startedAt.current)));
  }, [pathname, search]);

  useEffect(() => {
    const begin = () => {
      clearTimeout(timers.current.done);
      clearTimeout(timers.current.max);
      startedAt.current = Date.now();
      setShow(true);
      timers.current.max = setTimeout(() => {
        startedAt.current = 0;
        stop();
      }, MAX_MS);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // หน้าเดิม/แค่ hash
      begin();
    };
    // กดย้อนกลับ/ไปข้างหน้า: ถ้า URL ต่างจากหน้าปัจจุบันของแอปถือว่ากำลังเปลี่ยนหน้า
    const onPop = () => {
      if (location.pathname + location.search !== current.current) begin();
    };
    const noop = () => {}; // iOS WebView ต้องมี touch listener ถึงจะเปิดใช้ :active
    document.addEventListener("click", onClick, true); // capture: <Link> ของ Next เรียก preventDefault() ก่อน bubble ถึง document
    document.addEventListener("touchstart", noop, { passive: true });
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("touchstart", noop);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  return show ? <LoadingOverlay /> : null;
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationOverlay />
    </Suspense>
  );
}
