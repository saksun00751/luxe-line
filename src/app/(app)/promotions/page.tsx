import type { Metadata } from "next";
import { PageTitle } from "@/components/page-title";
import { api } from "@/lib/api";
import { guard, requireUser } from "@/lib/session";
import { PromoCard } from "./promo-card";

export const metadata: Metadata = { title: "โปรโมชั่น" };

export default async function PromotionsPage() {
  await requireUser("/promotions");
  const { items, selectionEnabled } = await guard(api.promotions(), "/promotions");
  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="โปรโมชั่น" subtitle="เลือกโปรก่อนฝาก ระบบจะให้สิทธิ์เมื่อฝากครั้งถัดไป" />
      {!selectionEnabled && <p className="rounded-xl border border-border bg-card px-4 py-3 text-[13px] text-muted-foreground">ขณะนี้ปิดรับการเลือกโปรโมชั่น</p>}
      {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีโปรโมชั่นในขณะนี้</p>}
      {items.map((p) => (
        <PromoCard key={p.code} promo={p} selectionEnabled={selectionEnabled} />
      ))}
    </div>
  );
}
