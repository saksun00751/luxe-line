"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, MessageCircle, User } from "lucide-react";
import { lineLoginAction, linkAction } from "@/app/actions/auth";
import { Field, PasswordField } from "@/components/form/field";
import { FormAlert } from "@/components/form/form-alert";
import { SubmitButton } from "@/components/form/submit-button";
import { useLiff } from "@/components/liff-provider";
import { Button } from "@/components/ui/button";
import { memberDest } from "@/config/site";
import type { FormState } from "@/lib/validation";

/** จดจำว่าผู้ใช้ออกจากระบบเอง → เปิดหน้า login ซ้ำ (เช่นจากเมนู LINE) ก็ไม่เข้าอัตโนมัติ จนกว่าจะกดเข้าสู่ระบบ */
export const LOGGED_OUT_KEY = "luxe-logged-out";

type Phase = "idle" | "checking" | "link" | "error";

/**
 * เข้าสู่ระบบด้วย LINE: LIFF ID token → backend
 *  - AUTHENTICATED → เข้าแอปทันที
 *  - LINK_REQUIRED → ล็อกอินด้วย user_name + password ของสมาชิกเดิม (ไม่มีสมัครใหม่)
 */
export function LoginForm({ next, loggedOut = false }: { next?: string; loggedOut?: boolean }) {
  const { ready, enabled, loggedIn, idToken, login, error: liffError } = useLiff();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState<string>();
  const [token, setToken] = useState<string>("");
  const started = useRef(false);
  // null = ยังไม่รู้ (รออ่าน localStorage) · true = ผู้ใช้เพิ่งออกจากระบบ ต้องกดเข้าเอง
  const [blocked, setBlocked] = useState<boolean | null>(loggedOut ? true : null);
  useEffect(() => {
    try {
      if (loggedOut) localStorage.setItem(LOGGED_OUT_KEY, "1");
      else setBlocked(!!localStorage.getItem(LOGGED_OUT_KEY));
    } catch {
      setBlocked(false);
    }
  }, [loggedOut]);
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/play";

  const run = useCallback(
    async (t: string) => {
      try {
        localStorage.removeItem(LOGGED_OUT_KEY);
      } catch {}
      setPhase("checking");
      setToken(t);
      let r: Awaited<ReturnType<typeof lineLoginAction>>;
      try {
        r = await lineLoginAction(t);
      } catch {
        r = { message: "ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง" }; // Server Action throw (เช่น config ฝั่ง server ผิด) ห้ามค้างที่ "กำลังตรวจสอบ"
      }
      if (r.result === "AUTHENTICATED") {
        const to = memberDest(dest);
        if (to.startsWith("http")) window.location.href = to; // LIFF สมาชิก (คนละ LIFF ID)
        else {
          router.replace(to);
          router.refresh();
        }
      } else if (r.result === "LINK_REQUIRED") setPhase("link");
      else {
        setMessage(r.message);
        setPhase("error");
      }
    },
    [dest, router]
  );

  // เปิดผ่าน LINE / ล็อกอิน LIFF แล้ว → ส่ง ID token ไปตรวจอัตโนมัติ
  useEffect(() => {
    if (blocked !== false) return; // เพิ่งออกจากระบบ/ยังไม่รู้สถานะ: รอให้ผู้ใช้กดเข้าสู่ระบบเอง
    if (ready && loggedIn && idToken && !started.current) {
      started.current = true;
      void run(idToken);
    }
  }, [ready, loggedIn, idToken, run, blocked]);

  if (phase === "link") return <LinkForm idToken={token} next={next} />;

  const busy = !ready || blocked === null || phase === "checking";
  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5">
      <FormAlert message={phase === "error" ? message : liffError ? `LINE: ${liffError}` : undefined} />
      {busy ? (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {phase === "checking" ? "กำลังตรวจสอบบัญชี…" : "กำลังเชื่อมต่อ LINE…"}
        </div>
      ) : blocked && phase === "idle" ? (
        <>
          <p className="text-center text-sm text-muted-foreground">ออกจากระบบแล้ว</p>
          <Button type="button" variant="line" size="lg" onClick={() => (loggedIn && idToken ? run(idToken) : login())}>
            <MessageCircle className="fill-current" /> เข้าสู่ระบบอีกครั้ง
          </Button>
        </>
      ) : enabled && !loggedIn ? (
        <Button type="button" variant="line" size="lg" onClick={login}>
          <MessageCircle className="fill-current" /> เข้าสู่ระบบด้วย LINE
        </Button>
      ) : enabled && phase === "error" ? (
        <Button type="button" variant="line" size="lg" onClick={() => idToken && run(idToken)}>ลองใหม่อีกครั้ง</Button>
      ) : !enabled ? (
        <p className="text-center text-sm text-muted-foreground">ยังไม่ได้ตั้งค่า LINE (NEXT_PUBLIC_LIFF_ID) กรุณาติดต่อผู้ดูแลระบบ</p>
      ) : null}

    </div>
  );
}

function LinkForm({ idToken, next }: { idToken: string; next?: string }) {
  const [state, action] = useActionState<FormState, FormData>(linkAction, {});
  const fe = state.fieldErrors ?? {};
  // controlled — กันฟอร์มถูกรีเซ็ตหลัง action (ข้อมูลที่กรอกต้องไม่หายเมื่อ validate ไม่ผ่าน)
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <form action={action} className="flex flex-col gap-3.5 rounded-xl border border-border bg-card p-5" noValidate>
        <input type="hidden" name="idToken" value={idToken} />
        {next && <input type="hidden" name="next" value={next} />}
        <div>
          <div className="text-[15px] font-semibold">ผูก LINE กับบัญชีสมาชิก</div>
          <p className="mt-0.5 text-[13px] text-muted-foreground">ยืนยันบัญชีสมาชิกเดิมด้วยชื่อผู้ใช้และรหัสผ่าน เพื่อผูกกับ LINE นี้</p>
        </div>
        <FormAlert message={state.message} />
        <Field label="ชื่อผู้ใช้ (เบอร์โทร)" icon={User} name="user_name" autoComplete="username" autoCapitalize="none" placeholder="กรอกชื่อผู้ใช้" value={userName} onChange={(e) => setUserName(e.target.value)} error={fe.user_name} />
        <PasswordField label="รหัสผ่าน" icon={Lock} name="password" autoComplete="current-password" placeholder="กรอกรหัสผ่าน" value={password} onChange={(e) => setPassword(e.target.value)} error={fe.password} />
        <SubmitButton pendingText="กำลังผูกบัญชี…">ผูกบัญชี</SubmitButton>
        <Link href="/contact" className="p-1 text-center text-[13px] text-primary">ลืมรหัสผ่าน? ติดต่อพนักงาน</Link>
      </form>
    </>
  );
}
