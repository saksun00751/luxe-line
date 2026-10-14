import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-core";

/** Laravel session หมดอายุ → ล้าง cookie เซสชันของเรา แล้วส่งไปหน้า login */
export function GET(req: NextRequest) {
  const next = req.nextUrl.searchParams.get("next");
  const url = new URL("/login", req.url);
  if (next && next.startsWith("/") && !next.startsWith("//")) url.searchParams.set("next", next);
  const res = NextResponse.redirect(url);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
