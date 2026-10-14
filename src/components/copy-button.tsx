"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ value, label = "คัดลอก" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          const t = document.createElement("textarea");
          t.value = value;
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          t.remove();
        }
        setDone(true);
        toast.success("คัดลอกเลขบัญชีแล้ว");
        setTimeout(() => setDone(false), 2000);
      }}
      className="flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-[13px]"
    >
      {done ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      {done ? "คัดลอกแล้ว" : label}
    </button>
  );
}
