"use client";

import { useActionState, useEffect, useState } from "react";
import { Info, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { withdrawAction } from "@/app/actions/wallet";
import { AmountPicker } from "@/components/form/amount-picker";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import type { WithdrawInfo } from "@/lib/api/types";
import type { FormState } from "@/lib/validation";

const baht = (n: number) => n.toLocaleString("th-TH");

export function WithdrawForm({ info }: { info: WithdrawInfo }) {
  const [amount, setAmount] = useState("");
  // Idempotency key: คงที่ตลอดการลองส่งยอดเดิมซ้ำ (กันหักซ้ำ) — เปลี่ยนเมื่อแก้ยอดหรือส่งสำเร็จแล้ว
  const [idemKey, setIdemKey] = useState(() => crypto.randomUUID());
  const [state, action] = useActionState<FormState, FormData>(withdrawAction, {});
  const blocked = info.pending || info.balance < info.min || info.dailyRemaining < info.min;

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message);
      setAmount("");
      setIdemKey(crypto.randomUUID());
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="idemKey" value={idemKey} />
      <AmountPicker
        label="จำนวนเงินที่ถอน"
        value={amount}
        onChange={(v) => {
          setAmount(v);
          setIdemKey(crypto.randomUUID());
        }}
        error={state.fieldErrors?.amount}
        max={Math.min(info.balance, info.dailyRemaining)}
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0" />
        ถอนขั้นต่ำ ฿{baht(info.min)} · ถอนได้อีก ฿{baht(info.dailyRemaining)} จากวงเงินวันละ ฿{baht(info.dailyLimit)} (เฉพาะจำนวนเต็มบาท)
      </div>
      {info.pending && (
        <div className="flex items-start gap-2 rounded-md bg-warning/12 px-4 py-3 text-sm text-warning">
          <TriangleAlert className="mt-0.5 size-[18px] shrink-0" /> มีรายการถอนที่กำลังดำเนินการอยู่ กรุณารอให้เสร็จก่อนทำรายการใหม่
        </div>
      )}
      {info.turnoverPending && !info.pending && (
        <div className="flex items-start gap-2 rounded-md bg-warning/12 px-4 py-3 text-sm text-warning">
          <TriangleAlert className="mt-0.5 size-[18px] shrink-0" /> ยังมียอดเทิร์นโอเวอร์ค้างอยู่ ระบบจะตรวจสอบอีกครั้งตอนกดถอน
        </div>
      )}
      {!state.ok && <FormAlert message={state.message} />}
      <SubmitButton disabled={blocked} pendingText="กำลังส่งคำขอ…">
        ยืนยันการถอน{amount ? ` ฿${Number(amount).toLocaleString("th-TH")}` : ""}
      </SubmitButton>
    </form>
  );
}
