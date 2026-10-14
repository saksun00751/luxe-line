import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[18px] outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-brand text-primary-foreground font-semibold shadow-glow hover:brightness-105",
        outline: "border border-primary text-primary bg-transparent hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:brightness-110",
        ghost: "hover:bg-accent text-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-md",
        line: "bg-line text-white font-semibold hover:brightness-105",
        destructive: "bg-destructive text-white hover:brightness-110",
      },
      size: {
        default: "h-11 px-5 text-[15px]",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-[54px] px-6 text-base w-full",
        icon: "size-[42px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
