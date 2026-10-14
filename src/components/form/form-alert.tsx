import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormAlert({ message, ok }: { message?: string; ok?: boolean }) {
  if (!message) return null;
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <div role={ok ? "status" : "alert"} className={cn("flex items-start gap-2.5 rounded-md px-4 py-3 text-sm", ok ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive")}>
      <Icon className="mt-0.5 size-[18px] shrink-0" />
      <span>{message}</span>
    </div>
  );
}
