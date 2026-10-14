import { NextResponse, type NextRequest } from "next/server";
import { api, ApiError } from "@/lib/api";
import { isAuthed } from "@/lib/session";

/** pusher-js ส่ง socket_id + channel_name (form-encoded) มาที่นี่ → ส่งต่อให้ backend เซ็นในนามสมาชิก */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ message: "unauthenticated" }, { status: 401 });
  const fd = await req.formData().catch(() => null);
  const socketId = String(fd?.get("socket_id") ?? "");
  const channelName = String(fd?.get("channel_name") ?? "");
  if (!socketId || !channelName) return NextResponse.json({ message: "invalid" }, { status: 422 });
  try {
    return NextResponse.json(await api.realtimeAuth(socketId, channelName), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ message: "forbidden" }, { status: e instanceof ApiError ? e.status : 502 });
  }
}
