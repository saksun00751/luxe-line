import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { api, ApiError, type User } from "./api";
import { readSession } from "./session-store";

export { readSession as getSession };

/** เป็นสมาชิกที่ล็อกอินแล้วหรือไม่ (ดูจากเซสชันของเรา ยังไม่ได้ถาม backend) */
export const isAuthed = async () => (await readSession())?.status === "authenticated";

/** สมาชิกปัจจุบัน + ยอดเงิน (cache ต่อ request) — คืน null ถ้ายังไม่ล็อกอินหรือ Laravel session หมดอายุ */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await isAuthed())) return null;
  try {
    return await api.profile();
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null;
    throw e;
  }
});

/**
 * ใช้ในหน้าสมาชิก: ถ้า Laravel session หมดอายุ ต้องล้าง cookie ของเราก่อนไปหน้า login
 * (ไม่งั้นหน้า login เห็นว่าล็อกอินอยู่แล้วแล้วเด้งกลับ → วนลูป)
 */
export const expired = (next?: string): never =>
  redirect(`/api/session/expired${next ? `?next=${encodeURIComponent(next)}` : ""}`);

export async function requireUser(next?: string) {
  const user = await getCurrentUser();
  if (!user) expired(next);
  return user!;
}

/** หุ้มการเรียก API ในหน้า server: 401 → เคลียร์เซสชันแล้วไปหน้า login */
export async function guard<T>(p: Promise<T>, next?: string): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) expired(next);
    throw e;
  }
}
