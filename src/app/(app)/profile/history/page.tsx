import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { guard } from "@/lib/session";
import { cn, formatBaht, formatDateTH } from "@/lib/utils";

export const metadata: Metadata = { title: "ประวัติฝาก-ถอน" };

const TYPE = { deposit: ["ฝาก", ArrowDownToLine], withdraw: ["ถอน", ArrowUpFromLine] } as const;
const STATUS = { pending: ["รอดำเนินการ", "warning"], success: ["สำเร็จ", "success"], rejected: ["ไม่สำเร็จ", "destructive"] } as const;
const FILTERS = [
  { v: undefined, l: "ทั้งหมด" },
  { v: "deposit", l: "ฝาก" },
  { v: "withdraw", l: "ถอน" },
] as const;

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const t = type === "deposit" || type === "withdraw" ? type : undefined;
  const kinds: ("deposit" | "withdraw")[] = t ? [t] : ["deposit", "withdraw"];
  const tx = (await guard(Promise.all(kinds.map((k) => api.transactions(k, 30))), "/profile/history"))
    .flat()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link href="/profile" aria-label="ย้อนกลับ" className="flex size-10 items-center justify-center rounded-full border border-border bg-card"><ChevronLeft className="size-5" /></Link>
        <h1 className="text-[22px] font-semibold">ประวัติฝาก-ถอน</h1>
      </div>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Link key={f.l} href={f.v ? `?type=${f.v}` : "?"} className={cn("h-10 rounded-full border px-4 text-sm leading-10", t === f.v ? "border-transparent bg-brand text-primary-foreground" : "border-border bg-card")}>{f.l}</Link>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card px-4">
        {tx.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">ยังไม่มีรายการ</p>}
        {tx.map((x) => {
          const [label, Icon] = TYPE[x.type];
          const [st, variant] = STATUS[x.status];
          return (
            <div key={x.id} className="flex items-center gap-3 border-t border-border py-3 first:border-t-0">
              <span className="flex size-[38px] items-center justify-center rounded-full bg-accent text-primary"><Icon className="size-[18px]" /></span>
              <div className="flex-1">
                <div className="text-sm font-medium">{label} ฿{formatBaht(x.amount)}{x.bonus ? <span className="text-xs font-normal text-muted-foreground"> · โบนัส ฿{formatBaht(x.bonus)}</span> : null}</div>
                <div className="text-xs text-muted-foreground">{formatDateTH(x.createdAt)}</div>
              </div>
              <Badge variant={variant}>{st}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
