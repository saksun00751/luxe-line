"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Gift } from "lucide-react";
import { toast } from "sonner";
import { deselectPromotionAction, selectPromotionAction } from "@/app/actions/wallet";
import { LoadingOverlay } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import type { Promotion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export function PromoCard({ promo, selectionEnabled }: { promo: Promotion; selectionEnabled: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {pending && <LoadingOverlay />}
      {/* รูปแสดงเต็มกรอบตามสัดส่วนจริง (ไม่ครอป) — ป้ายอยู่มุมรูปพื้นทึบ ส่วนชื่ออยู่ใต้รูปเพื่อให้อ่านชัด */}
      <div className="relative">
        {promo.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={promo.imageUrl} alt={promo.title} loading="lazy" className="block h-auto w-full" />
        ) : (
          <div className="flex h-[132px] items-center justify-center bg-brand text-primary-foreground">
            <Gift className="size-14 opacity-60" strokeWidth={1.5} aria-hidden />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {promo.selected && <span className="rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-white shadow">✓ เลือกแล้ว</span>}
          <span className="rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-sm">{promo.tag}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <h2 className="text-[17px] leading-snug font-semibold text-foreground">{promo.title}</h2>
        {promo.condition && (
          <div className="flex flex-wrap gap-1.5">
            {promo.condition.split(" · ").map((c) => (
              <span key={c} className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">{c}</span>
            ))}
          </div>
        )}
      {promo.descriptionHtml && <Details html={promo.descriptionHtml} />}
        {promo.selected ? (
          <Button
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deselectPromotionAction();
                if (r.ok) {
                  toast.success(r.message);
                  router.refresh();
                } else toast.error(r.message);
              })
            }
          >
            {pending ? "กำลังยกเลิก…" : "ยกเลิก"}
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={pending || !promo.canSelect || !selectionEnabled}
            onClick={() =>
              start(async () => {
                const r = await selectPromotionAction(promo.code);
                if (r.ok) {
                  toast.success(r.message);
                  router.push("/deposit");
                } else toast.error(r.message);
              })
            }
          >
            {pending ? "กำลังเลือก…" : promo.canSelect ? "เลือกโปรนี้" : "ไม่เข้าเงื่อนไข"}
          </Button>
        )}
      </div>
    </article>
  );
}

const PROSE =
  "text-sm leading-relaxed text-foreground/80 break-words [&_a]:text-primary [&_a]:underline [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-1.5 [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-1 [&_th]:border [&_th]:border-border [&_th]:p-1 [&_ul]:list-disc [&_ul]:pl-5";

/** รายละเอียด (HTML ที่ sanitize แล้วฝั่ง server — src/lib/html.ts) ย่อไว้ก่อน กดเพื่อขยาย/ย่อ; ถ้าสั้นอยู่แล้วไม่แสดงปุ่ม */
function Details({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (el) setLong(el.scrollHeight > 96 + 8); // เกิน ~4 บรรทัด
  }, [html]);
  return (
    <div>
      <div className="relative">
        <div
          ref={ref}
          className={cn(PROSE, "overflow-hidden transition-[max-height] duration-300", !open && "max-h-24")}
          style={open ? { maxHeight: ref.current?.scrollHeight } : undefined}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {long && !open && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" />}
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-1.5 flex cursor-pointer items-center gap-1 text-[13px] font-medium text-primary"
        >
          {open ? "ย่อรายละเอียด" : "ดูรายละเอียดทั้งหมด"}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      )}
    </div>
  );
}
