import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpFromLine, Crown, Gift, RefreshCw } from "lucide-react";
import { requireUser } from "@/lib/session";
import { formatBaht } from "@/lib/utils";
import { GameLauncher } from "./game-grid";

export const metadata: Metadata = { title: "ทางเข้าเล่น" };

export default async function PlayPage() {
  const user = await requireUser("/play");
  const [baht, satang] = formatBaht(user.balance).split(".");
  return (
    <div className="flex flex-col gap-[18px]">
      <section className="rounded-2xl bg-brand p-[1.5px] shadow-glow-lg" aria-label="ยอดเงิน">
        <div className="relative flex flex-col gap-3.5 overflow-hidden rounded-[26.5px] bg-card p-[18px]">
          <Crown className="absolute -top-6 -right-5 size-[150px] fill-current text-accent" strokeWidth={0} aria-hidden />
          <div className="relative flex items-center gap-2 text-[13px] text-muted-foreground">
            ยอดเงินคงเหลือ
            <Link href="/play" aria-label="รีเฟรชยอดเงิน" className="text-primary"><RefreshCw className="size-4" /></Link>
          </div>
          <div className="relative text-[34px] leading-none font-bold text-primary">
            ฿{baht}<span className="text-xl text-muted-foreground">.{satang}</span>
          </div>
          <div className="relative grid grid-cols-3 gap-2">
            <Link href="/deposit" className="flex h-[46px] items-center justify-center gap-1.5 rounded-full bg-brand text-sm font-semibold text-primary-foreground"><ArrowDownToLine className="size-[18px]" />ฝาก</Link>
            <Link href="/withdraw" className="flex h-[46px] items-center justify-center gap-1.5 rounded-full border border-border bg-secondary text-sm"><ArrowUpFromLine className="size-[18px]" />ถอน</Link>
            <Link href="/promotions" className="flex h-[46px] items-center justify-center gap-1.5 rounded-full border border-border bg-secondary text-sm"><Gift className="size-[18px]" />โปรฯ</Link>
          </div>
        </div>
      </section>
      <GameLauncher />
    </div>
  );
}
