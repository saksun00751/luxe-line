import "server-only";
import { site } from "@/config/site";
import { formatDate } from "@/lib/utils";

const MSG_TOKEN = process.env.LINE_MESSAGING_ACCESS_TOKEN;

/**
 * ตรวจ LIFF ID token ฝั่ง server เพื่อให้ได้ LINE userId ที่เชื่อถือได้
 * (ห้ามเชื่อ userId ที่ client ส่งมาตรงๆ)
 */
export async function verifyLineIdToken(idToken: string): Promise<{ userId: string; name?: string } | null> {
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!idToken || !clientId) return null;
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: clientId }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { sub?: string; name?: string };
  return j.sub ? { userId: j.sub, name: j.name } : null;
}

async function lineApi(path: string, body?: unknown, method: "POST" | "DELETE" = "POST") {
  if (!MSG_TOKEN) return;
  const res = await fetch(`https://api.line.me/v2/bot${path}`, {
    method,
    headers: { Authorization: `Bearer ${MSG_TOKEN}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) console.error("[LINE]", path, res.status, await res.text().catch(() => ""));
}

/** ข้อมูลจาก /member/profile — เบอร์และเลขบัญชีถูก mask จาก backend แล้ว */
type RegInfo = { username: string; phoneMasked: string; bankName: string; accountMasked: string; name: string; registeredOn: string };

const row = (label: string, value: string) => ({
  type: "box",
  layout: "horizontal",
  contents: [
    { type: "text", text: label, size: "sm", color: "#8A8F98", flex: 4 },
    { type: "text", text: value, size: "sm", color: "#1A1D21", weight: "bold", flex: 6, align: "end", wrap: true },
  ],
});

export function registrationFlex(info: RegInfo, loginUrl: string) {
  return {
    type: "flex",
    altText: `สมัครสมาชิก ${site.name} สำเร็จ · ชื่อผู้ใช้ ${info.username}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#E2B84A",
        paddingAll: "16px",
        contents: [
          { type: "text", text: "ยืนยันการสมัคร", size: "xs", color: "#1A1306" },
          { type: "text", text: `ยินดีต้อนรับสู่ ${site.name}`, size: "lg", weight: "bold", color: "#1A1306" },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          row("ชื่อผู้ใช้", info.username),
          row("เบอร์โทร", info.phoneMasked),
          row("ธนาคาร", info.bankName),
          row("เลขบัญชี", info.accountMasked),
          row("ชื่อบัญชี", info.name),
          row("วันที่สมัคร", formatDate(info.registeredOn)),
          { type: "text", text: "* เพื่อความปลอดภัย ระบบจะไม่ส่งรหัสผ่านทางแชท", size: "xxs", color: "#8A8F98", margin: "md", wrap: true },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "button", style: "primary", color: "#1A1306", height: "sm", action: { type: "uri", label: "เข้าสู่ระบบ", uri: loginUrl } }],
      },
    },
  };
}

/** ส่งข้อมูลการสมัครเข้าแชท LINE OA (push message ผ่าน Messaging API) */
export async function pushRegistrationMessage(lineUserId: string, info: RegInfo) {
  const loginUrl = site.liffId ? `https://liff.line.me/${site.liffId}/login` : site.lineOaUrl;
  await lineApi("/message/push", { to: lineUserId, messages: [registrationFlex(info, loginUrl)] });
}

/** สลับ rich menu ของผู้ใช้เป็นแบบสมาชิก (ถ้าตั้ง LINE_RICHMENU_MEMBER_ID) */
export async function linkMemberRichMenu(lineUserId: string) {
  const id = process.env.LINE_RICHMENU_MEMBER_ID;
  if (id) await lineApi(`/user/${encodeURIComponent(lineUserId)}/richmenu/${encodeURIComponent(id)}`);
}

/** ถอด rich menu รายคนออก → ผู้ใช้กลับไปเห็นเมนู guest (default) */
export async function unlinkRichMenu(lineUserId: string) {
  await lineApi(`/user/${encodeURIComponent(lineUserId)}/richmenu`, undefined, "DELETE");
}
