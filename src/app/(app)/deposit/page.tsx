import type { Metadata } from "next";
import Link from "next/link";
import { Gift } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { api } from "@/lib/api";
import { guard, requireUser } from "@/lib/session";
import { DepositForm } from "./deposit-form";

export const metadata: Metadata = { title: "ฝากเงิน" };

export default async function DepositPage() {
  await requireUser("/deposit");
  const [methods, promos] = await guard(Promise.all([api.depositChannels(), api.promotions().catch(() => null)]), "/deposit");
  const picked = promos?.items.find((p) => p.code === promos.selected);
  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="ฝากเงิน" subtitle="เลือกช่องทางฝาก แล้วทำตามขั้นตอนด้านล่าง" />
      {promos?.selectionEnabled && (
        <Link href="/promotions" className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <Gift className="size-[18px] shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate">{picked ? <>โปรที่เลือก: <b>{picked.title}</b></> : "ยังไม่ได้เลือกโปรโมชั่น"}</span>
          <span className="shrink-0 text-xs text-primary">{picked ? "เปลี่ยน" : "เลือกโปร"}</span>
        </Link>
      )}
      <DepositForm methods={methods.filter((m) => m.available)} />
    </div>
  );
}
