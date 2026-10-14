import { AppHeader } from "@/components/app-header";
import { RealtimeListener } from "@/components/realtime-listener";
import { RichMenuSync } from "@/components/richmenu-sync";
import { BottomNav } from "@/components/bottom-nav";
import { getCurrentUser, isAuthed } from "@/lib/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthed();
  const user = authed ? await getCurrentUser().catch(() => null) : null;
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-background sm:border-x sm:border-border">
      <AppHeader balance={authed ? (user?.balance ?? 0) : null} />
      <main className={authed ? "flex-1 px-5 pt-[18px] pb-[120px]" : "flex-1 px-5 pt-[18px] pb-8"}>{children}</main>
      {authed && <RealtimeListener />}
      {authed && <RichMenuSync />}
      <BottomNav authed={authed} />
    </div>
  );
}
