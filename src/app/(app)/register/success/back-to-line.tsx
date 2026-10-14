"use client";

import { useLiff } from "@/components/liff-provider";
import { Button } from "@/components/ui/button";

export function BackToLine() {
  const { close } = useLiff();
  return (
    <Button type="button" variant="outline" size="lg" onClick={close}>
      กลับไปที่แชท LINE
    </Button>
  );
}
