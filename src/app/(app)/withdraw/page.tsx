import type { Metadata } from "next";
import { ArrowUpFromLine, Landmark, ShieldCheck } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { guard, requireUser } from "@/lib/session";
import { formatBaht, formatDateTH } from "@/lib/utils";
import { WithdrawForm } from "./withdraw-form";

export const metadata: Metadata = { title: "ถอนเงิน" };

const STATUS = { pending: ["กำลังโอน", "warning"], success: ["สำเร็จ", "success"], rejected: ["ไม่สำเร็จ", "destructive"] } as const;

export default async function WithdrawPage() {
  const user = await requireUser("/withdraw");
  const [info, tx] = await guard(Promise.all([api.withdrawEligibility(), api.transactions("withdraw", 5)]), "/withdraw");
  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="ถอนเงิน" subtitle="โอนเข้าบัญชีที่ลงทะเบียนไว้เท่านั้น" />
      <section className="relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-border bg-card p-[18px]">
        <div className="absolute -top-6 -right-6 size-[120px] rounded-full bg-accent" />
        <div className="text-[13px] text-muted-foreground">ยอดที่ถอนได้</div>
        <div className="relative text-[32px] font-bold text-primary">฿{formatBaht(info.balance)}</div>
        <div className="mt-2 flex items-center gap-2.5 rounded-md bg-secondary px-3 py-2.5">
          <Landmark className="size-5 text-primary" />
          <div className="flex-1 text-[13px]">
            <div className="font-semibold">{user.bankName} · {info.bankAccountMasked || user.accountMasked}</div>
            <div className="text-xs text-muted-foreground">{user.name}</div>
          </div>
          <ShieldCheck className="size-[18px] text-success" aria-label="บัญชียืนยันแล้ว" />
        </div>
      </section>

      <WithdrawForm info={info} />

      <section className="rounded-xl border border-border bg-card px-4 pb-1">
        <h2 className="py-3 text-sm font-semibold">รายการล่าสุด</h2>
        {tx.length === 0 && <p className="border-t border-border py-4 text-center text-[13px] text-muted-foreground">ยังไม่มีรายการ</p>}
        {tx.map((t) => {
          const [label, variant] = STATUS[t.status];
          return (
            <div key={t.id} className="flex items-center gap-3 border-t border-border py-3">
              <span className="flex size-[38px] items-center justify-center rounded-full bg-accent text-primary"><ArrowUpFromLine className="size-[18px]" /></span>
              <div className="flex-1">
                <div className="text-sm font-medium">฿{formatBaht(t.amount)}</div>
                <div className="text-xs text-muted-foreground">{formatDateTH(t.createdAt)}</div>
              </div>
              <Badge variant={variant}>{label}</Badge>
            </div>
          );
        })}
      </section>
    </div>
  );
}
