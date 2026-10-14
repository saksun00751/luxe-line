"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError, WITHDRAW_REASON_TH, type DepositMethodId, type DepositSelection } from "@/lib/api";
import { clearSession } from "@/lib/session-store";
import { amountSchema, type FormState } from "@/lib/validation";

/** Laravel session หมดอายุ → ล้างเซสชันของเราแล้วไปหน้า login */
async function fail(e: unknown): Promise<FormState> {
  if (e instanceof ApiError) {
    if (e.status === 401) {
      await clearSession();
      redirect("/login");
    }
    return { message: e.message, fieldErrors: e.fieldErrors };
  }
  throw e;
}

/** Idempotency key ต้องคงที่เมื่อ retry คำขอเดิม: backend กำหนด 12–64 ตัว A-Z a-z 0-9 . _ : - */
const validKey = (k: unknown): k is string => typeof k === "string" && /^[A-Za-z0-9._:-]{12,64}$/.test(k);

const METHODS: DepositMethodId[] = ["bank", "tw", "payment", "slip"];

export async function selectDepositAction(method: string): Promise<{ data?: DepositSelection; message?: string }> {
  if (!METHODS.includes(method as DepositMethodId)) return { message: "ช่องทางไม่ถูกต้อง" };
  try {
    return { data: await api.depositSelect(method as DepositMethodId) };
  } catch (e) {
    const r = await fail(e);
    return { message: r.message };
  }
}

/** สร้างออเดอร์ชำระเงิน → คืน URL สำหรับ redirect ไปหน้าชำระเงิน */
export async function createPaymentAction(amount: number, idempotencyKey: string): Promise<{ url?: string; message?: string; fieldErrors?: Record<string, string> }> {
  const a = amountSchema.safeParse(amount);
  if (!a.success) return { fieldErrors: { amount: a.error.issues[0].message } };
  if (!validKey(idempotencyKey)) return { message: "คำขอไม่ถูกต้อง กรุณารีเฟรชหน้า" };
  try {
    const o = await api.createPayment(a.data, idempotencyKey);
    revalidatePath("/", "layout");
    return { url: o.checkoutUrl };
  } catch (e) {
    return fail(e);
  }
}

export async function withdrawAction(_: FormState, fd: FormData): Promise<FormState> {
  const amount = amountSchema.safeParse(fd.get("amount"));
  if (!amount.success) return { fieldErrors: { amount: amount.error.issues[0].message } };
  const key = fd.get("idemKey");
  if (!validKey(key)) return { message: "คำขอไม่ถูกต้อง กรุณารีเฟรชหน้า" };
  try {
    const q = await api.withdrawQuote(amount.data);
    if (!q.passes) {
      const msgs = q.reasons.map((r) => WITHDRAW_REASON_TH[r] ?? r);
      return { message: msgs.join(" · ") || "ยังไม่สามารถถอนได้ในขณะนี้", fieldErrors: q.reasons.some((r) => r === "BELOW_MINIMUM" || r === "INSUFFICIENT_BALANCE" || r === "DAILY_LIMIT_EXCEEDED") ? { amount: msgs[0] } : undefined };
    }
    await api.withdrawSubmit(amount.data, key);
    revalidatePath("/", "layout");
    return { ok: true, message: `ส่งคำขอถอน ฿${amount.data.toLocaleString("th-TH")} แล้ว` };
  } catch (e) {
    return fail(e);
  }
}

export async function selectPromotionAction(code: number): Promise<FormState> {
  try {
    await api.selectPromotion(code);
    revalidatePath("/promotions");
    return { ok: true, message: "เลือกโปรโมชั่นแล้ว ฝากเงินเพื่อรับสิทธิ์" };
  } catch (e) {
    return fail(e);
  }
}

export async function deselectPromotionAction(): Promise<FormState> {
  try {
    await api.deselectPromotion();
    revalidatePath("/promotions");
    return { ok: true, message: "ยกเลิกโปรโมชั่นที่เลือกแล้ว" };
  } catch (e) {
    return fail(e);
  }
}

/** ขอ URL เข้าเกม UFA (บัญชีเกมผูกกับสมาชิกฝั่ง backend แล้ว) */
export async function launchGameAction(): Promise<{ url?: string; message?: string }> {
  try {
    return await api.gameLogin();
  } catch (e) {
    const r = await fail(e);
    return { message: r.message };
  }
}
