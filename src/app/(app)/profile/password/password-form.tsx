"use client";

import { useActionState, useState } from "react";
import { KeyRound, Lock } from "lucide-react";
import { changePasswordAction } from "@/app/actions/auth";
import { PasswordField } from "@/components/form/field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import type { FormState } from "@/lib/validation";

export function PasswordForm() {
  const [state, action] = useActionState<FormState, FormData>(changePasswordAction, {});
  const fe = state.fieldErrors ?? {};
  // controlled — กันฟอร์มถูกรีเซ็ตหลัง action เมื่อ validate ไม่ผ่าน
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [doneKey, setDoneKey] = useState<FormState>();
  if (state.ok && doneKey !== state) {
    setDoneKey(state);
    setCurrent("");
    setNext("");
    setConfirm("");
  }
  return (
    <form action={action} className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5" noValidate>
      <FormAlert message={state.message} ok={state.ok} />
      <PasswordField label="รหัสผ่านปัจจุบัน" icon={Lock} name="current_password" autoComplete="current-password" placeholder="กรอกรหัสผ่านปัจจุบัน" value={current} onChange={(e) => setCurrent(e.target.value)} error={fe.current_password} />
      <PasswordField label="รหัสผ่านใหม่" icon={KeyRound} name="password" autoComplete="new-password" placeholder="อย่างน้อย 8 ตัวอักษร" value={next} onChange={(e) => setNext(e.target.value)} error={fe.password} />
      <PasswordField label="ยืนยันรหัสผ่านใหม่" icon={KeyRound} name="password_confirmation" autoComplete="new-password" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={fe.password_confirmation} />
      <SubmitButton pendingText="กำลังบันทึก…">เปลี่ยนรหัสผ่าน</SubmitButton>
    </form>
  );
}
