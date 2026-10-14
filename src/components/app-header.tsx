import Link from "next/link";
import { Wallet } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { formatBaht } from "@/lib/utils";

export function AppHeader({ balance }: { balance: number | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center gap-2.5 border-b border-border bg-background/90 px-5 backdrop-blur-md">
      <BrandLogo href={balance !== null ? "/play" : "/login"} />
      {balance !== null && (
        <Link
          href="/deposit"
          className="flex h-[38px] items-center gap-2 rounded-full border border-border bg-card pr-1.5 pl-3 text-sm font-semibold"
          aria-label={`ยอดเงิน ${formatBaht(balance, 0)} บาท ฝากเงิน`}
        >
          <Wallet className="size-4 text-primary" />฿{formatBaht(balance, 0)}
          <span className="flex size-[26px] items-center justify-center rounded-full bg-brand text-base leading-none text-primary-foreground">+</span>
        </Link>
      )}
    </header>
  );
}
