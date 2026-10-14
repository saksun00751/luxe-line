"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Landmark, Lock, Phone, ScanSearch, User, Wallet } from "lucide-react";
import { lookupBankNameAction, registerAction } from "@/app/actions/auth";
import { BankSelect, Field, PasswordField } from "@/components/form/field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { LineStatus, useLineConnect } from "@/components/line-status";
import { Button } from "@/components/ui/button";
import { memberDest } from "@/config/site";
import type { Bank } from "@/lib/api/types";
import type { FormState } from "@/lib/validation";

export function RegisterForm({ banks, marketing }: { banks: Bank[]; marketing: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(registerAction, {});
  const { connected, connect, canSwitch, idToken, accountExists, checking, checkError, ready } = useLineConnect();
  const formRef = useRef<HTMLFormElement>(null);
  // ทุกช่องเป็น controlled — React 19 รีเซ็ตฟอร์มหลัง action ทุกครั้ง ถ้าไม่ควบคุมค่า ข้อมูลที่กรอกไว้จะหายแม้ validate ไม่ผ่าน
  const [f, setF] = useState({ user_name: "", bank: "", acc_no: "", firstname: "", lastname: "", password: "", password_confirmation: "", accept: false });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: k === "accept" ? e.target.checked : e.target.value }));
  const [hint, setHint] = useState<{ text: string; ok: boolean }>();
  const [looking, startLookup] = useTransition();
  const fe = state.fieldErrors ?? {};

  // ตรวจชื่อเจ้าของบัญชีจากธนาคาร แล้วเติมชื่อ-นามสกุลให้ (backend จำกัด 4 ครั้ง/นาที จึงให้กดเอง)
  const lookup = () => {
    const fd = new FormData(formRef.current!);
    startLookup(async () => {
      const r = await lookupBankNameAction(idToken ?? "", Number(fd.get("bank")), String(fd.get("acc_no") ?? ""));
      if (!r.data) return setHint({ text: r.message ?? "ตรวจสอบชื่อบัญชีไม่สำเร็จ", ok: false });
      if (r.data.canPrefill) {
        setF((p) => ({ ...p, firstname: r.data!.firstname, lastname: r.data!.lastname }));
        setHint({ text: `ชื่อบัญชี: ${r.data.accountName}`, ok: true });
      } else setHint({ text: `ชื่อบัญชี: ${r.data.accountName} (กรุณากรอกชื่อ-นามสกุลเอง)`, ok: true });
    });
  };

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-3.5" noValidate>
      <LineStatus connected={connected} idToken={idToken} onConnect={connect} canSwitch={canSwitch} />
      {marketing && <input type="hidden" name="marketing" value={marketing} />}
      {accountExists && (
        <div role="alert" className="flex flex-col gap-2.5 rounded-xl border border-primary/40 bg-accent p-3.5 text-sm">
          <div className="font-semibold">LINE นี้มีบัญชีสมาชิกอยู่แล้ว</div>
          <p className="text-[13px] text-muted-foreground">ไม่สามารถสมัครซ้ำได้ กดเข้าสู่ระบบ หรือเปลี่ยนไปใช้บัญชี LINE อื่นเพื่อสมัครใหม่</p>
          <Button asChild variant="default" size="sm"><a href={memberDest("/play")}>เข้าสู่ระบบ</a></Button>
        </div>
      )}
      {checking && <p className="pl-1 text-xs text-muted-foreground">กำลังตรวจสอบว่า LINE นี้มีบัญชีแล้วหรือไม่…</p>}
      <FormAlert message={checkError ?? state.message} />
      <Field label="เบอร์โทรศัพท์ 10 หลัก (ใช้เป็นชื่อผู้ใช้)" icon={Phone} name="user_name" type="tel" inputMode="numeric" autoComplete="tel" maxLength={10} placeholder="0812345678" value={f.user_name} onChange={set("user_name")} error={fe.user_name} />
      <BankSelect icon={Landmark} banks={banks} value={f.bank} onChange={(bank) => setF((p) => ({ ...p, bank }))} error={fe.bank} />
      <Field label="เลขบัญชีธนาคาร" icon={Wallet} name="acc_no" inputMode="numeric" maxLength={20} placeholder="เลขบัญชี 8–20 หลัก (ตัวเลขเท่านั้น)" value={f.acc_no} onChange={set("acc_no")} error={fe.acc_no} />
      <div className="-mt-1.5 flex items-center gap-2.5">
        <Button type="button" variant="outline" size="sm" disabled={looking} onClick={lookup}>
          <ScanSearch /> {looking ? "กำลังตรวจสอบ…" : "ตรวจสอบชื่อบัญชี"}
        </Button>
        {hint && <span className={`min-w-0 flex-1 text-xs ${hint.ok ? "text-success" : "text-destructive"}`}>{hint.text}</span>}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          label="ชื่อ"
          icon={User}
          name="firstname"
          autoComplete="given-name"
          maxLength={20}
          placeholder="ชื่อจริง"
          value={f.firstname}
          onChange={set("firstname")}
          error={fe.firstname}
        />
        <Field
          label="นามสกุล"
          icon={User}
          name="lastname"
          autoComplete="family-name"
          maxLength={20}
          placeholder="นามสกุล"
          value={f.lastname}
          onChange={set("lastname")}
          error={fe.lastname}
        />
      </div>
      <p className="-mt-1.5 pl-1 text-xs text-muted-foreground">ชื่อ-นามสกุลต้องตรงกับบัญชีธนาคาร (ไม่เกิน 20 ตัวอักษรต่อช่อง) เพื่อใช้ถอนเงิน</p>
      <PasswordField label="รหัสผ่าน" icon={Lock} name="password" autoComplete="new-password" minLength={8} maxLength={64} placeholder="8–64 ตัวอักษร" value={f.password} onChange={set("password")} error={fe.password} />
      <PasswordField label="ยืนยันรหัสผ่าน" icon={Lock} name="password_confirmation" autoComplete="new-password" maxLength={64} placeholder="กรอกรหัสผ่านอีกครั้ง" value={f.password_confirmation} onChange={set("password_confirmation")} error={fe.password_confirmation} />
      <label className="flex items-start gap-2.5 text-[13px] leading-normal text-muted-foreground">
        <input type="checkbox" name="accept" checked={f.accept} onChange={set("accept")} className="mt-0.5 size-[18px] shrink-0 accent-[var(--primary)]" />
        <span>
          ฉันยอมรับ <span className="text-primary">เงื่อนไขการใช้งาน</span> และยืนยันว่ามีอายุ 20 ปีขึ้นไป
        </span>
      </label>
      {fe.accept && <p className="-mt-2 pl-1 text-xs text-destructive">{fe.accept}</p>}
      <SubmitButton pendingText="กำลังสมัคร…" disabled={!ready}>สมัครสมาชิก</SubmitButton>
      <Link href="/login" className="p-2 text-center text-sm text-muted-foreground">
        มีบัญชีอยู่แล้ว? <span className="font-semibold text-primary">ผูกบัญชีเดิม</span>
      </Link>
    </form>
  );
}
