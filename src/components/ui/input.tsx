import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-full w-full min-w-0 bg-transparent text-[15px] text-foreground outline-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
