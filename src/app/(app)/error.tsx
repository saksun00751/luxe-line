"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="text-lg font-semibold">เกิดข้อผิดพลาด</div>
      <p className="text-sm text-muted-foreground">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>
      <Button onClick={reset}>ลองใหม่</Button>
    </div>
  );
}
