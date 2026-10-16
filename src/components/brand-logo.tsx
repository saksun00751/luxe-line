import { Crown } from "lucide-react";
import Link from "next/link";
import { getBranding } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function BrandMark({ className, iconClass, logo }: { className?: string; iconClass?: string; logo?: string | null }) {
  return (
    <span className={cn("flex size-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand text-primary-foreground", className)}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        <Crown className={cn("size-5", iconClass)} strokeWidth={1.8} />
      )}
    </span>
  );
}

export async function BrandLogo({ href = "/" }: { href?: string }) {
  const site = await getBranding();
  return (
    <Link href={href} className="flex min-w-0 flex-1 items-center gap-2.5" aria-label={site.name}>
      <BrandMark logo={site.logo} />
      <span className="min-w-0 leading-[1.1]">
        <span className="block font-display text-[19px] font-bold tracking-[.18em] text-primary">{site.name}</span>
      </span>
    </Link>
  );
}

/** โลโก้ใหญ่สำหรับหน้าเข้าสู่ระบบ */
export async function BrandEmblem() {
  const site = await getBranding();
  return (
    <div className="flex flex-col items-center gap-2.5 pt-4 pb-1 text-center">
      <div className="size-[104px] rounded-full bg-brand p-[3px] shadow-glow-lg">
        <div className="flex size-full items-center justify-center rounded-full bg-background text-primary">
          {site.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logo} alt="" className="size-full rounded-full object-cover" />
          ) : (
            <Crown className="size-[46px]" strokeWidth={1.6} />
          )}
        </div>
      </div>
      <div className="mt-1.5 font-display text-[30px] font-bold tracking-[.22em] text-primary">{site.name}</div>
    </div>
  );
}
