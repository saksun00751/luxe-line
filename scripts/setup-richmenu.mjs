// สร้าง rich menu 2 ชุด (guest = default, member = link หลังสมัคร/ล็อกอิน)
// ใช้: LINE_MESSAGING_ACCESS_TOKEN=xxx NEXT_PUBLIC_LIFF_ID=xxx node scripts/setup-richmenu.mjs guest.png [member.png]
// รูป: 2500x1686 หรือ 2500x843 px, PNG/JPEG, ไม่เกิน 1MB
import { readFileSync } from "node:fs";

const TOKEN = process.env.LINE_MESSAGING_ACCESS_TOKEN;
const LIFF = process.env.NEXT_PUBLIC_LIFF_ID;
const [guestImg, memberImg] = process.argv.slice(2);
if (!TOKEN || !LIFF || !guestImg) {
  console.error("ต้องมี LINE_MESSAGING_ACCESS_TOKEN, NEXT_PUBLIC_LIFF_ID และพาธรูป guest (member ไม่บังคับ — ไม่ใส่ = สร้างเฉพาะ guest)");
  process.exit(1);
}
const H = { Authorization: `Bearer ${TOKEN}` };

async function create(file, img) {
  const body = readFileSync(file, "utf8").replaceAll("{LIFF_ID}", LIFF);
  const r = await fetch("https://api.line.me/v2/bot/richmenu", { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body });
  if (!r.ok) throw new Error(`create ${file}: ${r.status} ${await r.text()}`);
  const { richMenuId } = await r.json();
  const type = img.endsWith(".png") ? "image/png" : "image/jpeg";
  const u = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, { method: "POST", headers: { ...H, "Content-Type": type }, body: readFileSync(img) });
  if (!u.ok) throw new Error(`upload ${img}: ${u.status} ${await u.text()}`);
  return richMenuId;
}

const guest = await create("line/richmenu-guest.json", guestImg);
const member = memberImg ? await create("line/richmenu-member.json", memberImg) : null;
const d = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${guest}`, { method: "POST", headers: H });
if (!d.ok) throw new Error(`set default: ${d.status} ${await d.text()}`);
console.log("Guest (default):", guest);
if (member) console.log("Member -> ใส่ใน .env  LINE_RICHMENU_MEMBER_ID=" + member);
