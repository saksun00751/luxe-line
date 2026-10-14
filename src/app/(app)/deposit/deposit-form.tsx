"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Info, Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createPaymentAction, selectDepositAction } from "@/app/actions/wallet";
import { CopyButton } from "@/components/copy-button";
import { AmountPicker } from "@/components/form/amount-picker";
import { FormAlert } from "@/components/form/form-alert";
import { LoadingOverlay } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bankColor } from "@/config/banks";
import type { DepositMethod, DepositMethodId, DepositSelection } from "@/lib/api/types";

const LABEL: Record<DepositMethodId, string> = { bank: "โอนผ่านธนาคาร", tw: "TrueMoney", payment: "ชำระออนไลน์", slip: "โอน + สลิป" };
const HINT: Record<DepositMethodId, string> = {
  bank: "โอนเข้าบัญชีด้านล่าง ระบบจะตรวจสอบและเติมเครดิตให้ หากยอดไม่เข้า กรุณาติดต่อพนักงานทาง LINE",
  tw: "โอนเข้าบัญชี TrueMoney ด้านล่าง ระบบจะตรวจสอบและเติมเครดิตให้",
  payment: "ระบุยอดที่ต้องการฝาก แล้วระบบจะพาไปหน้าชำระเงิน",
  slip: "โอนเข้าบัญชีด้านล่าง แล้วส่งสลิปให้พนักงานทางแชท LINE",
};

const fmtAcc = (a = "") => a.replace(/\D/g, "").replace(/^(\d{3})(\d)(\d{5})(\d+)$/, "$1-$2-$3-$4");
const baht = (n: number) => n.toLocaleString("th-TH");

export function DepositForm({ methods }: { methods: DepositMethod[] }) {
  const [method, setMethod] = useState<DepositMethodId | undefined>(methods[0]?.id);
  const [loaded, setLoaded] = useState<Partial<Record<DepositMethodId, DepositSelection>>>({});
  const [error, setError] = useState<string>();
  const [loading, startLoad] = useTransition();
  const requested = useRef(new Set<string>());

  // โหลดบัญชีรับฝาก/ตัวเลือกชำระเงินของช่องทางที่เลือก (ครั้งเดียวต่อช่องทาง)
  useEffect(() => {
    if (!method || requested.current.has(method)) return;
    requested.current.add(method);
    startLoad(async () => {
      const r = await selectDepositAction(method);
      if (r.data) setLoaded((l) => ({ ...l, [method]: r.data }));
      else {
        requested.current.delete(method);
        setError(r.message ?? "โหลดข้อมูลไม่สำเร็จ");
      }
    });
  }, [method]);

  if (!methods.length) {
    return <p className="rounded-xl border border-border bg-card py-10 text-center text-sm text-muted-foreground">ยังไม่มีช่องทางฝากที่เปิดให้บริการ กรุณาติดต่อพนักงาน</p>;
  }
  const data = method ? loaded[method] : undefined;

  return (
    <Tabs value={method} onValueChange={(v) => { setError(undefined); setMethod(v as DepositMethodId); }}>
      <TabsList>
        {methods.map((m) => (
          <TabsTrigger key={m.id} value={m.id}>{LABEL[m.id]}</TabsTrigger>
        ))}
      </TabsList>
      {methods.map((m) => (
        <TabsContent key={m.id} value={m.id} className="mt-4 flex flex-col gap-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" /> {HINT[m.id]}
          </div>
          <FormAlert message={m.id === method ? error : undefined} />
          {m.id === method && !loaded[m.id] && loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> กำลังโหลด…</div>
          )}
          {m.id === method && data && (m.id === "payment" ? <PaymentPanel data={data} /> : <AccountList data={data} />)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function AccountList({ data }: { data: DepositSelection }) {
  if (!data.accounts.length) return <p className="py-6 text-center text-sm text-muted-foreground">ไม่มีบัญชีรับฝากในขณะนี้</p>;
  return (
    <>
      {data.accounts.map((a) => (
        <div key={a.code} className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {a.bankImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.bankImageUrl} alt="" className="size-12 shrink-0 rounded-md object-contain" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md text-white" style={{ background: bankColor(a.shortcode) }}>
                <Landmark className="size-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">บัญชีรับเงิน · {a.bankName}</div>
              <div className="truncate text-[15px] font-semibold">{a.accName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-md bg-secondary px-3.5 py-3">
            <div className="flex-1 text-[22px] font-semibold tracking-[.06em] text-primary">{fmtAcc(a.accNo)}</div>
            <CopyButton value={a.accNo} />
          </div>
          {a.qrImageUrl && (
            <div className="flex justify-center rounded-xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.qrImageUrl} alt="QR สำหรับโอนเงิน" className="size-[180px] object-contain" />
            </div>
          )}
          {a.depositMin > 0 && <div className="text-xs text-muted-foreground">ฝากขั้นต่ำ ฿{baht(a.depositMin)}</div>}
          {a.remark && <div className="text-xs text-muted-foreground">{a.remark}</div>}
        </div>
      ))}
    </>
  );
}

function PaymentPanel({ data }: { data: DepositSelection }) {
  const min = data.options.length ? Math.min(...data.options.map((o) => o.minDeposit)) : 0;
  const [amount, setAmount] = useState("500");
  // Idempotency key: คงที่ตลอดการลองซ้ำยอดเดิม (กันสร้างออเดอร์ซ้ำ) — เปลี่ยนเมื่อแก้ยอด
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [msg, setMsg] = useState<{ message?: string; amount?: string }>();
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      setMsg(undefined);
      const r = await createPaymentAction(Number(amount), key);
      // URL ชำระเงินมี token — redirect ทันที ห้าม log หรือเก็บไว้
      if (r.url) {
        toast.success("กำลังพาไปหน้าชำระเงิน…");
        window.location.href = r.url;
      } else setMsg({ message: r.message, amount: r.fieldErrors?.amount });
    });

  return (
    <div className="flex flex-col gap-4">
      {pending && <LoadingOverlay label="กำลังสร้างรายการ" />}
      <AmountPicker label="จำนวนเงินที่ฝาก" value={amount} onChange={(v) => { setAmount(v); setKey(crypto.randomUUID()); }} error={msg?.amount} />
      {min > 0 && <div className="-mt-2 pl-1 text-xs text-muted-foreground">ฝากขั้นต่ำ ฿{baht(min)}</div>}
      <FormAlert message={msg?.message} />
      <Button size="lg" onClick={submit} disabled={pending || !Number(amount)} aria-busy={pending}>
        {pending ? <><Loader2 className="animate-spin" /> กำลังสร้างรายการ…</> : `ชำระเงิน ฿${Number(amount || 0).toLocaleString("th-TH")}`}
      </Button>
    </div>
  );
}
