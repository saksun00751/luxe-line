import "server-only";
import { cache } from "react";
import { api } from "@/lib/api";
import { site } from "@/config/site";

export type Branding = { name: string; tagline: string; title: string; description: string; logo: string | null };

const TTL_OK = 5 * 60_000; // ดึงสำเร็จ: ใช้ซ้ำ 5 นาที
const TTL_FAIL = 30_000; // ดึงไม่สำเร็จ: ลองใหม่ทุก 30 วินาที ไม่ยิงซ้ำทุก request
const TIMEOUT_MS = 2_000; // branding อยู่ใน root layout — ห้ามรอ backend นานจนทุกหน้าช้า

// แคชในหน่วยความจำของ isolate (ไม่มี incremental cache บน Worker นี้ → fetch revalidate ของ Next ไม่คงอยู่ข้าม request)
let mem: { at: number; ttl: number; value: Branding | null } | undefined;
let inflight: Promise<Branding | null> | undefined;

const fallback = (): Branding => ({
  name: site.name,
  tagline: site.tagline,
  title: site.name,
  description: `${site.name} — สมัคร เข้าสู่ระบบ ฝาก ถอน ผ่าน LINE`,
  logo: null,
});

async function load(): Promise<Branding | null> {
  try {
    const b = await api.siteBranding(TIMEOUT_MS);
    const name = b.siteName || site.name;
    const value: Branding = {
      name,
      tagline: site.tagline,
      title: b.title || name,
      description: b.desc || `${name} — สมัคร เข้าสู่ระบบ ฝาก ถอน ผ่าน LINE`,
      logo: b.logo,
    };
    mem = { at: Date.now(), ttl: TTL_OK, value };
    return value;
  } catch {
    // ล้มเหลว: ใช้ค่าล่าสุดที่เคยได้ (ถ้ามี) ต่อไปก่อน
    mem = { at: Date.now(), ttl: TTL_FAIL, value: mem?.value ?? null };
    return mem.value;
  }
}

/** แบรนด์จาก backend (แคชไว้) — ถ้าดึงไม่ได้หรือไม่ได้ตั้งค่า ใช้ค่าจาก env ใน config/site.ts แทน */
export const getBranding = cache(async (): Promise<Branding> => {
  if (mem && Date.now() - mem.at < mem.ttl) return mem.value ?? fallback();
  inflight ??= load().finally(() => (inflight = undefined)); // request พร้อมกันรอการดึงครั้งเดียว
  return (await inflight) ?? fallback();
});
