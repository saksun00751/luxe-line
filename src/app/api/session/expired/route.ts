import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-core";

/** Laravel session หมดอายุ → ล้าง cookie เซสชันของเรา แล้วส่งไปหน้า login */
export function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next");
  // ใช้ Location แบบ relative — หลัง reverse proxy req.url จะเป็น localhost:4600 ทำให้เด้งไปโฮสต์ผิด
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? `?next=${encodeURIComponent(next)}` : "";
  const res = new NextResponse(null, { status: 307, headers: { Location: `/login${safeNext}` } });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
