"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex rounded-full border border-border bg-card p-1", className)} {...props} />;
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "h-[42px] flex-1 cursor-pointer rounded-full text-sm font-semibold text-muted-foreground transition-all data-[state=active]:bg-brand data-[state=active]:text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

const TabsContent = TabsPrimitive.Content;

export { Tabs, TabsList, TabsTrigger, TabsContent };
