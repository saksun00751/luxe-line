import "server-only";
import { headers as nextHeaders } from "next/headers";
import { readSession, tryWriteSession } from "../session-store";
import { ApiError, ERROR_TH } from "./errors";

/**
 * LineMember API (Laravel) — https://<host>/line-member/api-docs
 * ใช้ Laravel session cookie + CSRF จึงเรียกจากฝั่ง server เท่านั้น โดยเก็บ cookie ของ Laravel
 * ไว้ในเซสชันเข้ารหัสของแอปนี้ (ดู session-core.ts) แล้วแนบกลับไปทุกคำขอ
 */
const API_PREFIX = "/api/line-member/v1";
const ORIGIN = (process.env.EXTERNAL_API_BASE_URL || "https://api.36office.com").trim().replace(API_PREFIX, "").replace(/\/+$/, "");

/** รูป/ไฟล์จาก backend เป็น path สัมพัทธ์ (เช่น /storage/bank_img/x.png) → ต่อ origin ให้ */
export const assetUrl = (p?: string | null) => (!p ? null : /^https?:\/\//.test(p) ? p : ORIGIN + (p.startsWith("/") ? p : "/" + p));

/** cookie jar + CSRF token ของ Laravel session หนึ่งอัน */
export type Backend = { jar: Record<string, string>; csrf?: string };

type Opts = {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
};

function absorbCookies(res: Response, state: Backend) {
  for (const line of res.headers.getSetCookie()) {
    const [pair, ...attrs] = line.split(";");
    const i = pair.indexOf("=");
    if (i < 1) continue;
    const name = pair.slice(0, i).trim();
    const value = pair.slice(i + 1).trim();
    const lower = attrs.map((a) => a.trim().toLowerCase());
    const expired =
      lower.includes("max-age=0") ||
      lower.some((a) => a.startsWith("expires=") && Date.parse(a.slice(8)) < Date.now());
    if (!value || expired) delete state.jar[name];
    else state.jar[name] = value;
  }
}

const cookieHeader = (jar: Record<string, string>) =>
  Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");

function csrfHeaders(state: Backend): Record<string, string> {
  if (state.csrf) return { "X-CSRF-TOKEN": state.csrf };
  const xsrf = state.jar["XSRF-TOKEN"];
  return xsrf ? { "X-XSRF-TOKEN": decodeURIComponent(xsrf) } : {};
}

const GENERIC: Record<number, string> = {
  401: ERROR_TH.UNAUTHENTICATED,
  403: ERROR_TH.MEMBER_UNAVAILABLE,
  419: "เซสชันหมดอายุ กรุณารีเฟรชหน้าแล้วลองใหม่",
  428: ERROR_TH.LINE_IDENTITY_REQUIRED,
  429: "ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่",
};

type ErrBody = { message?: string; errors?: Record<string, string[] | string>; error?: { code?: string; message?: string } };

function toError(status: number, json: ErrBody | null): ApiError {
  const code = json?.error?.code;
  let fieldErrors: Record<string, string> | undefined;
  if (json?.errors && typeof json.errors === "object") {
    fieldErrors = {};
    for (const [k, v] of Object.entries(json.errors)) fieldErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
  }
  const message =
    (code && ERROR_TH[code]) ||
    json?.error?.message ||
    (fieldErrors ? "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" : undefined) ||
    GENERIC[status] ||
    (status >= 500 ? "ระบบขัดข้องชั่วคราว กรุณาลองใหม่ภายหลัง" : json?.message) ||
    "เกิดข้อผิดพลาด กรุณาลองใหม่";
  return new ApiError(message, status, fieldErrors, code ?? (status === 401 ? "UNAUTHENTICATED" : undefined));
}

async function internalHeaders(): Promise<Record<string, string>> {
  // X-Member-IP: IP ผู้ใช้จริงจาก cf-connecting-ip เท่านั้น (ให้ rate-limit ของ backend นับต่อผู้ใช้)
  // X-Internal-Token: ยืนยันว่าคำขอมาจาก Next.js server นี้
  const out: Record<string, string> = {};
  const token = process.env.API_INTERNAL_TOKEN;
  if (token) out["X-Internal-Token"] = token;
  try {
    const ip = (await nextHeaders()).get("cf-connecting-ip");
    if (ip) out["X-Member-IP"] = ip;
  } catch {
    // นอก request scope
  }
  return out;
}

/** ยิงคำขอหนึ่งครั้ง โดยอัปเดต state (cookie jar / csrf) ตามที่ backend ตอบ */
export async function call<T>(path: string, opts: Opts, state: Backend, retryCsrf = true): Promise<T> {
  const method = opts.method ?? "GET";
  const url = new URL(ORIGIN + API_PREFIX + path);
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v != null && v !== "") url.searchParams.set(k, String(v));

  if (method === "POST" && !state.csrf && !state.jar["XSRF-TOKEN"]) await refreshCsrf(state);

  const headers: Record<string, string> = { Accept: "application/json", ...(await internalHeaders()), ...opts.headers };
  const cookie = cookieHeader(state.jar);
  if (cookie) headers.Cookie = cookie;
  if (method === "POST") {
    Object.assign(headers, csrfHeaders(state));
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(opts.body ?? {}) : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ApiError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง", 503);
  }
  absorbCookies(res, state);

  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: T & { csrf_token?: string } } & ErrBody | null;
  // 419 = คำขอยังไม่ถูกประมวลผล ปลอดภัยที่จะขอ CSRF ใหม่แล้วลองซ้ำหนึ่งครั้ง
  if (res.status === 419 && retryCsrf) {
    await refreshCsrf(state);
    return call<T>(path, opts, state, false);
  }
  if (!res.ok || !json || json.success === false) throw toError(res.status, json);

  const data = (json.data ?? {}) as T & { csrf_token?: string };
  if (typeof data.csrf_token === "string") state.csrf = data.csrf_token;
  return data;
}

export async function refreshCsrf(state: Backend) {
  const d = await call<{ csrf_token?: string }>("/session/csrf", {}, state);
  state.csrf = d.csrf_token ?? state.csrf;
}

/** เริ่ม Laravel session ใหม่ (ใช้ตอน LINE login) */
export async function freshBackend(): Promise<Backend> {
  const state: Backend = { jar: {} };
  await refreshCsrf(state);
  return state;
}

/**
 * เรียก API ในนามของผู้ใช้ปัจจุบัน (ใช้ cookie ในเซสชัน) — ถ้าไม่มีเซสชันก็เรียกแบบ guest (เหมาะกับ endpoint สาธารณะ)
 * cookie/CSRF ที่ backend หมุนใหม่จะถูกบันทึกกลับถ้าอยู่ใน Server Action (ใน Server Component จะข้ามไป)
 */
export async function apiFetch<T>(path: string, opts: Opts = {}): Promise<T> {
  const stored = await readSession();
  const state: Backend = { jar: { ...(stored?.jar ?? {}) }, csrf: stored?.csrf };
  const before = JSON.stringify([state.jar, state.csrf]);
  try {
    return await call<T>(path, opts, state);
  } finally {
    if (stored && JSON.stringify([state.jar, state.csrf]) !== before) await tryWriteSession({ ...stored, jar: state.jar, csrf: state.csrf });
  }
}

/**
 * GET endpoint สาธารณะ (ไม่ใช้ session/cookie) แคชข้าม request ด้วย Next data cache —
 * ใช้กับข้อมูลที่ไม่ขึ้นกับผู้ใช้ เช่น branding เพื่อไม่ให้หน้า static กลายเป็น dynamic
 */
export async function publicGet<T>(path: string, revalidate: number, timeoutMs = 8_000): Promise<T> {
  let res: Response;
  try {
    res = await fetch(ORIGIN + API_PREFIX + path, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new ApiError("ไม่สามารถเชื่อมต่อระบบได้", 503);
  }
  const json = (await res.json().catch(() => null)) as { success?: boolean; data?: T } & ErrBody | null;
  if (!res.ok || !json || json.success === false) throw toError(res.status, json);
  return (json.data ?? {}) as T;
}
