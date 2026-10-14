import { LoadingOverlay } from "@/components/loading-overlay";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="กำลังโหลด">
      <LoadingOverlay />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-44 rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-[22px]" />
        ))}
      </div>
    </div>
  );
}
