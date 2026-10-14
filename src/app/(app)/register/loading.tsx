import { Skeleton } from "@/components/ui/skeleton";

/** โครงเดียวกับหน้าสมัคร (หัวข้อ + การ์ด LINE + ช่องกรอก) */
export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="กำลังโหลด">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-[66px]" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12" />
      ))}
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
