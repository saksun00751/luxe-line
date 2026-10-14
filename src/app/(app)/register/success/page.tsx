import type { Metadata } from "next";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { memberDest, site } from "@/config/site";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { BackToLine } from "./back-to-line";

export const metadata: Metadata = { title: "สมัครสำเร็จ" };

export default async function RegisterSuccess({ searchParams }: { searchParams: Promise<{ line?: string }> }) {
  const user = await requireUser("/register/success");
  const sent = (await searchParams).line === "1";
  const rows: [string, string][] = [
    ["ชื่อผู้ใช้", user.username],
    ["เบอร์โทร", user.phoneMasked],
    ["ธนาคาร", user.bankName],
    ["เลขบัญชี", user.accountMasked],
    ["ชื่อบัญชี", user.name],
    ["วันที่สมัคร", formatDate(user.registeredOn)],
  ];
  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col items-center gap-2.5 pt-1.5 text-center">
        <div className="flex size-[76px] items-center justify-center rounded-full bg-brand text-primary-foreground shadow-glow-lg">
          <Check className="size-[38px]" strokeWidth={2} />
        </div>
        <h1 className="mt-1.5 text-2xl font-semibold">สมัครสมาชิกสำเร็จ</h1>
        <p className="max-w-[290px] text-sm leading-relaxed text-muted-foreground">
          {sent ? "ระบบส่งข้อมูลการสมัครไปที่แชท LINE OA ของคุณแล้ว เก็บไว้เป็นหลักฐานได้เลย" : "เก็บข้อมูลด้านล่างไว้เป็นหลักฐาน (เปิดผ่าน LINE เพื่อรับข้อมูลทางแชท)"}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand text-primary-foreground"><Crown className="size-4" /></span>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">{site.name} · LINE OA</div>
            <div className="text-[11px] text-muted-foreground">{sent ? "ข้อความที่ส่งเข้าแชท" : "สรุปข้อมูลการสมัคร"}</div>
          </div>
          {sent && <span className="flex items-center gap-1 text-[11px] text-line"><Check className="size-3.5" /> ส่งแล้ว</span>}
        </div>
        <div className="flex items-start gap-2 bg-[#8CABD9] p-4">
          <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#1A1306] text-[#E7BF55]"><Crown className="size-3.5" /></span>
          <div className="w-full max-w-[260px] overflow-hidden rounded-[18px] bg-white shadow-sm">
            <div className="bg-brand px-3.5 py-3 text-primary-foreground">
              <div className="text-[11px] opacity-80">ยืนยันการสมัคร</div>
              <div className="text-base font-bold">ยินดีต้อนรับสู่ {site.name}</div>
            </div>
            <dl className="flex flex-col gap-[7px] px-3.5 py-3">
              {rows.map(([k, val]) => (
                <div key={k} className="flex justify-between gap-3 text-xs">
                  <dt className="text-[#8A8F98]">{k}</dt>
                  <dd className="text-right font-semibold text-[#1A1D21]">{val}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <Button asChild size="lg"><a href={memberDest("/play")}>เริ่มเล่นเลย</a></Button>
      <BackToLine />
    </div>
  );
}
