"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, Gamepad2, Gift, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; center?: boolean };

const MEMBER: Item[] = [
  { href: "/deposit", label: "ฝาก", icon: ArrowDownToLine },
  { href: "/withdraw", label: "ถอน", icon: ArrowUpFromLine },
  { href: "/play", label: "เข้าเล่น", icon: Gamepad2, center: true },
  { href: "/promotions", label: "โปรฯ", icon: Gift },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

export function BottomNav({ authed }: { authed: boolean }) {
  const path = usePathname();
  // ไฮไลต์ปุ่มที่เพิ่งกดทันที ไม่รอหน้าใหม่โหลด — ให้รู้ว่ากดโดนแล้ว
  const [tapped, setTapped] = useState<string>();
  useEffect(() => setTapped(undefined), [path]);
  if (!authed) return null; // ยังไม่ล็อกอิน: ไม่แสดงเมนูล่าง
  return (
    <nav aria-label="เมนูหลัก" className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-end rounded-t-[28px] border-t border-border bg-card px-2.5 pt-2 pb-safe">
      {MEMBER.map(({ href, label, icon: Icon, center }) => {
        const cur = tapped ?? path;
        const active = cur === href || cur.startsWith(href + "/");
        if (center)
          return (
            <Link key={href} href={href} onClick={() => setTapped(href)} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-1 flex-col items-center gap-1 text-[11px] font-semibold", active ? "text-primary" : "text-muted-foreground")}>
              <span className="-mt-[30px] flex size-[60px] items-center justify-center rounded-full border-4 border-card bg-brand text-primary-foreground shadow-glow">
                <Icon className="size-[26px]" strokeWidth={1.8} />
              </span>
              {label}
            </Link>
          );
        return (
          <Link key={href} href={href} onClick={() => setTapped(href)} aria-current={active ? "page" : undefined} className={cn("flex min-w-0 flex-1 flex-col items-center gap-1 py-1.5 text-[11px]", active ? "font-semibold text-primary" : "text-muted-foreground")}>
            <span className={cn("flex h-8 w-12 items-center justify-center rounded-full transition-colors", active && "bg-accent")}>
              <Icon className="size-[22px]" strokeWidth={1.8} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
