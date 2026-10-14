import { redirect } from "next/navigation";
import { LiffCallback } from "@/components/liff-callback";
import { isAuthed } from "@/lib/session";

const internal = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : undefined);

/**
 * ทางเข้าจาก LIFF:
 *  - callback หลัง LINE Login (?code & ?state): ต้องคง query ไว้ให้ liff.init() แลก token ก่อน → LiffCallback
 *  - ลิงก์ liff.line.me/<id>/<path> บางครั้งมาเป็น /?liff.state=/<path> → ส่งต่อไป path นั้น
 */
export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const to = internal(sp["liff.state"]);
  if (sp.code && sp.state) return <LiffCallback to={to ?? "/login"} />;
  if (to) redirect(to);
  redirect((await isAuthed()) ? "/play" : "/login");
}
