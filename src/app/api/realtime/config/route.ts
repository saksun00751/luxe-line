import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api";
import { isAuthed } from "@/lib/session";

/** browser ไม่มี Laravel session (เก็บใน cookie เข้ารหัสฝั่ง server) จึงต้องผ่าน route นี้ */
export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, config: await api.realtimeConfig() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: e instanceof ApiError ? e.status : 502 });
  }
}
