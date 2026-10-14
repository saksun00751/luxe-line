import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Crown, Headset, History, Landmark, Lock } from "lucide-react";
import { LogoutButton } from "./logout-button";
import { site } from "@/config/site";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { formatBaht, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "โปรไฟล์" };

const rowCls = "flex min-h-14 w-full cursor-pointer items-center gap-3.5 border-t border-border px-4 text-left text-[15px] first:border-t-0";
const Ico = ({ children }: { children: React.ReactNode }) => (
  <span className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-accent text-primary [&_svg]:size-[18px]">{children}</span>
);

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const bal = await api.balance().catch(() => null); // เทิร์นโอเวอร์ — ถ้าอ่านไม่ได้ก็ไม่ให้หน้าพัง
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 py-1.5 text-center">
        <div className="size-[92px] rounded-full bg-brand p-[3px]">
          <div className="flex size-full items-center justify-center rounded-full bg-secondary text-[32px] font-semibold text-primary uppercase">{(user.name || user.username)[0]}</div>
        </div>
        <h1 className="text-xl font-semibold">{user.name || user.username}</h1>
        <span className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs text-primary">
          <Crown className="size-3 fill-current" /> {user.username} · สมาชิกตั้งแต่ {formatDate(user.registeredOn)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-[22px] border border-border bg-card p-3.5">
          <div className="text-xs text-muted-foreground">ยอดเงิน</div>
          <div className="text-xl font-bold text-primary">฿{formatBaht(user.balance, 0)}</div>
        </div>
        <div className="rounded-[22px] border border-border bg-card p-3.5">
          <div className="text-xs text-muted-foreground">เทิร์นคงเหลือ</div>
          <div className="text-xl font-bold">{bal ? `฿${formatBaht(bal.turnoverRemaining, 0)}` : "-"}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
        <Ico><Landmark /></Ico>
        <div className="min-w-0 flex-1 text-sm">
          <div className="font-semibold">{user.bankName} · {user.accountMasked}</div>
          <div className="truncate text-xs text-muted-foreground">{user.name}</div>
        </div>
      </div>

      <nav className="overflow-hidden rounded-xl border border-border bg-card" aria-label="เมนูบัญชี">
        <Link href="/profile/history" className={rowCls}><Ico><History /></Ico><span className="flex-1">ประวัติฝาก-ถอน</span><ChevronRight className="size-[18px] text-muted-foreground" /></Link>
        <Link href="/profile/password" className={rowCls}><Ico><Lock /></Ico><span className="flex-1">เปลี่ยนรหัสผ่าน</span><ChevronRight className="size-[18px] text-muted-foreground" /></Link>
        <Link href="/contact" className={rowCls}><Ico><Headset /></Ico><span className="flex-1">ติดต่อพนักงาน</span><ChevronRight className="size-[18px] text-muted-foreground" /></Link>
      </nav>

      <LogoutButton />
    </div>
  );
}
