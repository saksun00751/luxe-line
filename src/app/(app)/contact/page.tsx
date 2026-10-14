import type { Metadata } from "next";
import { Clock, Globe, Headset, Mail, MessageCircle, Phone, Send, type LucideIcon } from "lucide-react";
import { PageTitle } from "@/components/page-title";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { api, type ContactChannel } from "@/lib/api";

export const metadata: Metadata = { title: "ติดต่อพนักงาน" };

const FAQS = [
  { q: "ฝากเงินแล้วยอดไม่เข้า ทำอย่างไร?", a: "ส่งสลิปพร้อมชื่อผู้ใช้ให้พนักงานทาง LINE เพื่อตรวจสอบรายการ" },
  { q: "ลืมรหัสผ่าน ต้องทำอย่างไร?", a: "ติดต่อพนักงาน แล้วยืนยันเบอร์โทรและบัญชีธนาคารที่ใช้สมัคร" },
  { q: "ถอนเงินใช้เวลานานเท่าไร?", a: "โดยปกติภายในไม่กี่นาทีหลังยืนยันรายการ หากเกิน 15 นาทีกรุณาติดต่อพนักงาน" },
];

const ICONS: Record<string, LucideIcon> = { line: MessageCircle, telegram: Send, phone: Phone, tel: Phone, email: Mail };

/** อนุญาตเฉพาะลิงก์ที่ปลอดภัย (กัน javascript: จากข้อมูลที่กรอกใน Admin) */
const safeHref = (l: string) => (/^(https?:\/\/|tel:|mailto:)/i.test(l) ? l : /^\+?[\d\s-]{8,}$/.test(l) ? `tel:${l.replace(/[^\d+]/g, "")}` : null);

/** ดึงจาก Admin เท่านั้น (เรียงตาม sort) — ถ้าไม่มี/เรียกไม่ได้ จะแสดงว่ายังไม่มีช่องทาง */
async function loadChannels(): Promise<ContactChannel[]> {
  const list = await api.contactChannels().catch(() => []);
  return list.filter((c) => safeHref(c.link));
}

export default async function ContactPage() {
  const channels = await loadChannels();
  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="ติดต่อพนักงาน" subtitle="ทีมงานพร้อมช่วยเหลือเรื่องฝาก ถอน และบัญชี" />
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center">
        <div className="flex size-[72px] items-center justify-center rounded-full bg-accent text-primary shadow-[0_0_0_8px_var(--accent)]">
          <Headset className="size-[34px]" strokeWidth={1.6} />
        </div>
        <div className="text-lg font-semibold">แชทกับพนักงาน</div>
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><Clock className="size-3.5" /> เวลาทำการ {site.contactHours}</div>
        <div className="flex w-full flex-col gap-2.5">
          {channels.length === 0 && <p className="py-2 text-sm text-muted-foreground">ยังไม่มีช่องทางติดต่อในขณะนี้ กรุณาลองใหม่ภายหลัง</p>}
          {channels.map((c) => {
            const Icon = ICONS[c.type] ?? Globe;
            const external = /^https?:/i.test(c.link);
            return (
              <Button key={c.code} asChild variant={c.type === "line" ? "line" : "secondary"} size="lg">
                <a href={safeHref(c.link)!} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <Icon className={c.type === "line" ? "fill-current" : undefined} /> {c.label}
                </a>
              </Button>
            );
          })}
        </div>
      </div>
      <h2 className="mt-1 text-[15px] font-semibold">คำถามที่พบบ่อย</h2>
      <Accordion type="single" collapsible defaultValue="0" className="flex flex-col gap-2.5">
        {FAQS.map((f, i) => (
          <AccordionItem key={i} value={String(i)}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
