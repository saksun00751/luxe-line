"use client";

import { useId, useState } from "react";
import { ChevronDown, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Bank } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const box = "flex h-[52px] items-center gap-2.5 rounded-md border bg-secondary pl-4 pr-1.5 text-muted-foreground transition-colors focus-within:border-primary";

type FieldProps = React.ComponentProps<"input"> & { label: string; icon: LucideIcon; error?: string; trailing?: React.ReactNode };

export function Field({ label, icon: Icon, error, trailing, className, ...props }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className={cn(box, error ? "border-destructive" : "border-border", className)}>
        <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
        <Input id={id} aria-invalid={!!error} aria-describedby={error ? id + "-e" : undefined} {...props} />
        {trailing}
      </div>
      {error && <p id={id + "-e"} className="pl-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [show, setShow] = useState(false);
  return (
    <Field
      {...props}
      type={show ? "text" : "password"}
      trailing={
        <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground">
          {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      }
    />
  );
}

export function BankSelect({ icon: Icon, banks, error, defaultValue, value, onChange, name = "bank" }: { icon: LucideIcon; banks: Bank[]; error?: string; defaultValue?: string; value?: string; onChange?: (v: string) => void; name?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>ธนาคาร</Label>
      <div className={cn(box, "relative pr-4", error ? "border-destructive" : "border-border")}>
        <Icon className="size-[18px] shrink-0" strokeWidth={1.8} />
        <select id={id} name={name} {...(value !== undefined ? { value, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e.target.value) } : { defaultValue: defaultValue ?? "" })} required aria-invalid={!!error} className="h-full w-full cursor-pointer appearance-none bg-transparent text-[15px] text-foreground outline-none">
          <option value="" disabled>เลือกธนาคาร</option>
          {banks.map((b) => (
            <option key={b.code} value={b.code}>{b.nameTh}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none size-[18px] shrink-0" />
      </div>
      {error && <p className="pl-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
