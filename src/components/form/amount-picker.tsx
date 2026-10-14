"use client";

import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESETS = [100, 300, 500, 1000, 2000, 5000];

export function AmountPicker({ label, value, onChange, error, max }: { label: string; value: string; onChange: (v: string) => void; error?: string; max?: number }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {max !== undefined && (
          <button type="button" onClick={() => onChange(String(Math.floor(max)))} className="cursor-pointer text-[13px] font-medium text-primary">
            ทั้งหมด
          </button>
        )}
      </div>
      <div className={cn("flex h-[60px] items-center gap-2.5 rounded-md border bg-secondary px-4 focus-within:border-primary", error ? "border-destructive" : "border-border")}>
        <span className="text-xl font-semibold text-primary">฿</span>
        <input
          id={id}
          name="amount"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 7))}
          placeholder="0"
          aria-invalid={!!error}
          className="h-full w-full min-w-0 bg-transparent text-[22px] font-semibold outline-none"
        />
      </div>
      {error && <p className="pl-1 text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((v) => {
          const active = value === String(v);
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(String(v))}
              aria-pressed={active}
              className={cn("h-11 cursor-pointer rounded-full border text-sm font-medium transition", active ? "border-primary bg-accent text-primary" : "border-border bg-secondary")}
            >
              {v.toLocaleString("en-US")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
