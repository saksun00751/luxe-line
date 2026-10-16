"use server";

import { redirect } from "next/navigation";
import { api, ApiError, type BankAccountLookup, type LineAuthResult } from "@/lib/api";
import { memberDest } from "@/config/site";
import { isAuthed } from "@/lib/session";
import { linkMemberRichMenu, pushRegistrationMessage, unlinkRichMenu, verifyLineIdToken } from "@/lib/line";
import { flatErrors, changePasswordSchema, linkSchema, registerSchema, type FormState } from "@/lib/validation";

/** log เวลาและผลของแต่ละขั้น (ไม่มีข้อมูลส่วนตัว) */
async function step<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const t = Date.now();
  try {
    const r = await fn();
    console.log(`[auth] ${name} ok ${Date.now() - t}ms`);
    return r;
  } catch (e) {
    const code = e instanceof ApiError ? `${e.status}/${e.code ?? "-"}` : String(e);
    console.error(`[auth] ${name} FAIL ${Date.now() - t}ms ${code}`);
    throw e;
  }
}

const pick = (fd: FormData, keys: string[]) => Object.fromEntries(keys.map((k) => [k, String(fd.get(k) ?? "")]));
const safeNext = (n?: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/play");

/**
 * รัน fn ที่ต้องมี "LINE ที่ยืนยันแล้ว" ใน session — ถ้า session ยังไม่มี/หมดอายุ (pending อยู่ได้ ~10 นาที)
 * จะยืนยัน idToken ใหม่แล้วลองซ้ำหนึ่งครั้ง ถ้ายืนยันแล้วพบว่าเป็นสมาชิกอยู่แล้วจะพาไปหน้าเล่น
 */
async function withLine<T>(idToken: string | undefined, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!idToken || !(e instanceof ApiError) || e.code !== "LINE_IDENTITY_REQUIRED") throw e;
    const r = await api.lineAuth(idToken);
    if (r.status === "AUTHENTICATED") redirect("/play");
    return fn();
  }
}

/** best-effort: สลับ rich menu เป็นแบบสมาชิก (ต้องได้ LINE userId จากการ verify ID token ฝั่ง server) */
async function afterMemberLogin(idToken?: string) {
  const line = idToken ? await verifyLineIdToken(idToken).catch(() => null) : null;
  if (line?.userId) await linkMemberRichMenu(line.userId).catch(() => {});
  return line;
}

/** ซิงก์ rich menu สำหรับผู้ที่ล็อกอินค้างอยู่ (session เดิมไม่ผ่านขั้น login) — ต้องมี session และ ID token ที่ verify ผ่าน */
export async function syncRichMenuAction(idToken: string) {
  if (!idToken || !(await isAuthed())) return;
  await afterMemberLogin(idToken);
}

/** ขั้นแรกของทุก flow: ส่ง LIFF ID token ให้ backend → เข้าสู่ระบบเลย หรือต้องผูก/สมัครต่อ */
export async function lineLoginAction(idToken: string): Promise<{ result?: LineAuthResult["status"]; message?: string }> {
  if (!idToken) return { message: "ไม่พบข้อมูล LINE กรุณาเปิดผ่านแอป LINE" };
  try {
    if (await isAuthed()) return { result: "AUTHENTICATED" };
    const r = await step("lineAuth", () => api.lineAuth(idToken));
    if (r.status === "AUTHENTICATED") await step("afterMemberLogin", () => afterMemberLogin(idToken));
    return { result: r.status };
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message };
    throw e;
  }
}

/** ผูก LINE เข้ากับบัญชีสมาชิกเดิม */
export async function linkAction(_: FormState, fd: FormData): Promise<FormState> {
  const keep = pick(fd, ["user_name"]);
  const parsed = linkSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: flatErrors(parsed.error), values: keep };
  const d = parsed.data;
  try {
    await step("link", () => withLine(d.idToken, () => api.link(d.user_name, d.password)));
    await step("afterMemberLogin", () => afterMemberLogin(d.idToken));
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, fieldErrors: e.fieldErrors, values: keep };
    throw e;
  }
  redirect(memberDest(safeNext(d.next)));
}

/** ปิดรับสมัครผ่านแอปนี้ (Server Action เรียกตรงได้ จึงต้องกันที่นี่ด้วย) */
const REGISTRATION_CLOSED = true;

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  if (REGISTRATION_CLOSED) return { message: "ปิดรับสมัครสมาชิกผ่านหน้านี้ กรุณาติดต่อพนักงาน" };
  const keep = pick(fd, ["user_name", "firstname", "lastname", "bank", "acc_no"]);
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: flatErrors(parsed.error), values: keep };
  const d = parsed.data;

  let sent = false;
  try {
    await step("register", () => withLine(d.idToken, () =>
      api.register({
        user_name: d.user_name,
        firstname: d.firstname,
        lastname: d.lastname,
        bank: d.bank,
        acc_no: d.acc_no,
        password: d.password,
        password_confirmation: d.password_confirmation,
        marketing: d.marketing || null,
      })
    ));
    // ส่งสรุปการสมัครเข้าแชท LINE OA (best-effort — ล้มเหลวก็ไม่กระทบการสมัคร)
    const line = await step("afterMemberLogin", () => afterMemberLogin(d.idToken));
    if (line?.userId) {
      const me = await step("profile", () => api.profile()).catch(() => null);
      if (me) {
        await pushRegistrationMessage(line.userId, { ...me, registeredOn: me.registeredOn }).then(() => (sent = true), () => {});
      }
    }
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message, fieldErrors: e.fieldErrors, values: keep };
    throw e;
  }
  redirect(`/register/success${sent ? "?line=1" : ""}`);
}

/** ตรวจชื่อเจ้าของบัญชีเพื่อเติมชื่อ-นามสกุลในฟอร์มสมัคร */
export async function lookupBankNameAction(
  idToken: string,
  bank: number,
  accNo: string
): Promise<{ data?: BankAccountLookup; message?: string }> {
  const acc = accNo.replace(/\D/g, "");
  if (!bank) return { message: "กรุณาเลือกธนาคารก่อน" };
  if (!/^\d{8,20}$/.test(acc)) return { message: "เลขบัญชีไม่ถูกต้อง (8–20 หลัก)" };
  try {
    return { data: await withLine(idToken, () => api.bankAccountName(bank, acc)) };
  } catch (e) {
    if (e instanceof ApiError) return { message: e.message };
    throw e;
  }
}

export async function logoutAction(idToken?: string) {
  // best-effort: คืนเมนู guest ให้ผู้ใช้ (ต้องได้ userId จาก ID token ที่ verify ฝั่ง server)
  const line = idToken ? await verifyLineIdToken(idToken).catch(() => null) : null;
  if (line?.userId) await unlinkRichMenu(line.userId).catch(() => {});
  await api.logout(); // client เป็นคน redirect แบบ hard navigation เพื่อให้ LIFF re-init ใหม่
}

/** เปลี่ยนรหัสผ่าน — MOCK: ตรวจฟอร์มแล้วตอบสำเร็จเลย ยังไม่ได้เรียก backend (รอ endpoint) */
export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAuthed())) return { message: "กรุณาเข้าสู่ระบบอีกครั้ง" };
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: flatErrors(parsed.error) };
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true, message: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว (ตัวอย่าง — ยังไม่ได้บันทึกจริง)" };
}
