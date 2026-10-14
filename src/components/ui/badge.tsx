import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium", {
  variants: {
    variant: {
      default: "bg-accent text-accent-foreground",
      brand: "bg-brand text-primary-foreground font-bold",
      success: "bg-success/15 text-success",
      warning: "bg-warning/15 text-warning",
      destructive: "bg-destructive/15 text-destructive",
      outline: "border border-border text-muted-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
