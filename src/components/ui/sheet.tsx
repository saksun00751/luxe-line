"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetContent({ className, children, title, ...props }: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col gap-4 rounded-t-[32px] border-t border-border bg-card px-5 pt-3 pb-safe text-card-foreground outline-none",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
          className
        )}
        {...props}
      >
        <div className="mx-auto h-[5px] w-11 rounded-full bg-border" />
        <div className="flex items-center">
          <DialogPrimitive.Title className="flex-1 text-lg font-semibold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-secondary" aria-label="ปิด">
            <X className="size-[18px]" />
          </DialogPrimitive.Close>
        </div>
        <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
