export function PageTitle({ title, subtitle, kicker }: { title: string; subtitle?: string; kicker?: string }) {
  return (
    <div>
      {kicker && <div className="font-display text-xs tracking-[.3em] text-primary">{kicker}</div>}
      <h1 className="mt-1 text-[26px] font-semibold tracking-[.01em]">{title}</h1>
      {subtitle && <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
