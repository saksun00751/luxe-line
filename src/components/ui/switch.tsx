"use client";
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors data-[state=checked]:bg-primary data-[state=unchecked]:bg-border",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-6 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
