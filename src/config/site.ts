export const site = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME || "LUXE",
  lineOaUrl: process.env.NEXT_PUBLIC_LINE_OA_URL || "https://line.me/R/",
  contactHours: process.env.NEXT_PUBLIC_CONTACT_HOURS || "ตลอด 24 ชั่วโมง",
  liffId: process.env.NEXT_PUBLIC_LIFF_ID || "",
  // LIFF ตัวที่สอง สำหรับสมาชิกที่ล็อกอินแล้ว (ไม่ตั้ง = ใช้ LIFF ตัวเดียว)
  memberLiffId: process.env.NEXT_PUBLIC_MEMBER_LIFF_ID || "",
};

/** ปลายทางหลังล็อกอิน: ถ้ามี LIFF สมาชิก → https://liff.line.me/<id>/<path> ไม่งั้นใช้ path ในแอปนี้ */
export const memberDest = (path: string) =>
  site.memberLiffId ? `https://liff.line.me/${site.memberLiffId}${path.startsWith("/") ? path : "/" + path}` : path;
