import { LoadingOverlay } from "@/components/loading-overlay";
import { Skeleton } from "@/components/ui/skeleton";

/** โครงเดียวกับหน้า login (โลโก้ + ข้อความ + การ์ดปุ่ม LINE) ไม่ใช้ skeleton หน้าเล่นของ (app)/loading.tsx */
export default function Loading() {
  return (
    <div className="flex flex-col gap-[18px]" aria-busy="true" aria-label="กำลังโหลด">
      <LoadingOverlay />
      <div className="flex flex-col items-center gap-3 pt-2">
        <Skeleton className="size-20 rounded-full" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-12 rounded-full" />
      </div>
    </div>
  );
}
