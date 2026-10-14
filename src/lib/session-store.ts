import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_MAX_AGE, sealSession, unsealSession, type SessionData } from "./session-core";

export const readSession = async () => unsealSession((await cookies()).get(SESSION_COOKIE)?.value);

export async function writeSession(data: SessionData) {
  (await cookies()).set(SESSION_COOKIE, await sealSession(data), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** เขียนเซสชันแบบ best-effort — ใน Server Component จะ set cookie ไม่ได้ (Next จะ throw) ให้ข้ามไป */
export async function tryWriteSession(data: SessionData) {
  try {
    await writeSession(data);
  } catch {
    /* read-only context */
  }
}
