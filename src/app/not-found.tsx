import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="font-display text-5xl font-bold text-primary">404</div>
      <p className="text-muted-foreground">ไม่พบหน้าที่คุณต้องการ</p>
      <Button asChild><Link href="/">กลับหน้าหลัก</Link></Button>
    </main>
  );
}
